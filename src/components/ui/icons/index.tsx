interface IconProps {
  className?: string;
}

function icon(d: string, opts?: { fill?: boolean; viewBox?: string }) {
  const Component = ({ className }: IconProps) => (
    <svg
      className={className}
      viewBox={opts?.viewBox ?? '0 0 24 24'}
      fill={opts?.fill ? 'currentColor' : 'none'}
      stroke={opts?.fill ? 'none' : 'currentColor'}
      strokeWidth={opts?.fill ? undefined : 2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={d} />
    </svg>
  );
  return Component;
}

function multiPath(paths: { d: string; fill?: boolean }[]) {
  const Component = ({ className }: IconProps) => (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths.map((p, i) => (
        <path
          key={i}
          d={p.d}
          fill={p.fill ? 'currentColor' : 'none'}
          stroke={p.fill ? 'none' : 'currentColor'}
        />
      ))}
    </svg>
  );
  return Component;
}

export const Search = icon('M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z');

export const Bookmark = icon('M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z');

export const BookmarkFilled = icon(
  'M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z',
  { fill: true },
);

export const Heart = icon(
  'M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z',
);

export const HeartFilled = icon(
  'M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z',
  { fill: true },
);

export const Bell = icon(
  'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
);

export const BellFilled = icon(
  'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
  { fill: true },
);

export const Share = icon(
  'M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13',
);

export const Copy = multiPath([
  { d: 'M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H8a2 2 0 01-2-2V6a2 2 0 012-2h2' },
  { d: 'M9 2h6a1 1 0 011 1v1a1 1 0 01-1 1H9a1 1 0 01-1-1V3a1 1 0 011-1z' },
]);

export const ChevronRight = icon('M9 5l7 7-7 7');

export const ChevronDown = icon('M6 9l6 6 6-6');

export const Close = icon('M6 18L18 6M6 6l12 12');

export const Menu = icon('M4 6h16M4 12h16M4 18h16');

export const Home = icon(
  'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z',
);

export const Settings = icon(
  'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.573-1.066zM15 12a3 3 0 11-6 0 3 3 0 016 0z',
);

export const Star = icon(
  'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z',
);

export const Fire = icon(
  'M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z',
);

export const Clock = multiPath([
  { d: 'M12 8v4l3 3' },
  { d: 'M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
]);

export const ArrowLeft = icon('M19 12H5m7-7l-7 7 7 7');

export const ArrowRight = icon('M5 12h14m-7-7l7 7-7 7');

export const Plus = icon('M12 4v16m8-8H4');

export const Check = icon('M5 13l4 4L19 7');

export const AlertCircle = multiPath([
  { d: 'M12 8v4m0 4h.01' },
  { d: 'M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
]);
