// src/components/cards/SymptomsCard.tsx
import { Stethoscope } from 'lucide-react';
import type { AnalysisResult, ReviewStatus } from '@/types/analysis';
import { InsightCard } from '../InsightCard';
import { cn } from '@/lib/cn';

interface Props {
  result: AnalysisResult;
  reviewStatus: ReviewStatus;
  onApprove: () => void;
  onEdit: () => void;
  onReject: () => void;
}

const SYMPTOM_LABELS: Record<string, string> = {
  headache: 'Headache',
  fatigue: 'Fatigue',
  illness: 'Illness',
  digestive_issues: 'Digestive issues',
  soreness: 'Soreness',
  other: 'Other',
};

export function SymptomsCard({ result, reviewStatus, onApprove, onEdit, onReject }: Props) {
  const { symptoms } = result;
  const present = symptoms.items.filter((s) => s.present);
  const tone = present.length >= 2 ? 'risk' : 'default';
  const summary = present.length === 0
    ? 'No symptoms reported'
    : `Reported: ${present.map((s) => SYMPTOM_LABELS[s.symptom]).join(', ')}`;

  return (
    <InsightCard
      title="Symptoms"
      icon={<Stethoscope className="h-4 w-4" />}
      confidence={symptoms.confidence}
      classification={symptoms.classification}
      value={summary}
      evidence={symptoms.evidence}
      notes={symptoms.notes}
      reviewStatus={reviewStatus}
      onApprove={onApprove}
      onEdit={onEdit}
      onReject={onReject}
      tone={tone}
    >
      <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
        {symptoms.items.map((item) => (
          <li
            key={item.symptom}
            className={cn(
              'flex items-center justify-between rounded-md border px-3 py-2 text-sm',
              item.present
                ? 'border-rose-200 bg-rose-50/60 text-rose-800'
                : 'border-ink-100 bg-white text-ink-500'
            )}
          >
            <span className="font-medium">{SYMPTOM_LABELS[item.symptom]}</span>
            <span className="text-xs">
              {item.present ? 'Reported' : 'Not reported'}
              {item.present && item.evidence && (
                <span className="ml-2 italic text-rose-700/80">"{item.evidence.slice(0, 60)}{item.evidence.length > 60 ? '…' : ''}"</span>
              )}
            </span>
          </li>
        ))}
      </ul>
    </InsightCard>
  );
}
