import React, { useState } from 'react';
import {
  Settings,
  Cpu,
  Layers,
  ShieldCheck,
  Code2,
  Database,
  Save,
  Check,
  Download,
  Terminal,
  Server
} from 'lucide-react';
import { Workspace } from '../types';

interface SettingsViewProps {
  workspace: Workspace;
  hasApiKey: boolean;
  onUpdateWorkspace: (updated: Partial<Workspace>) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  workspace,
  hasApiKey,
  onUpdateWorkspace
}) => {
  const [chunkSize, setChunkSize] = useState(workspace.settings?.chunkSize || 512);
  const [chunkOverlap, setChunkOverlap] = useState(workspace.settings?.chunkOverlap || 64);
  const [topK, setTopK] = useState(workspace.settings?.retrievalTopK || 5);
  const [rerank, setRerank] = useState(workspace.settings?.enableReranking ?? true);
  const [vectorStore, setVectorStore] = useState('In-Memory / HNSW Fast Index');
  const [pythonFastApiUrl, setPythonFastApiUrl] = useState('http://localhost:8000/api/rag');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateWorkspace({
      settings: {
        chunkSize,
        chunkOverlap,
        retrievalTopK: topK,
        defaultModel: workspace.settings?.defaultModel || 'gemini-3.8-flash',
        enableReranking: rerank
      }
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleExportConfig = () => {
    const config = {
      pipeline: 'TalkTalk Production RAG',
      version: '2.4.0',
      embedding_model: 'gemini-embedding-2',
      llm_model: 'gemini-3.8-flash',
      chunk_size: chunkSize,
      chunk_overlap: chunkOverlap,
      retrieval_top_k: topK,
      cross_encoder_rerank: rerank,
      vector_store: vectorStore,
      python_endpoint: pythonFastApiUrl
    };

    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'talktalk-rag-pipeline-config.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div id="talktalk-settings-view" className="p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Settings className="w-5 h-5 text-indigo-400" />
          <span>System & RAG Pipeline Configuration</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Tune document ingestion chunks, vector store parameters, and prepare for external Python/FastAPI pipelines
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* API & Provider Status */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>AI Provider & Security</span>
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Server-Side Only
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-slate-400 text-[11px]">Primary LLM Provider</div>
              <div className="text-sm font-semibold text-slate-200 mt-1">
                Google Gemini API (Server Proxy)
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                All client requests route through secure <code>/api/*</code> Express endpoints.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-slate-400 text-[11px]">Server API Key Status</div>
              <div className="text-sm font-semibold text-emerald-400 mt-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                {hasApiKey ? 'Configured (process.env.GEMINI_API_KEY)' : 'Default Grounded Fallback Active'}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Zero client-side credential exposure.
              </p>
            </div>
          </div>
        </div>

        {/* Document Ingestion & Chunking Pipeline */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>Document Extraction & Chunking Parameters</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              Pipeline: PDF &rarr; Cleaning &rarr; Chunks &rarr; Embeddings
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Token Chunk Size: <span className="text-indigo-400 font-mono">{chunkSize} tokens</span>
              </label>
              <input
                type="range"
                min="128"
                max="2048"
                step="64"
                value={chunkSize}
                onChange={(e) => setChunkSize(Number(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Recommended: 512 tokens for dense technical whitepapers & PDF reports.
              </p>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Chunk Overlap: <span className="text-indigo-400 font-mono">{chunkOverlap} tokens</span>
              </label>
              <input
                type="range"
                min="16"
                max="256"
                step="16"
                value={chunkOverlap}
                onChange={(e) => setChunkOverlap(Number(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Ensures semantic boundary continuity across paragraph breaks.
              </p>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Top-K Candidate Chunks: <span className="text-indigo-400 font-mono">{topK} chunks</span>
              </label>
              <input
                type="range"
                min="1"
                max="20"
                step="1"
                value={topK}
                onChange={(e) => setTopK(Number(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Number of vector chunks supplied as grounded context to Gemini.
              </p>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Vector Store Backend
              </label>
              <select
                value={vectorStore}
                onChange={(e) => setVectorStore(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="In-Memory / HNSW Fast Index">In-Memory / HNSW Fast Index (Current)</option>
                <option value="pgvector / PostgreSQL">pgvector / Cloud SQL PostgreSQL</option>
                <option value="Pinecone Serverless">Pinecone Serverless</option>
                <option value="Qdrant Distributed">Qdrant Distributed</option>
              </select>
              <p className="text-[11px] text-slate-500 mt-1">
                Vector index implementation for dense cosine similarity search.
              </p>
            </div>
          </div>
        </div>

        {/* Python FastAPI / LangChain Extensibility */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <Code2 className="w-4 h-4 text-violet-400" />
              <span>Python FastAPI / LangChain External Microservice</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">Future Pipeline Bridge</span>
          </div>

          <div className="space-y-2">
            <label className="block text-slate-300 font-semibold">
              FastAPI Extraction & Vector Endpoint URL
            </label>
            <input
              type="text"
              value={pythonFastApiUrl}
              onChange={(e) => setPythonFastApiUrl(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
            />
            <p className="text-[11px] text-slate-500">
              When ready, TalkTalk can dispatch PDF bytes directly to your Python backend for OCR (Tesseract / EasyOCR) and LangChain chunking.
            </p>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={handleExportConfig}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export RAG Pipeline JSON</span>
          </button>

          <button
            type="submit"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
          >
            {saved ? (
              <>
                <Check className="w-4 h-4" />
                <span>Saved Settings</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
