export function Footer() {
  return (
    <footer className="border-t border-border bg-bg-card/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex items-center gap-2 text-accent">
            <span className="text-xl">&#x1F37A;</span>
            <span className="text-lg font-bold">Brews & Box Scores</span>
          </div>
          <p className="text-sm text-text-muted italic">
            Where Sports News Gets a Cold One
          </p>
          <p className="text-xs text-text-muted mt-2">
            &copy; {new Date().getFullYear()} Brews & Box Scores. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
