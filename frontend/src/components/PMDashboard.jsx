import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShieldAlert } from 'lucide-react';

const API_BASE = 'http://127.0.0.1:5000/api';

export default function PMDashboard() {
  const [data, setData] = useState(null);
  useEffect(() => { axios.get(`${API_BASE}/pm/dashboard`).then(res => setData(res.data)); }, []);

  return (
    <div className="space-y-6">
      <div className="bg-slate-800/50 border border-slate-700/60 p-6 rounded-2xl">
        <h2 className="text-lg font-bold text-slate-100 flex items-center space-x-2"><ShieldAlert className="w-5 h-5 text-red-400" /><span>PM National Macro Analytics</span></h2>
      </div>
      {data && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-slate-800/50 border border-slate-700/60 p-6 rounded-2xl text-center flex flex-col justify-center">
            <span className="text-xs font-bold text-slate-400 uppercase mb-1">Total National Grievances</span>
            <span className="text-5xl font-black text-amber-400">{data.national_total_complaints}</span>
          </div>
          <div className="lg:col-span-2 bg-slate-800/50 border border-slate-700/60 p-6 rounded-2xl">
            <h3 className="text-xs font-bold text-slate-400 uppercase mb-4">Top 5 Priority National Hotspots</h3>
            <div className="space-y-3">
              {data.top_priority_national_hotspots.map((h, i) => (
                <div key={i} className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex justify-between">
                  <div><span className="text-xs font-bold text-slate-100">{h.district}, {h.state}</span><span className="block text-xs text-slate-400">Vol: {h.complaint_volume}</span></div>
                  <span className="text-xs font-mono font-bold bg-red-500/10 text-red-400 px-3 py-1 rounded-lg h-fit">Urgency: {h.computed_urgency_score}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}