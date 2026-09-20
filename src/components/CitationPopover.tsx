import React from 'react';
import { Citation } from '../types';
import { FileText, Copy, Check, ExternalLink, X, ShieldCheck } from 'lucide-react';

interface CitationPopoverProps {
  citation: Citation | null;
  onClose: () => void;
  onInspectDocument?: (docId: string) => void;
}

export const CitationPopover: React.FC<CitationPopoverProps> = ({
  citation,
  onClose,
  onInspectDocument
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!citation) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(
      `[Source: ${citation.document_name}, Page ${citation.page}, Section "${citation.section}"]\n"${citation.excerpt}"`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div
      id="talktalk-citation-modal"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div className="w-full max-w-lg bg-slate-950 border border-slate-800 rounded-xl shadow-2xl p-5 text-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute right-3.5 top-3.5 p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Source Header */}
        <div className="flex items-center gap-2 text-xs text-indigo-400 font-semibold mb-2">
          <FileText className="w-4 h-4" />
          <span>Verified Grounded Source Citation</span>
        </div>

        <h3 className="text-sm font-semibold text-slate-200 pr-6">
          {citation.document_name}
        </h3>

        <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px] text-slate-400">
          <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 font-mono">
            Page {citation.page}
          </span>
          <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 truncate max-w-xs">
            {citation.section}
          </span>
          {typeof citation.confidenceScore === 'number' && (
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              {Math.round(citation.confidenceScore * 100)}% Grounded
            </span>
          )}
        </div>

        {/* Verbatim Excerpt */}
        <div className="mt-3.5 p-3.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs text-slate-300 leading-relaxed font-serif italic border-l-2 border-l-indigo-500">
          "{citation.excerpt}"
        </div>

        {/* Actions */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied citation</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Copy Excerpt</span>
              </>
            )}
          </button>

          {onInspectDocument && (
            <button
              onClick={() => {
                onClose();
                onInspectDocument(citation.document_id);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors cursor-pointer"
            >
              <span>Inspect Document Chunks</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
