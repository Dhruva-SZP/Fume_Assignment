// src/components/EmptyState.tsx
// Shown before the user runs an analysis.

import { Sparkles, FileText, Wand2 } from 'lucide-react';

interface Props {
  onUseSample: () => void;
}

export function EmptyState({ onUseSample }: Props) {
  return (
    <div className="card flex flex-col items-center gap-4 px-6 py-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
        <Sparkles className="h-6 w-6" />
      </div>
      <div>
        <h2 className="text-lg font-semibold text-ink-900">No analysis yet</h2>
        <p className="mt-1 max-w-md text-sm text-ink-600">
          Upload a coaching conversation or paste a transcript above, then run the analyzer.
          Every insight will be returned with direct evidence, a confidence score, and a
          classification badge.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-ink-500">
        <span className="inline-flex items-center gap-1.5">
          <FileText className="h-4 w-4" /> Plain text or .txt
        </span>
        <span className="text-ink-300">·</span>
        <span className="inline-flex items-center gap-1.5">
          <Wand2 className="h-4 w-4" /> Or try the sample conversation
        </span>
      </div>
      <button type="button" className="btn-ghost" onClick={onUseSample}>
        Try sample conversation
      </button>
    </div>
  );
}
