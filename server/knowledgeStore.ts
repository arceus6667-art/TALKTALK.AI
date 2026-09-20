import {
  Document,
  DocumentChunk,
  Collection,
  Conversation,
  SavedAnswer,
  StudyCard,
  ComparisonResult,
  ResearchReport,
  PipelineSettings
} from '../src/types';

// Pre-seeded initial documents with realistic chunks & metadata
export const initialDocuments: Document[] = [
  {
    id: 'doc-ai-arch-2026',
    name: 'Enterprise_AI_Architecture_2026.pdf',
    size: 4829100,
    type: 'pdf',
    uploadDate: '2026-03-12',
    status: 'ready',
    pageCount: 38,
    collectionId: 'col-engineering',
    collectionName: 'AI & Engineering',
    tags: ['Architecture', 'RAG', 'Vector Store', 'Enterprise'],
    summary: 'Comprehensive analysis of production RAG architectures, hybrid dense-sparse vector retrievers, semantic caching layers, and LLM evaluation frameworks.',
    chunksCount: 84,
    vectorIndexed: true,
    author: 'Dr. Evelyn Mercer, Principal Architect',
    contentSnippet: 'Modern enterprise RAG pipelines require multi-stage retrieval: hybrid dense vector search combined with BM25 lexical reranking, followed by cross-encoder relevance scoring...'
  },
  {
    id: 'doc-rag-benchmarks',
    name: 'VectorDB_and_RAG_Benchmarks_Q1_2026.pdf',
    size: 2940200,
    type: 'pdf',
    uploadDate: '2026-03-14',
    status: 'ready',
    pageCount: 24,
    collectionId: 'col-engineering',
    collectionName: 'AI & Engineering',
    tags: ['Benchmarks', 'VectorDB', 'Latency', 'HNSW'],
    summary: 'Benchmarking HNSW vs IVF-PQ vector indexing techniques, P99 query latency under high QPS, and cost-efficiency trade-offs in cloud deployments.',
    chunksCount: 52,
    vectorIndexed: true,
    author: 'Systems Performance Group',
    contentSnippet: 'Under a 10M vector test set, HNSW with M=32 and efConstruction=200 achieved 98.4% recall at 14ms P99 latency, while quantization reduces RAM footprint by 72%...'
  },
  {
    id: 'doc-security-compliance',
    name: 'TalkTalk_Security_and_Data_Governance.pdf',
    size: 1845000,
    type: 'pdf',
    uploadDate: '2026-03-10',
    status: 'ready',
    pageCount: 19,
    collectionId: 'col-compliance',
    collectionName: 'Legal & Governance',
    tags: ['SOC2', 'GDPR', 'Encryption', 'PII Masking'],
    summary: 'Compliance documentation covering zero-retention LLM gateway protocols, AES-256 at rest, client-controlled KMS keys, and automated PII redaction.',
    chunksCount: 36,
    vectorIndexed: true,
    author: 'Governance & Privacy Council',
    contentSnippet: 'TalkTalk guarantees zero-training retention across LLM calls. Document chunks are tokenized through client-isolated tenant namespaces and salted vector namespaces...'
  },
  {
    id: 'doc-product-specs',
    name: 'TalkTalk_Product_Spec_v3.2.md',
    size: 892000,
    type: 'md',
    uploadDate: '2026-03-15',
    status: 'ready',
    pageCount: 12,
    collectionId: 'col-product',
    collectionName: 'Product & Roadmap',
    tags: ['Product', 'Specs', 'UI/UX', 'Mobile'],
    summary: 'Full product specification for the TalkTalk knowledge platform, detailing floating widget behaviors, citation rendering rules, and study card generation.',
    chunksCount: 26,
    vectorIndexed: true,
    author: 'Product Experience Team',
    contentSnippet: 'The floating TalkTalk widget provides omnipresent access, snapping to screen edges and allowing instantaneous transition into deep analytical workflows...'
  },
  {
    id: 'doc-quarterly-legal-scan',
    name: 'EU_AI_Act_Audit_Checklist.pdf',
    size: 3410000,
    type: 'pdf',
    uploadDate: '2026-03-18',
    status: 'ocr_required',
    pageCount: 22,
    collectionId: 'col-compliance',
    collectionName: 'Legal & Governance',
    tags: ['EU AI Act', 'Audit', 'OCR Scan'],
    summary: 'Scanned legal audit questionnaire for high-risk AI classification. Contains embedded table scans requiring high-resolution OCR parsing.',
    chunksCount: 0,
    vectorIndexed: false,
    ocrConfidence: 0.62,
    author: 'EU Regulatory Legal Counsel',
    contentSnippet: '[Requires OCR Processing: Scanned document pages detected without text layer]'
  },
  {
    id: 'doc-cloud-cost-analysis',
    name: 'Q1_Infrastructure_Cost_Model.docx',
    size: 1540000,
    type: 'docx',
    uploadDate: '2026-03-19',
    status: 'processing',
    progress: 74,
    pageCount: 15,
    collectionId: 'col-product',
    collectionName: 'Product & Roadmap',
    tags: ['Costs', 'Cloud Run', 'GCP'],
    summary: 'Processing document chunks and generating semantic embeddings...',
    chunksCount: 18,
    vectorIndexed: false,
    author: 'Cloud FinOps Lead',
    contentSnippet: 'Chunking page 11: GPU compute instance reservation comparison...'
  }
];

