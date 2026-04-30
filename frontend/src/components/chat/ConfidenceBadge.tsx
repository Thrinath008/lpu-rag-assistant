// ============================================================
// Project : LPU RAG Knowledge Assistant
// Authors : Thrinath, Shambhavi, irshad
// Year    : 2026
// Module  : ConfidenceBadge.tsx
// Phase   : 3 — Memory + Intelligence + API + Frontend
// ============================================================

import React from 'react';
import { ConfidenceResult } from '@/lib/types';
import { ShieldCheck, ShieldAlert, AlertTriangle } from 'lucide-react';

interface ConfidenceBadgeProps {
  confidence: ConfidenceResult;
}

export function ConfidenceBadge({ confidence }: ConfidenceBadgeProps) {
  if (!confidence) return null;

  const { level, label, color, message } = confidence;

  let Icon = ShieldCheck;
  let colorStyles = '';

  switch (color) {
    case 'green':
      Icon = ShieldCheck;
      colorStyles = 'bg-green-500/10 text-green-500 border-green-500/20';
      break;
    case 'yellow':
      Icon = ShieldAlert;
      colorStyles = 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      break;
    case 'red':
      Icon = AlertTriangle;
      colorStyles = 'bg-red-500/10 text-red-500 border-red-500/20';
      break;
    default:
      colorStyles = 'bg-gray-500/10 text-gray-400 border-gray-500/20';
  }

  return (
    <div className={`mt-2 flex flex-col gap-1 text-xs border rounded-lg p-2 ${colorStyles}`}>
      <div className="flex items-center gap-1.5 font-medium">
        <Icon className="w-3.5 h-3.5" />
        <span>{label}</span>
      </div>
      <span className="opacity-80 leading-relaxed text-[11px] ml-5">
        {message}
      </span>
    </div>
  );
}
