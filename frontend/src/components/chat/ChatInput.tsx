'use client';

import React, { useRef, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}

export function ChatInput({ input, setInput, handleSubmit, isLoading }: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [input]);

  const canSend = input.trim().length > 0 && !isLoading;

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-end gap-2 rounded-[22px] border border-line bg-surface p-1.5 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_-12px_rgba(16,24,40,0.12)] transition-colors focus-within:border-saffron"
    >
      <textarea
        ref={textareaRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
            e.preventDefault();
            handleSubmit(e);
          }
        }}
        aria-label="Your question"
        placeholder="Ask about attendance, fees, hostel…"
        rows={1}
        enterKeyHint="send"
        className="max-h-40 min-h-11 flex-1 resize-none bg-transparent px-3.5 py-2.5 text-base text-ink outline-none placeholder:text-ink-faint"
      />
      <button
        type="submit"
        disabled={!canSend}
        aria-label="Send question"
        className={`mb-0.5 mr-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all active:scale-95 ${
          canSend ? 'bg-saffron text-white hover:brightness-95' : 'bg-paper text-ink-faint'
        }`}
      >
        {isLoading ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-ink-faint/40 border-t-ink-soft" />
        ) : (
          <ArrowUp className="h-5 w-5" />
        )}
      </button>
    </form>
  );
}
