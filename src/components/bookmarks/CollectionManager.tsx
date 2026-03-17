'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/providers/ToastProvider';
import { cn } from '@/lib/utils';

interface Collection {
  id: string;
  name: string;
  description: string | null;
  createdAt: number;
  articleCount: number;
}

export function CollectionManager() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { addToast } = useToast();

  const fetchCollections = useCallback(async () => {
    try {
      const res = await fetch('/api/collections');
      if (res.ok) {
        const data = await res.json();
        setCollections(data);
      }
    } catch {
      addToast('Failed to load collections', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  async function handleCreate() {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch('/api/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName.trim(),
          description: newDesc.trim() || undefined,
        }),
      });
      if (res.ok) {
        const created = await res.json();
        setCollections((prev) => [
          ...prev,
          { ...created, articleCount: 0 },
        ]);
        setNewName('');
        setNewDesc('');
        setShowCreate(false);
        addToast('Collection created!', 'success');
      } else {
        addToast('Failed to create collection', 'error');
      }
    } catch {
      addToast('Failed to create collection', 'error');
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/collections?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setCollections((prev) => prev.filter((c) => c.id !== id));
        addToast('Collection deleted', 'info');
      } else {
        addToast('Failed to delete collection', 'error');
      }
    } catch {
      addToast('Failed to delete collection', 'error');
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-20 rounded-xl skeleton"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-text-primary">Collections</h2>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-accent/10 text-accent rounded-lg hover:bg-accent/20 transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          New Collection
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="p-4 bg-bg-elevated rounded-xl border border-border space-y-3">
          <input
            type="text"
            placeholder="Collection name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="w-full px-3 py-2 bg-bg-input border border-border rounded-lg text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:border-accent"
            maxLength={100}
          />
          <input
            type="text"
            placeholder="Description (optional)"
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            className="w-full px-3 py-2 bg-bg-input border border-border rounded-lg text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:border-accent"
            maxLength={255}
          />
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => {
                setShowCreate(false);
                setNewName('');
                setNewDesc('');
              }}
              className="px-3 py-1.5 text-sm text-text-muted hover:text-text-primary transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={creating || !newName.trim()}
              className={cn(
                'px-4 py-1.5 text-sm font-medium rounded-lg transition-colors',
                creating || !newName.trim()
                  ? 'bg-accent/30 text-bg-primary/50 cursor-not-allowed'
                  : 'bg-accent hover:bg-accent-hover text-bg-primary'
              )}
            >
              {creating ? 'Creating...' : 'Create'}
            </button>
          </div>
        </div>
      )}

      {/* Collection list */}
      {collections.length === 0 ? (
        <div className="text-center py-8">
          <span className="text-3xl block mb-2">&#x1F4DA;</span>
          <p className="text-sm text-text-muted">
            No collections yet. Create one to organize your bookmarks!
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {collections.map((collection) => (
            <div
              key={collection.id}
              className={cn(
                'flex items-center justify-between p-4 bg-bg-card rounded-xl border border-border hover:border-border-accent transition-colors',
                deletingId === collection.id && 'opacity-50'
              )}
            >
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold text-text-primary truncate">
                  {collection.name}
                </h3>
                {collection.description && (
                  <p className="text-xs text-text-muted truncate mt-0.5">
                    {collection.description}
                  </p>
                )}
                <p className="text-xs text-text-muted/60 mt-1">
                  {collection.articleCount} article
                  {collection.articleCount !== 1 ? 's' : ''}
                </p>
              </div>
              <button
                onClick={() => handleDelete(collection.id)}
                disabled={deletingId === collection.id}
                className="ml-3 p-2 rounded-lg text-text-muted hover:text-error hover:bg-error/10 transition-colors flex-shrink-0"
                title="Delete collection"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
