import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <span className="text-6xl mb-6">&#x1F37A;</span>
      <h1 className="text-3xl sm:text-4xl font-extrabold text-text-primary mb-3">
        404 &mdash; This Tap Is Dry
      </h1>
      <p className="text-text-secondary max-w-md mb-8 leading-relaxed">
        The page you&apos;re looking for has been 86&apos;d from the menu.
      </p>
      <Link
        href="/"
        className="px-6 py-3 rounded-xl text-sm font-bold bg-accent hover:bg-accent-hover text-bg-primary transition-all duration-300 hover:scale-105"
      >
        Back to the Bar
      </Link>
    </div>
  );
}
