// src/types/schema.ts
// JSON Schema for the LLM output. This is the contract the prompt enforces
// and what the validator (src/services/validator.ts) checks before we trust the response.

export const analysisJsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'ClientIntelligenceAnalysis',
  description:
    'Structured output for a coaching conversation. Every field that claims a fact MUST include direct evidence from the transcript.',
  type: 'object',
  required: [
    'weekly_summary',
    'weekly_summary_evidence',
    'weekly_summary_confidence',
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
  ],
  additionalProperties: false,
  properties: {
    weekly_summary: { type: 'string', minLength: 1 },
    weekly_summary_evidence: { type: 'string', minLength: 1 },
    weekly_summary_confidence: { type: 'integer', minimum: 0, maximum: 100 },

    nutrition: {
      type: 'object',
      required: ['status', 'classification', 'confidence', 'evidence'],
      additionalProperties: false,
      properties: {
        status: { type: 'string' },
        classification: {
          type: 'string',
          enum: ['Confirmed Fact', 'Client Report', 'AI Inference', 'Missing Information'],
        },
        confidence: { type: 'integer', minimum: 0, maximum: 100 },
        evidence: { type: 'string' },
        notes: { type: 'string' },
      },
    },

    exercise: {
      type: 'object',
      required: ['workouts', 'walking', 'step_count', 'consistency'],
      additionalProperties: false,
      properties: {
        workouts: insightSchema,
        walking: insightSchema,
        step_count: insightSchema,
        consistency: insightSchema,
      },
    },

    sleep: {
      type: 'object',
      required: ['hours', 'quality', 'insomnia', 'disturbances'],
      additionalProperties: false,
      properties: {
        hours: insightSchema,
        quality: insightSchema,
        insomnia: insightSchema,
        disturbances: insightSchema,
      },
    },

    water: {
      type: 'object',
      required: ['status', 'evidence', 'confidence', 'classification'],
      additionalProperties: false,
      properties: {
        status: {
          type: 'string',
          enum: ['Adequate', 'Inadequate', 'Missing Information', 'Insufficient Data'],
        },
        evidence: { type: 'string' },
        confidence: { type: 'integer', minimum: 0, maximum: 100 },
        classification: {
          type: 'string',
          enum: ['Confirmed Fact', 'Client Report', 'AI Inference', 'Missing Information'],
        },
      },
    },

    symptoms: {
      type: 'object',
      required: ['items', 'classification', 'evidence', 'confidence', 'notes'],
      additionalProperties: false,
      properties: {
        items: {
          type: 'array',
          items: {
            type: 'object',
            required: ['symptom', 'present', 'evidence', 'confidence'],
            additionalProperties: false,
            properties: {
              symptom: {
                type: 'string',
                enum: ['headache', 'fatigue', 'illness', 'digestive_issues', 'soreness', 'other'],
              },
              present: { type: 'boolean' },
              evidence: { type: 'string' },
              confidence: { type: 'integer', minimum: 0, maximum: 100 },
            },
          },
        },
        classification: {
          type: 'string',
          enum: ['Confirmed Fact', 'Client Report', 'AI Inference', 'Missing Information'],
        },
        evidence: { type: 'string' },
        confidence: { type: 'integer', minimum: 0, maximum: 100 },
        notes: { type: 'string' },
      },
    },

    stress: insightWithEnum(['Low', 'Medium', 'High']),
    engagement: insightWithEnum(['High', 'Medium', 'Low']),

    barriers: {
      type: 'array',
      items: {
        type: 'object',
        required: ['barrier', 'description', 'evidence', 'confidence'],
        additionalProperties: false,
        properties: {
          barrier: {
            type: 'string',
            enum: ['travel', 'work', 'family', 'motivation', 'illness', 'lack_of_time', 'other'],
          },
          description: { type: 'string' },
          evidence: { type: 'string' },
          confidence: { type: 'integer', minimum: 0, maximum: 100 },
        },
      },
    },

    pending_actions: {
      type: 'array',
      items: {
        type: 'object',
        required: ['action', 'rationale'],
        additionalProperties: false,
        properties: {
          action: { type: 'string' },
          rationale: { type: 'string' },
          evidence: { type: 'string' },
        },
      },
    },

    risk_flags: {
      type: 'array',
      items: {
        type: 'object',
        required: ['flag', 'severity', 'evidence', 'category'],
        additionalProperties: false,
        properties: {
          flag: { type: 'string' },
          severity: { type: 'string', enum: ['low', 'medium', 'high'] },
          evidence: { type: 'string' },
          category: {
            type: 'string',
            enum: ['sleep', 'stress', 'nutrition', 'engagement', 'symptoms', 'other'],
          },
        },
      },
    },

    coach_recommendation: { type: 'string', minLength: 1 },
    coach_recommendation_rationale: { type: 'string' },
    coach_recommendation_confidence: { type: 'integer', minimum: 0, maximum: 100 },
  },
};

// Helper builders keep the schema above readable.
function insightSchema() {
  return {
    type: 'object',
    required: ['value', 'evidence', 'confidence', 'classification'],
    additionalProperties: false,
    properties: {
      value: { type: 'string' },
      evidence: { type: 'string' },
      confidence: { type: 'integer', minimum: 0, maximum: 100 },
      classification: {
        type: 'string',
        enum: ['Confirmed Fact', 'Client Report', 'AI Inference', 'Missing Information'],
      },
    },
  };
}

function insightWithEnum(allowed: string[]) {
  const base = insightSchema();
  return {
    ...base,
    properties: {
      ...base.properties,
      value: { type: 'string', enum: allowed },
    },
  };
}
