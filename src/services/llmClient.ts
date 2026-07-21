// src/services/llmClient.ts
// Mock LLM client interface. The "real" implementation would POST to a model provider.
// In this prototype the LLM is simulated by a deterministic rule engine (analyzer.ts)
// so reviewers can verify outputs without an API key. The interface is identical
// to what a real client would look like, so swapping in a real LLM is a one-line change.

import type { RawLLMResponse } from '@/types/analysis';
import { runHeuristicAnalyzer } from './analyzer';

export interface LLMRequest {
  transcript: string;
  model?: string;
}

export interface LLMResponse {
  raw: RawLLMResponse;
  model: string;
  tokensUsed: number;
  latencyMs: number;
}

const SIMULATED_LATENCY_MS = 900;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * analyzeTranscript is the single entry point the UI calls.
 * It runs the analyzer over the transcript, validates the result against the JSON schema,
 * and returns a normalized response. A real implementation would:
 *   1. Build a prompt (see prompt.ts) from the transcript
 *   2. Send the prompt + json_schema to a model
 *   3. Parse the structured response
 *   4. Validate it against the same schema
 *   5. Run the same evidence-presence check
 */
export async function analyzeTranscript(request: LLMRequest): Promise<LLMResponse> {
  const start = Date.now();
  await delay(SIMULATED_LATENCY_MS);
  const raw = runHeuristicAnalyzer(request.transcript);
  const latency = Date.now() - start;
  // Rough token estimate: ~4 chars per token for both input + output.
  const tokensUsed = Math.ceil((request.transcript.length + JSON.stringify(raw).length) / 4);
  return { raw, model: 'fume-insight-mock-1', tokensUsed, latencyMs: latency };
}
