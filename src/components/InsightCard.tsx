// src/components/InsightCard.tsx
// The reusable card shell every domain-specific card renders inside.
// Owns: header (icon + title + badges), evidence quote, optional notes, review actions.

import type { ReactNode } from 'react';
import { Quote, ShieldAlert, ShieldCheck } from 'lucide-react';
import type { Classification, ReviewStatus } from '@/types/analysis';
import { ConfidenceBadge } from './ConfidenceBadge';
import { ClassificationBadge } from './ClassificationBadge';
import { ReviewActions } from './ReviewActions';
import { cn } from '@/lib/cn';

interface Props {
  title: string;
  icon: ReactNode;
  confidence: number;
  classification: Classification;
  value?: ReactNode; // the headline value (e.g. "5 hours", "Low")
  evidence?: string;
  notes?: string;
  reviewStatus: ReviewStatus;
  onApprove: () => void;
  onEdit: () => void;
  onReject: () => void;
  extraHeader?: ReactNode; // optional secondary badges
  children?: ReactNode; // optional body content (e.g. multiple sub-insights)
  tone?: 'default' | 'risk' | 'positive';
}

export function InsightCard({
  title,
  icon,
  confidence,
  classification,
  value,
  evidence,
  notes,
  reviewStatus,
  onApprove,
  onEdit,
  onReject,
  extraHeader,
  children,
  tone = 'default',
}: Props) {
  const showEvidence = evidence && evidence.trim().length > 0;
  const isMissing = classification === 'Missing Information';

  return (
    <article
      className={cn(
        'card flex flex-col',
        tone === 'risk' && 'border-rose-200/70',
        tone === 'positive' && 'border-emerald-200/70',
        isMissing && 'opacity-90'
      )}
    >
      <header className="card-header">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-lg',
              tone === 'risk' && 'bg-rose-50 text-rose-700',
              tone === 'positive' && 'bg-emerald-50 text-emerald-700',
              tone === 'default' && 'bg-brand-50 text-brand-700'
            )}
          >
            {icon}
          </span>
          <div>
            <h3 className="text-sm font-semibold text-ink-900">{title}</h3>
            <p className="text-xs text-ink-500">
              {isMissing ? 'Awaiting client input' : 'Extracted from transcript'}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <ConfidenceBadge confidence={confidence} />
          {extraHeader}
        </div>
      </header>

      <div className="card-body">
        {value && (
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-ink-500">Insight</p>
            <p className="mt-1 text-base font-semibold text-ink-900">{value}</p>
          </div>
        )}

        {children}

        {showEvidence && (
          <div className="rounded-lg border border-ink-100 bg-ink-50/60 p-3">
            <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-ink-500">
              <Quote className="h-3.5 w-3.5" /> Evidence
            </p>
            <blockquote className="mt-1.5 text-sm italic text-ink-800">"{evidence}"</blockquote>
          </div>
        )}

        {notes && (
          <div className="flex items-start gap-2 rounded-lg border border-violet-100 bg-violet-50/60 p-3 text-sm text-violet-900">
            <ShieldAlert className="mt-0.5 h-4 w-4 flex-shrink-0 text-violet-600" />
            <p>{notes}</p>
          </div>
        )}

        <div className="flex items-center justify-between gap-2">
          <ClassificationBadge classification={classification} />
          {!isMissing && reviewStatus === 'Approved' && (
            <span className="flex items-center gap-1 text-xs font-medium text-emerald-700">
              <ShieldCheck className="h-3.5 w-3.5" /> Coach-approved
            </span>
          )}
        </div>

        <ReviewActions
          status={reviewStatus}
          onApprove={onApprove}
          onEdit={onEdit}
          onReject={onReject}
        />
      </div>
    </article>
  );
}
