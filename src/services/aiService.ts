import {
  Citation,
  StudyCard,
  ComparisonResult,
  ResearchReport,
  ResearchResult,
  Document,
  Collection,
  Conversation,
  SavedAnswer,
  PipelineSettings,
  Workspace
} from '../types';

export interface AnswerResponse {
  answer: string;
  citations: Citation[];
  modelUsed: string;
  retrievalLatencyMs: number;
  totalTokensApprox: number;
}

export interface SummarizeResponse {
  summary: string;
  keyPoints: string[];
  tags: string[];
}

/**
 * TalkTalk Frontend Service Layer
 * Decouples the UI from exact LLM / LangChain / FastAPI backend specifics.
 */
class TalkTalkClientService {
  private baseUrl = '/api';

  // AI Service Methods
  async answerQuestion(params: {
    query: string;
    documentIds?: string[];
    collectionId?: string;
    conversationHistory?: { role: 'user' | 'assistant'; content: string }[];
    mode?: 'grounded' | 'research' | 'creative' | 'summarize';
  }): Promise<AnswerResponse> {
    const res = await fetch(`${this.baseUrl}/ai/answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to get grounded answer');
    }
    return res.json();
  }

  async summarizeDocument(documentId: string, mode: 'executive' | 'detailed' | 'bullet_points' = 'executive'): Promise<SummarizeResponse> {
    const res = await fetch(`${this.baseUrl}/ai/summarize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ documentId, mode })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to summarize document');
    }
    return res.json();
  }

  async compareDocuments(
    docAIdOrParams: string | { docAId: string; docBId: string; focus?: string },
    docBId?: string,
    focusTopic?: string
  ): Promise<ComparisonResult> {
    let docAId = '';
    let docB = '';
    let focus = focusTopic;

    if (typeof docAIdOrParams === 'object') {
      docAId = docAIdOrParams.docAId;
      docB = docAIdOrParams.docBId;
      focus = docAIdOrParams.focus;
    } else {
      docAId = docAIdOrParams;
      docB = docBId || '';
    }

    const res = await fetch(`${this.baseUrl}/ai/compare`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ docAId, docBId: docB, focusTopic: focus })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to compare documents');
    }
    const data = await res.json();
    return {
      ...data,
      docA_name: data.docAName || data.docA_name,
      docB_name: data.docBName || data.docB_name,
      summary: data.summaryComparison || data.summary,
      differences: (data.differences || []).map((d: any) =>
        typeof d === 'string' ? d : `${d.point}: ${d.docA} vs ${d.docB}`
      ),
      commonPoints: data.commonalities || data.commonPoints || [],
      recommendation: (data.keyTakeaways && data.keyTakeaways[0]) || data.recommendation || 'Consider unified architecture standards.'
    };
  }

  async generateStudyMaterial(documentId: string, numCards: number = 4, topic?: string): Promise<StudyCard[]> {
    const res = await fetch(`${this.baseUrl}/ai/study-material`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ documentId, numCards, topic })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to generate study material');
    }
    const data = await res.json();
    return (data || []).map((card: any) => ({
      ...card,
      citation: card.citation || {
        document_id: card.documentId || documentId,
        document_name: card.documentName || 'Document Citation',
        page: card.sourcePage || 1,
        section: card.sourceSection || card.keyConcept || 'General',
        excerpt: card.answer
      }
    }));
  }

  async researchQuestion(
    queryOrParams: string | { topic: string; depth?: 'focused' | 'deep' | 'exhaustive'; documentIds?: string[] },
    documentIds?: string[],
    depth: 'deep' | 'standard' | 'focused' | 'exhaustive' = 'deep'
  ): Promise<ResearchResult> {
    let query = '';
    let docIds = documentIds;
    let effectiveDepth = depth;

    if (typeof queryOrParams === 'object') {
      query = queryOrParams.topic;
      effectiveDepth = (queryOrParams.depth as any) || 'deep';
      docIds = queryOrParams.documentIds;
    } else {
      query = queryOrParams;
    }

    const res = await fetch(`${this.baseUrl}/ai/research`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, documentIds: docIds, depth: effectiveDepth })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to conduct research synthesis');
    }
    const data = await res.json();
    return {
      topic: query,
      executiveSummary: data.executiveSummary || 'Synthesis across documents complete.',
      findings: (data.keyFindings || []).map((f: any) => `${f.title}: ${f.synthesis}`),
      synthesis: data.methodology || 'Multi-document RAG synthesis with hybrid vector ranking.',
      recommendations: [
        'Establish automated benchmark evaluation loops across retrieval latency.',
        'Enforce strict zero-retention encryption for customer document tokens.'
      ],
      sources: (data.documentsAnalyzed || []).map((doc: any) => ({
        document_id: doc.id,
        document_name: doc.name,
        page: 1,
        excerpt: `Analyzed ${doc.pages || 1} pages with high cosine similarity.`
      }))
    };
  }

  // Documents API
  async getDocuments(): Promise<Document[]> {
    const res = await fetch(`${this.baseUrl}/documents`);
    if (!res.ok) throw new Error('Failed to load documents');
    return res.json();
  }

  async getDocumentDetails(id: string): Promise<{ document: Document; chunks: any[] }> {
    const res = await fetch(`${this.baseUrl}/documents/${id}`);
    if (!res.ok) throw new Error('Failed to load document details');
    return res.json();
  }

  async uploadDocument(data: {
    name: string;
    size: number;
    type: string;
    collectionId?: string;
    content?: string;
    simulateStatus?: Document['status'];
  }): Promise<Document> {
    const res = await fetch(`${this.baseUrl}/documents/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to upload document');
    return res.json();
  }

  async runDocumentOcr(id: string): Promise<Document> {
    const res = await fetch(`${this.baseUrl}/documents/${id}/ocr`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error('Failed to run OCR processing');
    return res.json();
  }

  async runOcr(id: string): Promise<Document> {
    return this.runDocumentOcr(id);
  }

  async deleteDocument(id: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/documents/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete document');
  }

  // Collections API
  async getCollections(): Promise<Collection[]> {
    const res = await fetch(`${this.baseUrl}/collections`);
    if (!res.ok) throw new Error('Failed to load collections');
    return res.json();
  }

  async createCollection(data: Partial<Collection>): Promise<Collection> {
    const res = await fetch(`${this.baseUrl}/collections`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create collection');
    return res.json();
  }

  async deleteCollection(id: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/collections/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete collection');
  }

  // Conversations API
  async getConversations(): Promise<Conversation[]> {
    const res = await fetch(`${this.baseUrl}/conversations`);
    if (!res.ok) throw new Error('Failed to load conversations');
    return res.json();
  }

  async saveConversation(conv: Conversation): Promise<Conversation> {
    const res = await fetch(`${this.baseUrl}/conversations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(conv)
    });
    if (!res.ok) throw new Error('Failed to save conversation');
    return res.json();
  }

  async deleteConversation(id: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/conversations/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete conversation');
  }

  // Saved Answers API
  async getSavedAnswers(): Promise<SavedAnswer[]> {
    const res = await fetch(`${this.baseUrl}/saved-answers`);
    if (!res.ok) throw new Error('Failed to load saved answers');
    return res.json();
  }

  async saveAnswer(answer: SavedAnswer): Promise<SavedAnswer> {
    const res = await fetch(`${this.baseUrl}/saved-answers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(answer)
    });
    if (!res.ok) throw new Error('Failed to save answer');
    return res.json();
  }

  async deleteSavedAnswer(id: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/saved-answers/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete saved answer');
  }

  // Workspace
  async getWorkspace(): Promise<Workspace> {
    const docs = await this.getDocuments();
    const cols = await this.getCollections();
    return {
      id: 'ws-1',
      name: 'TalkTalk Knowledge Hub',
      plan: 'Enterprise Pro',
      documentCount: docs.length,
      totalDocuments: docs.length,
      storageUsedBytes: 4320000,
      maxStorageBytes: 1073741824,
      storageQuotaBytes: 1073741824,
      collectionsCount: cols.length,
      usersCount: 8,
      activeAiModel: 'gemini-3.8-flash',
      settings: {
        chunkSize: 512,
        chunkOverlap: 64,
        retrievalTopK: 5,
        defaultModel: 'gemini-3.8-flash',
        enableReranking: true
      }
    };
  }

  // Settings & Analytics
  async getSettings(): Promise<PipelineSettings> {
    const res = await fetch(`${this.baseUrl}/settings`);
    if (!res.ok) throw new Error('Failed to load settings');
    return res.json();
  }

  async updateSettings(settings: Partial<PipelineSettings>): Promise<PipelineSettings> {
    const res = await fetch(`${this.baseUrl}/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
    if (!res.ok) throw new Error('Failed to update settings');
    return res.json();
  }

  async getAnalytics(): Promise<any> {
    const res = await fetch(`${this.baseUrl}/analytics`);
    if (!res.ok) throw new Error('Failed to load analytics');
    return res.json();
  }

  async getHealth(): Promise<{ status: string; service: string; hasGeminiApiKey: boolean; primaryModel: string }> {
    const res = await fetch(`${this.baseUrl}/health`);
    if (!res.ok) throw new Error('Failed to check health');
    return res.json();
  }
}

export const talkTalkService = new TalkTalkClientService();
