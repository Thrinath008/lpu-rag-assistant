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
    <div className="flex flex-col h-[calc(100vh-6rem)] max-w-4xl mx-auto">
      {/* Header Area */}
      {messages.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in zoom-in duration-500">
          <div className="w-16 h-16 bg-orange-600/20 rounded-2xl flex items-center justify-center mb-4 ring-1 ring-orange-500/30">
            <Bot className="w-8 h-8 text-orange-500" />
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight">How can I help you today?</h1>
          <p className="text-slate-400 max-w-lg text-lg">
            Ask me anything about Lovely Professional University. I can search through official documents, guidelines, and handbooks to find the answers you need.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl mt-8">
            <SuggestionCard 
              text="What are the strict rules for hostel timings?" 
              onClick={() => setInput("What are the strict rules for hostel timings?")} 
            />
            <SuggestionCard 
              text="Explain the grading system for B.Tech CSE." 
              onClick={() => setInput("Explain the grading system for B.Tech CSE.")} 
            />
            <SuggestionCard 
              text="How do I apply for a leave of absence?" 
              onClick={() => setInput("How do I apply for a leave of absence?")} 
            />
            <SuggestionCard 
              text="What are the library hours during exams?" 
              onClick={() => setInput("What are the library hours during exams?")} 
            />
          </div>
        </div>
      )}

      {/* Messages Area */}
      {messages.length > 0 && (
        <div className="flex-1 overflow-y-auto space-y-6 pb-20 px-2 scroll-smooth">
          {messages.map((msg, idx) => (
            <MessageBubble 
              key={msg.id} 
              message={msg} 
              isStreaming={isLoading && idx === messages.length - 1} 
            />
          ))}
          
          {isLoading && !messages[messages.length - 1]?.content && (
            <div className="flex gap-4 animate-in fade-in duration-300">
              <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 space-y-3">
                <div className="bg-slate-800/50 rounded-2xl rounded-tl-sm px-5 py-4 flex items-center gap-2 w-fit border border-slate-700">
                  <Sparkles className="w-4 h-4 text-orange-500 animate-pulse" />
                  <span className="text-slate-400 text-sm animate-pulse">Analyzing university knowledge base...</span>
                </div>
                <div className="max-w-[85%] space-y-2 pl-2">
                  <Skeleton className="h-4 w-[90%]" />
                  <Skeleton className="h-4 w-[75%]" />
                  <Skeleton className="h-4 w-[40%]" />
                </div>
              </div>
            </div>
          )}
          
          {error && (
            <div className="flex gap-4">
               <div className="w-8 h-8 rounded-lg bg-red-600/20 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5 text-red-500" />
              </div>
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl rounded-tl-sm px-5 py-3 text-sm">
                {error}
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Input Area */}
      <div className="sticky bottom-0 bg-slate-900 pt-4 pb-2">
        <form onSubmit={handleSubmit} className="relative flex items-end bg-slate-800 rounded-2xl border border-slate-700 shadow-lg overflow-hidden focus-within:ring-2 focus-within:ring-orange-500/50 focus-within:border-orange-500 transition-all">
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
            className="w-full max-h-48 min-h-[56px] bg-transparent text-white px-4 py-4 focus:outline-none resize-none placeholder-slate-500"
            rows={1}
          />
          <div className="px-2 py-2 flex items-center justify-center">
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className={`p-2 rounded-xl flex items-center justify-center transition-colors ${
                !input.trim() || isLoading 
                  ? 'bg-slate-700 text-slate-500 cursor-not-allowed' 
                  : 'bg-orange-600 text-white hover:bg-orange-500 shadow-md shadow-orange-600/20'
              }`}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </form>
        <div className="text-center mt-3 text-xs text-slate-500">
          Knowledge Base refers to the official rulebook chunks loaded into the system. AI can make mistakes.
        </div>
      </div>
    </div>
  );
}

function SuggestionCard({ text, onClick }: { text: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 text-left hover:bg-slate-800 hover:border-slate-600 transition-all group"
    >
      <p className="text-slate-300 text-sm group-hover:text-white">{text}</p>
    </button>
  );
}

function MessageBubble({ message, isStreaming }: { message: ChatMessage; isStreaming?: boolean }) {
  const isUser = message.role === 'user';
  const [showSources, setShowSources] = useState(false);

  return (
    <div className={`flex gap-4 ${isUser ? 'flex-row-reverse' : ''} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
        isUser ? 'bg-slate-700' : 'bg-orange-600 shadow-lg shadow-orange-500/20'
      }`}>
        {isUser ? <User className="w-5 h-5 text-slate-300" /> : <Bot className="w-5 h-5 text-white" />}
      </div>
      
      <div className={`max-w-[85%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-2`}>
        <div className={`px-5 py-4 rounded-2xl overflow-hidden leading-relaxed prose prose-invert prose-p:leading-relaxed prose-pre:bg-slate-900 prose-pre:border prose-pre:border-slate-700 relative ${
          isUser 
            ? 'bg-slate-800 rounded-tr-sm text-slate-200' 
            : 'bg-transparent border border-slate-700 rounded-tl-sm text-slate-300'
        }`}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {message.content}
          </ReactMarkdown>
          {isStreaming && (
            <span className="inline-block w-2 h-4 mb-[-2px] ml-1 bg-orange-500 animate-pulse align-middle rounded-sm shadow-sm shadow-orange-500/50" />
          )}
        </div>

        {!isUser && message.sources && message.sources.length > 0 && (
          <div className="w-full">
            <button 
              onClick={() => setShowSources(!showSources)}
              className="flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-slate-300 transition-colors bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-700 mb-2"
            >
              <FileText className="w-3.5 h-3.5" />
              {message.sources.length} Sources Found
              {showSources ? <ChevronUp className="w-3.5 h-3.5 ml-1" /> : <ChevronDown className="w-3.5 h-3.5 ml-1" />}
            </button>

            {showSources && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                {message.sources.map((source, idx) => (
                  <div key={idx} className="bg-slate-800 border border-slate-700 p-3 rounded-lg text-xs hover:border-slate-600 transition-colors">
                    <div className="flex justify-between items-start mb-1.5">
                      <span className="font-semibold text-orange-400 truncate max-w-[80%]" title={source.source_file}>
                        {source.source_file.replace('.docx', '')}
                      </span>
                      <span className="text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded ml-2">
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
