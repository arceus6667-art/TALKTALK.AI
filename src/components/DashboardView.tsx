import React, { useState } from 'react';
import {
  Sparkles,
  FileText,
  FolderKanban,
  MessageSquare,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Plus,
  BookOpen,
  Share2
} from 'lucide-react';
import { Document, Collection, Conversation, SavedAnswer, ActiveView, Workspace } from '../types';

interface DashboardViewProps {
  documents: Document[];
  collections: Collection[];
  conversations: Conversation[];
  savedAnswers: SavedAnswer[];
  workspace: Workspace;
  onNavigate: (view: ActiveView) => void;
  onOpenUpload: () => void;
  onStartChatWithQuery: (query: string) => void;
  onSelectDocument: (docId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  documents,
  collections,
  conversations,
  savedAnswers,
  workspace,
  onNavigate,
  onOpenUpload,
  onStartChatWithQuery,
  onSelectDocument
}) => {
  const [quickQuery, setQuickQuery] = useState('');

  const readyDocs = documents.filter(d => d.status === 'ready');
  const ocrNeededDocs = documents.filter(d => d.status === 'ocr_required');
  const processingDocs = documents.filter(d => d.status === 'processing');

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickQuery.trim()) {
      onStartChatWithQuery(quickQuery);
    }
  };

  const samplePrompts = [
    'What is the recommended hybrid RAG retrieval pipeline architecture?',
    'Compare HNSW vs IVF-PQ indexing benchmarks under high concurrency',
    'How does TalkTalk guarantee zero data retention and tenant privacy?',
    'What are the key differences between Document A and Document B?'
  ];

  return (
    <div id="talktalk-dashboard-view" className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Hero Quick Ask Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800/90 p-7 shadow-xl">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-medium mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Grounded Knowledge Reasoning Engine • Gemini 3.8 Flash</span>
          </div>

          <h2 className="text-2xl font-bold text-slate-100 tracking-tight">
            Synthesize your enterprise knowledge without hallucination.
          </h2>
          <p className="text-sm text-slate-400 mt-1.5 leading-relaxed">
            Ask any question across {readyDocs.length} vectorized documents. Every claim is strictly backed by verifiable inline source citations.
          </p>

          {/* Quick Query Form */}
          <form onSubmit={handleQuickSubmit} className="mt-5 flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={quickQuery}
                onChange={(e) => setQuickQuery(e.target.value)}
                placeholder="Ask TalkTalk a question across all documents..."
                className="w-full px-4 py-3 rounded-xl bg-slate-950/90 border border-slate-700/80 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all shadow-inner"
              />
            </div>
            <button
              type="submit"
              disabled={!quickQuery.trim()}
              className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-sm font-semibold shadow-md shadow-indigo-600/30 transition-all cursor-pointer flex items-center gap-2 shrink-0"
            >
              <span>Ask TalkTalk</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Prompt suggestions */}
          <div className="mt-3.5 flex flex-wrap items-center gap-2">
            <span className="text-[11px] text-slate-500 font-medium">Suggested queries:</span>
            {samplePrompts.map((prompt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onStartChatWithQuery(prompt)}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors truncate max-w-xs"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800/90 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Total Documents</span>
            <FileText className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-100 font-mono">{documents.length}</div>
            <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 font-medium">
              <CheckCircle2 className="w-3 h-3" /> {readyDocs.length} vectorized & indexed
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800/90 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Retrieval P95 Latency</span>
            <Cpu className="w-4 h-4 text-violet-400" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-100 font-mono">34ms</div>
            <div className="text-[11px] text-slate-400 mt-1">
              Dense vector search + BM25
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800/90 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Citation Accuracy</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-100 font-mono">99.1%</div>
            <div className="text-[11px] text-emerald-400 mt-1">
              Zero-retention verified
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800/90 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Knowledge Collections</span>
            <FolderKanban className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-100 font-mono">{collections.length}</div>
            <div className="text-[11px] text-slate-400 mt-1">
              Partitioned domains
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Split: Documents & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Ingested Documents & Status */}
        <div className="lg:col-span-2 space-y-6">
          {/* Documents Section */}
          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-semibold text-slate-100">Knowledge Repository</h3>
                <p className="text-xs text-slate-400 mt-0.5">Recently ingested and indexed document sources</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenUpload}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Document</span>
                </button>
                <button
                  onClick={() => onNavigate('documents')}
                  className="px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 text-xs font-medium transition-colors"
                >
                  View All
                </button>
              </div>
            </div>

            <div className="divide-y divide-slate-800/60 mt-2">
              {documents.slice(0, 5).map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => onSelectDocument(doc.id)}
                  className="py-3 flex items-center justify-between gap-4 hover:bg-slate-800/40 px-2 rounded-lg transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0">
                      <FileText className="w-4 h-4 text-indigo-400" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-slate-200 truncate flex items-center gap-2">
                        <span>{doc.name}</span>
                        {doc.collectionName && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                            {doc.collectionName}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>{doc.pageCount} pages</span>
                        <span>•</span>
                        <span>{(doc.size / (1024 * 1024)).toFixed(1)} MB</span>
                        <span>•</span>
                        <span>{doc.chunksCount || 0} vector chunks</span>
                      </div>
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <div className="shrink-0 flex items-center gap-2">
                    {doc.status === 'ready' && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Indexed
                      </span>
                    )}
                    {doc.status === 'ocr_required' && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                        <AlertTriangle className="w-2.5 h-2.5" /> OCR Scan
                      </span>
                    )}
                    {doc.status === 'processing' && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center gap-1">
                        <RefreshCw className="w-2.5 h-2.5 animate-spin" /> {doc.progress || 70}%
                      </span>
                    )}
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pinned Thematic Collections */}
          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-semibold text-slate-100">Knowledge Domains & Collections</h3>
                <p className="text-xs text-slate-400 mt-0.5">Scoped context boundaries for team collaboration</p>
              </div>
              <button
                onClick={() => onNavigate('collections')}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
              >
                Manage &rarr;
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-3.5">
              {collections.map(col => (
                <div
                  key={col.id}
                  onClick={() => onNavigate('collections')}
                  className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <div
                      className="w-7 h-7 rounded-md flex items-center justify-center text-xs font-semibold text-white shadow-xs"
                      style={{ backgroundColor: col.color }}
                    >
                      <FolderKanban className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">
                      {col.documentIds.length} docs
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-slate-200 mt-2.5 group-hover:text-indigo-300 transition-colors truncate">
                    {col.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                    {col.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Saved Answers & Conversations */}
        <div className="space-y-6">
          {/* Verified Saved Answers */}
          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-indigo-400" />
                <span>Saved Verified Answers</span>
              </h3>
              <span className="text-xs font-mono text-slate-400">{savedAnswers.length}</span>
            </div>

            <div className="space-y-3 mt-3.5">
              {savedAnswers.map((ans) => (
                <div
                  key={ans.id}
                  className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all text-xs"
                >
                  <div className="font-semibold text-slate-200 leading-snug">
                    {ans.title}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                    {ans.answer}
                  </p>
                  <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                    <span className="text-indigo-400 font-mono">
                      {ans.citations.length} cited source(s)
                    </span>
                    <span>{new Date(ans.savedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Tool Links */}
          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-2.5 text-xs">
            <div className="text-xs font-semibold text-slate-300">Advanced AI Modes</div>

            <button
              onClick={() => onNavigate('compare')}
              className="w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-200 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-violet-400" />
                <span>Compare Two Documents</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
            </button>

            <button
              onClick={() => onNavigate('study')}
              className="w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-200 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>Generate Study Cards</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
            </button>

            <button
              onClick={() => onNavigate('research')}
              className="w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-200 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-400" />
                <span>Run Deep Research Mode</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
