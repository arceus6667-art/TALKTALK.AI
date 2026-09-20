import React from 'react';
import { Search, Sparkles, UploadCloud, Bell, HelpCircle } from 'lucide-react';
import { ActiveView } from '../types';

interface HeaderProps {
  activeView: ActiveView;
  onOpenUpload: () => void;
  onQuickQuery: (query: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  hasApiKey: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeView,
  onOpenUpload,
  onQuickQuery,
  searchQuery,
  setSearchQuery,
  hasApiKey
}) => {
  const viewTitles: Record<ActiveView, { title: string; subtitle: string }> = {
    dashboard: {
      title: 'Knowledge Intelligence Hub',
      subtitle: 'Real-time overview of indexed documents, vector chunks, and research queries.'
    },
    documents: {
      title: 'Document Repository',
      subtitle: 'Manage multi-format documents, vector indexation status, and OCR extractions.'
    },
    collections: {
      title: 'Thematic Collections',
      subtitle: 'Organize research material into scoped contextual knowledge domains.'
    },
    chat: {
      title: 'Knowledge Chat Assistant',
      subtitle: 'Engage with multi-document grounded RAG, citation verification, and streaming.'
    },
    'document-details': {
      title: 'Document Inspector & Chunks',
      subtitle: 'Detailed breakdown of vector embeddings, token splits, and section citations.'
    },
    compare: {
      title: 'Document Comparison Studio',
      subtitle: 'Deep cross-document synthesis identifying architecture divergence and commonalities.'
    },
    study: {
      title: 'Active Recall Study Cards',
      subtitle: 'AI-generated technical flashcards with citation backlinks and mastery tracking.'
    },
    research: {
      title: 'Deep Research Synthesis',
      subtitle: 'Comprehensive multi-source analysis generating structured executive reports.'
    },
    analytics: {
      title: 'Retrieval & RAG Analytics',
      subtitle: 'Latency profiling, citation verification rates, and search query trends.'
    },
    settings: {
      title: 'System Settings & Pipeline',
      subtitle: 'Configure chunk sizes, vector thresholds, and Python FastAPI / LangChain endpoints.'
    }
  };

  const current = viewTitles[activeView] || viewTitles.dashboard;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      onQuickQuery(searchQuery);
    }
  };

  return (
    <header
      id="talktalk-top-header"
      className="h-16 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20"
    >
      {/* View Title & Context */}
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <span>{current.title}</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {hasApiKey ? 'Gemini 3.8 Live' : 'Grounded RAG Ready'}
            </span>
          </h1>
          <p className="text-[11px] text-slate-400 truncate max-w-xl">{current.subtitle}</p>
        </div>
      </div>

      {/* Center Search Bar */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="global-knowledge-search-input"
            type="text"
            placeholder="Search documents, sections, or ask knowledge base (Press Enter)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full pl-9 pr-12 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
          />
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-500 bg-slate-800 border border-slate-700">
            ↵
          </span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5 shrink-0">
        <button
          id="header-quick-upload-btn"
          onClick={onOpenUpload}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-medium transition-colors cursor-pointer"
        >
          <UploadCloud className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden sm:inline">Ingest</span>
        </button>

        <div className="h-4 w-px bg-slate-800 hidden sm:block" />

        <button
          id="header-ai-status-badge"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-950/40 border border-indigo-500/30 text-indigo-300 text-xs font-mono"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden lg:inline text-[11px]">gemini-3.8-flash</span>
        </button>

        <button
          id="header-notifications-btn"
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition-colors"
          title="Notifications & Pipeline Alerts"
        >
          <Bell className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
