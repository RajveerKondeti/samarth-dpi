import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PlusCircle, MapPin, Send } from 'lucide-react';

const API_BASE = 'http://127.0.0.1:5000/api';

export default function CitizenPortal() {
  const [stateName, setStateName] = useState('Andhra Pradesh');
  const [district, setDistrict] = useState('Ananthapuramu');
  const [category, setCategory] = useState('Water Security');
  const [description, setDescription] = useState('');
  const [citizenId, setCitizenId] = useState('CIT-99201');
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const fetchComplaints = async () => {
    try {
      const res = await axios.get(`${API_BASE}/citizen/complaints/${stateName}`);
      setComplaints(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => { fetchComplaints(); }, [stateName]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/citizen/complaint`, {
        citizen_id: citizenId, state: stateName, district, category, description
      });
      setMessage(`Grievance #${res.data.complaint_id} filed! Priority: ${res.data.assigned_priority_score}`);
      setDescription('');
      fetchComplaints();
    } catch (e) {
      setMessage('Failed to submit grievance.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-6">
        <h2 className="text-base font-bold flex items-center space-x-2 text-amber-400 mb-4">
          <PlusCircle className="w-5 h-5" /><span>File Grievance</span>
        </h2>
        {message && <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300">{message}</div>}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <input type="text" value={citizenId} onChange={(e) => setCitizenId(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-200" placeholder="Citizen ID" required />
          <input type="text" value={stateName} onChange={(e) => setStateName(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-200" placeholder="State" required />
          <input type="text" value={district} onChange={(e) => setDistrict(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-200" placeholder="District" required />
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-200">
            <option>Water Security</option><option>Roads & Infrastructure</option><option>Rural Employment</option>
          </select>
          <textarea rows="3" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Provide details..." className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-200" required />
          <button type="submit" disabled={loading} className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold p-3 rounded-xl transition-all flex items-center justify-center space-x-2">
            <Send className="w-4 h-4" /><span>{loading ? 'Processing...' : 'Register Grievance'}</span>
          </button>
        </form>
      </div>
      <div className="lg:col-span-2 bg-slate-800/50 border border-slate-700/60 rounded-2xl p-6">
        <h2 className="text-base font-bold flex items-center space-x-2 text-slate-200 mb-4">
          <MapPin className="w-5 h-5 text-amber-400" /><span>State Grievances Feed: {stateName}</span>
        </h2>
        <div className="space-y-3 max-h-[500px] overflow-y-auto">
          {complaints.map((c) => (
            <div key={c.complaint_id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex justify-between">
              <div>
                <div className="flex space-x-2 mb-1"><span className="text-xs font-bold text-amber-400">#{c.complaint_id}</span><span className="text-xs text-slate-400">{c.district}</span></div>
                <p className="text-xs text-slate-300 mb-1">{c.description}</p>
              </div>
              <div className="text-xs font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-1 rounded-lg h-fit">Score: {c.urgency_score}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}