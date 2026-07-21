// src/components/cards/NutritionCard.tsx
import { Salad } from 'lucide-react';
import type { AnalysisResult, ReviewStatus } from '@/types/analysis';
import { InsightCard } from '../InsightCard';

interface Props {
  result: AnalysisResult;
  reviewStatus: ReviewStatus;
  onApprove: () => void;
  onEdit: () => void;
  onReject: () => void;
}

export function NutritionCard({ result, reviewStatus, onApprove, onEdit, onReject }: Props) {
  const { nutrition } = result;
  const tone = /below|off plan|missed|skipped|inadequate/i.test(nutrition.status) ? 'risk' : 'default';
  return (
    <InsightCard
      title="Nutrition Adherence"
      icon={<Salad className="h-4 w-4" />}
      confidence={nutrition.confidence}
      classification={nutrition.classification}
      value={nutrition.status}
      evidence={nutrition.evidence}
      notes={nutrition.notes}
      reviewStatus={reviewStatus}
      onApprove={onApprove}
      onEdit={onEdit}
      onReject={onReject}
      tone={tone}
    />
  );
}
