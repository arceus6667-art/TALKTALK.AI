/**
 * TalkTalk Data Models and Domain Interfaces
 */

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'admin' | 'researcher' | 'member' | 'viewer';
  workspaceId: string;
}

export interface WorkspaceSettings {
  chunkSize: number;
  chunkOverlap: number;
  retrievalTopK: number;
  defaultModel?: string;
  enableReranking?: boolean;
}

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  plan?: 'Enterprise Pro' | 'Team' | 'Starter';
  documentCount?: number;
  totalDocuments?: number;
  storageUsedBytes: number;
  maxStorageBytes?: number;
  storageQuotaBytes?: number;
  collectionsCount?: number;
  usersCount?: number;
  activeAiModel?: string;
  settings?: WorkspaceSettings;
}

export type DocumentStatus = 'uploading' | 'processing' | 'ready' | 'failed' | 'ocr_required';

export interface DocumentChunk {
  id: string;
  document_id: string;
  document_name: string;
  page: number;
  section: string;
  excerpt: string;
  tokenCount: number;
  vectorId?: string;
  embeddingDimension?: number;
}

export interface Document {
  id: string;
  name: string;
  size: number;
  type: 'pdf' | 'docx' | 'txt' | 'md';
  uploadDate: string;
  status: DocumentStatus;
  progress?: number; // 0-100
  pageCount: number;
  collectionId?: string;
  collectionName?: string;
  tags: string[];
  summary?: string;
  error?: string;
  chunksCount?: number;
  vectorIndexed?: boolean;
  ocrConfidence?: number;
  contentSnippet?: string;
  author?: string;
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  documentIds: string[];
  createdAt: string;
  isPrivate?: boolean;
}

export interface Citation {
  id: string;
  document_id: string;
  document_name: string;
  page: number;
  section: string;
  excerpt: string;
  confidenceScore?: number;
}

export interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  citations?: Citation[];
  reactions?: {
    liked?: boolean;
    disliked?: boolean;
    saved?: boolean;
  };
  attachments?: Attachment[];
  status?: 'sending' | 'streaming' | 'complete' | 'error';
  modeUsed?: 'grounded' | 'research' | 'creative' | 'summarize';
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  documentIds?: string[];
  collectionId?: string;
  model: string;
  mode: 'grounded' | 'research' | 'creative' | 'summarize';
  messages: Message[];
  pinned?: boolean;
}

export interface SavedAnswer {
  id: string;
  title: string;
  query: string;
  answer: string;
  citations: Citation[];
  savedAt: string;
  collectionName?: string;
  tags?: string[];
}

export interface StudyCard {
  id: string;
  documentId?: string;
  documentName?: string;
  question: string;
  answer: string;
  difficulty: 'easy' | 'medium' | 'hard';
  keyConcept?: string;
  mastered?: boolean;
  sourcePage?: number;
  sourceSection?: string;
  citation?: Citation;
}

export interface ComparisonMatrixRow {
  aspect: string;
  docA_value: string;
  docB_value: string;
}

export interface ComparisonDifference {
  point: string;
  docA: string;
  docB: string;
}

export interface ComparisonResult {
  id: string;
  docAId: string;
  docAName: string;
  docA_name?: string;
  docBId: string;
  docBName: string;
  docB_name?: string;
  summary?: string;
  summaryComparison?: string;
  matrix?: ComparisonMatrixRow[];
  criteria?: string[];
  differences: (string | ComparisonDifference)[];
  commonPoints?: string[];
  commonalities?: string[];
  recommendation?: string;
  keyTakeaways?: string[];
  generatedAt?: string;
}

export interface ResearchResult {
  topic: string;
  executiveSummary: string;
  findings: string[];
  synthesis: string;
  recommendations: string[];
  sources: {
    document_id: string;
    document_name: string;
    page: number;
    excerpt: string;
  }[];
  depth?: string;
}

export interface ResearchFinding {
  title: string;
  synthesis: string;
  citations: Citation[];
  implications: string;
}

export interface ResearchReport {
  id: string;
  query: string;
  executiveSummary: string;
  keyFindings: ResearchFinding[];
  methodology: string;
  synthesizedAt: string;
  documentsAnalyzed: { id: string; name: string; pages: number }[];
  confidenceScore: number;
}

export interface PipelineSettings {
  chunkSize: number;
  chunkOverlap: number;
  embeddingModel: string;
  similarityThreshold: number;
  topKRetrieval: number;
  backendUrl: string; // Ready for Python FastAPI / LangChain
  langSmithTracing: boolean;
  ocrEngine: string;
}

export type ActiveView =
  | 'dashboard'
  | 'documents'
  | 'collections'
  | 'chat'
  | 'document-details'
  | 'compare'
  | 'study'
  | 'research'
  | 'analytics'
  | 'settings';
