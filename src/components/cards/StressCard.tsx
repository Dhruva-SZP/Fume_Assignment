// src/components/cards/StressCard.tsx
import { Activity } from 'lucide-react';
import type { AnalysisResult, ReviewStatus } from '@/types/analysis';
import { InsightCard } from '../InsightCard';

interface Props {
  result: AnalysisResult;
  reviewStatus: ReviewStatus;
  onApprove: () => void;
  onEdit: () => void;
  onReject: () => void;
}

export function StressCard({ result, reviewStatus, onApprove, onEdit, onReject }: Props) {
  const { stress } = result;
  const tone = stress.value === 'High' ? 'risk' : stress.value === 'Low' ? 'positive' : 'default';
  return (
    <InsightCard
      title="Stress"
      icon={<Activity className="h-4 w-4" />}
      confidence={stress.confidence}
      classification={stress.classification}
      value={stress.value}
      evidence={stress.evidence}
      notes={stress.notes}
      reviewStatus={reviewStatus}
      onApprove={onApprove}
      onEdit={onEdit}
      onReject={onReject}
      tone={tone}
    />
  );
}
