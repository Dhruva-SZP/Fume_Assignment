// src/components/cards/SleepCard.tsx
import { Moon } from 'lucide-react';
import type { AnalysisResult, ReviewStatus } from '@/types/analysis';
import { InsightCard } from '../InsightCard';
import { SubInsightRow } from '../SubInsightRow';

interface Props {
  result: AnalysisResult;
  reviewStatus: ReviewStatus;
  onApprove: () => void;
  onEdit: () => void;
  onReject: () => void;
}

export function SleepCard({ result, reviewStatus, onApprove, onEdit, onReject }: Props) {
  const { sleep } = result;
  const poor = /poor|bad|terrible|rough|awful/i.test(sleep.quality.value);
  return (
    <InsightCard
      title="Sleep"
      icon={<Moon className="h-4 w-4" />}
      confidence={Math.round(
        (sleep.hours.confidence + sleep.quality.confidence + sleep.insomnia.confidence + sleep.disturbances.confidence) / 4
      )}
      classification="Client Report"
      value={sleep.hours.value}
      evidence={sleep.hours.evidence}
      reviewStatus={reviewStatus}
      onApprove={onApprove}
      onEdit={onEdit}
      onReject={onReject}
      tone={poor ? 'risk' : 'default'}
    >
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <SubInsightRow
          label="Hours"
          value={sleep.hours.value}
          evidence={sleep.hours.evidence}
          confidence={sleep.hours.confidence}
          classification={sleep.hours.classification}
        />
        <SubInsightRow
          label="Quality"
          value={sleep.quality.value}
          evidence={sleep.quality.evidence}
          confidence={sleep.quality.confidence}
          classification={sleep.quality.classification}
        />
        <SubInsightRow
          label="Insomnia"
          value={sleep.insomnia.value}
          evidence={sleep.insomnia.evidence}
          confidence={sleep.insomnia.confidence}
          classification={sleep.insomnia.classification}
        />
        <SubInsightRow
          label="Disturbances"
          value={sleep.disturbances.value}
          evidence={sleep.disturbances.evidence}
          confidence={sleep.disturbances.confidence}
          classification={sleep.disturbances.classification}
        />
      </div>
    </InsightCard>
  );
}
