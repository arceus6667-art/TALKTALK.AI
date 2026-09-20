import React, { useState } from 'react';
import {
  GitCompare,
  FileText,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Copy,
  Check,
  Download
} from 'lucide-react';
import { Document, ComparisonResult } from '../types';
import { talkTalkService } from '../services/aiService';

interface CompareViewProps {
  documents: Document[];
  initialDocIdA?: string;
  initialDocIdB?: string;
  onInspectDocument: (id: string) => void;
}

export const CompareView: React.FC<CompareViewProps> = ({
  documents,
  initialDocIdA,
  initialDocIdB,
  onInspectDocument
}) => {
  const readyDocs = documents.filter((d) => d.status === 'ready');
  const [docAId, setDocAId] = useState<string>(
    initialDocIdA || readyDocs[0]?.id || ''
  );
  const [docBId, setDocBId] = useState<string>(
    initialDocIdB || readyDocs[1]?.id || readyDocs[0]?.id || ''
  );
  const [focusArea, setFocusArea] = useState<
    'comprehensive' | 'architecture' | 'security' | 'tradeoffs'
  >('comprehensive');

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [copied, setCopied] = useState(false);

  const docA = documents.find((d) => d.id === docAId);
  const docB = documents.find((d) => d.id === docBId);

  const handleRunComparison = async () => {
    if (!docAId || !docBId || docAId === docBId) {
      alert('Please select two different documents to compare.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await talkTalkService.compareDocuments({
        docAId,
        docBId,
        focus: focusArea
      });
      setResult(res);
    } catch (err: any) {
      console.error('Comparison failed:', err);
      alert('Failed to complete document comparison: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyReport = () => {
    if (!result) return;
    const markdown = `# Comparison: ${result.docA_name} vs ${result.docB_name}\n\n## Summary\n${result.summary}\n\n## Key Differences\n${result.differences.map(d => `- ${d}`).join('\n')}\n\n## Recommendations\n${result.recommendation}`;
    navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="talktalk-compare-view" className="p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <GitCompare className="w-5 h-5 text-indigo-400" />
          <span>Cross-Document Comparison Studio</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Perform multi-document semantic alignment, architecture divergence analysis, and consensus synthesis
        </p>
      </div>

      {/* Selectors Bar */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4 text-xs">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Doc A */}
          <div className="space-y-1.5">
            <label className="text-slate-300 font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-500" /> Document A (Baseline)
            </label>
            <select
              value={docAId}
              onChange={(e) => setDocAId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              {readyDocs.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.pageCount} pages)
                </option>
              ))}
            </select>
          </div>

          {/* Doc B */}
          <div className="space-y-1.5">
            <label className="text-slate-300 font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-violet-500" /> Document B (Target)
            </label>
            <select
              value={docBId}
              onChange={(e) => setDocBId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              {readyDocs.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.pageCount} pages)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Focus Area & Run Button */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Focus Lens:</span>
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
              {(
                [
                  { id: 'comprehensive', label: 'Comprehensive' },
                  { id: 'architecture', label: 'Architecture' },
                  { id: 'security', label: 'Security & Compliance' },
                  { id: 'tradeoffs', label: 'Tradeoffs & Cost' }
                ] as const
              ).map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFocusArea(f.id)}
                  className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                    focusArea === f.id
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleRunComparison}
            disabled={isLoading || !docAId || !docBId || docAId === docBId}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-semibold shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Synthesizing Matrix...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Synthesize Comparison</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Result Section */}
      {result && (
        <div className="space-y-6">
          {/* Executive Overview & Copy */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400">
                <Sparkles className="w-4 h-4" />
                <span>Executive Comparison Synthesis</span>
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
                    <span>Copy Full Report</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-sm text-slate-200 leading-relaxed font-sans">
              {result.summary}
            </p>
          </div>

          {/* Matrix Table */}
          {result.matrix && result.matrix.length > 0 && (
            <div className="rounded-2xl bg-slate-900/40 border border-slate-800 overflow-hidden">
              <div className="p-4 bg-slate-900/80 border-b border-slate-800 text-xs font-semibold text-slate-200">
                Comparative Dimension Matrix
              </div>
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/40 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    <th className="p-3.5 pl-4 w-1/4">Evaluation Dimension</th>
                    <th className="p-3.5 w-1/3">{result.docA_name}</th>
                    <th className="p-3.5 pr-4 w-1/3">{result.docB_name}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {result.matrix.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-800/20">
                      <td className="p-3.5 pl-4 font-semibold text-slate-200">
                        {row.aspect}
                      </td>
                      <td className="p-3.5 text-slate-300 leading-relaxed">
                        {row.docA_value}
                      </td>
                      <td className="p-3.5 pr-4 text-slate-300 leading-relaxed">
                        {row.docB_value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Split: Commonalities & Discrepancies */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
              <h4 className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Common Principles & Alignments</span>
              </h4>
              <ul className="space-y-2 text-xs text-slate-300">
                {(result.commonPoints || []).map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
              <h4 className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
                <GitCompare className="w-4 h-4" />
                <span>Key Divergences & Contrasts</span>
              </h4>
              <ul className="space-y-2 text-xs text-slate-300">
                {(result.differences || []).map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold">•</span>
                    <span>
                      {typeof item === 'string'
                        ? item
                        : `${item.point}: ${item.docA} vs ${item.docB}`}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Strategic Recommendation */}
          <div className="p-5 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 text-xs text-slate-200 space-y-2">
            <div className="font-semibold text-indigo-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span>TalkTalk Strategic Recommendation</span>
            </div>
            <p className="leading-relaxed text-slate-300">
              {result.recommendation}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
