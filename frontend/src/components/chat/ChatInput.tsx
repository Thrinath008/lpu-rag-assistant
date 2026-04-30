'use client';

// ============================================================
// Project : LPU RAG Knowledge Assistant
// Authors : Thrinath, Shambhavi, irshad
// Year    : 2026
// Module  : ChatInput.tsx
// Phase   : 3 — Memory + Intelligence + API + Frontend
// ============================================================
import React from 'react';
import { Send } from 'lucide-react';

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}

export function ChatInput({ input, setInput, handleSubmit, isLoading }: ChatInputProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-slate-950 via-slate-950 to-transparent pt-8 pb-6">
      <div className="max-w-5xl mx-auto px-6">
        <form onSubmit={handleSubmit} className="relative flex items-end gap-3 bg-slate-800/40 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-2xl overflow-hidden focus-within:ring-2 focus-within:ring-orange-500/50 focus-within:border-orange-500 transition-all">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder="Ask anything about LPU..."
            className="w-full max-h-48 min-h-[56px] bg-transparent text-white px-4 py-4 focus:outline-none resize-none placeholder-slate-600"
            rows={1}
          />
          <div className="px-3 py-3 flex items-center justify-center">
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className={`p-2.5 rounded-xl flex items-center justify-center transition-all ${!input.trim() || isLoading
                  ? 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-br from-orange-600 to-orange-500 text-white hover:from-orange-700 hover:to-orange-600 shadow-lg shadow-orange-600/30'
                }`}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </form>
        <div className="text-center mt-2 text-xs text-slate-500">
          Built with ❤️ for LPU • Powered by RAG Architecture
        </div>
      </div>
    </div>
  );
}