// Rich Document Chunks for Grounded RAG
export const documentChunks: DocumentChunk[] = [
  {
    id: 'chk-101',
    document_id: 'doc-ai-arch-2026',
    document_name: 'Enterprise_AI_Architecture_2026.pdf',
    page: 4,
    section: '2.1 Hybrid Retrieval Pipeline Architecture',
    excerpt: 'To eliminate hallucination in domain-specific tasks, modern RAG decouples retrieval into dense embeddings for semantic search and BM25 for precise token matching. A cross-encoder reranker then re-scores the top 50 candidates, returning the top 5 chunks with verified citations.',
    tokenCount: 142
  },
  {
    id: 'chk-102',
    document_id: 'doc-ai-arch-2026',
    document_name: 'Enterprise_AI_Architecture_2026.pdf',
    page: 9,
    section: '3.4 Dynamic Chunking Strategies',
    excerpt: 'Static character chunking introduces semantic fragmentation. Hierarchical chunking (parent document 1000 tokens, child chunk 200 tokens with 50-token overlap) ensures that citations pinpoint exact sentences while the LLM receives comprehensive context.',
    tokenCount: 138
  },
  {
    id: 'chk-103',
    document_id: 'doc-ai-arch-2026',
    document_name: 'Enterprise_AI_Architecture_2026.pdf',
    page: 16,
    section: '5.2 Citation Grounding and Hallucination Audits',
    excerpt: 'Every assertion generated by the reasoning model must link directly to an immutable chunk ID with page number, section heading, and verbatim excerpt. If context is insufficient, the system must declare lack of evidence rather than extrapolating.',
    tokenCount: 125
  },
  {
    id: 'chk-201',
    document_id: 'doc-rag-benchmarks',
    document_name: 'VectorDB_and_RAG_Benchmarks_Q1_2026.pdf',
    page: 6,
    section: '1.2 Indexing Algorithms: HNSW vs IVF-PQ',
    excerpt: 'HNSW provides superior recall (98.4% vs 91.2% for IVF-PQ) but requires approximately 4.2x more memory. For enterprise deployments exceeding 100 million embeddings, product quantization (PQ) with inverted file indexes is recommended with re-ranking.',
    tokenCount: 130
  },
  {
    id: 'chk-202',
    document_id: 'doc-rag-benchmarks',
    document_name: 'VectorDB_and_RAG_Benchmarks_Q1_2026.pdf',
    page: 14,
    section: '3.1 Latency Profiling under High Concurrency',
    excerpt: 'P95 end-to-end latency for the full retrieval loop was measured at 38ms (22ms vector search, 11ms reranker, 5ms context assembly). When coupled with Gemini 3.8 Flash, first-token time to glass averaged 310ms.',
    tokenCount: 129
  },
  {
    id: 'chk-301',
    document_id: 'doc-security-compliance',
    document_name: 'TalkTalk_Security_and_Data_Governance.pdf',
    page: 3,
    section: '1.1 Data Isolation and Multi-Tenancy',
    excerpt: 'Documents ingested into TalkTalk are partitioned using tenant-specific cryptographic salts. Embeddings stored in the vector database include mandatory workspace ID access control tags in vector metadata, preventing cross-tenant leakage.',
    tokenCount: 118
  },
  {
    id: 'chk-302',
    document_id: 'doc-security-compliance',
    document_name: 'TalkTalk_Security_and_Data_Governance.pdf',
    page: 8,
    section: '2.4 Zero Retention LLM Processing',
    excerpt: 'All external model invocations strictly employ enterprise commercial agreements with zero data logging and zero model fine-tuning retention. Client prompts and retrieved context are held exclusively in ephemeral memory during the lifecycle of the HTTP request.',
    tokenCount: 122
  },
  {
    id: 'chk-401',
    document_id: 'doc-product-specs',
    document_name: 'TalkTalk_Product_Spec_v3.2.md',
    page: 2,
    section: '2.0 Floating Assistant Experience',
    excerpt: 'The floating TalkTalk button acts as a persistent knowledge gateway across the workspace. It can be dragged to any viewport position, automatically snaps to the nearest lateral edge upon release, and toggles between a compact quick-query modal and the full research suite.',
    tokenCount: 131
  },
  {
    id: 'chk-402',
    document_id: 'doc-product-specs',
    document_name: 'TalkTalk_Product_Spec_v3.2.md',
    page: 7,
    section: '4.1 Study Mode and Synthesis',
    excerpt: 'Study Mode extracts core definitions, technical dilemmas, and quantitative benchmarks into interactive revision cards. Cards support active recall with self-evaluation ratings and direct citation tracking back to source paragraphs.',
    tokenCount: 115
  }
];

