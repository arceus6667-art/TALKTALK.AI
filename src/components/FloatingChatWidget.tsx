import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MessageSquare,
  Sparkles,
  Maximize2,
  X,
  Send,
  Loader2,
  FileText,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { ActiveView, Citation } from '../types';
import { talkTalkService } from '../services/aiService';

interface FloatingChatWidgetProps {
  onOpenFullChat: (initialQuery?: string) => void;
  activeView: ActiveView;
}

interface MiniMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
  timestamp: string;
}

export const FloatingChatWidget: React.FC<FloatingChatWidgetProps> = ({
  onOpenFullChat,
  activeView
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<{ x: number; y: number }>({
    x: typeof window !== 'undefined' ? window.innerWidth - 88 : 800,
    y: typeof window !== 'undefined' ? window.innerHeight - 110 : 600
  });
  const [isDragging, setIsDragging] = useState(false);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCitation, setSelectedCitation] = useState<Citation | null>(null);

  const [messages, setMessages] = useState<MiniMessage[]>([
    {
      id: 'mini-welcome',
      role: 'assistant',
      content: 'Hello! I am TalkTalk. Ask me anything about your indexed documents, RAG architectures, or compliance policies.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const dragStartPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const hasMovedSignificantly = useRef(false);

  // Keep button within window bounds on resize & snap to edges
  useEffect(() => {
    const handleResize = () => {
      setPosition(prev => ({
        x: prev.x > window.innerWidth / 2 ? window.innerWidth - 88 : 24,
        y: Math.min(Math.max(80, prev.y), window.innerHeight - 100)
      }));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Snap to nearest edge on drag end
  const handleDragEnd = (_: any, info: any) => {
    setIsDragging(false);
    const currentX = position.x + info.offset.x;
    const currentY = Math.min(Math.max(80, position.y + info.offset.y), window.innerHeight - 100);

    const snapLeft = 24;
    const snapRight = window.innerWidth - 88;
    const finalX = currentX < window.innerWidth / 2 ? snapLeft : snapRight;

    setPosition({ x: finalX, y: currentY });
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = inputQuery.trim();
    if (!query || isLoading) return;

    setInputQuery('');
    const userMsg: MiniMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await talkTalkService.answerQuestion({ query });
      const botMsg: MiniMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: response.answer,
        citations: response.citations,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err: any) {
      const errorMsg: MiniMessage = {
        id: `bot-err-${Date.now()}`,
        role: 'assistant',
        content: `Error: ${err?.message || 'Could not retrieve grounded response.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // If user is already in chat view, keep widget discreet
  const isChatView = activeView === 'chat';

  return (
    <div id="floating-talktalk-container" className="fixed z-50 pointer-events-none">
      {/* Draggable Button */}
      <motion.div
        drag
        dragMomentum={false}
        onDragStart={() => {
          setIsDragging(true);
          hasMovedSignificantly.current = false;
        }}
        onDrag={(_, info) => {
          if (Math.abs(info.offset.x) > 5 || Math.abs(info.offset.y) > 5) {
            hasMovedSignificantly.current = true;
          }
        }}
        onDragEnd={handleDragEnd}
        animate={{ x: position.x, y: position.y }}
        transition={{ type: 'spring', stiffness: 450, damping: 35 }}
        className="pointer-events-auto absolute top-0 left-0 cursor-grab active:cursor-grabbing"
      >
        <button
          id="talktalk-floating-button"
          aria-label="TalkTalk Assistant"
          title="Drag to reposition, Click to open TalkTalk Mini Assistant"
          onClick={() => {
            if (!hasMovedSignificantly.current) {
              setIsOpen(!isOpen);
            }
          }}
          className={`relative group flex items-center justify-center w-14 h-14 rounded-full shadow-2xl transition-all duration-200 ${
            isOpen
              ? 'bg-slate-900 border-2 border-indigo-500 text-indigo-400 ring-4 ring-indigo-500/20'
              : 'bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 text-white hover:scale-105 active:scale-95 ring-2 ring-indigo-400/40 hover:ring-indigo-400/70'
          }`}
        >
          {/* Ambient Glow */}
          <span className="absolute -inset-1 rounded-full bg-indigo-500/25 blur-sm group-hover:bg-indigo-500/40 transition-all pointer-events-none" />

          {isOpen ? (
            <X className="w-6 h-6 relative z-10" />
          ) : (
            <>
              <MessageSquare className="w-6 h-6 relative z-10" />
              <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-950 animate-pulse" />
            </>
          )}
        </button>
      </motion.div>

      {/* Mini Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="talktalk-mini-chat-popup"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.18 }}
            style={{
              position: 'fixed',
              left: Math.max(20, Math.min(position.x - 170, window.innerWidth - 400)),
              top: Math.max(70, Math.min(position.y - 480, window.innerHeight - 520))
            }}
            className="pointer-events-auto w-96 max-w-[calc(100vw-32px)] h-[460px] rounded-2xl bg-slate-950/95 backdrop-blur-xl border border-slate-800 shadow-2xl shadow-black/80 flex flex-col overflow-hidden text-slate-100"
          >
            {/* Header */}
            <div className="px-4 py-3 bg-slate-900/90 border-b border-slate-800/90 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-xs">
                  T
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-slate-100">TalkTalk Mini</span>
                    <span className="text-[10px] text-emerald-400 font-mono">● Grounded</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  id="mini-chat-expand-full-btn"
                  onClick={() => {
                    setIsOpen(false);
                    onOpenFullChat();
                  }}
                  title="Open Full Knowledge Chat"
                  className="p-1.5 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Message Thread */}
            <div className="flex-1 p-3.5 space-y-3 overflow-y-auto text-xs">
              {messages.map((m) => {
                const isUser = m.role === 'user';
                return (
                  <div
                    key={m.id}
                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
                        isUser
                          ? 'bg-indigo-600 text-white rounded-br-xs'
                          : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-xs'
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{m.content}</div>

                      {/* Source Citations in Mini Chat */}
                      {m.citations && m.citations.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-slate-800/80 space-y-1">
                          <span className="text-[10px] font-semibold text-indigo-400 flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5" /> Verified Sources:
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {m.citations.map((c, i) => (
                              <button
                                key={c.id || i}
                                onClick={() => setSelectedCitation(c)}
                                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-800/90 hover:bg-slate-750 text-[10px] text-slate-300 border border-slate-700 font-mono transition-colors"
                              >
                                <FileText className="w-2.5 h-2.5 text-indigo-400" />
                                <span>[{i + 1}] p.{c.page}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <span className="text-[9px] text-slate-400 px-1 mt-0.5">{m.timestamp}</span>
                  </div>
                );
              })}

              {isLoading && (
                <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-900/60 border border-slate-800 text-slate-400 text-xs w-max">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                  <span>Retrieving vector chunks & synthesizing...</span>
                </div>
              )}
            </div>

            {/* Citation Excerpt Tooltip/Preview */}
            {selectedCitation && (
              <div className="p-2.5 bg-slate-900/95 border-t border-indigo-500/30 text-[11px] relative">
                <button
                  onClick={() => setSelectedCitation(null)}
                  className="absolute right-2 top-2 text-slate-400 hover:text-slate-200"
                >
                  <X className="w-3 h-3" />
                </button>
                <div className="font-semibold text-indigo-300 text-[10px] flex items-center gap-1">
                  <FileText className="w-3 h-3 text-indigo-400" />
                  {selectedCitation.document_name} • p.{selectedCitation.page} ({selectedCitation.section})
                </div>
                <p className="text-slate-300 italic mt-1 line-clamp-3 text-[10px] border-l-2 border-indigo-500 pl-1.5">
                  "{selectedCitation.excerpt}"
                </p>
              </div>
            )}

            {/* Input Bar */}
            <form
              onSubmit={handleSendMessage}
              className="p-2.5 bg-slate-900/70 border-t border-slate-800 flex items-center gap-2"
            >
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder="Ask grounded question..."
                className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                disabled={!inputQuery.trim() || isLoading}
                className="p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
