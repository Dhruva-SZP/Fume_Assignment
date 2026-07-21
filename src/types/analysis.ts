// src/types/analysis.ts
// Core TypeScript types for the Client Intelligence analysis pipeline.
// All insights share the same "Evidence + Confidence + Classification + Review" shape
// so the UI can render any card consistently and the LLM prompt can target a single schema.

export type Classification =
  | 'Confirmed Fact'
  | 'Client Report'
  | 'AI Inference'
  | 'Missing Information';

export type ReviewStatus = 'Pending' | 'Approved' | 'Edited' | 'Rejected';

export type RiskSeverity = 'low' | 'medium' | 'high';

// A single atomic insight: what the AI thinks, why, how sure, and how to classify it.
export interface Insight<T = string> {
  value: T;
  evidence: string; // Direct quote from the transcript. Never fabricated.
  confidence: number; // 0-100 integer
  classification: Classification;
  notes?: string; // Optional reasoning, especially for AI Inferences.
}

export interface NumericInsight extends Insight<string> {
  numeric?: number; // Optional numeric value when explicitly stated.
}

export interface EngagementInsight extends Insight<'High' | 'Medium' | 'Low'> {}

export interface StressInsight extends Insight<'Low' | 'Medium' | 'High'> {}

export interface NutritionInsight {
  status: string;
  classification: Classification;
  confidence: number;
  evidence: string;
  notes?: string;
}

export interface ExerciseInsight {
  workouts: Insight<string>;
  walking: Insight<string>;
  step_count: Insight<string>;
  consistency: Insight<string>;
}

export interface SleepInsight {
  hours: Insight<string>;
  quality: Insight<string>;
  insomnia: Insight<string>;
  disturbances: Insight<string>;
}

export type WaterStatus = 'Adequate' | 'Inadequate' | 'Missing Information' | 'Insufficient Data';

export interface WaterInsight {
  status: WaterStatus;
  evidence: string;
  confidence: number;
  classification: Classification;
}

export interface SymptomItem {
  symptom: 'headache' | 'fatigue' | 'illness' | 'digestive_issues' | 'soreness' | 'other';
  present: boolean;
  evidence: string;
  confidence: number;
}

export interface SymptomsInsight {
  items: SymptomItem[];
  classification: Classification;
  evidence: string;
  confidence: number;
  notes: string;
}

export interface Barrier {
  barrier: 'travel' | 'work' | 'family' | 'motivation' | 'illness' | 'lack_of_time' | 'other';
  description: string;
  evidence: string;
  confidence: number;
}

export interface PendingAction {
  action: string;
  rationale: string;
  evidence?: string;
}

export interface RiskFlag {
  flag: string;
  severity: RiskSeverity;
  evidence: string;
  category: 'sleep' | 'stress' | 'nutrition' | 'engagement' | 'symptoms' | 'other';
}

export interface HumanReview {
  status: ReviewStatus;
  reviewer?: string;
  reviewedAt?: string; // ISO timestamp
  notes?: string;
}

export interface AnalysisResult {
  // Identity / metadata
  id: string;
  generatedAt: string; // ISO timestamp
  sourceTranscriptId: string;

  // Core insights
  weekly_summary: string;
  weekly_summary_confidence: number;
  weekly_summary_evidence: string;

  nutrition: NutritionInsight;
  exercise: ExerciseInsight;
  sleep: SleepInsight;
  water: WaterInsight;
  symptoms: SymptomsInsight;
  stress: StressInsight;
  engagement: EngagementInsight;

  // Lists
  barriers: Barrier[];
  pending_actions: PendingAction[];
  risk_flags: RiskFlag[];

  // Recommendation
  coach_recommendation: string;
  coach_recommendation_rationale: string;
  coach_recommendation_confidence: number;

  // Human-in-the-loop
  human_review: HumanReview;
}

// What the LLM is asked to return (validated by schema before being merged into AnalysisResult).
// Note: this is the wire format. The UI uses AnalysisResult.
export interface RawLLMResponse {
  weekly_summary: string;
  weekly_summary_evidence: string;
  weekly_summary_confidence: number;

  nutrition: {
    status: string;
    classification: Classification;
    confidence: number;
    evidence: string;
    notes?: string;
  };

  exercise: {
    workouts: { value: string; evidence: string; confidence: number; classification: Classification };
    walking: { value: string; evidence: string; confidence: number; classification: Classification };
    step_count: { value: string; evidence: string; confidence: number; classification: Classification };
    consistency: { value: string; evidence: string; confidence: number; classification: Classification };
  };

  sleep: {
    hours: { value: string; evidence: string; confidence: number; classification: Classification };
    quality: { value: string; evidence: string; confidence: number; classification: Classification };
    insomnia: { value: string; evidence: string; confidence: number; classification: Classification };
    disturbances: { value: string; evidence: string; confidence: number; classification: Classification };
  };

  water: {
    status: WaterStatus;
    evidence: string;
    confidence: number;
    classification: Classification;
  };

  symptoms: {
    items: { symptom: SymptomItem['symptom']; present: boolean; evidence: string; confidence: number }[];
    classification: Classification;
    evidence: string;
    confidence: number;
    notes: string;
  };

  stress: { value: 'Low' | 'Medium' | 'High'; evidence: string; confidence: number; classification: Classification; notes?: string };
  engagement: { value: 'High' | 'Medium' | 'Low'; evidence: string; confidence: number; classification: Classification; notes?: string };

  barriers: Barrier[];
  pending_actions: PendingAction[];
  risk_flags: RiskFlag[];

  coach_recommendation: string;
  coach_recommendation_rationale: string;
  coach_recommendation_confidence: number;
}
