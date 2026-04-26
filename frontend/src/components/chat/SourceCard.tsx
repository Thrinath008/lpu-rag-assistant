// ============================================================
// Project : LPU RAG Knowledge Assistant
// Authors : Thrinath, Shambhavi, Arshad
// Year    : 2026
// Module  : SourceCard.tsx
// Phase   : 3 — Memory + Intelligence + API + Frontend
// ============================================================
import React from 'react';
import { Source } from '@/lib/types';

interface SourceCardProps {
  source: Source;
}

export function SourceCard({ source }: SourceCardProps) {
  return (
    <div className="bg-slate-800/40 border border-slate-700/50 p-3 rounded-lg text-xs hover:border-slate-600/80 transition">
      <div className="flex justify-between items-start mb-1.5">
        <span className="font-semibold text-orange-400 truncate max-w-[80%]" title={source.source_file}>
          {source.source_file.replace('.docx', '')}
        </span>
        <span className="text-slate-500 bg-slate-900/60 px-1.5 py-0.5 rounded ml-2 text-xs">
          {(source.score * 100).toFixed(0)}%
        </span>
      </div>
      <p className="text-slate-400 line-clamp-3 leading-snug" title={source.text}>
        "{source.text}"
      </p>
    </div>
  );
}
