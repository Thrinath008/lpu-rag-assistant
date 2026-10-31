import React from 'react';
import { Source } from '@/lib/types';

export function SourceCard({ source }: { source: Source }) {
  const pct = Math.round(source.score * 100);
  const name = source.source_file.replace(/\.(docx|txt)$/i, '').replace(/[_-]+/g, ' ');

  return (
    <div className="rounded-xl border border-line bg-surface p-3">
      <div className="flex items-start justify-between gap-3">
        <p className="min-w-0 truncate text-[13px] font-semibold capitalize text-ink" title={source.source_file}>
          {name}
        </p>
        <span className="shrink-0 font-mono text-[11px] text-ink-soft">{pct}% match</span>
      </div>
      <div className="mt-2 h-1 overflow-hidden rounded-full bg-paper">
        <div className="h-full rounded-full bg-saffron" style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-ink-soft">{source.text}</p>
    </div>
  );
}
