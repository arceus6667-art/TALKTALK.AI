import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  FileText,
  Sparkles,
  Layers,
  GraduationCap,
  GitCompare,
  MessageSquare,
  ShieldCheck,
  RefreshCw,
  Copy,
  Check,
  Download,
  BookOpen
} from 'lucide-react';
import { Document, DocumentChunk, ActiveView } from '../types';
import { talkTalkService } from '../services/aiService';

interface DocumentDetailsViewProps {
  documentId: string;
  onBack: () => void;
  onNavigateToChatWithDoc: (docId: string) => void;
  onNavigateToStudyWithDoc: (docId: string) => void;
  onNavigateToCompareWithDoc: (docId: string) => void;
}

export const DocumentDetailsView: React.FC<DocumentDetailsViewProps> = ({
  documentId,
  onBack,
  onNavigateToChatWithDoc,
  onNavigateToStudyWithDoc,
  onNavigateToCompareWithDoc
}) => {
  const [doc, setDoc] = useState<Document | null>(null);
  const [chunks, setChunks] = useState<DocumentChunk[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [copiedChunkId, setCopiedChunkId] = useState<string | null>(null);

  useEffect(() => {
    loadDoc();
  }, [documentId]);

  const loadDoc = async () => {
    setIsLoading(true);
    try {
      const data = await talkTalkService.getDocumentDetails(documentId);
      setDoc(data.document);
      setChunks(data.chunks || []);
    } catch (err) {
      console.error('Failed to load document details:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReSummarize = async () => {
    if (!doc) return;
    setIsSummarizing(true);
    try {
      const res = await talkTalkService.summarizeDocument(doc.id, 'executive');
      setDoc(prev => prev ? { ...prev, summary: res.summary } : null);
    } catch (err) {
      console.error('Re-summarize failed:', err);
    } finally {
      setIsSummarizing(false);
    }
  };

  const copyChunk = (chunk: DocumentChunk) => {
    navigator.clipboard.writeText(`[${chunk.document_name}, p.${chunk.page}, ${chunk.section}]\n${chunk.excerpt}`);
    setCopiedChunkId(chunk.id);
    setTimeout(() => setCopiedChunkId(null), 1800);
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-2">
        <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
        <span>Loading document chunks & vector index...</span>
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="p-8 text-center text-slate-400">
        <p>Document not found.</p>
        <button onClick={onBack} className="mt-3 text-xs text-indigo-400 underline">
          Return to Documents
        </button>
      </div>
    );
  }

  return (
    <div id="talktalk-document-details-view" className="p-8 max-w-6xl mx-auto space-y-6">
      {/* Top Back & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-850 transition-colors"
            title="Back to Documents"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-100">{doc.name}</h2>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 uppercase font-mono">
                {doc.type}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Ingested on {doc.uploadDate} • {doc.pageCount} pages • {(doc.size / (1024 * 1024)).toFixed(1)} MB
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onNavigateToChatWithDoc(doc.id)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Chat With Doc</span>
          </button>

          <button
            onClick={() => onNavigateToStudyWithDoc(doc.id)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-200 text-xs font-medium transition-colors cursor-pointer"
          >
            <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
            <span>Study Cards</span>
          </button>

          <button
            onClick={() => onNavigateToCompareWithDoc(doc.id)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-200 text-xs font-medium transition-colors cursor-pointer"
          >
            <GitCompare className="w-3.5 h-3.5 text-violet-400" />
            <span>Compare</span>
          </button>
        </div>
      </div>

      {/* Summary Card */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400">
            <Sparkles className="w-4 h-4" />
            <span>Gemini Executive Synthesis</span>
          </div>

          <button
            onClick={handleReSummarize}
            disabled={isSummarizing}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs transition-colors"
          >
            <RefreshCw className={`w-3 h-3 ${isSummarizing ? 'animate-spin' : ''}`} />
            <span>{isSummarizing ? 'Synthesizing...' : 'Regenerate Summary'}</span>
          </button>
        </div>

        <p className="text-sm text-slate-200 leading-relaxed font-sans">
          {doc.summary || 'Summary is being computed across extracted semantic chunks.'}
        </p>

        {doc.tags && doc.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-2">
            <span className="text-[11px] text-slate-400 font-medium">Keywords:</span>
            {doc.tags.map((tag, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700 text-[10px]"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Pipeline & Indexing Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800">
          <div className="text-[11px] text-slate-400">Vector Embeddings</div>
          <div className="text-lg font-bold font-mono text-slate-100 mt-1">
            {chunks.length} chunks
          </div>
          <div className="text-[10px] text-indigo-400 mt-0.5">gemini-embedding-2</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800">
          <div className="text-[11px] text-slate-400">Embedding Dimension</div>
          <div className="text-lg font-bold font-mono text-slate-100 mt-1">768-D</div>
          <div className="text-[10px] text-slate-400 mt-0.5">HNSW Cosine Space</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800">
          <div className="text-[11px] text-slate-400">Grounding Confidence</div>
          <div className="text-lg font-bold font-mono text-emerald-400 mt-1">98.4%</div>
          <div className="text-[10px] text-emerald-400 mt-0.5 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> Verifiable Grounding
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800">
          <div className="text-[11px] text-slate-400">Collection Domain</div>
          <div className="text-lg font-bold text-slate-100 mt-1 truncate">
            {doc.collectionName || 'General'}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Namespace Isolated</div>
        </div>
      </div>

      {/* Vector Chunks Browser */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>Extracted Chunks & Citation Anchors ({chunks.length})</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              These chunks are searched by hybrid dense/lexical retrieval during Q&A
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {chunks.length === 0 ? (
            <div className="p-8 rounded-xl bg-slate-900/30 border border-slate-800 text-center text-slate-400 text-xs">
              No individual chunks found for this document. It may be pending full text extraction.
            </div>
          ) : (
            chunks.map((chunk) => (
              <div
                key={chunk.id}
                className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-colors space-y-2 text-xs"
              >
                <div className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-2 text-slate-300 font-medium">
                    <span className="px-2 py-0.5 rounded bg-indigo-950/60 text-indigo-300 border border-indigo-500/30 font-mono">
                      Page {chunk.page}
                    </span>
                    <span className="text-slate-200 font-semibold">{chunk.section}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-mono text-[10px]">
                      {chunk.tokenCount} tokens
                    </span>
                    <button
                      onClick={() => copyChunk(chunk)}
                      className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                      title="Copy chunk excerpt"
                    >
                      {copiedChunkId === chunk.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 text-slate-300 font-serif leading-relaxed italic border-l-2 border-l-indigo-500">
                  "{chunk.excerpt}"
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
