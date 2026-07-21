// src/components/ConversationUpload.tsx
// Lets the coach paste a transcript or upload a .txt file, then triggers analysis.

import { useRef, useState } from 'react';
import { FileText, Upload, Sparkles, X } from 'lucide-react';

interface Props {
  transcript: string;
  onTranscriptChange: (text: string) => void;
  onAnalyze: () => void;
  onUseSample: () => void;
  isAnalyzing: boolean;
}

export function ConversationUpload({
  transcript,
  onTranscriptChange,
  onAnalyze,
  onUseSample,
  isAnalyzing,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => onTranscriptChange(String(reader.result || ''));
    reader.readAsText(file);
  };

  const clear = () => {
    onTranscriptChange('');
    setFileName(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const canAnalyze = transcript.trim().length > 30 && !isAnalyzing;

  return (
    <section className="card">
      <div className="card-header">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
            <FileText className="h-4 w-4" />
          </span>
          <div>
            <h2 className="text-sm font-semibold text-ink-900">Conversation Upload</h2>
            <p className="text-xs text-ink-500">Paste a transcript or upload a .txt file</p>
          </div>
        </div>
        {fileName && (
          <span className="pill bg-sky-50 text-sky-700">
            {fileName}
            <button
              type="button"
              onClick={clear}
              className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full hover:bg-sky-100"
              aria-label="Clear file"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        )}
      </div>

      <div className="card-body space-y-3">
        <textarea
          value={transcript}
          onChange={(e) => onTranscriptChange(e.target.value)}
          placeholder="Paste your coaching conversation here. Each line can be prefixed with a speaker (e.g. 'Client:' or 'Coach:') for best results."
          className="block min-h-[180px] w-full rounded-lg border border-ink-200 bg-white p-3 text-sm text-ink-900 placeholder:text-ink-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
        />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,text/plain"
              onChange={handleFile}
              className="hidden"
            />
            <button
              type="button"
              className="btn-ghost"
              onClick={() => fileInputRef.current?.click()}
              disabled={isAnalyzing}
            >
              <Upload className="h-4 w-4" /> Upload .txt
            </button>
            <button
              type="button"
              className="btn-ghost"
              onClick={onUseSample}
              disabled={isAnalyzing}
            >
              <FileText className="h-4 w-4" /> Try sample
            </button>
          </div>
          <button
            type="button"
            className="btn-primary"
            onClick={onAnalyze}
            disabled={!canAnalyze}
          >
            <Sparkles className="h-4 w-4" /> {isAnalyzing ? 'Analyzing…' : 'Analyze conversation'}
          </button>
        </div>
        <p className="text-xs text-ink-500">
          Your transcript never leaves the browser in this prototype. Analysis runs against a mock LLM
          in <code className="rounded bg-ink-100 px-1">src/services</code> — see the README for instructions to swap in a real model.
        </p>
      </div>
    </section>
  );
}