export const initialCollections: Collection[] = [
  {
    id: 'col-engineering',
    name: 'AI & Engineering',
    description: 'System architecture, RAG pipelines, vector databases, and engineering blueprints.',
    icon: 'Cpu',
    color: '#6366F1',
    documentIds: ['doc-ai-arch-2026', 'doc-rag-benchmarks'],
    createdAt: '2026-03-01'
  },
  {
    id: 'col-compliance',
    name: 'Legal & Governance',
    description: 'Compliance documentation, SOC2 audits, privacy frameworks, and EU AI Act checklists.',
    icon: 'ShieldCheck',
    color: '#10B981',
    documentIds: ['doc-security-compliance', 'doc-quarterly-legal-scan'],
    createdAt: '2026-03-05'
  },
  {
    id: 'col-product',
    name: 'Product & Roadmap',
    description: 'Product specifications, UX standards, UI guidelines, and FinOps models.',
    icon: 'Sparkles',
    color: '#F59E0B',
    documentIds: ['doc-product-specs', 'doc-cloud-cost-analysis'],
    createdAt: '2026-03-08'
  }
];

export const initialSavedAnswers: SavedAnswer[] = [
  {
    id: 'ans-1',
    title: 'How does TalkTalk prevent cross-tenant data leakage?',
    query: 'What security mechanism isolates tenant embeddings and documents?',
    answer: 'TalkTalk enforces tenant data isolation through cryptographic salting and mandatory workspace metadata filtering at the vector store level. Every vector chunk query must match the verified tenant token before distance calculations execute. Furthermore, external LLM calls enforce strict zero-retention terms.',
    citations: [
      {
        id: 'cit-1',
        document_id: 'doc-security-compliance',
        document_name: 'TalkTalk_Security_and_Data_Governance.pdf',
        page: 3,
        section: '1.1 Data Isolation and Multi-Tenancy',
        excerpt: 'Documents ingested into TalkTalk are partitioned using tenant-specific cryptographic salts. Embeddings stored in the vector database include mandatory workspace ID access control tags in vector metadata, preventing cross-tenant leakage.',
        confidenceScore: 0.98
      }
    ],
    savedAt: '2026-03-16T14:22:00Z',
    collectionName: 'Legal & Governance',
    tags: ['Security', 'Multi-Tenancy']
  },
  {
    id: 'ans-2',
    title: 'HNSW vs IVF-PQ Recall & Memory Trade-offs',
    query: 'What are the benchmark differences between HNSW and IVF-PQ in vector search?',
    answer: 'HNSW demonstrates 98.4% recall compared to 91.2% for IVF-PQ under 10M vector testing, but requires 4.2x higher RAM footprint. For high-scale deployments, IVF-PQ combined with cross-encoder reranking yields optimal balance between memory economy and precision.',
    citations: [
      {
        id: 'cit-2',
        document_id: 'doc-rag-benchmarks',
        document_name: 'VectorDB_and_RAG_Benchmarks_Q1_2026.pdf',
        page: 6,
        section: '1.2 Indexing Algorithms: HNSW vs IVF-PQ',
        excerpt: 'HNSW provides superior recall (98.4% vs 91.2% for IVF-PQ) but requires approximately 4.2x more memory. For enterprise deployments exceeding 100 million embeddings, product quantization (PQ) with inverted file indexes is recommended with re-ranking.',
        confidenceScore: 0.96
      }
    ],
    savedAt: '2026-03-18T09:15:00Z',
    collectionName: 'AI & Engineering',
    tags: ['VectorDB', 'Benchmarks']
  }
];

