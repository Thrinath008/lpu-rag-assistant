'use client';

import React, { useState } from 'react';
import { FileText, ChevronDown, Copy, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatMessage as ChatMessageType } from '@/lib/types';
import { ConfidenceBadge } from './ConfidenceBadge';
import { SourceCard } from './SourceCard';

export function Mark() {
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-ink font-display text-sm font-bold text-white">
      L
    </div>
  );
}

export function ChatMessage({ message }: { message: ChatMessageType; isStreaming?: boolean }) {
  const isUser = message.role === 'user';
  const [showSources, setShowSources] = useState(false);
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  if (isUser) {
    return (
      <div className="flex justify-end">
        <p className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-ink px-4 py-2.5 text-[0.95rem] leading-relaxed text-white sm:max-w-[75%]">
          {message.content}
        </p>
      </div>
    );
  }

  const sources = message.sources ?? [];

  return (
    <div className="flex gap-3">
      <Mark />
      <div className="min-w-0 flex-1 pt-0.5">
        <div className="md">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              table: ({ children }) => (
                <div className="table-wrap">
                  <table>{children}</table>
                </div>
              ),
              a: ({ children, href }) => (
                <a href={href} target="_blank" rel="noopener noreferrer">
                  {children}
                </a>
              ),
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {message.confidence && <ConfidenceBadge confidence={message.confidence} />}

          {sources.length > 0 && (
            <button
              onClick={() => setShowSources((v) => !v)}
              aria-expanded={showSources}
              className="inline-flex min-h-8 items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium text-ink-soft transition-colors hover:border-ink-faint hover:text-ink"
            >
              <FileText className="h-3.5 w-3.5" />
              Verified against {sources.length} {sources.length === 1 ? 'passage' : 'passages'}
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showSources ? 'rotate-180' : ''}`} />
            </button>
          )}

          <button
            onClick={copy}
            aria-label="Copy answer"
            className="ml-auto inline-flex h-8 w-8 items-center justify-center rounded-full text-ink-faint transition-colors hover:bg-surface hover:text-ink"
          >
            {copied ? <Check className="h-4 w-4 text-verified" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>

        <AnimatePresence initial={false}>
          {showSources && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 gap-2 pt-3 sm:grid-cols-2">
                {sources.map((source, idx) => (
                  <SourceCard key={idx} source={source} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
