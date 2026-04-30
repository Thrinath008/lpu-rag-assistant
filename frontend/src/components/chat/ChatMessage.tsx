'use client';

import React, { useState } from 'react';
import { Bot, User, FileText, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
import { ChatMessage as ChatMessageType } from '@/lib/types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ConfidenceBadge } from './ConfidenceBadge';
import { SourceCard } from './SourceCard';
import { motion, AnimatePresence } from 'framer-motion';

export function ChatMessage({ message, isStreaming }: { message: ChatMessageType; isStreaming?: boolean }) {
  const isUser = message.role === 'user';
  const [showSources, setShowSources] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex gap-5 ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-white/5 transition-transform duration-500 hover:rotate-3 ${isUser
          ? 'bg-slate-800 shadow-lg'
          : 'bg-gradient-to-br from-brand-orange to-orange-400 shadow-lg shadow-brand-orange/20'
        }`}>
        {isUser ? <User className="w-6 h-6 text-slate-400" /> : <Bot className="w-6 h-6 text-white" />}
      </div>

      {/* Message Content */}
      <div className={`max-w-[82%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-3 group`}>
        <div className={`relative px-6 py-5 rounded-3xl overflow-hidden leading-relaxed backdrop-blur-md transition-all duration-300 ${isUser
            ? 'bg-brand-orange/10 text-slate-200 rounded-tr-sm border border-brand-orange/20'
            : 'bg-white/5 border border-white/10 rounded-tl-sm text-slate-300'
          }`}>
          
          {/* Action Button (Copy) */}
          <button 
            onClick={copyToClipboard}
            className="absolute top-3 right-3 p-1.5 rounded-lg bg-white/5 border border-white/5 text-slate-500 hover:text-white hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <div className="prose prose-invert prose-sm sm:prose-base prose-p:leading-relaxed prose-strong:text-brand-orange prose-headings:text-white prose-a:text-brand-orange">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content}
            </ReactMarkdown>
          </div>
          
          {isStreaming && (
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
              className="inline-block w-2 h-4 bg-brand-orange align-middle rounded-sm ml-1"
            />
          )}
        </div>

        {/* Metadata Footer */}
        <div className="flex items-center gap-4 px-1">
          {!isUser && message.confidence && (
            <ConfidenceBadge confidence={message.confidence} />
          )}

          {!isUser && message.sources && message.sources.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setShowSources(!showSources)}
                className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider transition-all px-3 py-1.5 rounded-full border ${
                  showSources 
                    ? 'bg-brand-orange/20 border-brand-orange/30 text-brand-orange' 
                    : 'bg-white/5 border-white/5 text-slate-500 hover:text-slate-300 hover:bg-white/10'
                }`}
              >
                <FileText className="w-3 h-3" />
                {message.sources.length} Contextual Sources
                {showSources ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>

              <AnimatePresence>
                {showSources && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4"
                  >
                    {message.sources.map((source, idx) => (
                      <SourceCard key={idx} source={source} />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

