# FUME · Client Intelligence Dashboard

> AI-powered coaching assistant for health coaches. Extracts weekly intelligence from a coaching transcript with **direct evidence, confidence scores, classification badges, and human review** — never invents numbers, never diagnoses.

This is a frontend prototype for the **FUME GenAI Product Intern Assignment**. It demonstrates product thinking, AI reliability, explainability, structured outputs, and hallucination prevention.

---

## ✨ Features

- **Upload** a coaching conversation (paste text or upload `.txt`).
- **Analyze** the transcript against a strict JSON schema.
- **12 insight cards** — Weekly Summary, Nutrition, Exercise, Sleep, Water, Symptoms, Stress, Engagement, Barriers, Pending Actions, Risk Flags, Coach Recommendation.
- Every insight shows: **value, direct evidence quote, confidence, classification**.
- **Human review** (Approve / Edit / Reject) on every card.
- **Validator** flags hallucinations and any medical-advice leak.
- **Raw JSON** viewer for transparency.

---

## 🧠 Hallucination prevention strategy

| Rule | Implementation |
| --- | --- |
| Never invent numbers | `analyzer.ts` only extracts numerics from text that contains a relevant keyword nearby. Otherwise returns `Missing Information` with confidence `0`. |
| Never estimate calories | The model never produces calorie counts; nutrition status is derived from qualitative client reports. |
| Never estimate water | The dashboard only reports what the client said (e.g. "three glasses"). |
| Never estimate sleep | Sleep hours are quoted verbatim from the transcript. |
| Never diagnose | Symptoms are summarized, not diagnosed. The validator scans recommendations for medical language (`take`, `mg`, `prescribe`, etc.) and flags errors. |
| Never infer motivation without evidence | Engagement is always classified `AI Inference` and shown with a notes field. |
| Missing → say so | Any field with no direct evidence is returned as `Missing Information` with confidence `0`. |
| Confidence floor | Below `70` triggers a `Low · N%` confidence badge and surfaces a warning in the validation panel. |
| Schema-validated | The JSON Schema in `src/types/schema.ts` is enforced; the validator collects issues without crashing. |

The mock LLM in `src/services/analyzer.ts` is intentionally conservative — it returns `Missing Information` whenever it cannot quote a line of the transcript.

---

## 🧪 Failure scenarios handled

| Scenario | What happens |
| --- | --- |
| Empty transcript | The "Analyze" button stays disabled (< 30 chars). |
| Transcript with no nutrition discussion | Nutrition card shows `Missing Information` with confidence 0. |
| Transcript with vague language ("I guess…") | Engagement is flagged `Low` with hedging-language rationale. |
| Transcript with a confident claim and no evidence | The validator downgrades confidence and surfaces a warning. |
| LLM returns medical advice | The validator blocks the recommendation with a red error. |
| LLM invents a number | The validator's evidence-presence check requires a direct quote. |
| LLM returns invalid JSON / wrong classification | The validator lists the issue paths; the UI never crashes. |

---

## 🛠 Tech stack

- React 18 + TypeScript
- Vite
- Tailwind CSS
- Lucide icons
- No backend — uses a deterministic mock LLM (`src/services/analyzer.ts`) that obeys the same JSON schema a real model would. Swapping in a real LLM is a one-file change.

---

## 🚀 Setup

```bash
cd fume-client-intel
npm install
npm run dev
```

Then open `http://localhost:5173` and click **Try sample conversation → Analyze conversation**.

### Build

```bash
npm run build
```

### Type-check

```bash
npm run lint
```

---

## 🗂 Folder structure

```
fume-client-intel/
├── public/
│   ├── favicon.svg
│   ├── sample-conversation.txt     # Sample transcript for the "Try sample" button
│   └── sample-response.json        # Sample full LLM response
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   ├── index.css
│   ├── types/
│   │   ├── analysis.ts             # TypeScript types
│   │   └── schema.ts               # JSON Schema (for the LLM)
│   ├── services/
│   │   ├── llmClient.ts            # Single entry point the UI calls
│   │   ├── analyzer.ts             # Mock LLM (replace with real call)
│   │   ├── prompt.ts               # The full LLM prompt
│   │   ├── validator.ts            # Post-LLM validation
│   │   ├── resultFactory.ts        # Wraps the LLM response with identity
│   │   └── sample.ts               # Bundled sample transcript
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── ConversationUpload.tsx
│   │   ├── Dashboard.tsx
│   │   ├── InsightCard.tsx
│   │   ├── SubInsightRow.tsx
│   │   ├── ConfidenceBadge.tsx
│   │   ├── ClassificationBadge.tsx
│   │   ├── ReviewActions.tsx
│   │   ├── ReviewStateProvider.tsx
│   │   ├── ValidationPanel.tsx
│   │   ├── JsonView.tsx
│   │   ├── EmptyState.tsx
│   │   ├── LoadingState.tsx
│   │   └── cards/
│   │       ├── WeeklySummaryCard.tsx
│   │       ├── NutritionCard.tsx
│   │       ├── ExerciseCard.tsx
│   │       ├── SleepCard.tsx
│   │       ├── WaterCard.tsx
│   │       ├── SymptomsCard.tsx
│   │       ├── StressCard.tsx
│   │       ├── EngagementCard.tsx
│   │       ├── BarriersCard.tsx
│   │       ├── PendingActionsCard.tsx
│   │       ├── RiskFlagsCard.tsx
│   │       └── CoachRecommendationCard.tsx
│   └── lib/
│       ├── cn.ts
│       └── format.ts
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
└── README.md
```

