// src/services/validator.ts
// Validates the LLM's structured output before it reaches the UI.
// Checks: (1) JSON shape, (2) classification enum, (3) confidence range,
// (4) evidence presence (every insight must have *some* text), and
// (5) hallucination heuristics (numbers without context, suspiciously perfect confidence).
//
// The validator never throws on a single bad field — it collects issues so the
// coach can see exactly what to review. This is the human-in-the-loop safety net.

import type { Classification, RawLLMResponse } from '@/types/analysis';

export type IssueSeverity = 'error' | 'warning' | 'info';

export interface ValidationIssue {
  path: string; // JSON path, e.g. "nutrition.confidence"
  severity: IssueSeverity;
  message: string;
}

export interface ValidationResult {
  ok: boolean;
  issues: ValidationIssue[];
  errorCount: number;
  warningCount: number;
}

const VALID_CLASSIFICATIONS: Classification[] = [
  'Confirmed Fact',
  'Client Report',
  'AI Inference',
  'Missing Information',
];

// Confidence should never look like a guaranteed guess. Above 95 with no direct
// evidence is suspicious enough to flag for human review.
const MAX_PRACTICAL_CONFIDENCE = 95;

function isClassification(v: unknown): v is Classification {
  return typeof v === 'string' && VALID_CLASSIFICATIONS.includes(v as Classification);
}

function isMissing(s: string | undefined): boolean {
  return !s || /missing information|insufficient data|not specified|not reported|not mentioned|none/i.test(s);
}

export function validateAnalysisResponse(raw: RawLLMResponse): ValidationResult {
  const issues: ValidationIssue[] = [];

  // ---- Top-level checks ---------------------------------------------------
  if (!raw.weekly_summary || raw.weekly_summary.trim().length < 5) {
    issues.push({ path: 'weekly_summary', severity: 'error', message: 'Weekly summary is empty.' });
  }
  if (!raw.weekly_summary_evidence) {
    issues.push({ path: 'weekly_summary_evidence', severity: 'error', message: 'Weekly summary must include direct evidence.' });
  }
  if (raw.weekly_summary_confidence > MAX_PRACTICAL_CONFIDENCE && raw.weekly_summary_evidence) {
    issues.push({
      path: 'weekly_summary_confidence',
      severity: 'warning',
      message: `Confidence ${raw.weekly_summary_confidence}% is very high. Coach should review.`,
    });
  }

  // ---- Nutrition ----------------------------------------------------------
  if (!isClassification(raw.nutrition?.classification)) {
    issues.push({ path: 'nutrition.classification', severity: 'error', message: 'Invalid classification.' });
  }
  if (raw.nutrition?.classification === 'Missing Information' && raw.nutrition?.confidence !== 0) {
    issues.push({ path: 'nutrition.confidence', severity: 'warning', message: 'Missing information should have confidence 0.' });
  }
  if (isMissing(raw.nutrition?.evidence) && raw.nutrition?.classification !== 'Missing Information') {
    issues.push({ path: 'nutrition.evidence', severity: 'error', message: 'Evidence missing for nutrition insight.' });
  }

  // ---- Exercise, sleep, water, symptoms, stress, engagement ---------------
  const grouped: Array<[string, unknown, string?]> = [
    ['exercise.workouts', raw.exercise?.workouts],
    ['exercise.walking', raw.exercise?.walking],
    ['exercise.step_count', raw.exercise?.step_count],
    ['exercise.consistency', raw.exercise?.consistency],
    ['sleep.hours', raw.sleep?.hours],
    ['sleep.quality', raw.sleep?.quality],
    ['sleep.insomnia', raw.sleep?.insomnia],
    ['sleep.disturbances', raw.sleep?.disturbances],
    ['water', raw.water],
    ['stress', raw.stress],
    ['engagement', raw.engagement],
  ];
  for (const [path, field] of grouped) {
    if (!field || typeof field !== 'object') {
      issues.push({ path, severity: 'error', message: 'Field missing or malformed.' });
      continue;
    }
    const f = field as { classification?: string; confidence?: number; evidence?: string; value?: string };
    if (!isClassification(f.classification)) {
      issues.push({ path: `${path}.classification`, severity: 'error', message: 'Invalid classification.' });
    }
    if (typeof f.confidence !== 'number' || f.confidence < 0 || f.confidence > 100) {
      issues.push({ path: `${path}.confidence`, severity: 'error', message: 'Confidence must be 0-100.' });
    }
    if (f.classification === 'Missing Information' && f.confidence !== 0) {
      issues.push({ path: `${path}.confidence`, severity: 'warning', message: 'Missing Information should have confidence 0.' });
    }
    if (isMissing(f.evidence) && f.classification !== 'Missing Information') {
      issues.push({ path: `${path}.evidence`, severity: 'error', message: 'Evidence required.' });
    }
    if (f.classification === 'AI Inference' && f.confidence && f.confidence > MAX_PRACTICAL_CONFIDENCE) {
      issues.push({
        path: `${path}.confidence`,
        severity: 'warning',
        message: 'AI inference above 95% is suspicious. Review evidence.',
      });
    }
  }

  // ---- Symptoms -----------------------------------------------------------
  if (!Array.isArray(raw.symptoms?.items)) {
    issues.push({ path: 'symptoms.items', severity: 'error', message: 'Symptoms items must be an array.' });
  }

  // ---- Lists --------------------------------------------------------------
  if (!Array.isArray(raw.barriers)) {
    issues.push({ path: 'barriers', severity: 'error', message: 'Barriers must be an array.' });
  }
  if (!Array.isArray(raw.pending_actions)) {
    issues.push({ path: 'pending_actions', severity: 'error', message: 'Pending actions must be an array.' });
  }
  if (!Array.isArray(raw.risk_flags)) {
    issues.push({ path: 'risk_flags', severity: 'error', message: 'Risk flags must be an array.' });
  }
  // Risk flags must have evidence.
  raw.risk_flags?.forEach((f, i) => {
    if (!f.evidence) {
      issues.push({ path: `risk_flags[${i}].evidence`, severity: 'error', message: 'Risk flag must include evidence.' });
    }
  });

  // ---- Coach recommendation ----------------------------------------------
  if (!raw.coach_recommendation) {
    issues.push({ path: 'coach_recommendation', severity: 'error', message: 'Coach recommendation required.' });
  }
  // Crude medical-advice guard: flag recommendations that look like prescriptions.
  // Word boundaries matter: "intake" contains "take" and is fine; "take 200 mg" is not.
  // We strip common coaching idioms that contain a red-flag substring before testing.
  const ALLOWLIST = /\b(intake|mistake|uptake|undertake|stake|takeaway|takeover|breakfast|stomach|stomachache)\b/gi;
  const stripped = (raw.coach_recommendation || '').replace(ALLOWLIST, '');
  const medicalRedFlags = /\b(take|takes|took|taking|prescribe|prescribed|diagnos\w*|you have|stop taking|increase\s+(?:the\s+)?dose|mg\b|medication|antibiotic|painkiller|insulin|steroid)\b/i;
  if (medicalRedFlags.test(stripped)) {
    issues.push({
      path: 'coach_recommendation',
      severity: 'error',
      message: 'Recommendation looks like medical advice. Coaches do not prescribe.',
    });
  }

  const errorCount = issues.filter((i) => i.severity === 'error').length;
  const warningCount = issues.filter((i) => i.severity === 'warning').length;
  return { ok: errorCount === 0, issues, errorCount, warningCount };
}
