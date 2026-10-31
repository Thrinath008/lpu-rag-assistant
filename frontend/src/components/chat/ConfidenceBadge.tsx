import React from 'react';
import { ConfidenceResult } from '@/lib/types';

const TONES: Record<string, { dot: string; chip: string }> = {
  green: { dot: 'bg-verified', chip: 'bg-verified-soft text-verified' },
  yellow: { dot: 'bg-caution', chip: 'bg-caution-soft text-caution' },
  red: { dot: 'bg-risk', chip: 'bg-risk-soft text-risk' },
};

export function ConfidenceBadge({ confidence }: { confidence: ConfidenceResult }) {
  if (!confidence) return null;
  const tone = TONES[confidence.color] ?? { dot: 'bg-ink-faint', chip: 'bg-paper text-ink-soft' };

  return (
    <span
      title={confidence.message}
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${tone.chip}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} />
      {confidence.label}
    </span>
  );
}
