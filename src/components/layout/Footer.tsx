import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-border bg-bg-card/50 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Branding */}
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="flex items-center gap-2 text-accent">
              <span className="text-xl">&#x1F37A;</span>
              <span className="text-lg font-bold">Brews & Box Scores</span>
            </div>
            <p className="text-sm text-text-muted italic">
              Where Sports News Gets a Cold One
            </p>
            <p className="text-xs text-text-muted/70 mt-1">
              Powered by bad puns and cold beer.
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col items-center md:items-start gap-2">
            <h4 className="text-sm font-semibold text-text-primary mb-1">Quick Links</h4>
            <Link href="/" className="text-sm text-text-muted hover:text-accent transition-colors">
              Home
            </Link>
            <Link href="/sports" className="text-sm text-text-muted hover:text-accent transition-colors">
              Sports
            </Link>
            <Link href="/admin" className="text-sm text-text-muted hover:text-accent transition-colors">
              Admin
            </Link>
            <Link href="/preferences" className="text-sm text-text-muted hover:text-accent transition-colors">
              Preferences
            </Link>
          </div>

          {/* Legal / Copyright */}
          <div className="flex flex-col items-center md:items-end gap-2 text-center md:text-right">
            <p className="text-xs text-text-muted">
              AI-powered sports coverage served with personality.
            </p>
            <p className="text-xs text-text-muted mt-2">
              &copy; {new Date().getFullYear()} Brews & Box Scores. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
