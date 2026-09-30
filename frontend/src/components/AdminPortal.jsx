import React, { useState } from 'react';
import axios from 'axios';
import { FileText } from 'lucide-react';

const API_BASE = 'http://127.0.0.1:5000/api';

export default function AdminPortal() {
  const [docId, setDocId] = useState('POL-2026-09');
  const [title, setTitle] = useState('PMGSY Rural Connectivity Circular');
  const [ministry, setMinistry] = useState('Ministry of Rural Development');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState('');

  const handleUpload = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_BASE}/admin/upload-policy`, { doc_id: docId, title, ministry, content });
      setStatus(res.data.message); setContent('');
    } catch (e) { setStatus('Upload failed.'); }
  };

  return (
    <div className="max-w-2xl mx-auto bg-slate-800/50 border border-slate-700/60 p-6 rounded-2xl">
      <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2 mb-4"><FileText className="w-5 h-5 text-amber-400" /><span>Vector Policy Ingestion (ChromaDB)</span></h2>
      {status && <div className="mb-4 p-3 bg-emerald-500/10 text-xs text-emerald-300 rounded-xl">{status}</div>}
      <form onSubmit={handleUpload} className="space-y-4 text-xs">
        <input type="text" value={docId} onChange={(e) => setDocId(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-200" placeholder="Document ID" required />
        <input type="text" value={ministry} onChange={(e) => setMinistry(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-200" placeholder="Ministry" required />
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-200" placeholder="Title" required />
        <textarea rows="6" value={content} onChange={(e) => setContent(e.target.value)} placeholder="Paste policy text..." className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-200" required />
        <button type="submit" className="w-full bg-amber-500 text-slate-950 font-bold p-3 rounded-xl">Ingest Policy Document</button>
      </form>
    </div>
  );
}