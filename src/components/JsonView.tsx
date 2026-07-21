// src/components/JsonView.tsx
// Collapsible raw-JSON viewer. Useful for debugging and for the technical panel.

import { useState } from 'react';
import { Code, ChevronDown, ChevronRight } from 'lucide-react';

interface Props {
  data: unknown;
  title?: string;
}

export function JsonView({ data, title = 'Raw JSON' }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <div className="card">
      <button
        type="button"
        className="card-header w-full text-left"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink-100 text-ink-700">
            <Code className="h-4 w-4" />
          </span>
          <div>
            <h2 className="text-sm font-semibold text-ink-900">{title}</h2>
            <p className="text-xs text-ink-500">Click to expand the structured response</p>
          </div>
        </div>
        {open ? <ChevronDown className="h-4 w-4 text-ink-500" /> : <ChevronRight className="h-4 w-4 text-ink-500" />}
      </button>
      {open && (
        <pre className="max-h-[480px] overflow-auto rounded-b-xl bg-ink-950 px-4 py-3 text-xs leading-relaxed text-ink-100">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
}
