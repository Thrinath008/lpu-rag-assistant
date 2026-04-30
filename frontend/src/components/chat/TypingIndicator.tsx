// ============================================================
// Project : LPU RAG Knowledge Assistant
// Authors : Thrinath, Shambhavi, irshad
// Year    : 2026
// Module  : TypingIndicator.tsx
// Phase   : 3 — Memory + Intelligence + API + Frontend
// ============================================================
import React from 'react';
import { Bot, Sparkles } from 'lucide-react';

export function TypingIndicator() {
  return (
    <div className="flex gap-4 animate-in fade-in duration-300">
      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-600 to-orange-500 flex items-center justify-center shrink-0 shadow-lg shadow-orange-600/20">
        <Bot className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1 space-y-3">
        <div className="bg-slate-800/40 backdrop-blur rounded-2xl rounded-tl-sm px-5 py-4 flex items-center gap-2 w-fit border border-slate-700/50">
          <Sparkles className="w-4 h-4 text-orange-500 animate-pulse" />
          <span className="text-slate-300 text-sm animate-pulse">Analyzing knowledge base...</span>
        </div>
      </div>
    </div>
  );
}
