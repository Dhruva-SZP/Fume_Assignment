// src/components/ValidationPanel.tsx
// Surfaces validator issues to the coach. Errors block export; warnings are advisory.

import { AlertCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { ValidationResult } from '@/services/validator';

interface Props {
  result: ValidationResult;
}

export function ValidationPanel({ result }: Props) {
  if (result.errorCount === 0 && result.warningCount === 0) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
        <CheckCircle2 className="h-4 w-4" />
        <span>All insights passed validation. No hallucination or medical-advice risks detected.</span>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50/60 p-3 text-sm text-ink-800">
      <div className="flex items-center gap-2">
        {result.errorCount > 0 ? (
          <AlertCircle className="h-4 w-4 text-rose-600" />
        ) : (
          <AlertTriangle className="h-4 w-4 text-amber-600" />
        )}
        <p className="font-medium">
          {result.errorCount} error{result.errorCount === 1 ? '' : 's'} · {result.warningCount} warning{result.warningCount === 1 ? '' : 's'}
        </p>
      </div>
      <ul className="mt-2 space-y-1 text-xs">
        {result.issues.map((issue, i) => (
          <li
            key={i}
            className={
              issue.severity === 'error'
                ? 'text-rose-700'
                : issue.severity === 'warning'
                ? 'text-amber-800'
                : 'text-ink-600'
            }
          >
            <span className="font-mono text-ink-500">[{issue.path}]</span> {issue.message}
          </li>
        ))}
      </ul>
    </div>
  );
}
