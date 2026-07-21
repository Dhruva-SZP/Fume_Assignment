// src/components/Dashboard.tsx
// Composes all the domain cards into a single, readable grid.

import { useState } from 'react';
import type { AnalysisResult } from '@/types/analysis';
import type { ValidationResult } from '@/services/validator';
import { useReviewState } from './ReviewStateProvider';
import { WeeklySummaryCard } from './cards/WeeklySummaryCard';
import { NutritionCard } from './cards/NutritionCard';
import { ExerciseCard } from './cards/ExerciseCard';
import { SleepCard } from './cards/SleepCard';
import { WaterCard } from './cards/WaterCard';
import { SymptomsCard } from './cards/SymptomsCard';
import { StressCard } from './cards/StressCard';
import { EngagementCard } from './cards/EngagementCard';
import { BarriersCard } from './cards/BarriersCard';
import { PendingActionsCard } from './cards/PendingActionsCard';
import { RiskFlagsCard } from './cards/RiskFlagsCard';
import { CoachRecommendationCard } from './cards/CoachRecommendationCard';
import { ValidationPanel } from './ValidationPanel';
import { JsonView } from './JsonView';

interface Props {
  result: AnalysisResult;
  validation: ValidationResult;
}

function useCardReview(key: Parameters<ReturnType<typeof useReviewState>['setStatus']>[0]) {
  const { statuses, setStatus } = useReviewState();
  return {
    reviewStatus: statuses[key],
    onApprove: () => setStatus(key, 'Approved'),
    onEdit: () => setStatus(key, 'Edited'),
    onReject: () => setStatus(key, 'Rejected'),
  };
}

export function Dashboard({ result, validation }: Props) {
  const ws = useCardReview('weekly_summary');
  const nut = useCardReview('nutrition');
  const ex = useCardReview('exercise');
  const sl = useCardReview('sleep');
  const wa = useCardReview('water');
  const sy = useCardReview('symptoms');
  const st = useCardReview('stress');
  const en = useCardReview('engagement');
  const ba = useCardReview('barriers');
  const pa = useCardReview('pending_actions');
  const rf = useCardReview('risk_flags');
  const cr = useCardReview('coach_recommendation');

  const [hideJson, setHideJson] = useState(false);

  return (
    <div className="space-y-4">
      <ValidationPanel result={validation} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="lg:col-span-2">
          <WeeklySummaryCard result={result} {...ws} />
        </div>
        <NutritionCard result={result} {...nut} />
        <ExerciseCard result={result} {...ex} />
        <SleepCard result={result} {...sl} />
        <WaterCard result={result} {...wa} />
        <StressCard result={result} {...st} />
        <SymptomsCard result={result} {...sy} />
        <EngagementCard result={result} {...en} />
        <BarriersCard result={result} {...ba} />
        <PendingActionsCard result={result} {...pa} />
        <RiskFlagsCard result={result} {...rf} />
        <div className="lg:col-span-2">
          <CoachRecommendationCard result={result} {...cr} />
        </div>
      </div>

      <div className="flex items-center justify-end">
        <button
          type="button"
          className="btn-ghost"
          onClick={() => setHideJson((v) => !v)}
        >
          {hideJson ? 'Show' : 'Hide'} raw JSON
        </button>
      </div>
      {!hideJson && <JsonView data={result} />}
    </div>
  );
}
