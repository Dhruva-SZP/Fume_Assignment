// src/components/ReviewActions.tsx
// Human-in-the-loop action bar. Each insight exposes Approve / Edit / Reject.
// The buttons are inline in cards; this component centralizes the icons + styling.

import { Check, Pencil, X } from 'lucide-react';
import type { ReviewStatus } from '@/types/analysis';
import { cn } from '@/lib/cn';

interface Props {
  status: ReviewStatus;
  onApprove: () => void;
  onEdit: () => void;
  onReject: () => void;
}

export function ReviewActions({ status, onApprove, onEdit, onReject }: Props) {
  const baseBtn = (active: boolean, color: string) =>
    cn(
      'inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors',
      active ? color : 'border border-ink-200 bg-white text-ink-600 hover:bg-ink-50'
    );
  return (
    <div className="flex flex-wrap items-center gap-2 pt-2">
      <span className="text-xs font-medium uppercase tracking-wide text-ink-500">Review</span>
      <button
        type="button"
        onClick={onApprove}
        className={baseBtn(
          status === 'Approved',
          'border border-emerald-200 bg-emerald-50 text-emerald-700'
        )}
        aria-label="Approve insight"
      >
        <Check className="h-3.5 w-3.5" /> Approve
      </button>
      <button
        type="button"
        onClick={onEdit}
        className={baseBtn(
          status === 'Edited',
          'border border-amber-200 bg-amber-50 text-amber-700'
        )}
        aria-label="Edit insight"
      >
        <Pencil className="h-3.5 w-3.5" /> Edit
      </button>
      <button
        type="button"
        onClick={onReject}
        className={baseBtn(
          status === 'Rejected',
          'border border-rose-200 bg-rose-50 text-rose-700'
        )}
        aria-label="Reject insight"
      >
        <X className="h-3.5 w-3.5" /> Reject
      </button>
    </div>
  );
}
