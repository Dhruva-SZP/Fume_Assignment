// src/services/resultFactory.ts
// Converts a validated RawLLMResponse into the full AnalysisResult the UI consumes.
// Adds identity, timestamps, and a Pending human review state.

import type { AnalysisResult, RawLLMResponse } from '@/types/analysis';

export function buildAnalysisResult(
  raw: RawLLMResponse,
  meta: { sourceTranscriptId: string }
): AnalysisResult {
  const now = new Date().toISOString();
  return {
    id: `analysis_${Math.random().toString(36).slice(2, 10)}`,
    generatedAt: now,
    sourceTranscriptId: meta.sourceTranscriptId,

    weekly_summary: raw.weekly_summary,
    weekly_summary_evidence: raw.weekly_summary_evidence,
    weekly_summary_confidence: raw.weekly_summary_confidence,

    nutrition: raw.nutrition,
    exercise: raw.exercise,
    sleep: raw.sleep,
    water: raw.water,
    symptoms: raw.symptoms,
    stress: raw.stress,
    engagement: raw.engagement,

    barriers: raw.barriers,
    pending_actions: raw.pending_actions,
    risk_flags: raw.risk_flags,

    coach_recommendation: raw.coach_recommendation,
    coach_recommendation_rationale: raw.coach_recommendation_rationale,
    coach_recommendation_confidence: raw.coach_recommendation_confidence,

    human_review: { status: 'Pending' },
  };
}
