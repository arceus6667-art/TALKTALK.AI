import 'dotenv/config';
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { knowledgeStore } from './server/knowledgeStore';
import { aiService } from './server/aiService';
import { Document } from './src/types';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '25mb' }));

  // ==========================================
  // Health & System Info
  // ==========================================
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'TalkTalk Knowledge Assistant',
      hasGeminiApiKey: Boolean(process.env.GEMINI_API_KEY),
      primaryModel: 'gemini-3.8-flash',
      version: '3.2.0'
    });
  });

  // ==========================================
  // Document Management API
  // ==========================================
  app.get('/api/documents', (req, res) => {
    res.json(knowledgeStore.getDocuments());
  });

  app.get('/api/documents/:id', (req, res) => {
    const doc = knowledgeStore.getDocument(req.params.id);
    if (!doc) {
      return res.status(404).json({ error: 'Document not found' });
    }
    const chunks = knowledgeStore.getChunks(req.params.id);
    res.json({ document: doc, chunks });
  });

  app.post('/api/documents/upload', (req, res) => {
    const { name, size, type, collectionId, content, simulateStatus } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Document name is required' });
    }

    const id = `doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const pageCount = Math.max(1, Math.ceil((size || 50000) / 45000));
    const collection = collectionId ? knowledgeStore.getCollections().find(c => c.id === collectionId) : undefined;

    const newDoc: Document = {
      id,
      name,
      size: size || 124000,
      type: (type || 'pdf').toLowerCase().includes('pdf') ? 'pdf' : (type || 'md').includes('md') ? 'md' : 'docx',
      uploadDate: new Date().toISOString().split('T')[0],
      status: simulateStatus || 'ready',
      pageCount,
      collectionId,
      collectionName: collection?.name,
      tags: ['Uploaded', type || 'Document'],
      summary: `Uploaded document ${name}. Vector indexed and ready for grounded retrieval.`,
      chunksCount: Math.ceil(pageCount * 2.2),
      vectorIndexed: simulateStatus !== 'ocr_required' && simulateStatus !== 'failed',
      contentSnippet: content ? content.slice(0, 350) : `Extracted text snippet from ${name}...`
    };

    const added = knowledgeStore.addDocument(newDoc, content || `Content of ${name}\n\nSection 1: Executive Overview\nThis document provides primary reference data for TalkTalk.`);
    
    if (collectionId && collection) {
      if (!collection.documentIds.includes(id)) {
        collection.documentIds.push(id);
      }
    }

    res.status(201).json(added);
  });

  app.post('/api/documents/:id/ocr', (req, res) => {
    const doc = knowledgeStore.getDocument(req.params.id);
    if (!doc) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Simulate OCR pipeline processing -> Ready
    const updated = knowledgeStore.updateDocument(doc.id, {
      status: 'ready',
      ocrConfidence: 0.97,
      vectorIndexed: true,
      chunksCount: doc.pageCount * 3,
      summary: `OCR scanned and verified with Gemini Vision. Extracted ${doc.pageCount * 3} searchable text chunks.`
    });

    res.json(updated);
  });

  app.delete('/api/documents/:id', (req, res) => {
    knowledgeStore.deleteDocument(req.params.id);
    res.json({ success: true, id: req.params.id });
  });

  // ==========================================
  // Collections API
  // ==========================================
  app.get('/api/collections', (req, res) => {
    res.json(knowledgeStore.getCollections());
  });

  app.post('/api/collections', (req, res) => {
    const { name, description, icon, color, documentIds = [] } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });

    const newCol = {
      id: `col-${Date.now()}`,
      name,
      description: description || '',
      icon: icon || 'Folder',
      color: color || '#6366F1',
      documentIds,
      createdAt: new Date().toISOString().split('T')[0]
    };

    knowledgeStore.createCollection(newCol);
    res.status(201).json(newCol);
  });

  app.delete('/api/collections/:id', (req, res) => {
    knowledgeStore.deleteCollection(req.params.id);
    res.json({ success: true });
  });

  // ==========================================
  // Conversations API
  // ==========================================
  app.get('/api/conversations', (req, res) => {
    res.json(knowledgeStore.getConversations());
  });

  app.post('/api/conversations', (req, res) => {
    const conv = req.body;
    if (!conv.id) {
      conv.id = `conv-${Date.now()}`;
    }
    conv.updatedAt = new Date().toISOString();
    const saved = knowledgeStore.saveConversation(conv);
    res.json(saved);
  });

  app.delete('/api/conversations/:id', (req, res) => {
    knowledgeStore.deleteConversation(req.params.id);
    res.json({ success: true });
  });

  // ==========================================
  // Saved Answers API
  // ==========================================
  app.get('/api/saved-answers', (req, res) => {
    res.json(knowledgeStore.getSavedAnswers());
  });

  app.post('/api/saved-answers', (req, res) => {
    const ans = req.body;
    ans.id = ans.id || `ans-${Date.now()}`;
    ans.savedAt = ans.savedAt || new Date().toISOString();
    const saved = knowledgeStore.saveAnswer(ans);
    res.json(saved);
  });

  app.delete('/api/saved-answers/:id', (req, res) => {
    knowledgeStore.deleteSavedAnswer(req.params.id);
    res.json({ success: true });
  });

  // ==========================================
  // Settings API
  // ==========================================
  app.get('/api/settings', (req, res) => {
    res.json(knowledgeStore.getPipelineSettings());
  });

  app.post('/api/settings', (req, res) => {
    const updated = knowledgeStore.updatePipelineSettings(req.body);
    res.json(updated);
  });

  // ==========================================
  // AI Service Endpoints (Clean Abstractions)
  // ==========================================
  
  // 1. answerQuestion
  app.post('/api/ai/answer', async (req, res) => {
    try {
      const response = await aiService.answerQuestion(req.body);
      res.json(response);
    } catch (err: any) {
      console.error('API /api/ai/answer failed:', err);
      res.status(500).json({ error: err?.message || 'Failed to answer question' });
    }
  });

  // 2. summarizeDocument
  app.post('/api/ai/summarize', async (req, res) => {
    try {
      const response = await aiService.summarizeDocument(req.body);
      res.json(response);
    } catch (err: any) {
      console.error('API /api/ai/summarize failed:', err);
      res.status(500).json({ error: err?.message || 'Failed to summarize document' });
    }
  });

  // 3. compareDocuments
  app.post('/api/ai/compare', async (req, res) => {
    try {
      const response = await aiService.compareDocuments(req.body);
      res.json(response);
    } catch (err: any) {
      console.error('API /api/ai/compare failed:', err);
      res.status(500).json({ error: err?.message || 'Failed to compare documents' });
    }
  });

  // 4. generateStudyMaterial
  app.post('/api/ai/study-material', async (req, res) => {
    try {
      const response = await aiService.generateStudyMaterial(req.body);
      res.json(response);
    } catch (err: any) {
      console.error('API /api/ai/study-material failed:', err);
      res.status(500).json({ error: err?.message || 'Failed to generate study material' });
    }
  });

  // 5. researchQuestion
  app.post('/api/ai/research', async (req, res) => {
    try {
      const response = await aiService.researchQuestion(req.body);
      res.json(response);
    } catch (err: any) {
      console.error('API /api/ai/research failed:', err);
      res.status(500).json({ error: err?.message || 'Failed to run research question' });
    }
  });

  // Analytics endpoint
  app.get('/api/analytics', (req, res) => {
    const docs = knowledgeStore.getDocuments();
    const chunks = knowledgeStore.getChunks();
    const readyDocs = docs.filter(d => d.status === 'ready');

    res.json({
      totalQueriesCount: 1420,
      averageRetrievalLatencyMs: 34,
      firstTokenLatencyMs: 310,
      groundedPrecisionScore: 99.1,
      totalDocuments: docs.length,
      readyDocuments: readyDocs.length,
      totalChunksIndexed: chunks.length,
      vectorStorageUsedMb: 14.8,
      popularTopics: [
        { topic: 'Hybrid RAG Pipeline', queryCount: 420, avgConfidence: 0.98 },
        { topic: 'HNSW vs IVF-PQ Benchmarks', queryCount: 315, avgConfidence: 0.96 },
        { topic: 'Tenant Security & Salting', queryCount: 280, avgConfidence: 0.99 },
        { topic: 'Zero Retention Compliance', queryCount: 225, avgConfidence: 0.97 },
        { topic: 'Hierarchical Chunking (1000/200)', queryCount: 180, avgConfidence: 0.95 }
      ],
      retrievalLatencyTrend: [
        { day: 'Mon', vectorSearchMs: 24, rerankMs: 12, llmMs: 280 },
        { day: 'Tue', vectorSearchMs: 22, rerankMs: 11, llmMs: 260 },
        { day: 'Wed', vectorSearchMs: 21, rerankMs: 10, llmMs: 275 },
        { day: 'Thu', vectorSearchMs: 25, rerankMs: 13, llmMs: 290 },
        { day: 'Fri', vectorSearchMs: 20, rerankMs: 9, llmMs: 250 },
        { day: 'Sat', vectorSearchMs: 18, rerankMs: 8, llmMs: 240 },
        { day: 'Sun', vectorSearchMs: 19, rerankMs: 9, llmMs: 245 }
      ]
    });
  });

  // ==========================================
  // Vite Integration & Static Serving
  // ==========================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TalkTalk AI Knowledge Assistant running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
