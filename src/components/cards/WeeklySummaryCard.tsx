// src/components/cards/WeeklySummaryCard.tsx
import { CalendarRange } from 'lucide-react';
import type { AnalysisResult, ReviewStatus } from '@/types/analysis';
import { InsightCard } from '../InsightCard';

interface Props {
  result: AnalysisResult;
  reviewStatus: ReviewStatus;
  onApprove: () => void;
  onEdit: () => void;
  onReject: () => void;
}

export function WeeklySummaryCard({ result, reviewStatus, onApprove, onEdit, onReject }: Props) {
  return (
    <InsightCard
      title="Weekly Summary"
      icon={<CalendarRange className="h-4 w-4" />}
      confidence={result.weekly_summary_confidence}
      classification="AI Inference"
      value={result.weekly_summary}
      evidence={result.weekly_summary_evidence}
      notes="Composite narrative written by the AI. Verifiable line-by-line against the cards below."
      reviewStatus={reviewStatus}
      onApprove={onApprove}
      onEdit={onEdit}
      onReject={onReject}
    />
  );
}
