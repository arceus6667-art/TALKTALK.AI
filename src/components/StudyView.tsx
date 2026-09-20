import React, { useState } from 'react';
import {
  GraduationCap,
  Sparkles,
  RotateCw,
  CheckCircle2,
  AlertCircle,
  FileText,
  Layers,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  Eye
} from 'lucide-react';
import { Document, StudyCard } from '../types';
import { talkTalkService } from '../services/aiService';

interface StudyViewProps {
  documents: Document[];
  initialDocId?: string;
  onInspectDocument: (id: string) => void;
}

export const StudyView: React.FC<StudyViewProps> = ({
  documents,
  initialDocId,
  onInspectDocument
}) => {
  const readyDocs = documents.filter((d) => d.status === 'ready');
  const [selectedDocId, setSelectedDocId] = useState<string>(
    initialDocId || readyDocs[0]?.id || ''
  );
  const [isLoading, setIsLoading] = useState(false);
  const [cards, setCards] = useState<StudyCard[]>([
    {
      id: 'sc-seed-1',
      question: 'What is the role of the Cross-Encoder Reranker in production RAG systems?',
      answer:
        'A cross-encoder reranker scores the query and candidate chunk jointly, capturing fine-grained token-level cross-attentions that bi-encoder cosine similarity misses. It refines top-50 vector candidates down to the top-5 most relevant chunks.',
      citation: {
        id: 'cit-sc-1',
        document_id: 'doc-1',
        document_name: 'Production RAG Architecture Guide 2026.pdf',
        page: 12,
        section: 'Reranking Pipeline',
        excerpt: 'Cross-encoders process query and passage pairs together, computing non-linear attention weights.'
      },
      difficulty: 'hard',
      mastered: true
    },
    {
      id: 'sc-seed-2',
      question: 'Why does HNSW outperform Flat L2 indexing for high-concurrency vector retrieval?',
      answer:
        'HNSW organizes vectors into a multi-layered graph where upper layers have long-distance links (skip-list style) and bottom layers offer dense local connectivity, enabling sub-millisecond approximate nearest neighbor search with O(log N) search complexity.',
      citation: {
        id: 'cit-sc-2',
        document_id: 'doc-1',
        document_name: 'Production RAG Architecture Guide 2026.pdf',
        page: 7,
        section: 'Vector Store Benchmarks',
        excerpt: 'HNSW maintains high recall (>98%) at 40x the QPS throughput of brute-force IVF.'
      },
      difficulty: 'medium',
      mastered: false
    },
    {
      id: 'sc-seed-3',
      question: 'What is the retention and encryption policy for customer documents in TalkTalk?',
      answer:
        'TalkTalk enforces strict zero-data retention on LLM API endpoints with ephemeral chunk handling and AES-256 GCM encryption at rest with tenant-isolated KMS keys.',
      citation: {
        id: 'cit-sc-3',
        document_id: 'doc-2',
        document_name: 'Enterprise Security & Compliance Whitepaper.pdf',
        page: 4,
        section: 'Cryptographic Architecture',
        excerpt: 'Customer tenant keys reside inside FIPS 140-3 Level 3 Cloud KMS HSMs.'
      },
      difficulty: 'easy',
      mastered: false
    }
  ]);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const handleGenerateCards = async () => {
    if (!selectedDocId) return;
    setIsLoading(true);
    try {
      const generated = await talkTalkService.generateStudyMaterial(selectedDocId);
      if (generated && generated.length > 0) {
        setCards(generated);
        setCurrentIdx(0);
        setIsFlipped(false);
      }
    } catch (err) {
      console.error('Study card generation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleMastered = (cardId: string) => {
    setCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, mastered: !c.mastered } : c))
    );
  };

  const handleShuffle = () => {
    setCards((prev) => [...prev].sort(() => Math.random() - 0.5));
    setCurrentIdx(0);
    setIsFlipped(false);
  };

  const currentCard = cards[currentIdx];
  const masteredCount = cards.filter((c) => c.mastered).length;
  const progressPercent = cards.length > 0 ? Math.round((masteredCount / cards.length) * 100) : 0;

  return (
    <div id="talktalk-study-view" className="p-8 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-amber-400" />
            <span>Active Recall Study Cards</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Master complex architectural concepts, compliance policies, and technical specifications
          </p>
        </div>

        {/* Generate Trigger */}
        <div className="flex items-center gap-2">
          <select
            value={selectedDocId}
            onChange={(e) => setSelectedDocId(e.target.value)}
            className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            {readyDocs.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

          <button
            onClick={handleGenerateCards}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-slate-950 text-xs font-semibold shadow-sm transition-colors cursor-pointer"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Generating...' : 'Generate New Deck'}</span>
          </button>
        </div>
      </div>

      {/* Progress & Deck Status */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-4">
          <div>
            <span className="text-slate-400 text-[11px]">Mastery Score: </span>
            <span className="font-bold text-slate-200 font-mono">
              {masteredCount} / {cards.length} ({progressPercent}%)
            </span>
          </div>

          <div className="w-48 bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-amber-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <button
          onClick={handleShuffle}
          className="flex items-center gap-1 text-slate-400 hover:text-slate-200 text-xs transition-colors"
        >
          <Shuffle className="w-3.5 h-3.5" />
          <span>Shuffle</span>
        </button>
      </div>

      {/* Active Card Viewer */}
      {currentCard ? (
        <div className="space-y-4">
          {/* Card Container */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="min-h-[280px] p-8 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 hover:border-slate-700 shadow-2xl flex flex-col justify-between transition-all cursor-pointer relative select-none"
          >
            {/* Card Top Pill */}
            <div className="flex items-center justify-between text-xs">
              <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono text-[11px]">
                Card {currentIdx + 1} of {cards.length}
              </span>

              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase font-mono ${
                    currentCard.difficulty === 'hard'
                      ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      : currentCard.difficulty === 'medium'
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  }`}
                >
                  {currentCard.difficulty}
                </span>

                <span className="text-[11px] text-slate-500">
                  {isFlipped ? 'Answer (Click to flip)' : 'Question (Click to flip)'}
                </span>
              </div>
            </div>

            {/* Card Body */}
            <div className="py-6 my-auto text-center">
              {!isFlipped ? (
                <div className="space-y-3">
                  <div className="text-base sm:text-lg font-semibold text-slate-100 max-w-xl mx-auto leading-relaxed">
                    {currentCard.question}
                  </div>
                  <p className="text-xs text-slate-500">Click anywhere to reveal answer</p>
                </div>
              ) : (
                <div className="space-y-4 text-left max-w-2xl mx-auto">
                  <div className="text-sm sm:text-base text-slate-200 leading-relaxed font-sans">
                    {currentCard.answer}
                  </div>

                  {currentCard.citation && (
                    <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800/80 text-xs text-slate-400">
                      <div className="text-indigo-300 font-semibold text-[11px] flex items-center gap-1">
                        <FileText className="w-3 h-3 text-indigo-400" />
                        {currentCard.citation.document_name} • p.{currentCard.citation.page}
                      </div>
                      <p className="italic mt-1 text-[11px] line-clamp-2">
                        "{currentCard.citation.excerpt}"
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Card Bottom: Mastered toggle */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800/80 text-xs">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleMastered(currentCard.id);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors ${
                  currentCard.mastered
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{currentCard.mastered ? 'Mastered' : 'Mark as Mastered'}</span>
              </button>

              <span className="text-slate-500 text-[11px]">Space / Enter to flip</span>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                if (currentIdx > 0) {
                  setCurrentIdx(currentIdx - 1);
                  setIsFlipped(false);
                }
              }}
              disabled={currentIdx === 0}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-850 disabled:opacity-30 text-slate-200 text-xs font-medium border border-slate-800 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous Card</span>
            </button>

            <button
              onClick={() => {
                if (currentIdx < cards.length - 1) {
                  setCurrentIdx(currentIdx + 1);
                  setIsFlipped(false);
                }
              }}
              disabled={currentIdx === cards.length - 1}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-850 disabled:opacity-30 text-slate-200 text-xs font-medium border border-slate-800 transition-colors"
            >
              <span>Next Card</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center text-slate-500 text-xs">
          No cards available. Click "Generate New Deck" above.
        </div>
      )}
    </div>
  );
};
