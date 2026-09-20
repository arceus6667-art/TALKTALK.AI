import React, { useState } from 'react';
import {
  FileText,
  Search,
  Filter,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Trash2,
  ExternalLink,
  Layers,
  Sparkles,
  Eye,
  Check
} from 'lucide-react';
import { Document, Collection, DocumentStatus } from '../types';

interface DocumentsViewProps {
  documents: Document[];
  collections: Collection[];
  onOpenUpload: () => void;
  onSelectDocument: (docId: string) => void;
  onDeleteDocument: (docId: string) => void;
  onRunOcr: (docId: string) => Promise<void>;
}

export const DocumentsView: React.FC<DocumentsViewProps> = ({
  documents,
  collections,
  onOpenUpload,
  onSelectDocument,
  onDeleteDocument,
  onRunOcr
}) => {
  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [collectionFilter, setCollectionFilter] = useState<string>('all');
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  const [ocrLoadingId, setOcrLoadingId] = useState<string | null>(null);

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      (doc.tags && doc.tags.some((t) => t.toLowerCase().includes(searchFilter.toLowerCase()))) ||
      (doc.summary && doc.summary.toLowerCase().includes(searchFilter.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
    const matchesCollection = collectionFilter === 'all' || doc.collectionId === collectionFilter;

    return matchesSearch && matchesStatus && matchesCollection;
  });

  const handleRunOcrClick = async (e: React.MouseEvent, docId: string) => {
    e.stopPropagation();
    setOcrLoadingId(docId);
    try {
      await onRunOcr(docId);
    } finally {
      setOcrLoadingId(null);
    }
  };

  const toggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedDocIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBatchDelete = () => {
    if (confirm(`Delete ${selectedDocIds.length} selected document(s)?`)) {
      selectedDocIds.forEach((id) => onDeleteDocument(id));
      setSelectedDocIds([]);
    }
  };

  return (
    <div id="talktalk-documents-view" className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-400" />
            <span>Document Repository</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
              {filteredDocs.length} of {documents.length}
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage chunked knowledge files, vector store indexing, and OCR pipelines
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {selectedDocIds.length > 0 && (
            <button
              onClick={handleBatchDelete}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-rose-600/15 hover:bg-rose-600/25 border border-rose-500/30 text-rose-300 text-xs font-medium transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete ({selectedDocIds.length})</span>
            </button>
          )}

          <button
            onClick={onOpenUpload}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Ingest Documents</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by file name, summary, or tag..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-[11px] font-medium">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Statuses</option>
            <option value="ready">Ready (Vectorized)</option>
            <option value="ocr_required">OCR Required</option>
            <option value="processing">Processing</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        {/* Collection Filter */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-[11px] font-medium">Collection:</span>
          <select
            value={collectionFilter}
            onChange={(e) => setCollectionFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Collections</option>
            {collections.map((col) => (
              <option key={col.id} value={col.id}>
                {col.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Documents Table */}
      <div className="rounded-2xl bg-slate-900/40 border border-slate-800 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/80 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <th className="p-3.5 pl-4 w-10">
                <span className="sr-only">Select</span>
              </th>
              <th className="p-3.5">Document Details</th>
              <th className="p-3.5">Collection</th>
              <th className="p-3.5">Vector Chunks</th>
              <th className="p-3.5">Pipeline Status</th>
              <th className="p-3.5 pr-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-xs">
            {filteredDocs.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-400">
                  No documents found matching the selected filters.
                </td>
              </tr>
            ) : (
              filteredDocs.map((doc) => {
                const isSelected = selectedDocIds.includes(doc.id);
                return (
                  <tr
                    key={doc.id}
                    onClick={() => onSelectDocument(doc.id)}
                    className={`hover:bg-slate-800/40 transition-colors cursor-pointer ${
                      isSelected ? 'bg-indigo-950/20' : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="p-3.5 pl-4" onClick={(e) => toggleSelect(doc.id, e)}>
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                          isSelected
                            ? 'bg-indigo-600 border-indigo-500 text-white'
                            : 'border-slate-700 bg-slate-900 hover:border-slate-500'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </td>

                    {/* Document Info */}
                    <td className="p-3.5 min-w-[240px]">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0">
                          <FileText className="w-4 h-4 text-indigo-400" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-200 truncate flex items-center gap-2">
                            <span>{doc.name}</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 uppercase font-mono">
                              {doc.type}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                            <span>{doc.pageCount} pages</span>
                            <span>•</span>
                            <span>{(doc.size / (1024 * 1024)).toFixed(1)} MB</span>
                            <span>•</span>
                            <span>Uploaded {doc.uploadDate}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Collection */}
                    <td className="p-3.5 text-slate-300">
                      {doc.collectionName ? (
                        <span className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-300 text-[11px]">
                          {doc.collectionName}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Unassigned</span>
                      )}
                    </td>

                    {/* Vector Chunks */}
                    <td className="p-3.5">
                      <div className="font-mono text-slate-300">
                        {doc.chunksCount || 0}{' '}
                        <span className="text-slate-400 text-[10px]">chunks</span>
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Layers className="w-3 h-3 text-indigo-400" />
                        <span>768-dim embedding</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="p-3.5">
                      {doc.status === 'ready' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" /> Vector Indexed
                        </span>
                      )}

                      {doc.status === 'ocr_required' && (
                        <div className="inline-flex items-center gap-1.5">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            <AlertTriangle className="w-3 h-3" /> OCR Required
                          </span>
                          <button
                            onClick={(e) => handleRunOcrClick(e, doc.id)}
                            disabled={ocrLoadingId === doc.id}
                            className="px-2 py-0.5 rounded bg-amber-600 hover:bg-amber-500 text-slate-950 font-semibold text-[10px] transition-colors flex items-center gap-1"
                          >
                            {ocrLoadingId === doc.id ? (
                              <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                            ) : null}
                            <span>Run OCR</span>
                          </button>
                        </div>
                      )}

                      {doc.status === 'processing' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          <RefreshCw className="w-3 h-3 animate-spin" /> Chunking {doc.progress || 75}%
                        </span>
                      )}

                      {doc.status === 'failed' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          Failed Parsing
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-3.5 pr-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectDocument(doc.id);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                          title="Inspect Chunks & Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Delete ${doc.name}?`)) {
                              onDeleteDocument(doc.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                          title="Delete Document"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
