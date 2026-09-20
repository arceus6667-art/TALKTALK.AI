import React, { useState } from 'react';
import {
  FolderKanban,
  Plus,
  FileText,
  Trash2,
  MessageSquare,
  Sparkles,
  ExternalLink,
  Check,
  X
} from 'lucide-react';
import { Collection, Document } from '../types';

interface CollectionsViewProps {
  collections: Collection[];
  documents: Document[];
  onCreateCollection: (data: Partial<Collection>) => Promise<void>;
  onDeleteCollection: (id: string) => Promise<void>;
  onSelectDocument: (docId: string) => void;
  onChatWithCollection: (colId: string) => void;
}

export const CollectionsView: React.FC<CollectionsViewProps> = ({
  collections,
  documents,
  onCreateCollection,
  onDeleteCollection,
  onSelectDocument,
  onChatWithCollection
}) => {
  const [selectedColId, setSelectedColId] = useState<string>(collections[0]?.id || '');
  const [isCreating, setIsCreating] = useState(false);
  const [newColName, setNewColName] = useState('');
  const [newColDesc, setNewColDesc] = useState('');
  const [newColColor, setNewColColor] = useState('#6366F1');
  const [selectedDocIdsForNew, setSelectedDocIdsForNew] = useState<string[]>([]);

  const activeCollection = collections.find((c) => c.id === selectedColId) || collections[0];

  const collectionDocs = documents.filter((d) =>
    activeCollection?.documentIds?.includes(d.id)
  );

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColName.trim()) return;

    await onCreateCollection({
      name: newColName.trim(),
      description: newColDesc.trim(),
      color: newColColor,
      documentIds: selectedDocIdsForNew,
      icon: 'Folder'
    });

    setNewColName('');
    setNewColDesc('');
    setSelectedDocIdsForNew([]);
    setIsCreating(false);
  };

  const colors = ['#6366F1', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6', '#3B82F6'];

  return (
    <div id="talktalk-collections-view" className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-indigo-400" />
            <span>Thematic Collections</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
              {collections.length} domains
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Group documents into dedicated knowledge scopes for targeted RAG and multi-document synthesis
          </p>
        </div>

        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Collection</span>
        </button>
      </div>

      {/* Main Grid: Collections List on Left, Active Collection Documents on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Collections List */}
        <div className="space-y-3">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
            Knowledge Domains
          </div>

          <div className="space-y-2">
            {collections.map((col) => {
              const isActive = col.id === activeCollection?.id;
              return (
                <div
                  key={col.id}
                  onClick={() => setSelectedColId(col.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                    isActive
                      ? 'bg-slate-900 border-indigo-500/50 ring-1 ring-indigo-500/20 shadow-md'
                      : 'bg-slate-950/60 hover:bg-slate-900/60 border-slate-800/80 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold text-white shadow-xs"
                        style={{ backgroundColor: col.color }}
                      >
                        <FolderKanban className="w-4 h-4" />
                      </div>
                      <span className="font-semibold text-slate-200 text-xs truncate max-w-[160px]">
                        {col.name}
                      </span>
                    </div>

                    <span className="text-[11px] font-mono text-slate-400">
                      {col.documentIds?.length || 0} doc(s)
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 line-clamp-2 pl-9">
                    {col.description || 'No description provided.'}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Collection Details & Documents */}
        <div className="lg:col-span-2 space-y-5">
          {activeCollection ? (
            <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-6">
              {/* Collection Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md"
                    style={{ backgroundColor: activeCollection.color }}
                  >
                    <FolderKanban className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-100">
                      {activeCollection.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {activeCollection.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onChatWithCollection(activeCollection.id)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Chat With Scope</span>
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`Delete collection "${activeCollection.name}"?`)) {
                        onDeleteCollection(activeCollection.id);
                      }
                    }}
                    className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                    title="Delete Collection"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Documents in Collection */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                  <span>Assigned Documents ({collectionDocs.length})</span>
                  <span className="text-[11px] text-slate-500">
                    Queries in this scope will only retrieve from these documents
                  </span>
                </div>

                {collectionDocs.length === 0 ? (
                  <div className="p-8 rounded-xl bg-slate-900/30 border border-slate-800 text-center text-slate-400 text-xs">
                    No documents assigned to this collection yet. Ingest documents or edit metadata to associate.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {collectionDocs.map((doc) => (
                      <div
                        key={doc.id}
                        onClick={() => onSelectDocument(doc.id)}
                        className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 flex items-center justify-between gap-3 text-xs transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300 shrink-0">
                            <FileText className="w-4 h-4 text-indigo-400" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-slate-200 group-hover:text-indigo-300 transition-colors truncate">
                              {doc.name}
                            </div>
                            <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                              <span>{doc.pageCount} pages</span>
                              <span>•</span>
                              <span>{doc.chunksCount || 0} chunks</span>
                              <span>•</span>
                              <span className="text-emerald-400">Indexed</span>
                            </div>
                          </div>
                        </div>

                        <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 shrink-0" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500 text-xs">
              Select or create a collection to view its details.
            </div>
          )}
        </div>
      </div>

      {/* Create Collection Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                <FolderKanban className="w-4 h-4 text-indigo-400" />
                <span>Create New Knowledge Domain</span>
              </h3>
              <button
                onClick={() => setIsCreating(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Collection Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Q1 Architecture & Security Whitepapers"
                  value={newColName}
                  onChange={(e) => setNewColName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Domain scope and intended research objectives..."
                  value={newColDesc}
                  onChange={(e) => setNewColDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Color Picker */}
              <div>
                <label className="block text-slate-300 font-medium mb-1.5">Color Accent</label>
                <div className="flex items-center gap-2">
                  {colors.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewColColor(c)}
                      className={`w-6 h-6 rounded-full transition-transform ${
                        newColColor === c ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-slate-950' : 'opacity-80 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              {/* Document Selection */}
              <div>
                <label className="block text-slate-300 font-medium mb-1.5">
                  Select Documents to Include ({selectedDocIdsForNew.length})
                </label>
                <div className="max-h-36 overflow-y-auto space-y-1 bg-slate-900 p-2 rounded-lg border border-slate-800">
                  {documents.map((doc) => {
                    const checked = selectedDocIdsForNew.includes(doc.id);
                    return (
                      <div
                        key={doc.id}
                        onClick={() =>
                          setSelectedDocIdsForNew((prev) =>
                            checked ? prev.filter((id) => id !== doc.id) : [...prev, doc.id]
                          )
                        }
                        className="flex items-center justify-between p-1.5 rounded hover:bg-slate-800 cursor-pointer text-[11px]"
                      >
                        <span className="truncate pr-2 text-slate-200">{doc.name}</span>
                        <div
                          className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${
                            checked ? 'bg-indigo-600 border-indigo-500 text-white' : 'border-slate-700'
                          }`}
                        >
                          {checked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors cursor-pointer"
                >
                  Create Collection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
