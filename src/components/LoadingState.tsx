// src/components/LoadingState.tsx
// Skeleton / loading state for when the analysis is running.

import { Loader2 } from 'lucide-react';

export function LoadingState() {
  return (
    <div className="card flex flex-col items-center gap-3 px-6 py-12 text-center">
      <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      <div>
        <h3 className="text-sm font-semibold text-ink-900">Analyzing conversation</h3>
        <p className="text-xs text-ink-500">
          Extracting insights, classifying evidence, and validating against the schema…
        </p>
      </div>
    </div>
  );
}
