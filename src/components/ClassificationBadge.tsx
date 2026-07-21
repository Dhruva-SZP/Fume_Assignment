// src/components/ClassificationBadge.tsx
import type { Classification } from '@/types/analysis';
import { classificationTone } from '@/lib/format';
import { Info } from 'lucide-react';

interface Props {
  classification: Classification;
  showDescription?: boolean;
}

export function ClassificationBadge({ classification, showDescription = false }: Props) {
  const tone = classificationTone[classification];
  return (
    <span className="inline-flex flex-col items-start gap-1">
      <span className={`pill ${tone.className}`}>{tone.label}</span>
      {showDescription && (
        <span className="flex items-start gap-1 text-xs text-ink-500">
          <Info className="mt-0.5 h-3 w-3 flex-shrink-0" aria-hidden />
          <span>{tone.description}</span>
        </span>
      )}
    </span>
  );
}
