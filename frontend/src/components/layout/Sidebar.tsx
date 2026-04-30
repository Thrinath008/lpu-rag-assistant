'use client';

import React from 'react';
import { MessageSquare, History, Plus, Settings, LogOut, Github } from 'lucide-react';
import { motion } from 'framer-motion';

export function Sidebar({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: (val: boolean) => void }) {
  return (
    <motion.aside
      initial={false}
      animate={{ width: isOpen ? 280 : 0, opacity: isOpen ? 1 : 0 }}
      className="h-screen glass-panel border-r border-white/5 overflow-hidden flex flex-col shrink-0"
    >
      <div className="p-6 flex flex-col h-full">
        {/* New Chat Button */}
        <button className="w-full flex items-center gap-3 px-4 py-3 bg-brand-orange text-white rounded-xl font-medium hover:bg-brand-orange/90 transition-all active:scale-95 shadow-lg shadow-brand-orange/20 mb-8">
          <Plus className="w-5 h-5" />
          <span>New Thread</span>
        </button>

        {/* Navigation */}
        <div className="flex-1 space-y-2 overflow-y-auto pr-2">
          <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-4 px-2">History</p>
          
          <HistoryItem title="LPU Hostel Rules" active />
          <HistoryItem title="Minimum CGPA for Exchange" />
          <HistoryItem title="Attendance Policy 2024" />
          <HistoryItem title="Holiday List Query" />
        </div>

        {/* Bottom Actions */}
        <div className="pt-6 mt-6 border-t border-white/5 space-y-1">
          <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors group">
            <Settings className="w-5 h-5 group-hover:rotate-45 transition-transform" />
            <span>Settings</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-red-500/5 rounded-lg transition-colors">
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
          
          <div className="pt-4 flex items-center justify-between px-2">
            <a href="#" className="text-slate-600 hover:text-slate-400 transition-colors">
              <Github className="w-5 h-5" />
            </a>
            <span className="text-[10px] text-slate-700 font-mono">v1.0.0-PRO</span>
          </div>
        </div>
      </div>
    </motion.aside>
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
