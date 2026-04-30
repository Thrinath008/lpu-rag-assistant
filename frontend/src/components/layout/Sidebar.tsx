'use client';

import React from 'react';
import { MessageSquare, Plus, Settings, LogOut, Github, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
  onNewThread: () => void;
}

export function Sidebar({ isOpen, setIsOpen, onNewThread }: SidebarProps) {
  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[60] lg:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{ 
          width: isOpen ? 280 : 0,
          x: isOpen ? 0 : -280,
          opacity: isOpen ? 1 : 0 
        }}
        className={`fixed lg:relative h-screen glass-panel border-r border-white/5 z-[70] overflow-hidden flex flex-col shrink-0`}
      >
        <div className="p-6 flex flex-col h-full w-[280px]">
          {/* Mobile Close Button */}
          <button 
            onClick={() => setIsOpen(false)}
            className="lg:hidden absolute top-4 right-4 p-2 text-slate-500 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>

          {/* New Chat Button */}
          <button 
            onClick={() => { onNewThread(); if (window.innerWidth < 1024) setIsOpen(false); }}
            className="w-full flex items-center gap-3 px-4 py-3 bg-brand-orange text-white rounded-xl font-medium hover:bg-brand-orange/90 transition-all active:scale-95 shadow-lg shadow-brand-orange/20 mb-8"
          >
            <Plus className="w-5 h-5" />
            <span>New Thread</span>
          </button>

          {/* Navigation */}
          <div className="flex-1 space-y-2 overflow-y-auto pr-2 custom-scrollbar">
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-4 px-2">Knowledge Threads</p>
            
            <HistoryItem title="LPU Hostel Rules" active />
            <HistoryItem title="Minimum CGPA for Exchange" />
            <HistoryItem title="Attendance Policy 2024" />
          </div>

          {/* Bottom Actions */}
          <div className="pt-6 mt-6 border-t border-white/5 space-y-1">
            <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors group text-sm">
              <Settings className="w-5 h-5 group-hover:rotate-45 transition-transform" />
              <span>Settings</span>
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-red-500/5 rounded-lg transition-colors text-sm">
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </button>
            
            <div className="pt-4 flex items-center justify-between px-2">
              <a href="#" className="text-slate-600 hover:text-slate-400 transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <span className="text-[10px] text-slate-700 font-mono tracking-tighter">BUILD v1.0.42</span>
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  );
}

function HistoryItem({ title, active = false }: { title: string; active?: boolean }) {
  return (
    <button className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all text-left ${
      active 
        ? 'bg-white/10 text-white border border-white/10 shadow-inner' 
        : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
    }`}>
      <MessageSquare className={`w-4 h-4 ${active ? 'text-brand-orange' : 'text-slate-500'}`} />
      <span className="truncate">{title}</span>
    </button>
  );
}

