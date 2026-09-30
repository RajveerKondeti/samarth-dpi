import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = 'http://127.0.0.1:5000/api';

export default function CMDashboard() {
  const [stateName, setStateName] = useState('Andhra Pradesh');
  const [data, setData] = useState(null);

  useEffect(() => {
    axios.get(`${API_BASE}/cm/dashboard/${stateName}`).then(res => setData(res.data)).catch(console.error);
  }, [stateName]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-slate-800/50 border border-slate-700/60 p-6 rounded-2xl">
        <div>
          <h2 className="text-lg font-bold text-slate-100">Chief Minister Executive Dashboard</h2>
          <p className="text-xs text-slate-400">Real-time District Aggregation & Financial Health</p>
        </div>
        <input type="text" value={stateName} onChange={(e) => setStateName(e.target.value)} className="bg-slate-900 border border-slate-700 px-4 py-2 rounded-xl text-xs text-slate-200" placeholder="State Name" />
      </div>

      {data && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-800/50 border border-slate-700/60 p-6 rounded-2xl">
            <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">State Avg Income</h3>
            <p className="text-2xl font-black text-amber-400">₹{data.state_financial_health.avg_monthly_income}/mo</p>
          </div>
          <div className="md:col-span-2 bg-slate-800/50 border border-slate-700/60 p-6 rounded-2xl">
            <h3 className="text-xs font-bold text-slate-400 uppercase mb-4">Top District Hotspots</h3>
            <div className="space-y-3">
              {data.district_grievance_hotspots.map((h, i) => (
                <div key={i} className="flex justify-between items-center bg-slate-900 p-3 rounded-xl border border-slate-800 text-xs">
                  <span className="font-bold text-slate-200">{h.district}</span>
                  <div className="flex space-x-4"><span className="text-slate-400">{h.total_complaints} Grievances</span><span className="text-red-400 font-bold">Avg Score: {h.avg_urgency_score}</span></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}