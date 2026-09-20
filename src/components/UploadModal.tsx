import React, { useState, useRef } from 'react';
import {
  X,
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Eye,
  Layers,
  Sparkles,
  ArrowRight,
  FolderKanban
} from 'lucide-react';
import { Document, Collection } from '../types';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  collections: Collection[];
  onUploadSuccess: (newDocs: Document[]) => void;
  onRunOcr: (docId: string) => Promise<void>;
}

interface QueuedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  progress: number;
  status: 'uploading' | 'processing' | 'ready' | 'ocr_required' | 'failed';
  currentStep?: 'Text Extraction' | 'Cleaning' | 'Chunking' | 'Embeddings' | 'Vector Store';
  error?: string;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  collections,
  onUploadSuccess,
  onRunOcr
}) => {
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>(
    collections[0]?.id || ''
  );
  const [isDragging, setIsDragging] = useState(false);
  const [queuedFiles, setQueuedFiles] = useState<QueuedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(Array.from(e.target.files));
    }
  };

  const processFiles = (files: File[]) => {
    const newItems: QueuedFile[] = files.map((file, idx) => {
      // Simulate varied real-world document states based on name or index for demonstration
      let finalStatus: 'ready' | 'ocr_required' | 'failed' = 'ready';
      if (file.name.toLowerCase().includes('scan') || file.name.toLowerCase().includes('image')) {
        finalStatus = 'ocr_required';
      } else if (file.name.toLowerCase().includes('corrupt') || file.name.toLowerCase().includes('err')) {
        finalStatus = 'failed';
      }

      return {
        id: `q-${Date.now()}-${idx}`,
        name: file.name,
        size: file.size,
        type: file.name.endsWith('.pdf') ? 'pdf' : file.name.endsWith('.docx') ? 'docx' : 'md',
        progress: 0,
        status: 'uploading',
        currentStep: 'Text Extraction'
      };
    });

    setQueuedFiles(prev => [...prev, ...newItems]);

    // Simulate multi-stage pipeline for each file
    newItems.forEach((item, i) => {
      simulatePipeline(item.id, item.name);
    });
  };

  const simulatePipeline = (id: string, fileName: string) => {
    // 1. Uploading
    let step = 0;
    const interval = setInterval(() => {
      step += 25;
      setQueuedFiles(prev =>
        prev.map(f => {
          if (f.id !== id) return f;
          if (step <= 100) {
            return { ...f, progress: step };
          }
          return f;
        })
      );

      if (step >= 100) {
        clearInterval(interval);
        // Transition into Processing Stages: Text Extraction -> Cleaning -> Chunking -> Embeddings -> Vector Store
        advanceProcessing(id, fileName);
      }
    }, 180);
  };

  const advanceProcessing = (id: string, fileName: string) => {
    const steps: QueuedFile['currentStep'][] = [
      'Text Extraction',
      'Cleaning',
      'Chunking',
      'Embeddings',
      'Vector Store'
    ];
    let stepIdx = 0;

    const procInterval = setInterval(() => {
      stepIdx++;
      if (stepIdx < steps.length) {
        setQueuedFiles(prev =>
          prev.map(f => (f.id === id ? { ...f, status: 'processing', currentStep: steps[stepIdx] } : f))
        );
      } else {
        clearInterval(procInterval);

        // Determine final state
        let targetStatus: QueuedFile['status'] = 'ready';
        let errorMsg: string | undefined = undefined;

        if (fileName.toLowerCase().includes('scan')) {
          targetStatus = 'ocr_required';
        } else if (fileName.toLowerCase().includes('corrupt')) {
          targetStatus = 'failed';
          errorMsg = 'PDF damaged or unreadable text stream detected.';
        }

        setQueuedFiles(prev =>
          prev.map(f =>
            f.id === id
              ? {
                  ...f,
                  status: targetStatus,
                  error: errorMsg,
                  currentStep: 'Vector Store'
                }
              : f
          )
        );

        // Send to backend if ready or ocr_required
        fetch('/api/documents/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: fileName,
            size: 154000,
            type: fileName.endsWith('.pdf') ? 'pdf' : 'docx',
            collectionId: selectedCollectionId,
            simulateStatus: targetStatus
          })
        })
          .then(res => res.json())
          .then(savedDoc => {
            onUploadSuccess([savedDoc]);
          })
          .catch(err => console.error('Upload sync error:', err));
      }
    }, 320);
  };

  const handleTriggerOcr = async (fileId: string) => {
    setQueuedFiles(prev =>
      prev.map(f => (f.id === fileId ? { ...f, status: 'processing', currentStep: 'Text Extraction' } : f))
    );
    setTimeout(() => {
      setQueuedFiles(prev =>
        prev.map(f => (f.id === fileId ? { ...f, status: 'ready', currentStep: 'Vector Store' } : f))
      );
    }, 1200);
  };

  const handleRetry = (file: QueuedFile) => {
    setQueuedFiles(prev =>
      prev.map(f => (f.id === file.id ? { ...f, status: 'uploading', progress: 0, error: undefined } : f))
    );
    simulatePipeline(file.id, file.name);
  };

  return (
    <div
      id="talktalk-upload-modal-overlay"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div
        id="talktalk-upload-modal"
        className="w-full max-w-2xl bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div>
            <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-indigo-400" />
              Ingest Documents into TalkTalk
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Production pipeline: PDF &rarr; Text Extraction &rarr; Cleaning &rarr; Chunking &rarr; Vector Index
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Collection Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <FolderKanban className="w-3.5 h-3.5 text-indigo-400" /> Assign to Collection
            </label>
            <select
              value={selectedCollectionId}
              onChange={(e) => setSelectedCollectionId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-medium"
            >
              {collections.map(col => (
                <option key={col.id} value={col.id}>
                  {col.name} ({col.documentIds.length} existing documents)
                </option>
              ))}
            </select>
          </div>

          {/* Drag & Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
              isDragging
                ? 'border-indigo-500 bg-indigo-500/10 scale-[1.01]'
                : 'border-slate-800 hover:border-slate-700 bg-slate-900/40 hover:bg-slate-900/70'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.docx,.txt,.md"
              onChange={handleFileSelect}
              className="hidden"
            />
            <div className="w-12 h-12 rounded-full bg-indigo-600/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto mb-3">
              <UploadCloud className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-slate-200">
              Drag and drop multiple documents here, or <span className="text-indigo-400 underline">browse files</span>
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Supports PDF, DOCX, TXT, Markdown (Max 100MB per file)
            </p>

            {/* Quick Test Document Buttons */}
            <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-center gap-2 text-xs">
              <span className="text-slate-400 text-[11px]">Or load simulated prototype files:</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  processFiles([
                    new File(['Sample Content'], 'Agentic_Workflow_Patterns_2026.pdf', { type: 'application/pdf' })
                  ]);
                }}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-750 text-slate-300 text-[11px] border border-slate-700 transition-colors"
              >
                + Normal PDF
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  processFiles([
                    new File(['Scan Data'], 'Patent_Diagrams_Scan_2026.pdf', { type: 'application/pdf' })
                  ]);
                }}
                className="px-2.5 py-1 rounded bg-amber-950/40 hover:bg-amber-900/50 text-amber-300 text-[11px] border border-amber-500/30 transition-colors"
              >
                + Scanned (OCR Required)
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  processFiles([
                    new File(['Corrupted binary'], 'Corrupted_Legacy_Archive.pdf', { type: 'application/pdf' })
                  ]);
                }}
                className="px-2.5 py-1 rounded bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 text-[11px] border border-rose-500/30 transition-colors"
              >
                + Corrupted (Failed State)
              </button>
            </div>
          </div>

          {/* Queue & Progress States */}
          {queuedFiles.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider">
                <span>Ingestion Queue ({queuedFiles.length})</span>
                <span>Pipeline Status</span>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {queuedFiles.map((file) => (
                  <div
                    key={file.id}
                    className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300 shrink-0">
                        <FileText className="w-4 h-4 text-indigo-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-slate-200 truncate">{file.name}</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                          <span>{(file.size / 1024).toFixed(0)} KB</span>
                          {file.status === 'processing' && (
                            <span className="text-indigo-400 font-mono flex items-center gap-1">
                              <RefreshCw className="w-2.5 h-2.5 animate-spin" /> {file.currentStep}
                            </span>
                          )}
                          {file.status === 'uploading' && (
                            <span className="text-slate-400">Uploading {file.progress}%</span>
                          )}
                        </div>

                        {/* Progress bar */}
                        {(file.status === 'uploading' || file.status === 'processing') && (
                          <div className="w-full bg-slate-800 rounded-full h-1 mt-1.5 overflow-hidden">
                            <div
                              className="bg-indigo-500 h-1 rounded-full transition-all duration-200"
                              style={{
                                width: file.status === 'uploading' ? `${file.progress}%` : '85%'
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Status Badge & Actions */}
                    <div className="shrink-0 flex items-center gap-2">
                      {file.status === 'ready' && (
                        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Ready
                        </span>
                      )}

                      {file.status === 'ocr_required' && (
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> OCR Needed
                          </span>
                          <button
                            onClick={() => handleTriggerOcr(file.id)}
                            className="px-2 py-1 rounded bg-amber-600 hover:bg-amber-500 text-slate-950 font-semibold text-[10px] transition-colors"
                          >
                            Run OCR
                          </button>
                        </div>
                      )}

                      {file.status === 'failed' && (
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-rose-500/15 text-rose-400 border border-rose-500/30">
                            Failed
                          </span>
                          <button
                            onClick={() => handleRetry(file)}
                            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs"
                            title="Retry ingestion"
                          >
                            <RefreshCw className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-900/60 border-t border-slate-800 flex items-center justify-between">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5 font-mono">
            <Sparkles className="w-3 h-3 text-indigo-400" />
            <span>AES-256 encrypted • Zero LLM retention</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