---

## 🧩 The LLM prompt

The full prompt is in `src/services/prompt.ts`. It is shipped here for reviewer reference:

### System

> You are FUME Insight, a conservative AI assistant for health coaches. Your job is to extract client intelligence from a coaching conversation transcript.
>
> ABSOLUTE RULES — non-negotiable:
> 1. EVIDENCE REQUIRED. Every insight MUST be supported by a direct quote from the transcript. If you cannot find a direct quote, return the field as "Missing Information" with confidence 0. Never paraphrase as evidence.
> 2. NO FABRICATION. Never invent numbers, calories, water volumes, sleep durations, step counts, or diagnoses. If the client didn't say it, return Missing Information.
> 3. NO MEDICAL CLAIMS. Never diagnose. Symptoms are summarized only when the client reports them.
> 4. NO MOTIVATION INFERENCE WITHOUT EVIDENCE. Do not infer motivation, attitude, or emotion unless the client explicitly expresses it. Default classification for motivation/engagement is "AI Inference".
> 5. CLASSIFY EVERY INSIGHT. Each insight must carry one of: "Confirmed Fact", "Client Report", "AI Inference", "Missing Information".
> 6. CONFIDENCE. Score 0-100. If below 70, the field should be flagged as low confidence and the coach should be told to verify.
> 7. STRUCTURED OUTPUT ONLY. Respond with JSON matching the schema provided. No prose outside JSON.

### User

> Analyze the following coaching conversation. {Client: … Week of: …}
> TRANSCRIPT: """…"""
> Return JSON matching this schema: { … full schema … }
> Remember: … (rules + classification enum + the "no medical advice" guard)

---

## 📦 JSON schema (excerpt)

The full schema is in `src/types/schema.ts`. Key shape:

```jsonc
{
  "weekly_summary": "string",
  "weekly_summary_evidence": "string",
  "weekly_summary_confidence": 0,
  "nutrition": {
    "status": "string",
    "classification": "Confirmed Fact | Client Report | AI Inference | Missing Information",
    "confidence": 0,
    "evidence": "string"
  },
  "exercise": {
    "workouts":   { "value": "string", "evidence": "string", "confidence": 0, "classification": "..." },
    "walking":    { "value": "string", "evidence": "string", "confidence": 0, "classification": "..." },
    "step_count": { "value": "string", "evidence": "string", "confidence": 0, "classification": "..." },
    "consistency":{ "value": "string", "evidence": "string", "confidence": 0, "classification": "..." }
  },
  "sleep": { "hours": ..., "quality": ..., "insomnia": ..., "disturbances": ... },
  "water":  { "status": "Adequate | Inadequate | Missing Information | Insufficient Data", "evidence": "string", "confidence": 0, "classification": "..." },
  "symptoms": {
    "items": [
      { "symptom": "headache | fatigue | illness | digestive_issues | soreness | other", "present": false, "evidence": "string", "confidence": 0 }
    ],
    "classification": "...",
    "evidence": "string",
    "confidence": 0,
    "notes": "string"
  },
  "stress":     { "value": "Low | Medium | High", "evidence": "string", "confidence": 0, "classification": "..." },
  "engagement": { "value": "High | Medium | Low", "evidence": "string", "confidence": 0, "classification": "..." },
  "barriers":       [ { "barrier": "travel | work | family | motivation | illness | lack_of_time | other", "description": "string", "evidence": "string", "confidence": 0 } ],
  "pending_actions":[ { "action": "string", "rationale": "string", "evidence": "string" } ],
  "risk_flags":     [ { "flag": "string", "severity": "low | medium | high", "evidence": "string", "category": "sleep | stress | nutrition | engagement | symptoms | other" } ],
  "coach_recommendation": "string",
  "coach_recommendation_rationale": "string",
  "coach_recommendation_confidence": 0
}
```

A full sample response is in `public/sample-response.json`.

---

## 🔁 Swapping in a real LLM

Replace the body of `runHeuristicAnalyzer` in `src/services/analyzer.ts` with:

```ts
export async function runHeuristicAnalyzer(transcript: string): Promise<RawLLMResponse> {
  const { system, user, schema } = buildAnalysisPrompt({ transcript });
  const response = await fetch('https://api.your-llm-provider.com/v1/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${import.meta.env.VITE_LLM_KEY}` },
    body: JSON.stringify({
      model: 'your-model',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      response_format: { type: 'json_schema', json_schema: { name: 'analysis', schema } },
    }),
  });
  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
}
```

Then update `llmClient.ts` to `await runHeuristicAnalyzer(request.transcript)`. Everything else — validation, the UI, the cards — is unchanged.

---

## 🩺 Sample conversation

The bundled sample (`public/sample-conversation.txt` / "Try sample" button) covers sleep deficit, hydration gaps, stress, and multiple symptoms. It is designed to exercise every card.

---

## 🛡 Responsible AI notes

- The AI **assists** coaches. It does not replace them.
- Every recommendation is coaching-oriented, not medical.
- Every insight is human-reviewable.
- Every insight carries evidence; missing evidence is shown as `Missing Information`, not a guess.

---

## License

Internal prototype — not for distribution.
