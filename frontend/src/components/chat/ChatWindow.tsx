'use client';

import React, { useState, useRef, useEffect } from 'react';
import { SquarePen, ArrowUpRight } from 'lucide-react';
import { useChat } from '@/hooks/useChat';
import { ChatMessage, Mark } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { TypingIndicator } from './TypingIndicator';

const SUGGESTIONS = [
  { topic: 'Attendance', question: 'What is the minimum attendance requirement?' },
  { topic: 'Hostel', question: 'What are the hostel timings and rules?' },
  { topic: 'Exams', question: 'How do reappear and improvement exams work?' },
  { topic: 'Fees', question: 'What are the fee payment modes?' },
  { topic: 'Exchange', question: 'What is the CGPA needed for semester abroad?' },
];

export function ChatWindow() {
  const { messages, isLoading, error, sendMessage, clearMessages } = useChat();
  const [input, setInput] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length === 0) return;
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, isLoading]);

  const send = (text: string) => {
    if (!text.trim() || isLoading) return;
    sendMessage(text.trim());
    setInput('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    send(input);
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="flex h-dvh flex-col bg-paper">
      <header className="pt-safe shrink-0 border-b border-line bg-paper/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
          <div className="flex items-center gap-2.5">
            <Mark />
            <div className="leading-tight">
              <h1 className="font-display text-[15px] font-semibold tracking-tight">LPU Assistant</h1>
              <p className="text-[11px] text-ink-soft">Answers from official policy documents</p>
            </div>
          </div>
          <button
            onClick={clearMessages}
            disabled={isEmpty}
            className="inline-flex h-9 items-center gap-1.5 rounded-full border border-line bg-surface px-3 text-[13px] font-medium text-ink transition-colors hover:border-ink-faint disabled:opacity-40"
          >
            <SquarePen className="h-3.5 w-3.5" />
            <span>New chat</span>
          </button>
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div className="mx-auto flex min-h-full max-w-2xl flex-col px-4 py-6">
          {isEmpty ? (
            <section className="fade-up my-auto py-6">
              <h2 className="font-display text-[2rem] font-semibold leading-[1.08] tracking-tight sm:text-5xl">
                Ask the policy,
                <br />
                <span className="text-saffron">get the clause.</span>
              </h2>
              <p className="mt-3 max-w-md text-[15px] leading-relaxed text-ink-soft">
                Every answer is pulled from LPU&apos;s own documents, with the passages it used shown underneath.
              </p>

              <ul className="mt-8 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
                {SUGGESTIONS.map((s) => (
                  <li key={s.topic}>
                    <button
                      onClick={() => send(s.question)}
                      className="group flex min-h-14 w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-paper"
                    >
                      <span className="w-[4.5rem] shrink-0 font-mono text-[11px] uppercase tracking-wide text-ink-faint">
                        {s.topic}
                      </span>
                      <span className="flex-1 text-[15px] text-ink">{s.question}</span>
                      <ArrowUpRight className="h-4 w-4 shrink-0 text-ink-faint transition-colors group-hover:text-saffron" />
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ) : (
            <div className="space-y-6">
              {messages.map((msg) => (
                <div key={msg.id} className="fade-up">
                  <ChatMessage message={msg} />
                </div>
              ))}
              {isLoading && <TypingIndicator />}
              {error && !isLoading && (
                <p role="alert" className="rounded-xl bg-risk-soft px-4 py-3 text-sm text-risk">
                  {String(error)}
                </p>
              )}
            </div>
          )}
          <div ref={endRef} />
        </div>
      </main>

      <footer className="pb-safe shrink-0 bg-gradient-to-t from-paper via-paper to-paper/0 px-4 pt-2">
        <div className="mx-auto max-w-2xl">
          <ChatInput input={input} setInput={setInput} handleSubmit={handleSubmit} isLoading={isLoading} />
          <p className="px-2 pb-1 pt-2 text-center text-[11px] text-ink-faint">
            AI can make mistakes. Confirm important decisions on the LPU portal.
          </p>
        </div>
      </footer>
    </div>
  );
}
