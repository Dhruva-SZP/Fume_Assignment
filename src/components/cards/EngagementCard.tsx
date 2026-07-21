// src/components/cards/EngagementCard.tsx
import { Sparkles } from 'lucide-react';
import type { AnalysisResult, ReviewStatus } from '@/types/analysis';
import { InsightCard } from '../InsightCard';

interface Props {
  result: AnalysisResult;
  reviewStatus: ReviewStatus;
  onApprove: () => void;
  onEdit: () => void;
  onReject: () => void;
}

export function EngagementCard({ result, reviewStatus, onApprove, onEdit, onReject }: Props) {
  const { engagement } = result;
  const tone = engagement.value === 'High' ? 'positive' : engagement.value === 'Low' ? 'risk' : 'default';
  return (
    <InsightCard
      title="Engagement"
      icon={<Sparkles className="h-4 w-4" />}
      confidence={engagement.confidence}
      classification="AI Inference"
      value={engagement.value}
      evidence={engagement.evidence}
      notes={engagement.notes}
      reviewStatus={reviewStatus}
      onApprove={onApprove}
      onEdit={onEdit}
      onReject={onReject}
      tone={tone}
    />
  );
}
