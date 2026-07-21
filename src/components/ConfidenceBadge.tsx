// src/components/ConfidenceBadge.tsx
import { confidenceTone } from '@/lib/format';
import { cn } from '@/lib/cn';

interface Props {
  confidence: number;
  className?: string;
}

export function ConfidenceBadge({ confidence, className }: Props) {
  const tone = confidenceTone(confidence);
  return (
    <span
      className={cn('pill', tone.className, className)}
      title="Confidence reflects how strongly the evidence supports the insight."
    >
      {tone.label}
    </span>
  );
}
