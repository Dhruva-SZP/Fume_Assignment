// src/components/Header.tsx
import { Sparkles } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-ink-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white shadow-sm">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-ink-900">FUME · Client Intelligence</h1>
            <p className="text-xs text-ink-500">Explainable AI for health coaches</p>
          </div>
        </div>
        <a
          href="https://github.com"
          className="hidden text-xs text-ink-500 hover:text-ink-700 sm:inline"
          onClick={(e) => e.preventDefault()}
        >
          v0.1 · prototype
        </a>
      </div>
    </header>
  );
}
