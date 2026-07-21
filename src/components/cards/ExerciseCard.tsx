// src/components/cards/ExerciseCard.tsx
import { Dumbbell } from 'lucide-react';
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

export function ExerciseCard({ result, reviewStatus, onApprove, onEdit, onReject }: Props) {
  const { exercise } = result;
  const tone = exercise.consistency.value === 'Inconsistent' ? 'risk' : 'default';
  return (
    <InsightCard
      title="Exercise & Steps"
      icon={<Dumbbell className="h-4 w-4" />}
      confidence={Math.round(
        (exercise.workouts.confidence +
          exercise.walking.confidence +
          exercise.step_count.confidence +
          exercise.consistency.confidence) /
          4
      )}
      classification="Client Report"
      evidence={exercise.workouts.evidence}
      reviewStatus={reviewStatus}
      onApprove={onApprove}
      onEdit={onEdit}
      onReject={onReject}
      tone={tone}
    >
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <SubInsightRow
          label="Workouts"
          value={exercise.workouts.value}
          evidence={exercise.workouts.evidence}
          confidence={exercise.workouts.confidence}
          classification={exercise.workouts.classification}
        />
        <SubInsightRow
          label="Walking"
          value={exercise.walking.value}
          evidence={exercise.walking.evidence}
          confidence={exercise.walking.confidence}
          classification={exercise.walking.classification}
        />
        <SubInsightRow
          label="Step Count"
          value={exercise.step_count.value}
          evidence={exercise.step_count.evidence}
          confidence={exercise.step_count.confidence}
          classification={exercise.step_count.classification}
        />
        <SubInsightRow
          label="Consistency"
          value={exercise.consistency.value}
          evidence={exercise.consistency.evidence}
          confidence={exercise.consistency.confidence}
          classification={exercise.consistency.classification}
        />
      </div>
    </InsightCard>
  );
}
