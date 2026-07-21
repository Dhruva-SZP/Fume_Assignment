// src/services/analyzer.ts
// Heuristic rule-based analyzer that simulates an LLM's behavior for the prototype.
// Every rule below is intentionally conservative: when in doubt it returns
// "Missing Information" rather than guessing. This is the "hallucination prevention
// strategy" made concrete. Replace this file's body with a real LLM call to
// go to production — the contract (RawLLMResponse) is unchanged.

import type { RawLLMResponse } from '@/types/analysis';

export function runHeuristicAnalyzer(transcript: string): RawLLMResponse {
  const lower = transcript.toLowerCase();
  const lines = transcript.split(/\n+/).map((l) => l.trim()).filter(Boolean);

  // ----- Helpers ----------------------------------------------------------
  // Find the first line (or substring) that contains a keyword, return the line as evidence.
  // If we find a number alongside the keyword (e.g. "5 hours"), include that fragment.
  const findEvidence = (predicate: (l: string) => boolean): string => {
    const hit = lines.find(predicate);
    if (hit) return hit.length > 220 ? hit.slice(0, 220) + '…' : hit;
    return '';
  };

  // Prefer the line where the keyword is the topic, not a passing mention.
  // Strategy: among client lines that match the predicate, pick the one where the
  // keyword appears earliest (most "topical"); ties broken by length.
  // `keywordPattern` is used for the topicality score; if absent we fall back to a
  // generic lowercase search for any letter from the predicate's first matching line.
  const findBestEvidence = (predicate: (l: string) => boolean, keywordPattern?: RegExp): string => {
    const hits = lines.filter(predicate);
    if (hits.length === 0) return '';
    const score = (l: string) => {
      if (keywordPattern) {
        const m = l.match(keywordPattern);
        return m && m.index !== undefined ? m.index : 1000;
      }
      // Fallback: prefer the line that contains a lowercase letter early (cheap heuristic).
      const idx = l.search(/[a-z]/i);
      return idx < 0 ? 1000 : idx;
    };
    const clientLines = hits.filter((l) => !/^coach[:\s]/i.test(l));
    const pool = clientLines.length > 0 ? clientLines : hits;
    const best = pool.reduce((a, b) => {
      const sa = score(a);
      const sb = score(b);
      if (sa !== sb) return sa < sb ? a : b;
      return b.length > a.length ? b : a;
    }, pool[0]);
    return best.length > 220 ? best.slice(0, 220) + '…' : best;
  };

  // Conservative pattern: only return the numeric value if it appears in proximity
  // to a relevant keyword. Otherwise we mark the value as Missing Information.
  const findProximateNumber = (keyword: RegExp, valuePattern: RegExp): string | null => {
    const linesContaining = lines.filter((l) => keyword.test(l));
    for (const line of linesContaining) {
      const m = line.match(valuePattern);
      if (m) return m[0];
    }
    return null;
  };

  // ----- Nutrition --------------------------------------------------------
  const nutritionHit = findEvidence((l) => /meal|food|ate|eating|protein|carbs|calorie|diet|nutrition/.test(l));
  const nutritionStatus = nutritionHit
    ? /skip|miss|haven't|haven’t|not really|poorly|off track/.test(nutritionHit.toLowerCase())
      ? 'Below plan — client reports missed meals and inconsistent intake'
      : /on track|on plan|hit my|good week|stayed on/.test(nutritionHit.toLowerCase())
      ? 'On plan — client reports staying consistent'
      : 'Partially tracked — client shared partial information'
    : 'No clear nutrition signal in conversation';
  const nutrition: RawLLMResponse['nutrition'] = {
    status: nutritionStatus,
    classification: nutritionHit ? 'Client Report' : 'Missing Information',
    confidence: nutritionHit ? 78 : 0,
    evidence: nutritionHit,
    notes: nutritionHit
      ? 'Status derived from client self-report. No calorie estimation performed.'
      : 'No explicit food or meal discussion detected.',
  };

  // ----- Exercise ---------------------------------------------------------
  const workoutHit = findEvidence((l) => /workout|gym|lift|run(?!ning late)|training|class/.test(l));
  const walkHit = findEvidence((l) => /walk|steps|step count/.test(l));
  const stepsVal = findProximateNumber(/step/i, /(\d{1,2}[,.]?\d{3,5})\s*(?:steps)?/i);
  const consistencyHit = findEvidence((l) => /consistent|consistency|every day|missed.*workout|skipped.*workout/.test(l));

  const exercise: RawLLMResponse['exercise'] = {
    workouts: {
      // Use the actual client-reported frequency for the current week.
      // We prefer phrases like "twice this week" over "usually do three" because
      // "usually" is a baseline, not a report of this week.
      value: workoutHit
        ? /\b(twice|two times|2 times)\b/i.test(workoutHit) && !/usually|normally|typically|ideally/i.test(workoutHit)
          ? 'Twice this week'
          : /\b(three|3 times|three times)\b/i.test(workoutHit) && !/usually|normally|typically|ideally/i.test(workoutHit)
          ? 'Three times this week'
          : /\bonce\b|\bone time\b|\bjust once\b/i.test(workoutHit)
          ? 'Once this week'
          : /\bno workouts?\b|skipped/i.test(workoutHit)
          ? 'No workouts reported'
          : 'Workouts reported (frequency not specified)'
        : 'No workout discussion detected',
      evidence: workoutHit || 'No mention of workouts in transcript.',
      confidence: workoutHit ? 75 : 0,
      classification: workoutHit ? 'Client Report' : 'Missing Information',
    },
    walking: {
      value: walkHit ? 'Walking mentioned' : 'No walking mentioned',
      evidence: walkHit || 'No mention of walking in transcript.',
      confidence: walkHit ? 70 : 0,
      classification: walkHit ? 'Client Report' : 'Missing Information',
    },
    step_count: {
      value: stepsVal ? `~${stepsVal} steps` : 'Step count not specified',
      evidence: walkHit || 'No numeric step count shared.',
      confidence: stepsVal ? 82 : 0,
      classification: stepsVal ? 'Client Report' : 'Missing Information',
    },
    consistency: {
      value: consistencyHit
        ? /missed|skipped|off|behind/.test(consistencyHit.toLowerCase())
          ? 'Inconsistent'
          : 'Consistent'
        : 'Unclear from conversation',
      evidence: consistencyHit || 'No explicit consistency statement.',
      confidence: consistencyHit ? 72 : 0,
      classification: consistencyHit ? 'Client Report' : 'Missing Information',
    },
  };

  // ----- Sleep ------------------------------------------------------------
  const sleepHit = findEvidence((l) => /sleep|slept|insomnia|awake|woke up|tired|rest/.test(l));
  // Match either digits ("5 hours") or number-words ("five hours") close to a sleep keyword.
  const NUMBER_WORDS = 'zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve';
  const sleepHoursNumber = findProximateNumber(
    /sleep|slept|hours? of sleep|hours? of rest/i,
    /(\d+(?:\.\d+)?)\s*(?:hours?|hrs?)/i
  );
  const sleepHoursWord = findProximateNumber(
    /sleep|slept|hours? of sleep|hours? of rest/i,
    new RegExp(`\\b(${NUMBER_WORDS})\\s+hours?\\b`, 'i')
  );
  const sleepHours = sleepHoursNumber || sleepHoursWord;
  const insomniaHit = findEvidence((l) => /insomnia|can't sleep|couldn't sleep|cant sleep|wake up|woke up/.test(l));
  const disturbanceHit = findEvidence((l) => /disturb|interrupt|woke|wake.*up|night.*up/.test(l));

  const sleep: RawLLMResponse['sleep'] = {
    hours: {
      value: sleepHours
        ? (() => {
            // Convert "five hours" → "~5h"; keep digits as "~5h".
            const trimmed = sleepHours.replace(/\s*hours?\s*$/i, '').trim();
            const wordToNum: Record<string, number> = {
              one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12,
            };
            if (wordToNum[trimmed.toLowerCase()]) return `~${wordToNum[trimmed.toLowerCase()]}h`;
            if (/^\d+(?:\.\d+)?$/.test(trimmed)) return `~${trimmed}h`;
            return sleepHours;
          })()
        : 'Not specified',
      evidence: sleepHit || 'No sleep duration mentioned.',
      confidence: sleepHours ? 88 : 0,
      classification: sleepHours ? 'Client Report' : 'Missing Information',
    },
    quality: {
      value: sleepHit
        ? /poor|bad|terrible|rough|awful/.test(sleepHit.toLowerCase())
          ? 'Poor'
          : /good|great|well|solid/.test(sleepHit.toLowerCase())
          ? 'Good'
          : 'Mixed'
        : 'Unclear',
      evidence: sleepHit || 'No quality statement.',
      confidence: sleepHit ? 65 : 0,
      classification: sleepHit ? 'AI Inference' : 'Missing Information',
    },
    insomnia: {
      value: insomniaHit ? 'Reported' : 'Not reported',
      evidence: insomniaHit || 'No mention of insomnia or difficulty staying asleep.',
      confidence: insomniaHit ? 80 : 0,
      classification: insomniaHit ? 'Client Report' : 'Missing Information',
    },
    disturbances: {
      value: disturbanceHit ? 'Reported' : 'Not reported',
      evidence: disturbanceHit || 'No mention of sleep disturbances.',
      confidence: disturbanceHit ? 70 : 0,
      classification: disturbanceHit ? 'Client Report' : 'Missing Information',
    },
  };

  // ----- Water ------------------------------------------------------------
  const waterHit = findBestEvidence(
    (l) => /water|hydrat|fluid|drink|glasses|bottle/.test(l),
    /\b(water|hydrat|fluid|drink|glasses?|bottles?)\b/i
  );
  // Token-based check: split the line into words so we can look at the exact tokens present.
  // This avoids "not enough" matching as "enough" or "3 glasses" being missed because it's "three".
  const tokens = (waterHit || '').toLowerCase().split(/[^a-z0-9'-]+/).filter(Boolean);
  const NUM_LOW = new Set(['1', '2', '3', '4', '5', 'one', 'two', 'three', 'four', 'five']);
  const NUM_HIGH = new Set(['8', '9', '10', '11', '12', 'eight', 'nine', 'ten', 'eleven', 'twelve']);
  let waterDecision: 'Adequate' | 'Inadequate' | 'Insufficient Data' = 'Insufficient Data';
  if (waterHit) {
    // Strong signals first: explicit language beats numbers.
    const hasAdequate = ['plenty', 'enough', 'a lot', 'lots', 'good', 'hydrated'].some((w) => waterHit.toLowerCase().includes(w));
    const hasInadequate = ['not enough', 'probably not', 'low', 'dehydrated', 'forgot', 'missed', 'should do more', 'need to drink'].some((w) => waterHit.toLowerCase().includes(w));
    if (hasInadequate && !hasAdequate) waterDecision = 'Inadequate';
    else if (hasAdequate && !hasInadequate) waterDecision = 'Adequate';
    else if (tokens.some((t) => NUM_LOW.has(t)) && !tokens.some((t) => NUM_HIGH.has(t))) waterDecision = 'Inadequate';
    else if (tokens.some((t) => NUM_HIGH.has(t))) waterDecision = 'Adequate';
  }
  const water: RawLLMResponse['water'] = {
    status: waterHit
      ? (waterDecision as 'Adequate' | 'Inadequate' | 'Insufficient Data')
      : 'Missing Information',
    evidence: waterHit || 'No water intake discussion detected in transcript.',
    confidence: waterDecision !== 'Insufficient Data' ? 75 : waterHit ? 40 : 0,
    classification: waterHit ? 'Client Report' : 'Missing Information',
  };

  // ----- Symptoms ---------------------------------------------------------
  const symptomMap: Record<string, RegExp> = {
    headache: /headache|head hurts|migraine/,
    fatigue: /tired|exhausted|fatigue|wiped|fatigued/,
    illness: /sick|ill|cold|flu|fever|infection/,
    digestive_issues: /bloated|nausea|stomach|constipat|diarrh|digest/,
    soreness: /sore|aching|soreness|muscle pain|stiff/,
  };
  const symptoms: RawLLMResponse['symptoms'] = {
    items: Object.entries(symptomMap).map(([symptom, pattern]) => {
      const hit = findEvidence((l) => pattern.test(l));
      return {
        symptom: symptom as RawLLMResponse['symptoms']['items'][number]['symptom'],
        present: Boolean(hit),
        evidence: hit || `No mention of ${symptom.replace('_', ' ')} in transcript.`,
        confidence: hit ? 80 : 0,
      };
    }),
    classification: 'Client Report',
    evidence: findEvidence((l) => /tired|sore|headache|nausea|bloat|stomach|sick|cold|flu/.test(l)) || 'No symptoms reported.',
    confidence: 80,
    notes:
      'Symptoms are reported only — not diagnosed. Severity is not inferred; clients should be asked to describe onset, duration, and intensity in follow-ups.',
  };

  // ----- Stress -----------------------------------------------------------
  const stressHit = findEvidence((l) => /stress|overwhelm|anxious|anxiety|burn(ed)?\s*out|tension/.test(l));
  const stressHigh = stressHit && /(extreme|very|overwhelm|burnt|burned out|too much|unbearable)/i.test(stressHit);
  const stressLow = stressHit && /(calm|fine|good|manageable|relaxed)/i.test(stressHit);
  const stress: RawLLMResponse['stress'] = {
    value: stressHigh ? 'High' : stressLow ? 'Low' : stressHit ? 'Medium' : 'Low',
    evidence: stressHit || 'No stress language detected; defaulting to Low (not confirmed).',
    confidence: stressHit ? (stressHigh || stressLow ? 78 : 62) : 35,
    classification: stressHit ? (stressHigh || stressLow ? 'Client Report' : 'AI Inference') : 'Missing Information',
    notes: stressHit ? undefined : 'No direct evidence of stress; coach should confirm in next session.',
  };

  // ----- Engagement -------------------------------------------------------
  // Engagement is a derived signal — always classified as AI Inference.
  const wordCount = transcript.split(/\s+/).filter(Boolean).length;
  const enthusiasm = (lower.match(/!|love it|great|awesome|excited|happy to/g) || []).length;
  const hesitation = (lower.match(/i guess|maybe|i don't know|i dunno|kind of|sort of|not really/i) || []).length;
  let engagementValue: 'High' | 'Medium' | 'Low' = 'Medium';
  if (wordCount < 80 && hesitation > 1) engagementValue = 'Low';
  else if (enthusiasm >= 2 && wordCount > 200) engagementValue = 'High';
  const engagement: RawLLMResponse['engagement'] = {
    value: engagementValue,
    evidence: lines.slice(0, 3).join(' ').slice(0, 220) || 'Insufficient client utterances to evaluate.',
    confidence: wordCount > 120 ? 68 : 50,
    classification: 'AI Inference',
    notes: 'Derived from response length, enthusiasm markers, and hedging language. Coach should validate.',
  };

  // ----- Barriers ---------------------------------------------------------
  const barrierPatterns: Array<{ barrier: RawLLMResponse['barriers'][number]['barrier']; pattern: RegExp; description: string }> = [
    { barrier: 'travel', pattern: /travel|fly(ing)?|trip|vacation|out of town/, description: 'Travel disrupting routine' },
    { barrier: 'work', pattern: /work|deadline|meeting|office|shift|overtime/, description: 'Work-related demands' },
    { barrier: 'family', pattern: /kids|family|child|spouse|partner|mom|dad|parent/, description: 'Family obligations' },
    { barrier: 'motivation', pattern: /motivat|lazy|unmotivat|don’t feel like|burnt|burned out/, description: 'Motivation challenge' },
    { barrier: 'illness', pattern: /sick|ill|cold|flu|unwell/, description: 'Illness' },
    { barrier: 'lack_of_time', pattern: /no time|too busy|running out of time|busy week|short on time/, description: 'Time scarcity' },
  ];
  const barriers: RawLLMResponse['barriers'] = barrierPatterns
    .map(({ barrier, pattern, description }) => {
      const hit = findEvidence((l) => pattern.test(l));
      if (!hit) return null;
      return { barrier, description, evidence: hit, confidence: 75 };
    })
    .filter((b): b is RawLLMResponse['barriers'][number] => b !== null);

  // ----- Pending Actions --------------------------------------------------
  // Build pending actions from the data we actually found evidence for. No fabrication.
  const pending_actions: RawLLMResponse['pending_actions'] = [];
  if (water.status === 'Inadequate' || water.status === 'Insufficient Data') {
    pending_actions.push({
      action: 'Confirm water intake volume (glasses/oz)',
      rationale: 'Water status is unclear or low. Ask for a specific daily amount.',
      evidence: water.evidence,
    });
  }
  if (sleep.hours.classification === 'Missing Information') {
    pending_actions.push({
      action: 'Ask for average sleep hours this week',
      rationale: 'Sleep duration was not discussed.',
      evidence: sleep.hours.evidence,
    });
  }
  if (exercise.workouts.classification === 'Missing Information') {
    pending_actions.push({
      action: 'Request workout log for the week',
      rationale: 'No workout session details were shared.',
      evidence: exercise.workouts.evidence,
    });
  }
  if (symptoms.items.some((i) => i.present)) {
    pending_actions.push({
      action: 'Follow up on reported symptoms — onset, duration, severity',
      rationale: 'Symptoms reported; coach should clarify before any program change.',
      evidence: symptoms.evidence,
    });
  }
  pending_actions.push({
    action: 'Share photo of one meal this week',
    rationale: 'Standard accountability action — provides visual evidence for next review.',
  });

  // ----- Risk Flags -------------------------------------------------------
  const risk_flags: RawLLMResponse['risk_flags'] = [];
  if (sleepHours && Number(sleepHours) < 5) {
    risk_flags.push({
      flag: 'Very poor sleep',
      severity: 'high',
      evidence: sleepHit,
      category: 'sleep',
    });
  }
  if (stress.value === 'High') {
    risk_flags.push({
      flag: 'High reported stress',
      severity: 'high',
      evidence: stressHit,
      category: 'stress',
    });
  }
  if (nutrition.status.toLowerCase().includes('below') || /skip|miss/i.test(nutritionStatus)) {
    risk_flags.push({
      flag: 'Nutrition off-plan',
      severity: 'medium',
      evidence: nutritionHit,
      category: 'nutrition',
    });
  }
  if (engagement.value === 'Low') {
    risk_flags.push({
      flag: 'Low engagement',
      severity: 'medium',
      evidence: engagement.evidence,
      category: 'engagement',
    });
  }
  const worseningSymptoms = symptoms.items.filter((s) => s.present).length >= 2;
  if (worseningSymptoms) {
    risk_flags.push({
      flag: 'Multiple symptoms reported',
      severity: 'medium',
      evidence: symptoms.evidence,
      category: 'symptoms',
    });
  }

  // ----- Coach Recommendation --------------------------------------------
  // Always education/coaching oriented — never medical.
  const recs: string[] = [];
  if (sleepHours && Number(sleepHours) < 6) recs.push('Review sleep hygiene and explore a wind-down routine.');
  if (water.status !== 'Adequate') recs.push('Ask about daily water intake and set a specific target.');
  if (exercise.workouts.classification === 'Missing Information') recs.push('Request a workout log for the week.');
  if (stress.value === 'High' || stress.value === 'Medium') recs.push('Check in on stress levels and adjust expectations if needed.');
  if (symptoms.items.some((i) => i.present)) recs.push('Follow up on reported symptoms — ask about onset, duration, and severity.');
  if (engagement.value === 'Low') recs.push('Use a short, low-friction check-in next session to rebuild momentum.');
  if (recs.length === 0) recs.push('Reinforce the current plan and ask what would make next week even better.');

  const coach_recommendation = recs.slice(0, 3).join(' ');
  const weekly_summary_evidence = lines[0] || transcript.slice(0, 200);
  const formatSleepHours = (s: string | null) => {
    if (!s) return 'Sleep not discussed';
    const n = Number(s);
    if (!Number.isNaN(n) && n > 0) return `Sleep ~${n}h`;
    // Word-form: "five hours" → "Sleep ~5h (client reported)"
    const wordToNum: Record<string, number> = {
      one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12,
    };
    const word = s.replace(/\s*hours?$/, '').trim().toLowerCase();
    if (wordToNum[word]) return `Sleep ~${wordToNum[word]}h`;
    return `Sleep: ${s}`;
  };
  const weekly_summary =
    `Client ${engagement.value.toLowerCase()}-engagement week. ` +
    (nutritionStatus ? `Nutrition: ${nutritionStatus.toLowerCase()}. ` : '') +
    `${formatSleepHours(sleepHours)}. ` +
    (water.status !== 'Missing Information' ? `Water ${water.status.toLowerCase()}. ` : '') +
    (exercise.workouts.value !== 'No workout discussion detected' ? `Exercise: ${exercise.workouts.value.toLowerCase()}. ` : '');

  return {
    weekly_summary,
    weekly_summary_evidence,
    weekly_summary_confidence: 72,
    nutrition,
    exercise,
    sleep,
    water,
    symptoms,
    stress,
    engagement,
    barriers,
    pending_actions,
    risk_flags,
    coach_recommendation,
    coach_recommendation_rationale:
      'Recommendation derived from highest-confidence gaps. No medical advice is given — coach is advised to gather more information before any program change.',
    coach_recommendation_confidence: 70,
  };
}
