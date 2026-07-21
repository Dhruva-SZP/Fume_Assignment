// src/components/SubInsightRow.tsx
// Compact row used inside cards that have multiple sub-insights
// (e.g. exercise: workouts, walking, step count, consistency).

import type { Classification } from '@/types/analysis';
import { ConfidenceBadge } from './ConfidenceBadge';
import { ClassificationBadge } from './ClassificationBadge';
import { cn } from '@/lib/cn';

interface Props {
  label: string;
  value: string;
  evidence?: string;
  confidence: number;
  classification: Classification;
}

export function SubInsightRow({ label, value, evidence, confidence, classification }: Props) {
  return (
    <div className={cn('rounded-lg border border-ink-100 bg-white p-3')}>
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-ink-500">{label}</p>
          <p className="mt-0.5 text-sm font-semibold text-ink-900">{value}</p>
        </div>
        <ConfidenceBadge confidence={confidence} />
      </div>
      {evidence && evidence.trim() && (
        <p className="mt-2 border-t border-ink-100 pt-2 text-xs italic text-ink-600">"{evidence}"</p>
      )}
      <div className="mt-2 flex items-center justify-end">
        <ClassificationBadge classification={classification} />
      </div>
    </div>
  );
}
