'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bot, Sparkles, AlertCircle, Menu, X, Command } from 'lucide-react';
import { useChat } from '@/hooks/useChat';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { TypingIndicator } from './TypingIndicator';
import { Sidebar } from '../layout/Sidebar';
import { motion, AnimatePresence } from 'framer-motion';

export function ChatWindow() {
  const { messages, isLoading, error, sendMessage } = useChat();
  const [input, setInput] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
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
    <div className="flex h-screen bg-[#020617] text-slate-50 overflow-hidden font-sans">
      {/* Animated Mesh Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-brand-orange/10 rounded-full blur-[120px] animate-mesh" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-blue/10 rounded-full blur-[120px] animate-mesh" style={{ animationDelay: '-5s' }} />
      </div>

      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <main className="flex-1 flex flex-col relative z-10">
        {/* Top Navigation */}
        <header className="glass-panel sticky top-0 z-50 border-b border-white/5 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-400 hover:text-white"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-brand-orange to-orange-400 rounded-xl flex items-center justify-center shadow-lg shadow-brand-orange/20">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                {isLoading && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-[#020617] rounded-full animate-pulse" />
                )}
              </div>
              <div>
                <h1 className="font-bold text-base leading-none mb-1 flex items-center gap-2">
                  LPU Assistant
                  <span className="px-1.5 py-0.5 rounded-md bg-white/5 text-[10px] font-mono text-slate-500 border border-white/5">PRO</span>
                </h1>
                <p className="text-[10px] text-slate-500 font-medium tracking-wide flex items-center gap-1.5">
                  <span className="w-1 h-1 bg-emerald-500 rounded-full" />
                  ONLINE • KNOWLEDGE BASE V1.2
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/5 text-xs text-slate-400">
              <Command className="w-3 h-3" />
              <span>Shift + Enter to send</span>
            </div>
          </div>
        </header>

        {/* Chat Content */}
        <div className="flex-1 overflow-y-auto relative custom-scrollbar">
          <div className="max-w-4xl mx-auto px-6 py-12 min-h-full flex flex-col">
            <AnimatePresence mode="wait">
              {messages.length === 0 ? (
                <motion.div 
                  key="welcome"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex-1 flex flex-col items-center justify-center text-center space-y-12"
                >
                  <div className="space-y-6">
                    <div className="w-24 h-24 bg-gradient-to-br from-brand-orange to-orange-400 rounded-[32px] flex items-center justify-center mx-auto shadow-2xl shadow-brand-orange/30 rotate-3 transform hover:rotate-0 transition-transform duration-500">
                      <Sparkles className="w-12 h-12 text-white" />
                    </div>
                    <div className="space-y-3">
                      <h2 className="text-5xl font-extrabold text-white tracking-tight">How can I assist you?</h2>
                      <p className="text-slate-400 max-w-lg mx-auto text-lg leading-relaxed">
                        Secure, official, and direct. Ask me about Lovely Professional University policies, admissions, and campus life.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl">
                    <SuggestionCard 
                      icon="🏫"
                      title="Hostel Rules"
                      desc="What are the strict rules for timings?"
                      onClick={() => setInput("What are the hostel timings and strict rules?")} 
                    />
                    <SuggestionCard 
                      icon="📊"
                      title="Attendance"
                      desc="Minimum requirements & penalties"
                      onClick={() => setInput("What is the minimum attendance requirement?")} 
                    />
                    <SuggestionCard 
                      icon="✈️"
                      title="Global Exchange"
                      desc="Semester exchange CGPA requirements"
                      onClick={() => setInput("What is the CGPA for semester exchange?")} 
                    />
                    <SuggestionCard 
                      icon="📅"
                      title="Academic Calendar"
                      desc="When do the next mid-terms start?"
                      onClick={() => setInput("Tell me the academic calendar dates.")} 
                    />
                  </div>
                </motion.div>
              ) : (
                <div className="space-y-8 pb-32">
                  {messages.map((msg, idx) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <ChatMessage message={msg} isStreaming={false} />
                    </motion.div>
                  ))}
                  {isLoading && <TypingIndicator />}
                </div>
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Dock */}
        <div className="absolute bottom-0 left-0 right-0 p-6 pointer-events-none">
          <div className="max-w-4xl mx-auto pointer-events-auto">
            <ChatInput
              input={input}
              setInput={setInput}
              handleSubmit={handleSubmit}
              isLoading={isLoading}
            />
            <p className="mt-3 text-center text-[10px] text-slate-600 font-medium">
              AI-generated responses. Cross-verify with LPU official portal for critical decisions.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

function SuggestionCard({ icon, title, desc, onClick }: { icon: string; title: string; desc: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="glass-card p-5 text-left group flex gap-4 items-start rounded-2xl"
    >
      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-xl shrink-0 group-hover:bg-brand-orange/10 transition-colors">
        {icon}
      </div>
      <div>
        <h4 className="text-white font-semibold text-sm mb-1 group-hover:text-brand-orange transition-colors">{title}</h4>
        <p className="text-slate-500 text-xs leading-relaxed">{desc}</p>
      </div>
    </button>
  );
}

