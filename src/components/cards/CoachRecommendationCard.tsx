// src/components/cards/CoachRecommendationCard.tsx
import { MessageSquareHeart } from 'lucide-react';
import type { AnalysisResult, ReviewStatus } from '@/types/analysis';
import { InsightCard } from '../InsightCard';

interface Props {
  result: AnalysisResult;
  reviewStatus: ReviewStatus;
  onApprove: () => void;
  onEdit: () => void;
  onReject: () => void;
}

export function CoachRecommendationCard({ result, reviewStatus, onApprove, onEdit, onReject }: Props) {
  return (
    <InsightCard
      title="Recommended Next Action"
      icon={<MessageSquareHeart className="h-4 w-4" />}
      confidence={result.coach_recommendation_confidence}
      classification="AI Inference"
      value={result.coach_recommendation}
      evidence={result.coach_recommendation_rationale}
      notes="Coaching guidance only. Not medical advice. Always confirm with the client before changing their program."
      reviewStatus={reviewStatus}
      onApprove={onApprove}
      onEdit={onEdit}
      onReject={onReject}
    />
  );
}
