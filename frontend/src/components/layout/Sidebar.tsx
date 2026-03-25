import Link from 'next/link';
import { MessageSquare, UploadCloud, Database, Activity, Compass } from 'lucide-react';

export default function Sidebar() {
  return (
    <aside id="logo-sidebar" className="fixed top-0 left-0 z-40 w-64 h-screen pt-20 transition-transform -translate-x-full bg-slate-900 border-r border-slate-800 sm:translate-x-0" aria-label="Sidebar">
      <div className="h-full px-3 pb-4 overflow-y-auto bg-slate-900">
        <ul className="space-y-2 font-medium mt-4">
          <MenuSection title="KNOWLEDGE HUB" />
          <MenuItem href="/" icon={<MessageSquare size={18} />} label="Ask Query" active />
          <MenuItem href="/history" icon={<Compass size={18} />} label="History" />
          
          <div className="pt-6">
            <MenuSection title="ADMINISTRATION" />
            <MenuItem href="/admin" icon={<UploadCloud size={18} />} label="Ingestion Pipeline" />
            <MenuItem href="/admin/inventory" icon={<Database size={18} />} label="Document Inventory" />
            <MenuItem href="/admin/system" icon={<Activity size={18} />} label="System Health" />
          </div>
        </ul>
      </div>
    </aside>
  );
}

function MenuSection({ title }: { title: string }) {
  return (
    <li className="px-3 py-2">
      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</span>
    </li>
  );
}

function MenuItem({ href, icon, label, active = false }: { href: string; icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <li>
      <Link href={href} className={`flex items-center p-2 rounded-lg group ${
        active 
          ? 'bg-orange-600/10 text-orange-500' 
          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
      }`}>
        <div className={`${active ? 'text-orange-500' : 'text-slate-400 group-hover:text-white'}`}>
          {icon}
        </div>
        <span className="ms-3">{label}</span>
      </Link>
    </li>
  );
}
