'use client';

import { useState } from 'react';
import { useToast } from '@/components/providers/ToastProvider';

interface ShareButtonsProps {
  title: string;
  url?: string;
}

export function ShareButtons({ title, url }: ShareButtonsProps) {
  const { addToast } = useToast();
  const [supportsShare] = useState(
    () => typeof navigator !== 'undefined' && !!navigator.share
  );

  const getUrl = () => url || (typeof window !== 'undefined' ? window.location.href : '');

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(getUrl());
      addToast('Link copied!', 'success');
    } catch {
      addToast('Failed to copy link', 'error');
    }
  }

  function handleTwitter() {
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(getUrl())}`;
    window.open(tweetUrl, '_blank', 'noopener,noreferrer');
  }

  async function handleNativeShare() {
    try {
      await navigator.share({ title, url: getUrl() });
    } catch {
      // User cancelled or share failed silently
    }
  }

  return (
    <div className="flex items-center gap-2">
      {/* Copy Link */}
      <button
        onClick={handleCopy}
        className="p-2 rounded-lg text-text-muted hover:text-accent hover:bg-accent-muted transition-colors"
        aria-label="Copy link"
        title="Copy link"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      </button>

      {/* Twitter / X */}
      <button
        onClick={handleTwitter}
        className="p-2 rounded-lg text-text-muted hover:text-accent hover:bg-accent-muted transition-colors"
        aria-label="Share on X"
        title="Share on X"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </button>

      {/* Native Share (if available) */}
      {supportsShare && (
        <button
          onClick={handleNativeShare}
          className="p-2 rounded-lg text-text-muted hover:text-accent hover:bg-accent-muted transition-colors"
          aria-label="Share"
          title="Share"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
        </button>
      )}
    </div>
  );
}
