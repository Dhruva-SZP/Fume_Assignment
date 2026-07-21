// src/lib/format.ts
// Small helpers for rendering insights consistently.

import type { Classification, RiskSeverity } from '@/types/analysis';

export const classificationTone: Record<Classification, { label: string; className: string; description: string }> = {
  'Confirmed Fact': {
    label: 'Confirmed Fact',
    className: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200',
    description: 'Coach or client stated this as a measurable, observable event.',
  },
  'Client Report': {
    label: 'Client Report',
    className: 'bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-200',
    description: 'Client self-reported — subjective experience, food log, or symptoms.',
  },
  'AI Inference': {
    label: 'AI Inference',
    className: 'bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-200',
    description: 'Derived by the AI from indirect signals. Verify before relying on it.',
  },
  'Missing Information': {
    label: 'Missing Information',
    className: 'bg-ink-100 text-ink-700 ring-1 ring-inset ring-ink-200',
    description: 'Not present in the transcript. Coach should ask for this.',
  },
};

export function confidenceTone(confidence: number): { label: string; className: string } {
  if (confidence === 0) return { label: 'No data', className: 'bg-ink-100 text-ink-600' };
  if (confidence < 70) return { label: `Low · ${confidence}%`, className: 'bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-200' };
  if (confidence < 85) return { label: `Medium · ${confidence}%`, className: 'bg-sky-50 text-sky-800 ring-1 ring-inset ring-sky-200' };
  return { label: `High · ${confidence}%`, className: 'bg-emerald-50 text-emerald-800 ring-1 ring-inset ring-emerald-200' };
}

export function severityTone(severity: RiskSeverity): { label: string; className: string } {
  switch (severity) {
    case 'high':
      return { label: 'High', className: 'bg-rose-50 text-rose-800 ring-1 ring-inset ring-rose-200' };
    case 'medium':
      return { label: 'Medium', className: 'bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-200' };
    case 'low':
      return { label: 'Low', className: 'bg-sky-50 text-sky-800 ring-1 ring-inset ring-sky-200' };
  }
}

export function valueTone(value: string): { className: string } {
  const lower = value.toLowerCase();
  if (/(inadequate|poor|low|miss|skipped|bad|high|severe)/.test(lower)) {
    return { className: 'text-rose-700' };
  }
  if (/(adequate|good|on track|consistent|well)/.test(lower)) {
    return { className: 'text-emerald-700' };
  }
  return { className: 'text-ink-800' };
}
