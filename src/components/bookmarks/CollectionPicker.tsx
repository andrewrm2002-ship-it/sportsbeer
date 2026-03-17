'use client';

import { useState, useEffect, useRef } from 'react';
import { useToast } from '@/components/providers/ToastProvider';
import { cn } from '@/lib/utils';

interface Collection {
  id: string;
  name: string;
  articleCount: number;
}

interface CollectionPickerProps {
  /** The article ID to add to a collection */
  articleId: string;
  /** Called after the picker closes */
  onClose?: () => void;
}

/**
 * CollectionPicker - A small dropdown to add a bookmarked article to a collection.
 * Renders as an absolutely-positioned dropdown; wrap the trigger in a relative container.
 */
export function CollectionPicker({ articleId, onClose }: CollectionPickerProps) {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingTo, setAddingTo] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const { addToast } = useToast();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/collections');
        if (res.ok) {
          const data = await res.json();
          setCollections(data);
        }
      } catch {
        // Silent
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose?.();
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  async function addToCollection(collectionId: string) {
    setAddingTo(collectionId);
    try {
      const res = await fetch(`/api/collections/${collectionId}/articles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId }),
      });

      if (res.ok) {
        addToast('Added to collection!', 'success');
        onClose?.();
      } else if (res.status === 409) {
        addToast('Already in this collection', 'info');
      } else {
        addToast('Failed to add to collection', 'error');
      }
    } catch {
      addToast('Failed to add to collection', 'error');
    } finally {
      setAddingTo(null);
    }
  }

  async function quickCreate() {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch('/api/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim() }),
      });
      if (res.ok) {
        const created = await res.json();
        setCollections((prev) => [
          ...prev,
          { id: created.id, name: created.name, articleCount: 0 },
        ]);
        setNewName('');
        // Auto-add article to the new collection
        await addToCollection(created.id);
      }
    } catch {
      addToast('Failed to create collection', 'error');
    } finally {
      setCreating(false);
    }
  }

  return (
    <div
      ref={panelRef}
      className="absolute right-0 bottom-full mb-2 w-64 bg-bg-card border border-border rounded-xl shadow-2xl z-40 overflow-hidden"
    >
      <div className="px-3 py-2 border-b border-border">
        <p className="text-xs font-semibold text-text-primary">
          Add to Collection
        </p>
      </div>

      <div className="max-h-48 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center">
            <div className="w-4 h-4 border-2 border-accent/30 border-t-accent rounded-full animate-spin mx-auto" />
          </div>
        ) : collections.length === 0 ? (
          <div className="p-3 text-center">
            <p className="text-xs text-text-muted">No collections yet</p>
          </div>
        ) : (
          collections.map((c) => (
            <button
              key={c.id}
              onClick={() => addToCollection(c.id)}
              disabled={addingTo === c.id}
              className={cn(
                'w-full text-left px-3 py-2 text-sm hover:bg-bg-elevated/50 transition-colors flex items-center justify-between',
                addingTo === c.id && 'opacity-50'
              )}
            >
              <span className="truncate text-text-primary">{c.name}</span>
              <span className="text-[10px] text-text-muted ml-2 flex-shrink-0">
                {c.articleCount}
              </span>
            </button>
          ))
        )}
      </div>

      {/* Quick create */}
      <div className="px-3 py-2 border-t border-border flex gap-1.5">
        <input
          type="text"
          placeholder="New collection..."
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') quickCreate();
          }}
          className="flex-1 px-2 py-1 bg-bg-input border border-border rounded text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
          maxLength={100}
        />
        <button
          onClick={quickCreate}
          disabled={creating || !newName.trim()}
          className={cn(
            'px-2 py-1 text-xs font-medium rounded transition-colors',
            creating || !newName.trim()
              ? 'text-text-muted cursor-not-allowed'
              : 'text-accent hover:text-accent-hover'
          )}
        >
          {creating ? '...' : '+'}
        </button>
      </div>
    </div>
  );
}
