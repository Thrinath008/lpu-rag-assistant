'use client';

// ============================================================
// Project : LPU RAG Knowledge Assistant
// Authors : Thrinath, Shambhavi, irshad
// Year    : 2026
// Module  : ChatMessage.tsx
// Phase   : 3 — Memory + Intelligence + API + Frontend
// ============================================================
import React, { useState } from 'react';
import { Bot, User, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { ChatMessage as ChatMessageType } from '@/lib/types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ConfidenceBadge } from './ConfidenceBadge';
import { SourceCard } from './SourceCard';

export function ChatMessage({ message, isStreaming }: { message: ChatMessageType; isStreaming?: boolean }) {
  const isUser = message.role === 'user';
  const [showSources, setShowSources] = useState(false);

  return (
    <div className={`flex gap-4 ${isUser ? 'flex-row-reverse' : ''} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isUser
          ? 'bg-slate-700/60'
          : 'bg-gradient-to-br from-orange-600 to-orange-500 shadow-lg shadow-orange-600/20'
        }`}>
        {isUser ? <User className="w-5 h-5 text-slate-300" /> : <Bot className="w-5 h-5 text-white" />}
      </div>

      <div className={`max-w-[85%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-2`}>
        <div className={`px-5 py-4 rounded-2xl overflow-hidden leading-relaxed prose prose-invert prose-p:leading-relaxed prose-pre:bg-slate-900 prose-pre:border prose-pre:border-slate-700 relative ${isUser
            ? 'bg-slate-800/60 rounded-tr-sm text-slate-200'
            : 'bg-slate-800/30 border border-slate-700/50 rounded-tl-sm text-slate-300 backdrop-blur-sm'
          }`}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {message.content}
          </ReactMarkdown>
          {isStreaming && (
            <span className="inline-block w-2 h-4 mb-[-2px] ml-1 bg-orange-500 animate-pulse align-middle rounded-sm" />
          )}
        </div>

        {!isUser && message.confidence && (
          <ConfidenceBadge confidence={message.confidence} />
        )}

        {!isUser && message.sources && message.sources.length > 0 && (
          <div className="w-full">
            <button
              onClick={() => setShowSources(!showSources)}
              className="flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-slate-300 transition-colors bg-slate-800/40 px-3 py-1.5 rounded-full border border-slate-700/50 hover:border-slate-600/80"
            >
              <FileText className="w-3.5 h-3.5" />
              {message.sources.length} Sources
              {showSources ? <ChevronUp className="w-3.5 h-3.5 ml-1" /> : <ChevronDown className="w-3.5 h-3.5 ml-1" />}
            </button>

            {showSources && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                {message.sources.map((source, idx) => (
                  <SourceCard key={idx} source={source} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
