'use client';

import { useLayoutEffect } from 'react';
import { withBasePath } from '@/lib/base-path';

function needsApiBasePath(pathname: string): boolean {
  return pathname === '/api' || pathname.startsWith('/api/');
}

function rewriteRequest(input: RequestInfo | URL): RequestInfo | URL {
  if (typeof input === 'string') {
    return needsApiBasePath(input) ? withBasePath(input) : input;
  }

  if (input instanceof URL) {
    return needsApiBasePath(input.pathname)
      ? new URL(`${withBasePath(input.pathname)}${input.search}${input.hash}`, input.origin)
      : input;
  }

  const url = new URL(input.url);
  if (!needsApiBasePath(url.pathname)) {
    return input;
  }

  const rewrittenUrl = new URL(
    `${withBasePath(url.pathname)}${url.search}${url.hash}`,
    url.origin,
  );

  return new Request(rewrittenUrl, input);
}

export function BasePathFetchShim() {
  useLayoutEffect(() => {
    const originalFetch = window.fetch.bind(window);

    window.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
      return originalFetch(rewriteRequest(input), init);
    }) as typeof window.fetch;

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  return null;
}
