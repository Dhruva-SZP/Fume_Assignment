// src/components/cards/PendingActionsCard.tsx
import { ListChecks } from 'lucide-react';
import type { AnalysisResult, ReviewStatus } from '@/types/analysis';
import { InsightCard } from '../InsightCard';

interface Props {
  result: AnalysisResult;
  reviewStatus: ReviewStatus;
  onApprove: () => void;
  onEdit: () => void;
  onReject: () => void;
}

export function PendingActionsCard({ result, reviewStatus, onApprove, onEdit, onReject }: Props) {
  const { pending_actions } = result;
  return (
    <InsightCard
      title="Pending Actions"
      icon={<ListChecks className="h-4 w-4" />}
      confidence={pending_actions.length > 0 ? 80 : 0}
      classification={pending_actions.length > 0 ? 'AI Inference' : 'Missing Information'}
      value={pending_actions.length > 0 ? `${pending_actions.length} action${pending_actions.length === 1 ? '' : 's'} to follow up on` : 'No pending actions'}
      reviewStatus={reviewStatus}
      onApprove={onApprove}
      onEdit={onEdit}
      onReject={onReject}
    >
      {pending_actions.length === 0 ? (
        <p className="text-sm text-ink-500">No pending actions generated.</p>
      ) : (
        <ul className="space-y-2">
          {pending_actions.map((a, i) => (
            <li
              key={a.action + i}
              className="flex items-start gap-3 rounded-md border border-ink-100 p-3"
            >
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-500"
                aria-label={`Mark ${a.action} complete`}
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-ink-900">{a.action}</p>
                <p className="text-xs text-ink-600">{a.rationale}</p>
                {a.evidence && (
                  <p className="mt-1 text-xs italic text-ink-500">"{a.evidence}"</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </InsightCard>
  );
}
