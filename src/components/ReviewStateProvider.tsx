// src/components/ReviewStateProvider.tsx
// Holds per-section review statuses (Pending | Approved | Edited | Rejected).
// Local to the page — not persisted across reloads in this prototype, but the
// shape makes it easy to wire up to a backend later.

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import type { ReviewStatus } from '@/types/analysis';

type SectionKey =
  | 'weekly_summary'
  | 'nutrition'
  | 'exercise'
  | 'sleep'
  | 'water'
  | 'symptoms'
  | 'stress'
  | 'engagement'
  | 'barriers'
  | 'pending_actions'
  | 'risk_flags'
  | 'coach_recommendation';

interface ContextValue {
  statuses: Record<SectionKey, ReviewStatus>;
  setStatus: (key: SectionKey, status: ReviewStatus) => void;
  reset: () => void;
}

const ReviewContext = createContext<ContextValue | null>(null);

const ALL_KEYS: SectionKey[] = [
  'weekly_summary',
  'nutrition',
  'exercise',
  'sleep',
  'water',
  'symptoms',
  'stress',
  'engagement',
  'barriers',
  'pending_actions',
  'risk_flags',
  'coach_recommendation',
];

export function ReviewStateProvider({ children }: { children: ReactNode }) {
  const [statuses, setStatuses] = useState<Record<SectionKey, ReviewStatus>>(
    () => Object.fromEntries(ALL_KEYS.map((k) => [k, 'Pending' as ReviewStatus])) as Record<SectionKey, ReviewStatus>
  );
  const value = useMemo<ContextValue>(
    () => ({
      statuses,
      setStatus: (key, status) => setStatuses((s) => ({ ...s, [key]: status })),
      reset: () => setStatuses(Object.fromEntries(ALL_KEYS.map((k) => [k, 'Pending' as ReviewStatus])) as Record<SectionKey, ReviewStatus>),
    }),
    [statuses]
  );
  return <ReviewContext.Provider value={value}>{children}</ReviewContext.Provider>;
}

export function useReviewState(): ContextValue {
  const ctx = useContext(ReviewContext);
  if (!ctx) throw new Error('useReviewState must be used inside ReviewStateProvider');
  return ctx;
}
