// src/components/cards/WaterCard.tsx
import { Droplet } from 'lucide-react';
import type { AnalysisResult, ReviewStatus } from '@/types/analysis';
import { InsightCard } from '../InsightCard';

interface Props {
  result: AnalysisResult;
  reviewStatus: ReviewStatus;
  onApprove: () => void;
  onEdit: () => void;
  onReject: () => void;
}

export function WaterCard({ result, reviewStatus, onApprove, onEdit, onReject }: Props) {
  const { water } = result;
  const tone = water.status === 'Inadequate' ? 'risk' : 'default';
  return (
    <InsightCard
      title="Water Intake"
      icon={<Droplet className="h-4 w-4" />}
      confidence={water.confidence}
      classification={water.classification}
      value={water.status}
      evidence={water.evidence}
      notes={
        water.status === 'Missing Information' || water.status === 'Insufficient Data'
          ? 'The AI will not estimate water intake. Ask the client for a specific number of glasses/oz.'
          : 'If intake is reported, confirm the unit and daily target before changing advice.'
      }
      reviewStatus={reviewStatus}
      onApprove={onApprove}
      onEdit={onEdit}
      onReject={onReject}
      tone={tone}
    />
  );
}
