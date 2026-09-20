import React, { useState } from 'react';
import {
  Compass,
  Sparkles,
  Search,
  FileText,
  CheckCircle2,
  RefreshCw,
  Download,
  Copy,
  Check,
  ShieldCheck,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Document, ResearchResult, Collection } from '../types';
import { talkTalkService } from '../services/aiService';

interface ResearchViewProps {
  documents: Document[];
  collections: Collection[];
  onInspectDocument: (id: string) => void;
}

export const ResearchView: React.FC<ResearchViewProps> = ({
  documents,
  collections,
  onInspectDocument
}) => {
  const [researchTopic, setResearchTopic] = useState('');
  const [depth, setDepth] = useState<'focused' | 'deep' | 'exhaustive'>('deep');
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ResearchResult | null>(null);
  const [copied, setCopied] = useState(false);

  const sampleResearchQueries = [
    'Evaluate production scalability tradeoffs of vector graph indexing (HNSW) vs inverted file clustering (IVF) under high concurrency',
    'Synthesize end-to-end zero-retention data privacy guarantees across enterprise cloud RAG pipelines',
    'Analyze cross-document divergence in AI agent orchestration frameworks and memory retention policies'
  ];

  const handleRunResearch = async (queryText?: string) => {
    const q = (queryText || researchTopic).trim();
    if (!q || isLoading) return;

    setIsLoading(true);
    try {
      const res = await talkTalkService.researchQuestion({
        topic: q,
        depth
      });
      setResult(res);
    } catch (err: any) {
      console.error('Research error:', err);
      alert('Failed to execute research synthesis: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyReport = () => {
    if (!result) return;
    const reportText = `# Deep Research Report: ${result.topic}\n\n## Executive Summary\n${result.executiveSummary}\n\n## Key Findings\n${result.findings.map(f => `- ${f}`).join('\n')}\n\n## Synthesis\n${result.synthesis}\n\n## Strategic Recommendations\n${result.recommendations.map(r => `- ${r}`).join('\n')}`;
    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div id="talktalk-research-view" className="p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Compass className="w-5 h-5 text-indigo-400" />
          <span>Deep Research Mode</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Perform multi-hop query decomposition, cross-document hypothesis testing, and structured executive synthesis
        </p>
      </div>

      {/* Query Formulation Form */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4 text-xs">
        <div>
          <label className="block text-slate-300 font-semibold mb-1.5">
            Research Hypothesis or Inquiry
          </label>
          <div className="relative">
            <input
              type="text"
              value={researchTopic}
              onChange={(e) => setResearchTopic(e.target.value)}
              placeholder="Enter complex multi-document research inquiry..."
              className="w-full pl-4 pr-10 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-xs"
            />
          </div>
        </div>

        {/* Query Suggestions */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] text-slate-500 font-medium">Examples:</span>
          {sampleResearchQueries.map((query, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setResearchTopic(query);
                handleRunResearch(query);
              }}
              className="text-[11px] px-2.5 py-1 rounded bg-slate-950 hover:bg-slate-850 text-slate-300 border border-slate-800 truncate max-w-md"
            >
              {query}
            </button>
          ))}
        </div>

        {/* Depth & Execution */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-800">
          <div className="flex items-center gap-3">
            <span className="text-slate-400 font-medium">Investigation Depth:</span>
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
              {(
                [
                  { id: 'focused', label: 'Focused (Top 5 Chunks)' },
                  { id: 'deep', label: 'Deep (Top 15 Chunks)' },
                  { id: 'exhaustive', label: 'Exhaustive (Full Corpus)' }
                ] as const
              ).map((d) => (
                <button
                  key={d.id}
                  onClick={() => setDepth(d.id)}
                  className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                    depth === d.id
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => handleRunResearch()}
            disabled={isLoading || !researchTopic.trim()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-semibold shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Decomposing & Synthesizing...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Execute Deep Research</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Research Output Dossier */}
      {result && (
        <div className="space-y-6">
          {/* Executive Overview */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400">
                <Sparkles className="w-4 h-4" />
                <span>Executive Research Dossier</span>
              </div>

              <button
                onClick={handleCopyReport}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied Report</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span>Copy Report</span>
                  </>
                )}
              </button>
            </div>

            <div className="text-xs text-slate-400 font-mono">
              Inquiry: <span className="text-slate-200 font-semibold">{result.topic}</span>
            </div>

            <p className="text-sm text-slate-200 leading-relaxed font-sans">
              {result.executiveSummary}
            </p>
          </div>

          {/* Key Findings List */}
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
            <h4 className="text-xs font-semibold text-indigo-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-400" />
              <span>Synthesized Key Findings ({result.findings.length})</span>
            </h4>
            <div className="space-y-2.5">
              {result.findings.map((f, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-xs text-slate-200 leading-relaxed flex items-start gap-2.5"
                >
                  <span className="w-5 h-5 rounded-md bg-indigo-950 text-indigo-400 font-mono text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Deep Synthesis & Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3 text-xs">
              <h4 className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-violet-400" />
                <span>Corpus Synthesis</span>
              </h4>
              <p className="text-slate-300 leading-relaxed font-sans whitespace-pre-wrap">
                {result.synthesis}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3 text-xs">
              <h4 className="font-semibold text-emerald-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>Strategic Recommendations</span>
              </h4>
              <div className="space-y-2">
                {result.recommendations.map((r, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 leading-relaxed flex items-start gap-2"
                  >
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>{r}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Grounded Sources */}
          {result.sources && result.sources.length > 0 && (
            <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
              <h4 className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-400" />
                <span>Corpus Sources Referenced</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {result.sources.map((s, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between"
                  >
                    <span className="text-slate-200 font-medium truncate pr-2">
                      {s.document_name}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 shrink-0">
                      p.{s.page}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