export const initialConversations: Conversation[] = [
  {
    id: 'conv-1',
    title: 'Enterprise RAG Retrieval & Latency Strategy',
    createdAt: '2026-03-17T11:00:00Z',
    updatedAt: '2026-03-17T11:35:00Z',
    documentIds: ['doc-ai-arch-2026', 'doc-rag-benchmarks'],
    model: 'gemini-3.8-flash',
    mode: 'grounded',
    pinned: true,
    messages: [
      {
        id: 'msg-1',
        role: 'user',
        content: 'What is the recommended multi-stage retrieval architecture for enterprise RAG, and what latency can we expect?',
        timestamp: '2026-03-17T11:32:00Z'
      },
      {
        id: 'msg-2',
        role: 'assistant',
        content: `Based on **Enterprise_AI_Architecture_2026.pdf** and **VectorDB_and_RAG_Benchmarks_Q1_2026.pdf**, the recommended architecture follows a three-stage hybrid retrieval strategy:

1. **Hybrid Retrieval (Dense + Lexical)**: Dense vector embeddings capture conceptual intent while BM25 handles exact keyword tokens [1].
2. **Cross-Encoder Reranking**: The top 50 candidates are re-scored, delivering the top 5 highest-confidence chunks to the reasoning model [1].
3. **Hierarchical Chunking**: Parent chunks (1,000 tokens) ensure contextual coherence while child chunks (200 tokens) enable pinpoint sentence citations [2].

### End-to-End Latency Profile:
- **Vector Search**: ~22ms [3]
- **Reranker Scoring**: ~11ms [3]
- **Context Assembly**: ~5ms [3]
- **Total Retrieval Loop**: **~38ms P95** [3]
- When combined with **Gemini 3.8 Flash**, first-token latency reaches **~310ms**, providing near-instantaneous grounded answers.`,
        timestamp: '2026-03-17T11:35:00Z',
        status: 'complete',
        modeUsed: 'grounded',
        citations: [
          {
            id: 'cit-101',
            document_id: 'doc-ai-arch-2026',
            document_name: 'Enterprise_AI_Architecture_2026.pdf',
            page: 4,
            section: '2.1 Hybrid Retrieval Pipeline Architecture',
            excerpt: 'To eliminate hallucination in domain-specific tasks, modern RAG decouples retrieval into dense embeddings for semantic search and BM25 for precise token matching. A cross-encoder reranker then re-scores the top 50 candidates, returning the top 5 chunks with verified citations.',
            confidenceScore: 0.99
          },
          {
            id: 'cit-102',
            document_id: 'doc-ai-arch-2026',
            document_name: 'Enterprise_AI_Architecture_2026.pdf',
            page: 9,
            section: '3.4 Dynamic Chunking Strategies',
            excerpt: 'Hierarchical chunking (parent document 1000 tokens, child chunk 200 tokens with 50-token overlap) ensures that citations pinpoint exact sentences while the LLM receives comprehensive context.',
            confidenceScore: 0.95
          },
          {
            id: 'cit-202',
            document_id: 'doc-rag-benchmarks',
            document_name: 'VectorDB_and_RAG_Benchmarks_Q1_2026.pdf',
            page: 14,
            section: '3.1 Latency Profiling under High Concurrency',
            excerpt: 'P95 end-to-end latency for the full retrieval loop was measured at 38ms (22ms vector search, 11ms reranker, 5ms context assembly). When coupled with Gemini 3.8 Flash, first-token time to glass averaged 310ms.',
            confidenceScore: 0.97
          }
        ]
      }
    ]
  }
];

export const defaultPipelineSettings: PipelineSettings = {
  chunkSize: 500,
  chunkOverlap: 60,
  embeddingModel: 'gemini-embedding-2-preview',
  similarityThreshold: 0.78,
  topKRetrieval: 5,
  backendUrl: 'http://localhost:8000/api/v1/rag',
  langSmithTracing: true,
  ocrEngine: 'Gemini Vision v3.8 OCR'
};

// KnowledgeStore Class managing in-memory state
class KnowledgeStore {
  private docs: Document[] = [...initialDocuments];
  private chunks: DocumentChunk[] = [...documentChunks];
  private collections: Collection[] = [...initialCollections];
  private conversations: Conversation[] = [...initialConversations];
  private savedAnswers: SavedAnswer[] = [...initialSavedAnswers];
  private pipelineSettings: PipelineSettings = { ...defaultPipelineSettings };

