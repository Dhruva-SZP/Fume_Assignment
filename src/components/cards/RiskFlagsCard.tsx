// src/components/cards/RiskFlagsCard.tsx
import { AlertTriangle } from 'lucide-react';
import type { AnalysisResult, ReviewStatus } from '@/types/analysis';
import { InsightCard } from '../InsightCard';
import { severityTone } from '@/lib/format';

interface Props {
  result: AnalysisResult;
  reviewStatus: ReviewStatus;
  onApprove: () => void;
  onEdit: () => void;
  onReject: () => void;
}

export function RiskFlagsCard({ result, reviewStatus, onApprove, onEdit, onReject }: Props) {
  const { risk_flags } = result;
  const maxSeverity = risk_flags.some((f) => f.severity === 'high')
    ? 'high'
    : risk_flags.some((f) => f.severity === 'medium')
    ? 'medium'
    : 'low';
  return (
    <InsightCard
      title="Risk Flags"
      icon={<AlertTriangle className="h-4 w-4" />}
      confidence={risk_flags.length > 0 ? 80 : 0}
      classification={risk_flags.length > 0 ? 'Client Report' : 'Missing Information'}
      value={risk_flags.length === 0 ? 'No meaningful risks detected' : `${risk_flags.length} risk${risk_flags.length === 1 ? '' : 's'} flagged`}
      reviewStatus={reviewStatus}
      onApprove={onApprove}
      onEdit={onEdit}
      onReject={onReject}
      tone={risk_flags.length > 0 && maxSeverity === 'high' ? 'risk' : 'default'}
    >
      {risk_flags.length === 0 ? (
        <p className="text-sm text-ink-500">
          Nothing in this conversation rises to a meaningful risk level. Keep monitoring.
        </p>
      ) : (
        <ul className="space-y-2">
          {risk_flags.map((f) => {
            const tone = severityTone(f.severity);
            return (
              <li
                key={f.flag + f.category}
                className="flex items-start gap-3 rounded-md border border-rose-100 bg-rose-50/40 p-3"
              >
                <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-rose-600" />
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-rose-800">{f.flag}</p>
                    <span className={`pill ${tone.className}`}>{tone.label} severity</span>
                  </div>
                  <p className="text-xs text-ink-600">Category: {f.category}</p>
                  {f.evidence && (
                    <p className="mt-1 text-xs italic text-ink-600">"{f.evidence}"</p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </InsightCard>
  );
}
