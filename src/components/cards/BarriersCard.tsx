// src/components/cards/BarriersCard.tsx
import { ShieldAlert } from 'lucide-react';
import type { AnalysisResult, ReviewStatus } from '@/types/analysis';
import { InsightCard } from '../InsightCard';
import { ConfidenceBadge } from '../ConfidenceBadge';

interface Props {
  result: AnalysisResult;
  reviewStatus: ReviewStatus;
  onApprove: () => void;
  onEdit: () => void;
  onReject: () => void;
}

const BARRIER_LABELS: Record<string, string> = {
  travel: 'Travel',
  work: 'Work',
  family: 'Family',
  motivation: 'Motivation',
  illness: 'Illness',
  lack_of_time: 'Lack of time',
  other: 'Other',
};

export function BarriersCard({ result, reviewStatus, onApprove, onEdit, onReject }: Props) {
  const { barriers } = result;
  const maxConfidence = barriers.length === 0
    ? 0
    : Math.max(...barriers.map((b) => b.confidence));
  return (
    <InsightCard
      title="Key Barriers"
      icon={<ShieldAlert className="h-4 w-4" />}
      confidence={maxConfidence}
      classification={barriers.length === 0 ? 'Missing Information' : 'Client Report'}
      value={barriers.length === 0 ? 'No barriers reported' : `${barriers.length} barrier${barriers.length === 1 ? '' : 's'} identified`}
      evidence={barriers[0]?.evidence}
      reviewStatus={reviewStatus}
      onApprove={onApprove}
      onEdit={onEdit}
      onReject={onReject}
    >
      {barriers.length === 0 ? (
        <p className="text-sm text-ink-500">No barriers mentioned in the transcript.</p>
      ) : (
        <ul className="space-y-2">
          {barriers.map((b) => (
            <li key={b.barrier + b.description} className="rounded-md border border-ink-100 p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-ink-900">{BARRIER_LABELS[b.barrier]}</p>
                <ConfidenceBadge confidence={b.confidence} />
              </div>
              <p className="text-xs text-ink-600">{b.description}</p>
              {b.evidence && <p className="mt-1 text-xs italic text-ink-500">"{b.evidence}"</p>}
            </li>
          ))}
        </ul>
      )}
    </InsightCard>
  );
}
