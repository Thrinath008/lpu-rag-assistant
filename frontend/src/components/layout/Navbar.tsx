import Link from 'next/link';
import { BookOpen, Settings, User } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="fixed top-0 z-50 w-full bg-slate-900 border-b border-slate-800">
      <div className="px-3 py-3 lg:px-5 lg:pl-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-start rtl:justify-end">
            <Link href="/" className="flex ms-2 md:me-24 items-center">
              <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center mr-3 shadow-lg shadow-orange-500/20">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="self-center text-xl font-semibold sm:text-2xl whitespace-nowrap text-white hidden sm:block">
                LPU RAG Assistant
              </span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              href="/admin" 
              className="px-3 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg flex items-center transition-colors"
            >
              <Settings className="w-4 h-4 mr-2" />
              Admin
            </Link>
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
              <User className="w-4 h-4 text-slate-400" />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