  getDocuments() {
    return this.docs;
  }

  getDocument(id: string) {
    return this.docs.find(d => d.id === id);
  }

  getChunks(docId?: string) {
    if (docId) {
      return this.chunks.filter(c => c.document_id === docId);
    }
    return this.chunks;
  }

  addDocument(doc: Document, textContent?: string) {
    this.docs.unshift(doc);

    // Simulate Document Pipeline: Text Extraction -> Cleaning -> Chunking -> Vector Indexing
    if (textContent) {
      const paragraphs = textContent.split(/\n\s*\n/).filter(p => p.trim().length > 20);
      paragraphs.forEach((p, idx) => {
        this.chunks.push({
          id: `chk-${doc.id}-${idx + 1}`,
          document_id: doc.id,
          document_name: doc.name,
          page: Math.floor(idx / 3) + 1,
          section: `Section ${idx + 1}`,
          excerpt: p.trim().slice(0, 300),
          tokenCount: Math.round(p.length / 4),
          vectorId: `vec-${doc.id}-${idx + 1}`,
          embeddingDimension: 768
        });
      });
      doc.chunksCount = paragraphs.length;
    }
    return doc;
  }

  updateDocument(id: string, updates: Partial<Document>) {
    const idx = this.docs.findIndex(d => d.id === id);
    if (idx !== -1) {
      this.docs[idx] = { ...this.docs[idx], ...updates };
      return this.docs[idx];
    }
    return null;
  }

  deleteDocument(id: string) {
    this.docs = this.docs.filter(d => d.id !== id);
    this.chunks = this.chunks.filter(c => c.document_id !== id);
    this.collections.forEach(col => {
      col.documentIds = col.documentIds.filter(dId => dId !== id);
    });
  }

  getCollections() {
    return this.collections;
  }

  createCollection(col: Collection) {
    this.collections.push(col);
    return col;
  }

  updateCollection(id: string, updates: Partial<Collection>) {
    const idx = this.collections.findIndex(c => c.id === id);
    if (idx !== -1) {
      this.collections[idx] = { ...this.collections[idx], ...updates };
      return this.collections[idx];
    }
    return null;
  }

  deleteCollection(id: string) {
    this.collections = this.collections.filter(c => c.id !== id);
  }

  getConversations() {
    return this.conversations;
  }

  getConversation(id: string) {
    return this.conversations.find(c => c.id === id);
  }

  saveConversation(conv: Conversation) {
    const idx = this.conversations.findIndex(c => c.id === conv.id);
    if (idx !== -1) {
      this.conversations[idx] = conv;
    } else {
      this.conversations.unshift(conv);
    }
    return conv;
  }

  deleteConversation(id: string) {
    this.conversations = this.conversations.filter(c => c.id !== id);
  }

  getSavedAnswers() {
    return this.savedAnswers;
  }

  saveAnswer(answer: SavedAnswer) {
    this.savedAnswers.unshift(answer);
    return answer;
  }

  deleteSavedAnswer(id: string) {
    this.savedAnswers = this.savedAnswers.filter(a => a.id !== id);
  }

  getPipelineSettings() {
    return this.pipelineSettings;
  }

  updatePipelineSettings(settings: Partial<PipelineSettings>) {
    this.pipelineSettings = { ...this.pipelineSettings, ...settings };
    return this.pipelineSettings;
  }

  // Production-Ready Retriever Simulation: returns relevant chunks with verified metadata
  retrieveRelevantChunks(query: string, documentIds?: string[], limit: number = 4): DocumentChunk[] {
    const queryTokens = query.toLowerCase().split(/\W+/).filter(t => t.length > 2);
    let targetChunks = this.chunks;

    if (documentIds && documentIds.length > 0) {
      targetChunks = targetChunks.filter(c => documentIds.includes(c.document_id));
    }

    // Score chunks by keyword presence & semantic density
    const scored = targetChunks.map(chunk => {
      const text = `${chunk.excerpt} ${chunk.section} ${chunk.document_name}`.toLowerCase();
      let score = 0;
      queryTokens.forEach(t => {
        if (text.includes(t)) score += 2;
      });
      return { chunk, score };
    });

    scored.sort((a, b) => b.score - a.score);

    const top = scored.filter(s => s.score > 0).slice(0, limit).map(s => s.chunk);
    if (top.length === 0 && targetChunks.length > 0) {
      return targetChunks.slice(0, limit);
    }
    return top;
  }
}

export const knowledgeStore = new KnowledgeStore();
