'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, AlertCircle, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { useChat } from '@/hooks/useChat';
import { ChatMessage } from '@/lib/types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Skeleton from '@/components/ui/Skeleton';

export default function Home() {
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
                onClick={() => setInput("What are the strict rules for hostel timings?")} 
              />
              <SuggestionCard 
                text="Explain attendance requirements" 
                onClick={() => setInput("What is the minimum attendance required?")} 
              />
              <SuggestionCard 
                text="How do I apply for leaves?" 
                onClick={() => setInput("How do I apply for a leave of absence?")} 
              />
              <SuggestionCard 
                text="Library hours during exams?" 
                onClick={() => setInput("What are the library hours during exams?")} 
              />
            </div>
          </div>
        )}

        {/* Messages Area */}
        {messages.length > 0 && (
          <div className="flex-1 overflow-y-auto space-y-6 pb-24 px-4 scroll-smooth">
            {messages.map((msg, idx) => (
              <MessageBubble 
                key={msg.id} 
                message={msg} 
                isStreaming={false} 
              />
            ))}
            
            {isLoading && (
              <div className="flex gap-4 animate-in fade-in duration-300">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-600 to-orange-500 flex items-center justify-center shrink-0 shadow-lg shadow-orange-600/20">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 space-y-3">
                  <div className="bg-slate-800/40 backdrop-blur rounded-2xl rounded-tl-sm px-5 py-4 flex items-center gap-2 w-fit border border-slate-700/50">
                    <Sparkles className="w-4 h-4 text-orange-500 animate-pulse" />
                    <span className="text-slate-300 text-sm animate-pulse">Analyzing knowledge base...</span>
                  </div>
                </div>
              </div>
            )}
            
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
                  className={`p-2.5 rounded-xl flex items-center justify-center transition-all ${
                    !input.trim() || isLoading 
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

function MessageBubble({ message, isStreaming }: { message: ChatMessage; isStreaming?: boolean }) {
  const isUser = message.role === 'user';
  const [showSources, setShowSources] = useState(false);

  return (
    <div className={`flex gap-4 ${isUser ? 'flex-row-reverse' : ''} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
        isUser 
          ? 'bg-slate-700/60' 
          : 'bg-gradient-to-br from-orange-600 to-orange-500 shadow-lg shadow-orange-600/20'
      }`}>
        {isUser ? <User className="w-5 h-5 text-slate-300" /> : <Bot className="w-5 h-5 text-white" />}
      </div>
      
      <div className={`max-w-[85%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-2`}>
        <div className={`px-5 py-4 rounded-2xl overflow-hidden leading-relaxed prose prose-invert prose-p:leading-relaxed prose-pre:bg-slate-900 prose-pre:border prose-pre:border-slate-700 relative ${
          isUser 
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
                  <div key={idx} className="bg-slate-800/40 border border-slate-700/50 p-3 rounded-lg text-xs hover:border-slate-600/80 transition">
                    <div className="flex justify-between items-start mb-1.5">
                      <span className="font-semibold text-orange-400 truncate max-w-[80%]" title={source.source_file}>
                        {source.source_file.replace('.docx', '')}
                      </span>
                      <span className="text-slate-500 bg-slate-900/60 px-1.5 py-0.5 rounded ml-2 text-xs">
                        {(source.score * 100).toFixed(0)}%
                      </span>
                    </div>
                    <p className="text-slate-400 line-clamp-3 leading-snug" title={source.text}>
                      "{source.text}"
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
