import React from 'react';
import {
  BarChart3,
  TrendingUp,
  Cpu,
  ShieldCheck,
  Zap,
  Layers,
  FileText,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { Document, Collection } from '../types';

interface AnalyticsViewProps {
  documents: Document[];
  collections: Collection[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ documents, collections }) => {
  const pipelineStages = [
    { name: 'Lexical BM25 Inverted Index', latency: '4ms', percentage: 2 },
    { name: 'Dense Vector HNSW Search', latency: '12ms', percentage: 7 },
    { name: 'Reciprocal Rank Fusion (RRF)', latency: '2ms', percentage: 1 },
    { name: 'Cross-Encoder Reranker (Top 50 -> Top 5)', latency: '16ms', percentage: 9 },
    { name: 'Gemini 3.8 Flash First Token TTFT', latency: '142ms', percentage: 81 }
  ];

  const topQueries = [
    { query: 'Hybrid RAG retrieval pipeline architecture', count: 142, avgConfidence: '99.4%' },
    { query: 'HNSW vs IVF-PQ vector indexing benchmarks', count: 118, avgConfidence: '98.8%' },
    { query: 'Zero data retention and tenant KMS isolation', count: 96, avgConfidence: '99.9%' },
    { query: 'Cross-document discrepancy analysis', count: 64, avgConfidence: '97.6%' },
    { query: 'Active recall flashcard generation', count: 52, avgConfidence: '99.1%' }
  ];

  return (
    <div id="talktalk-analytics-view" className="p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-indigo-400" />
          <span>Retrieval & Knowledge Analytics</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Real-time telemetry on vector retrieval latency, grounded citation coverage, and query telemetry
        </p>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Query Volume (30D)</span>
            <TrendingUp className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-100 mt-2">1,842</div>
          <div className="text-[11px] text-emerald-400 mt-1 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> +24% vs previous cycle
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Grounding Accuracy</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-100 mt-2">99.1%</div>
          <div className="text-[11px] text-slate-400 mt-1">Zero unverified hallucinations</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Retrieval Latency</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-100 mt-2">34ms</div>
          <div className="text-[11px] text-slate-400 mt-1">HNSW Vector + BM25 fusion</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Vector Cache Hit Rate</span>
            <Cpu className="w-4 h-4 text-violet-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-100 mt-2">88.6%</div>
          <div className="text-[11px] text-violet-400 mt-1">LRU Redis semantic cache</div>
        </div>
      </div>

      {/* RAG Pipeline Breakdown */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-400" />
            <span>RAG End-to-End Latency Waterfall</span>
          </h3>
          <span className="text-xs font-mono text-slate-400">Total Avg: 176ms</span>
        </div>

        <div className="space-y-3 pt-2">
          {pipelineStages.map((stage, i) => (
            <div key={i} className="space-y-1 text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span className="font-medium">{stage.name}</span>
                <span className="font-mono text-slate-400">{stage.latency}</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-indigo-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.max(4, stage.percentage)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Search Queries Table */}
      <div className="rounded-2xl bg-slate-900/40 border border-slate-800 overflow-hidden">
        <div className="p-4 bg-slate-900/80 border-b border-slate-800 text-xs font-semibold text-slate-200">
          High-Frequency Knowledge Queries
        </div>
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/40 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <th className="p-3.5 pl-4">Search Query</th>
              <th className="p-3.5">Frequency</th>
              <th className="p-3.5 pr-4 text-right">Avg Grounding Confidence</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {topQueries.map((item, i) => (
              <tr key={i} className="hover:bg-slate-800/20">
                <td className="p-3.5 pl-4 text-slate-200 font-medium">{item.query}</td>
                <td className="p-3.5 font-mono text-slate-400">{item.count} asks</td>
                <td className="p-3.5 pr-4 text-right font-mono text-emerald-400">
                  {item.avgConfidence}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
