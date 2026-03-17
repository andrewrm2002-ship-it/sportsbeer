'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

interface AvatarProps {
  src?: string | null;
  alt?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg';
  statusRing?: 'online' | 'offline' | 'busy' | null;
  className?: string;
}

const sizeMap: Record<string, { container: string; text: string; ring: string }> = {
  sm: { container: 'w-8 h-8', text: 'text-xs', ring: 'ring-2' },
  md: { container: 'w-10 h-10', text: 'text-sm', ring: 'ring-2' },
  lg: { container: 'w-12 h-12', text: 'text-base', ring: 'ring-[3px]' },
};

const ringColors: Record<string, string> = {
  online: 'ring-success',
  offline: 'ring-text-muted',
  busy: 'ring-error',
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function Avatar({
  src,
  alt = '',
  name = '',
  size = 'md',
  statusRing = null,
  className,
}: AvatarProps) {
  const [imgError, setImgError] = useState(false);
  const styles = sizeMap[size];
  const showImage = src && !imgError;
  const initials = name ? getInitials(name) : '?';

  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center rounded-full overflow-hidden bg-bg-elevated text-text-secondary font-semibold shrink-0',
        styles.container,
        styles.text,
        statusRing && `${styles.ring} ${ringColors[statusRing]}`,
        className,
      )}
    >
      {showImage ? (
        <img
          src={src}
          alt={alt || name}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover"
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}
