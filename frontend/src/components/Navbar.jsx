import React from 'react';
import { Building2, UserCheck, ShieldAlert, FileText } from 'lucide-react';

export default function Navbar({ persona, setPersona }) {
  const navItems = [
    { id: 'CITIZEN', label: 'Citizen Portal', icon: UserCheck },
    { id: 'CM', label: 'CM Dashboard', icon: Building2 },
    { id: 'PM', label: 'PM Dashboard', icon: ShieldAlert },
    { id: 'ADMIN', label: 'Admin Policy Ingest', icon: FileText },
  ];

  return (
    <header className="bg-slate-800/80 backdrop-blur border-b border-slate-700 sticky top-0 z-50 px-6 py-4 flex flex-wrap justify-between items-center gap-4">
      <div className="flex items-center space-x-3">
        <div className="bg-amber-500 text-slate-950 p-2 rounded-xl font-black text-xl tracking-wider">DPI</div>
        <div>
          <h1 className="text-lg font-bold leading-tight">SAMARTH DPI</h1>
          <p className="text-xs text-slate-400">National AI Governance Platform</p>
        </div>
      </div>

      <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 space-x-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = persona === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setPersona(item.id)}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                active 
                  ? 'bg-amber-500 text-slate-950 shadow-md' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
}