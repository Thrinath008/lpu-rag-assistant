'use client';

// ============================================================
// Project : LPU RAG Knowledge Assistant
// Authors : Thrinath, Shambhavi, irshad
// Year    : 2026
// Module  : ChatWindow.tsx
// Phase   : 3 — Memory + Intelligence + API + Frontend
// ============================================================
import React, { useState, useRef, useEffect } from 'react';
import { Bot, Sparkles, AlertCircle } from 'lucide-react';
import { useChat } from '@/hooks/useChat';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { TypingIndicator } from './TypingIndicator';

export function ChatWindow() {
  const { messages, isLoading, error, sendMessage } = useChat();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage(input.trim());
    setInput('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-500/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl"></div>
      </div>

      {/* Top Bar */}
      <div className="sticky top-0 z-40 backdrop-blur-xl bg-slate-950/80 border-b border-slate-700/30">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-600 to-orange-500 rounded-lg flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <h1 className="font-bold text-white">LPU Assistant</h1>
          </div>
          <span className="text-xs text-slate-400">Official LPU Knowledge Assistant</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col h-[calc(100vh-8rem)] max-w-5xl mx-auto">
        {/* Header Area */}
        {messages.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8 px-4 animate-in fade-in zoom-in duration-500">
            <div className="space-y-4">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-600 to-orange-500 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-orange-600/30">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-5xl font-bold text-white tracking-tight">How can I help you?</h1>
              <p className="text-lg text-slate-400 max-w-lg mx-auto">
                Ask me anything about Lovely Professional University. I have access to official policies, guidelines, and handbooks.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl">
              <SuggestionCard
                text="What are hostel timings?"
                onClick={() => { setInput("What are the strict rules for hostel timings?"); handleSubmit(new Event('submit') as any); }}
              />
              <SuggestionCard
                text="Explain attendance requirements"
                onClick={() => { setInput("What is the minimum attendance required?"); handleSubmit(new Event('submit') as any); }}
              />
              <SuggestionCard
                text="How do I apply for leaves?"
                onClick={() => { setInput("How do I apply for a leave of absence?"); handleSubmit(new Event('submit') as any); }}
              />
              <SuggestionCard
                text="Library hours during exams?"
                onClick={() => { setInput("What are the library hours during exams?"); handleSubmit(new Event('submit') as any); }}
              />
            </div>
          </div>
        )}

        {/* Messages Area */}
        {messages.length > 0 && (
          <div className="flex-1 overflow-y-auto space-y-6 pb-24 px-4 scroll-smooth">
            {messages.map((msg) => (
              <ChatMessage
                key={msg.id}
                message={msg}
                isStreaming={false}
              />
            ))}

            {isLoading && <TypingIndicator />}

            {error && (
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-lg bg-red-600/20 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                </div>
                <div className="bg-red-500/10 border border-red-500/30 text-red-300 rounded-2xl rounded-tl-sm px-5 py-3 text-sm">
                  {error}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Input Area */}
        <ChatInput
          input={input}
          setInput={setInput}
          handleSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}

function SuggestionCard({ text, onClick }: { text: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 text-left hover:bg-slate-800/60 hover:border-slate-600/80 transition-all group"
    >
      <p className="text-slate-300 text-sm group-hover:text-white transition">{text}</p>
    </button>
  );
}
