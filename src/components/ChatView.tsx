import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  Send,
  Sparkles,
  Paperclip,
  Copy,
  Check,
  RotateCw,
  Bookmark,
  Share2,
  ThumbsUp,
  ThumbsDown,
  FileText,
  Plus,
  Trash2,
  ChevronDown,
  Layers,
  ShieldCheck,
  ExternalLink,
  MessageSquare,
  AlertCircle,
  X,
  Info
} from 'lucide-react';
import {
  Conversation,
  Message,
  Citation,
  Document,
  Collection,
  SavedAnswer
} from '../types';
import { talkTalkService } from '../services/aiService';
import { CitationPopover } from './CitationPopover';

interface ChatViewProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
  documents: Document[];
  collections: Collection[];
  onSaveAnswer: (answer: SavedAnswer) => void;
  onInspectDocument: (docId: string) => void;
  initialQuery?: string;
}

export const ChatView: React.FC<ChatViewProps> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  documents,
  collections,
  onSaveAnswer,
  onInspectDocument,
  initialQuery
}) => {
  const [inputPrompt, setInputPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gemini-3.8-flash');
  const [selectedMode, setSelectedMode] = useState<
    'grounded' | 'research' | 'creative' | 'summarize'
  >('grounded');
  const [selectedDocScope, setSelectedDocScope] = useState<string>('all');
  const [activeCitation, setActiveCitation] = useState<Citation | null>(null);

  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [savedMsgId, setSavedMsgId] = useState<string | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Active conversation state
  const activeConv =
    conversations.find((c) => c.id === activeConversationId) || conversations[0];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConv?.messages, isGenerating]);

  // If initialQuery is provided from outside (e.g. quick ask on Dashboard), trigger it
  useEffect(() => {
    if (initialQuery && initialQuery.trim()) {
      handleSendMessage(initialQuery);
    }
  }, [initialQuery]);

  const handleSendMessage = async (queryText?: string) => {
    const text = (queryText || inputPrompt).trim();
    if (!text || isGenerating) return;

    setInputPrompt('');

    const userMsg: Message = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'complete'
    };

    const updatedMessages = [...(activeConv?.messages || []), userMsg];

    // Optimistically update conversation
    const currentConv: Conversation = activeConv
      ? { ...activeConv, messages: updatedMessages, updatedAt: new Date().toISOString() }
      : {
          id: `conv-${Date.now()}`,
          title: text.slice(0, 36) + '...',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          model: selectedModel,
          mode: selectedMode,
          messages: updatedMessages
        };

    talkTalkService.saveConversation(currentConv);

    setIsGenerating(true);

    try {
      // Determine document IDs scope
      let docIds: string[] | undefined = undefined;
      if (selectedDocScope !== 'all') {
        docIds = [selectedDocScope];
      }

      // Call AI Service answerQuestion
      const res = await talkTalkService.answerQuestion({
        query: text,
        documentIds: docIds,
        mode: selectedMode,
        conversationHistory: updatedMessages.map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content
        }))
      });

      const assistantMsg: Message = {
        id: `msg-${Date.now()}-assistant`,
        role: 'assistant',
        content: res.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        citations: res.citations,
        status: 'complete',
        modeUsed: selectedMode
      };

      const finalConv: Conversation = {
        ...currentConv,
        messages: [...updatedMessages, assistantMsg],
        updatedAt: new Date().toISOString()
      };

      await talkTalkService.saveConversation(finalConv);
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMsg: Message = {
        id: `msg-${Date.now()}-err`,
        role: 'assistant',
        content: `Sorry, encountered an error synthesizing response: ${err?.message || 'Unknown error'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'error'
      };
      await talkTalkService.saveConversation({
        ...currentConv,
        messages: [...updatedMessages, errorMsg]
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyMessage = (msg: Message) => {
    navigator.clipboard.writeText(msg.content);
    setCopiedMsgId(msg.id);
    setTimeout(() => setCopiedMsgId(null), 1800);
  };

  const handleRegenerate = async (targetMsgIndex: number) => {
    if (!activeConv || isGenerating) return;
    const historyUpToLastUser = activeConv.messages.slice(0, targetMsgIndex);
    const lastUserMsg = historyUpToLastUser[historyUpToLastUser.length - 1];
    if (!lastUserMsg || lastUserMsg.role !== 'user') return;

    setIsGenerating(true);
    try {
      const res = await talkTalkService.answerQuestion({
        query: lastUserMsg.content,
        mode: selectedMode
      });

      const regeneratedMsg: Message = {
        id: `msg-${Date.now()}-regen`,
        role: 'assistant',
        content: res.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        citations: res.citations,
        status: 'complete'
      };

      const updated = [...historyUpToLastUser, regeneratedMsg];
      await talkTalkService.saveConversation({
        ...activeConv,
        messages: updated,
        updatedAt: new Date().toISOString()
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveToAnswers = (msg: Message) => {
    const parentUserMsg = activeConv?.messages.find(
      (m, idx) =>
        m.role === 'user' &&
        activeConv.messages[idx + 1]?.id === msg.id
    );

    const newSavedAnswer: SavedAnswer = {
      id: `ans-${Date.now()}`,
      title: (parentUserMsg?.content || 'Knowledge Query').slice(0, 48) + '...',
      query: parentUserMsg?.content || 'Grounded question',
      answer: msg.content,
      citations: msg.citations || [],
      savedAt: new Date().toISOString(),
      collectionName: 'General'
    };

    onSaveAnswer(newSavedAnswer);
    setSavedMsgId(msg.id);
    setTimeout(() => setSavedMsgId(null), 2000);
  };

  const handleToggleReaction = (msgId: string, type: 'liked' | 'disliked') => {
    if (!activeConv) return;
    const updated = activeConv.messages.map((m) => {
      if (m.id !== msgId) return m;
      const current = m.reactions?.[type];
      return {
        ...m,
        reactions: {
          ...m.reactions,
          [type]: !current
        }
      };
    });
    talkTalkService.saveConversation({ ...activeConv, messages: updated });
  };

  const handleShare = (msg: Message) => {
    const url = `${window.location.origin}/chat?conversationId=${activeConv?.id}&msg=${msg.id}`;
    setShareUrl(url);
    setShareModalOpen(true);
  };

  return (
    <div id="talktalk-chat-view" className="flex h-[calc(100vh-64px)] overflow-hidden">
      {/* Left Column: Conversation History Sidebar */}
      <div className="w-72 bg-slate-950 border-r border-slate-800/80 flex flex-col justify-between hidden md:flex shrink-0">
        <div className="p-3 border-b border-slate-800">
          <button
            onClick={onNewConversation}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Knowledge Chat</span>
          </button>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Recent Conversations
          </div>

          {conversations.map((conv) => {
            const isCurrent = conv.id === activeConv?.id;
            return (
              <div
                key={conv.id}
                onClick={() => onSelectConversation(conv.id)}
                className={`group flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-colors cursor-pointer ${
                  isCurrent
                    ? 'bg-slate-900 text-slate-100 border border-slate-800 font-medium'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <MessageSquare
                    className={`w-3.5 h-3.5 shrink-0 ${
                      isCurrent ? 'text-indigo-400' : 'text-slate-500'
                    }`}
                  />
                  <span className="truncate">{conv.title || 'Untitled Conversation'}</span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteConversation(conv.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded text-slate-500 hover:text-rose-400 transition-opacity"
                  title="Delete chat"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Bottom Scope Filter */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/80 space-y-1.5 text-xs">
          <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1">
            <Layers className="w-3 h-3 text-indigo-400" /> Document Scope
          </label>
          <select
            value={selectedDocScope}
            onChange={(e) => setSelectedDocScope(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">Entire Knowledge Base ({documents.length} docs)</option>
            {documents
              .filter((d) => d.status === 'ready')
              .map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.name}
                </option>
              ))}
          </select>
        </div>
      </div>

      {/* Main Chat Thread Area */}
      <div className="flex-1 flex flex-col bg-slate-950 h-full overflow-hidden">
        {/* Chat Control Toolbar */}
        <div className="px-6 py-2.5 border-b border-slate-800/80 bg-slate-950/60 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Model Selector */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Model:</span>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-200 font-mono text-[11px] focus:outline-none focus:border-indigo-500"
            >
              <option value="gemini-3.8-flash">gemini-3.8-flash (Recommended)</option>
              <option value="gemini-flash-latest">gemini-flash-latest</option>
              <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview</option>
            </select>
          </div>

          {/* Mode Selector */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
            {(
              [
                { id: 'grounded', label: 'Grounded RAG' },
                { id: 'research', label: 'Deep Research' },
                { id: 'summarize', label: 'Summarize' },
                { id: 'creative', label: 'Creative' }
              ] as const
            ).map((mode) => (
              <button
                key={mode.id}
                onClick={() => setSelectedMode(mode.id)}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                  selectedMode === mode.id
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-emerald-400 font-mono">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Zero Data Logging</span>
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeConv?.messages.map((msg, idx) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-4xl mx-auto ${
                  isUser ? 'justify-end' : 'justify-start'
                }`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0 mt-1">
                    TT
                  </div>
                )}

                <div
                  className={`flex flex-col ${
                    isUser ? 'items-end' : 'items-start'
                  } max-w-3xl min-w-0`}
                >
                  {/* Message Bubble */}
                  <div
                    className={`rounded-2xl px-5 py-3.5 text-xs leading-relaxed ${
                      isUser
                        ? 'bg-indigo-600 text-white rounded-tr-xs shadow-md'
                        : 'bg-slate-900/90 border border-slate-800 text-slate-100 rounded-tl-xs shadow-md'
                    }`}
                  >
                    {isUser ? (
                      <div className="whitespace-pre-wrap font-sans text-sm">{msg.content}</div>
                    ) : (
                      <div className="prose prose-invert prose-xs max-w-none space-y-2 text-slate-200">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    )}

                    {/* Grounded Source Cards Deck */}
                    {!isUser && msg.citations && msg.citations.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2">
                        <div className="flex items-center justify-between text-[11px] font-semibold text-indigo-400">
                          <span className="flex items-center gap-1.5">
                            <Sparkles className="w-3 h-3" /> Grounded Source Citations (
                            {msg.citations.length})
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            Click citation to verify excerpt
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {msg.citations.map((citation, i) => (
                            <div
                              key={citation.id || i}
                              onClick={() => setActiveCitation(citation)}
                              className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 hover:border-indigo-500/50 text-[11px] text-slate-300 transition-all cursor-pointer group"
                            >
                              <div className="flex items-center justify-between font-medium">
                                <span className="text-indigo-300 flex items-center gap-1 truncate max-w-[170px]">
                                  <FileText className="w-3 h-3 text-indigo-400 shrink-0" />
                                  [{i + 1}] {citation.document_name}
                                </span>
                                <span className="font-mono text-[10px] text-slate-400">
                                  p.{citation.page}
                                </span>
                              </div>

                              <p className="text-[10px] text-slate-400 line-clamp-2 mt-1 italic font-serif group-hover:text-slate-300">
                                "{citation.excerpt}"
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Message Action Bar */}
                  <div className="flex items-center gap-2 px-1 mt-1.5 text-[11px] text-slate-500">
                    <span>{msg.timestamp}</span>

                    {!isUser && (
                      <>
                        <span>•</span>

                        {/* Copy */}
                        <button
                          onClick={() => handleCopyMessage(msg)}
                          className="hover:text-slate-300 transition-colors"
                          title="Copy response"
                        >
                          {copiedMsgId === msg.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {/* Regenerate */}
                        <button
                          onClick={() => handleRegenerate(idx)}
                          className="hover:text-slate-300 transition-colors"
                          title="Regenerate answer"
                        >
                          <RotateCw className="w-3.5 h-3.5" />
                        </button>

                        {/* Save Answer */}
                        <button
                          onClick={() => handleSaveToAnswers(msg)}
                          className={`hover:text-slate-300 transition-colors ${
                            savedMsgId === msg.id ? 'text-amber-400' : ''
                          }`}
                          title="Save to Verified Answers"
                        >
                          <Bookmark className="w-3.5 h-3.5" />
                        </button>

                        {/* Share */}
                        <button
                          onClick={() => handleShare(msg)}
                          className="hover:text-slate-300 transition-colors"
                          title="Share citation thread"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Thumbs Feedback */}
                        <button
                          onClick={() => handleToggleReaction(msg.id, 'liked')}
                          className={`hover:text-slate-300 transition-colors ${
                            msg.reactions?.liked ? 'text-emerald-400' : ''
                          }`}
                          title="Helpful grounded response"
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleToggleReaction(msg.id, 'disliked')}
                          className={`hover:text-slate-300 transition-colors ${
                            msg.reactions?.disliked ? 'text-rose-400' : ''
                          }`}
                          title="Inaccurate or incomplete citations"
                        >
                          <ThumbsDown className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {isGenerating && (
            <div className="flex gap-3 max-w-4xl mx-auto">
              <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0 mt-1">
                TT
              </div>
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-400 flex items-center gap-3">
                <div className="flex space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.4s]" />
                </div>
                <span>Retrieving chunks & synthesizing grounded citations...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/80">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="max-w-4xl mx-auto flex items-end gap-2"
          >
            <div className="relative flex-1 bg-slate-900 rounded-2xl border border-slate-800 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all">
              <textarea
                rows={2}
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder={`Ask TalkTalk in ${selectedMode} mode (Press Enter to send, Shift+Enter for newline)...`}
                className="w-full px-4 py-3 bg-transparent text-xs text-slate-100 placeholder-slate-500 focus:outline-none resize-none leading-relaxed"
              />

              <div className="flex items-center justify-between px-3 pb-2 text-[11px] text-slate-500">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    title="Attach document to this prompt"
                    className="p-1 rounded hover:text-slate-300 hover:bg-slate-800 transition-colors"
                  >
                    <Paperclip className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Scope: {selectedDocScope === 'all' ? 'All Docs' : '1 Document'}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400">Gemini 3.8 Flash RAG</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={!inputPrompt.trim() || isGenerating}
              className="p-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white shadow-md shadow-indigo-600/30 transition-all cursor-pointer shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Citation Popover Modal */}
      <CitationPopover
        citation={activeCitation}
        onClose={() => setActiveCitation(null)}
        onInspectDocument={onInspectDocument}
      />

      {/* Share Modal */}
      {shareModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl p-5 text-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                <Share2 className="w-4 h-4 text-indigo-400" />
                <span>Share Grounded Citation Thread</span>
              </h3>
              <button
                onClick={() => setShareModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Shareable link including verified document excerpts and answer citations:
            </p>

            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 font-mono truncate"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(shareUrl);
                  alert('Copied link to clipboard!');
                }}
                className="px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
              >
                Copy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
