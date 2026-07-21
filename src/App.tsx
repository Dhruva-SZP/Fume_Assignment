// src/App.tsx
import { useCallback, useState } from 'react';
import { Header } from './components/Header';
import { ConversationUpload } from './components/ConversationUpload';
import { Dashboard } from './components/Dashboard';
import { EmptyState } from './components/EmptyState';
import { LoadingState } from './components/LoadingState';
import { ReviewStateProvider, useReviewState } from './components/ReviewStateProvider';
import { analyzeTranscript } from './services/llmClient';
import { validateAnalysisResponse } from './services/validator';
import { buildAnalysisResult } from './services/resultFactory';
import type { AnalysisResult } from './types/analysis';
import type { ValidationResult } from './services/validator';
import { SAMPLE_TRANSCRIPT, SAMPLE_TRANSCRIPT_NAME } from './services/sample';

function AppInner() {
  const [transcript, setTranscript] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { reset: resetReviews } = useReviewState();

  const handleAnalyze = useCallback(async () => {
    if (transcript.trim().length < 30) return;
    setIsAnalyzing(true);
    setError(null);
    try {
      const llmResponse = await analyzeTranscript({ transcript });
      const v = validateAnalysisResponse(llmResponse.raw);
      const r = buildAnalysisResult(llmResponse.raw, { sourceTranscriptId: 'transcript_' + Date.now() });
      setResult(r);
      setValidation(v);
      resetReviews();
    } catch (err) {
      console.error(err);
      setError('Something went wrong while analyzing. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  }, [transcript, resetReviews]);

  const handleUseSample = useCallback(() => {
    setTranscript(SAMPLE_TRANSCRIPT);
  }, []);

  return (
    <div className="min-h-full">
      <Header />
      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6">
        <ConversationUpload
          transcript={transcript}
          onTranscriptChange={setTranscript}
          onAnalyze={handleAnalyze}
          onUseSample={handleUseSample}
          isAnalyzing={isAnalyzing}
        />

        {error && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
            {error}
          </div>
        )}

        {isAnalyzing && <LoadingState />}

        {!isAnalyzing && result && validation && <Dashboard result={result} validation={validation} />}

        {!isAnalyzing && !result && (
          <EmptyState onUseSample={handleUseSample} />
        )}

        <footer className="pt-6 text-center text-xs text-ink-500">
          Sample: {SAMPLE_TRANSCRIPT_NAME}. Built for the FUME GenAI Product Intern Assignment.
        </footer>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ReviewStateProvider>
      <AppInner />
    </ReviewStateProvider>
  );
}
