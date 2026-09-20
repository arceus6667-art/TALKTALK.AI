import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { DocumentsView } from './components/DocumentsView';
import { DocumentDetailsView } from './components/DocumentDetailsView';
import { CollectionsView } from './components/CollectionsView';
import { ChatView } from './components/ChatView';
import { CompareView } from './components/CompareView';
import { StudyView } from './components/StudyView';
import { ResearchView } from './components/ResearchView';
import { AnalyticsView } from './components/AnalyticsView';
import { SettingsView } from './components/SettingsView';
import { FloatingChatWidget } from './components/FloatingChatWidget';
import { UploadModal } from './components/UploadModal';
import {
  ActiveView,
  Document,
  Collection,
  Conversation,
  SavedAnswer,
  Workspace
} from './types';
import { talkTalkService } from './services/aiService';

export default function App() {
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [chatInitialQuery, setChatInitialQuery] = useState<string | undefined>(undefined);
  const [compareDocA, setCompareDocA] = useState<string | undefined>(undefined);
  const [compareDocB, setCompareDocB] = useState<string | undefined>(undefined);
  const [studyDocId, setStudyDocId] = useState<string | undefined>(undefined);

  const [searchQuery, setSearchQuery] = useState('');
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // Core domain state
  const [documents, setDocuments] = useState<Document[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [savedAnswers, setSavedAnswers] = useState<SavedAnswer[]>([]);
  const [workspace, setWorkspace] = useState<Workspace>({
    id: 'ws-1',
    name: 'TalkTalk Knowledge Hub',
    description: 'Enterprise AI knowledge assistant & grounded RAG workspace',
    totalDocuments: 3,
    storageUsedBytes: 4320000,
    storageQuotaBytes: 1073741824,
    usersCount: 8,
    settings: {
      chunkSize: 512,
      chunkOverlap: 64,
      retrievalTopK: 5,
      defaultModel: 'gemini-3.8-flash',
      enableReranking: true
    }
  });
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [hasApiKey, setHasApiKey] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState(true);

  // Initial Data Fetching
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      const [docs, cols, convs, answers, ws] = await Promise.all([
        talkTalkService.getDocuments(),
        talkTalkService.getCollections(),
        talkTalkService.getConversations(),
        talkTalkService.getSavedAnswers(),
        talkTalkService.getWorkspace()
      ]);

      setDocuments(docs);
      setCollections(cols);
      setConversations(convs);
      setSavedAnswers(answers);
      setWorkspace(ws);
      if (convs.length > 0) {
        setActiveConversationId(convs[0].id);
      }
    } catch (err) {
      console.error('Initial data fetch failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Actions
  const handleSelectDocument = (docId: string) => {
    setSelectedDocId(docId);
    setActiveView('document-details');
  };

  const handleStartChatWithQuery = (query: string) => {
    setChatInitialQuery(query);
    setActiveView('chat');
  };

  const handleNavigateToChatWithDoc = (docId: string) => {
    setChatInitialQuery(undefined);
    setActiveView('chat');
  };

  const handleNavigateToStudyWithDoc = (docId: string) => {
    setStudyDocId(docId);
    setActiveView('study');
  };

  const handleNavigateToCompareWithDoc = (docId: string) => {
    setCompareDocA(docId);
    setActiveView('compare');
  };

  const handleChatWithCollection = (colId: string) => {
    setChatInitialQuery(undefined);
    setActiveView('chat');
  };

  const handleCreateCollection = async (data: Partial<Collection>) => {
    try {
      const newCol = await talkTalkService.createCollection(data);
      setCollections(prev => [...prev, newCol]);
    } catch (err) {
      console.error('Failed to create collection:', err);
    }
  };

  const handleDeleteCollection = async (id: string) => {
    try {
      await talkTalkService.deleteCollection(id);
      setCollections(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error('Failed to delete collection:', err);
    }
  };

  const handleDeleteDocument = async (id: string) => {
    try {
      await talkTalkService.deleteDocument(id);
      setDocuments(prev => prev.filter(d => d.id !== id));
    } catch (err) {
      console.error('Failed to delete document:', err);
    }
  };

  const handleRunOcr = async (docId: string) => {
    try {
      const updated = await talkTalkService.runOcr(docId);
      setDocuments(prev => prev.map(d => d.id === docId ? updated : d));
    } catch (err) {
      console.error('Failed to run OCR:', err);
    }
  };

  const handleUploadSuccess = (newDocs: Document[]) => {
    setDocuments(prev => {
      const existingIds = new Set(prev.map(d => d.id));
      const added = newDocs.filter(d => !existingIds.has(d.id));
      return [...added, ...prev];
    });
  };

  const handleSaveAnswer = async (ans: SavedAnswer) => {
    try {
      const saved = await talkTalkService.saveAnswer(ans);
      setSavedAnswers(prev => [saved, ...prev]);
    } catch (err) {
      console.error('Failed to save answer:', err);
    }
  };

  const handleNewConversation = () => {
    const newConv: Conversation = {
      id: `conv-${Date.now()}`,
      title: 'New Knowledge Conversation',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      model: 'gemini-3.8-flash',
      mode: 'grounded',
      messages: [
        {
          id: `msg-welcome-${Date.now()}`,
          role: 'assistant',
          content: 'Hello! I am your TalkTalk knowledge assistant. I am connected to your vectorized documents with zero data retention. How can I assist your research today?',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'complete'
        }
      ]
    };
    setConversations(prev => [newConv, ...prev]);
    setActiveConversationId(newConv.id);
    talkTalkService.saveConversation(newConv);
  };

  const handleDeleteConversation = async (id: string) => {
    try {
      await talkTalkService.deleteConversation(id);
      setConversations(prev => prev.filter(c => c.id !== id));
      if (activeConversationId === id) {
        const remaining = conversations.filter(c => c.id !== id);
        setActiveConversationId(remaining[0]?.id || null);
      }
    } catch (err) {
      console.error('Failed to delete conversation:', err);
    }
  };

  const handleUpdateWorkspace = (updated: Partial<Workspace>) => {
    setWorkspace(prev => ({
      ...prev,
      ...updated,
      settings: updated.settings
        ? {
            chunkSize: updated.settings.chunkSize ?? prev.settings?.chunkSize ?? 512,
            chunkOverlap: updated.settings.chunkOverlap ?? prev.settings?.chunkOverlap ?? 64,
            retrievalTopK: updated.settings.retrievalTopK ?? prev.settings?.retrievalTopK ?? 5,
            defaultModel: updated.settings.defaultModel ?? prev.settings?.defaultModel ?? 'gemini-3.8-flash',
            enableReranking: updated.settings.enableReranking ?? prev.settings?.enableReranking ?? true
          }
        : prev.settings
    }));
  };

  return (
    <div id="talktalk-app-root" className="min-h-screen bg-slate-950 text-slate-100 flex font-sans antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Primary Left Navigation Hub */}
      <Sidebar
        activeView={activeView}
        onNavigate={(view: ActiveView) => {
          setActiveView(view);
          if (view !== 'chat') {
            setChatInitialQuery(undefined);
          }
        }}
        onOpenUpload={() => setIsUploadOpen(true)}
        workspace={workspace}
        documentsCount={documents.length}
        collectionsCount={collections.length}
        conversationsCount={conversations.length}
      />

      {/* Main App Canvas */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header
          activeView={activeView}
          onOpenUpload={() => setIsUploadOpen(true)}
          onQuickQuery={(query) => handleStartChatWithQuery(query)}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          hasApiKey={hasApiKey}
        />

        <main className="flex-1 bg-slate-950">
          {activeView === 'dashboard' && (
            <DashboardView
              documents={documents}
              collections={collections}
              conversations={conversations}
              savedAnswers={savedAnswers}
              workspace={workspace}
              onNavigate={setActiveView}
              onOpenUpload={() => setIsUploadOpen(true)}
              onStartChatWithQuery={handleStartChatWithQuery}
              onSelectDocument={handleSelectDocument}
            />
          )}

          {activeView === 'documents' && (
            <DocumentsView
              documents={documents}
              collections={collections}
              onOpenUpload={() => setIsUploadOpen(true)}
              onSelectDocument={handleSelectDocument}
              onDeleteDocument={handleDeleteDocument}
              onRunOcr={handleRunOcr}
            />
          )}

          {activeView === 'document-details' && (
            <DocumentDetailsView
              documentId={selectedDocId || documents[0]?.id || ''}
              onBack={() => setActiveView('documents')}
              onNavigateToChatWithDoc={handleNavigateToChatWithDoc}
              onNavigateToStudyWithDoc={handleNavigateToStudyWithDoc}
              onNavigateToCompareWithDoc={handleNavigateToCompareWithDoc}
            />
          )}

          {activeView === 'collections' && (
            <CollectionsView
              collections={collections}
              documents={documents}
              onCreateCollection={handleCreateCollection}
              onDeleteCollection={handleDeleteCollection}
              onSelectDocument={handleSelectDocument}
              onChatWithCollection={handleChatWithCollection}
            />
          )}

          {activeView === 'chat' && (
            <ChatView
              conversations={conversations}
              activeConversationId={activeConversationId}
              onSelectConversation={setActiveConversationId}
              onNewConversation={handleNewConversation}
              onDeleteConversation={handleDeleteConversation}
              documents={documents}
              collections={collections}
              onSaveAnswer={handleSaveAnswer}
              onInspectDocument={handleSelectDocument}
              initialQuery={chatInitialQuery}
            />
          )}

          {activeView === 'compare' && (
            <CompareView
              documents={documents}
              initialDocIdA={compareDocA}
              initialDocIdB={compareDocB}
              onInspectDocument={handleSelectDocument}
            />
          )}

          {activeView === 'study' && (
            <StudyView
              documents={documents}
              initialDocId={studyDocId}
              onInspectDocument={handleSelectDocument}
            />
          )}

          {activeView === 'research' && (
            <ResearchView
              documents={documents}
              collections={collections}
              onInspectDocument={handleSelectDocument}
            />
          )}

          {activeView === 'analytics' && (
            <AnalyticsView
              documents={documents}
              collections={collections}
            />
          )}

          {activeView === 'settings' && (
            <SettingsView
              workspace={workspace}
              hasApiKey={hasApiKey}
              onUpdateWorkspace={handleUpdateWorkspace}
            />
          )}
        </main>
      </div>

      {/* Draggable Snap-to-Edge TalkTalk Floating Chat Widget */}
      <FloatingChatWidget
        activeView={activeView}
        onOpenFullChat={(q) => {
          if (q) setChatInitialQuery(q);
          setActiveView('chat');
        }}
      />

      {/* Multi-State Drag & Drop Document Ingestion Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        collections={collections}
        onUploadSuccess={handleUploadSuccess}
        onRunOcr={handleRunOcr}
      />
    </div>
  );
}
