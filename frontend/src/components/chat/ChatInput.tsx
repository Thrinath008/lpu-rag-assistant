'use client';

import React, { useRef, useEffect } from 'react';
import { Send, ArrowUp } from 'lucide-react';
import { motion } from 'framer-motion';

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}

export function ChatInput({ input, setInput, handleSubmit, isLoading }: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  return (
    <motion.div 
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="relative group"
    >
      {/* Input Glow Effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-orange to-brand-blue rounded-[26px] blur opacity-10 group-focus-within:opacity-25 transition duration-1000 group-focus-within:duration-200"></div>
      
      <form 
        onSubmit={handleSubmit} 
        className="relative flex items-end gap-2 bg-[#0f172a]/80 backdrop-blur-2xl rounded-[24px] border border-white/10 p-2 shadow-2xl overflow-hidden transition-all duration-300 focus-within:border-brand-orange/40"
      >
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          placeholder="Ask anything about LPU..."
          className="flex-1 max-h-[200px] min-h-[48px] bg-transparent text-slate-100 px-4 py-3 focus:outline-none resize-none placeholder-slate-500 text-sm sm:text-base scrollbar-none"
          rows={1}
        />
        
        <div className="pb-1 pr-1">
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${!input.trim() || isLoading
                ? 'bg-slate-800 text-slate-600 cursor-not-allowed opacity-50'
                : 'bg-brand-orange text-white hover:scale-105 active:scale-95 shadow-lg shadow-brand-orange/30'
              }`}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <ArrowUp className="w-5 h-5" />
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
}

