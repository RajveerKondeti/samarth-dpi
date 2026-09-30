import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  UserCheck, 
  Building2, 
  ShieldAlert, 
  MapPin, 
  Send, 
  PlusCircle, 
  Bot, 
  Sparkles,
  ChevronRight,
  Lock,
  Terminal
} from 'lucide-react';

const API_BASE = 'http://127.0.0.1:5000/api';

// Simple Markdown to HTML parser for Chat UI
const formatChatText = (text) => {
  if (!text) return "";
  
  // Replace bold text (**text**) with HTML bold tags and amber color
  let formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong className="text-amber-400 font-bold">$1</strong>');
  
  // Replace single newlines with <br /> tags
  formattedText = formattedText.replace(/\n/g, '<br />');
  
  // Replace bullet points (* or -) with styled list items
  formattedText = formattedText.replace(/(?:^|\n)[*-]\s(.*)/g, '<li className="ml-4 list-disc marker:text-amber-500">$1</li>');

  return formattedText;
};

export default function App() {
  const [persona, setPersona] = useState('CITIZEN');

  return (
    <div className="min-h-screen bg-[#070C18] text-slate-100 font-sans selection:bg-amber-500/30">
      {/* Top Navbar */}
      <header className="bg-[#0D1527]/90 backdrop-blur-xl border-b border-slate-800 sticky top-0 z-50 px-6 py-4 flex flex-wrap justify-between items-center gap-4 shadow-2xl">
        <div className="flex items-center space-x-4">
          <div className="bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950 p-2.5 rounded-xl font-black text-xl tracking-wider shadow-lg shadow-amber-500/20">
            DPI
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              SAMARTH <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-mono">v2.5 AI</span>
            </h1>
            <p className="text-[11px] text-slate-400 font-medium">National Command & Intelligence Network</p>
          </div>
        </div>

        {/* Persona Switcher */}
        <div className="flex bg-[#070C18] p-1.5 rounded-2xl border border-slate-800/80 space-x-1">
          {[
            { id: 'CITIZEN', label: 'Citizen Portal', icon: UserCheck },
            { id: 'CM', label: 'CM Command Center', icon: Building2 },
            { id: 'PM', label: 'PM National Intelligence', icon: ShieldAlert },
          ].map((item) => {
            const Icon = item.icon;
            const active = persona === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setPersona(item.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${
                  active 
                    ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 scale-100' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Workspace */}
      <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto">
        {persona === 'CITIZEN' && <CitizenView />}
        {persona === 'CM' && <CMView />}
        {persona === 'PM' && <PMView />}
      </main>
    </div>
  );
}

/* ==========================================
   1. CITIZEN PORTAL VIEW
   ========================================== */
function CitizenView() {
  const [stateName, setStateName] = useState('Andhra Pradesh');
  const [district, setDistrict] = useState('Ananthapuramu');
  const [category, setCategory] = useState('Water Security');
  const [description, setDescription] = useState('');
  const [citizenId, setCitizenId] = useState('CIT-99201');
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);

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
      await axios.post(`${API_BASE}/citizen/complaint`, {
        citizen_id: citizenId, state: stateName, district, category, description
      });
      setDescription('');
      fetchComplaints();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-5 bg-[#0D1527]/60 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-orange-500"></div>
        <h2 className="text-base font-bold flex items-center space-x-2 text-white mb-6">
          <PlusCircle className="w-5 h-5 text-amber-400" />
          <span>File Public Grievance</span>
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Citizen ID</label>
            <input type="text" value={citizenId} onChange={(e) => setCitizenId(e.target.value)} className="w-full bg-[#070C18] border border-slate-800 rounded-xl p-3 text-slate-200 outline-none focus:border-amber-500" required />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">State</label>
              <input type="text" value={stateName} onChange={(e) => setStateName(e.target.value)} className="w-full bg-[#070C18] border border-slate-800 rounded-xl p-3 text-slate-200 outline-none focus:border-amber-500" required />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-medium">District</label>
              <input type="text" value={district} onChange={(e) => setDistrict(e.target.value)} className="w-full bg-[#070C18] border border-slate-800 rounded-xl p-3 text-slate-200 outline-none focus:border-amber-500" required />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">Sector</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-[#070C18] border border-slate-800 rounded-xl p-3 text-slate-200 outline-none focus:border-amber-500">
              <option>Water Security</option><option>Roads & Infrastructure</option><option>Rural Employment</option><option>Public Health</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">Grievance Summary</label>
            <textarea rows="4" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe ground reality..." className="w-full bg-[#070C18] border border-slate-800 rounded-xl p-3 text-slate-200 outline-none focus:border-amber-500 resize-none" required />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black p-3.5 rounded-xl transition-all flex items-center justify-center space-x-2">
            <Send className="w-4 h-4" />
            <span>{loading ? 'Routing...' : 'Submit Grievance'}</span>
          </button>
        </form>
      </div>

      <div className="lg:col-span-7 bg-[#0D1527]/60 border border-slate-800 rounded-3xl p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-base font-bold flex items-center space-x-2 text-white">
            <MapPin className="w-5 h-5 text-amber-400" />
            <span>Live Regional Stream: {stateName}</span>
          </h2>
          <span className="text-xs font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1 rounded-full">
            {complaints.length} Logged
          </span>
        </div>

        <div className="space-y-3 max-h-[520px] overflow-y-auto pr-2">
          {complaints.map((c) => (
            <div key={c.complaint_id} className="bg-[#070C18] border border-slate-800/80 p-4 rounded-2xl flex justify-between items-start">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-xs font-bold text-amber-400">#{c.complaint_id}</span>
                  <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md font-medium">{c.district}</span>
                  <span className="text-xs border border-slate-700 text-slate-400 px-2 py-0.5 rounded-md">{c.category}</span>
                </div>
                <p className="text-xs text-slate-300">{c.description}</p>
              </div>
              <span className="text-xs font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-lg">
                Score: {c.urgency_score}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ==========================================
   2. CHIEF MINISTER COMMAND CENTER
   ========================================== */
function CMView() {
  const [stateName, setStateName] = useState('Andhra Pradesh');
  const [data, setData] = useState(null);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState([
    { sender: 'bot', text: `Authorized Chief Minister Copilot initialized for state: **Andhra Pradesh**. How may I assist your cabinet?` }
  ]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    axios.get(`${API_BASE}/cm/dashboard/${stateName}`).then(res => setData(res.data)).catch(console.error);
  }, [stateName]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendChat = async (e) => {
    e?.preventDefault();
    if (!chatInput.trim() || loading) return;

    const userMsg = chatInput;
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setChatInput('');
    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE}/chat`, {
        persona: 'CM',
        message: userMsg,
        state_name: stateName
      });
      setMessages(prev => [...prev, { sender: 'bot', text: res.data.response }]);
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'bot', text: 'Error connecting to State Copilot Engine.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* State Metric Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-[#0D1527]/60 border border-slate-800 p-6 rounded-3xl shadow-xl gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-mono font-bold flex items-center gap-1">
              <Lock className="w-3 h-3" /> State Level RBAC Bounded
            </span>
          </div>
          <h2 className="text-xl font-bold text-white">Chief Minister AI Command Terminal</h2>
        </div>
        <div className="flex items-center space-x-2">
          <label className="text-xs text-slate-400 font-semibold">Active State Context:</label>
          <input type="text" value={stateName} onChange={(e) => setStateName(e.target.value)} className="bg-[#070C18] border border-slate-800 px-4 py-2 rounded-xl text-xs text-amber-400 font-bold outline-none focus:border-amber-500" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Metrics Cards */}
        <div className="lg:col-span-5 space-y-6">
          {data && (
            <>
              <div className="bg-[#0D1527]/60 border border-slate-800 p-6 rounded-3xl shadow-lg">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">State Household Income (NAFIS)</h3>
                <p className="text-3xl font-black text-amber-400">₹{data.state_financial_health.avg_monthly_income} <span className="text-xs text-slate-500 font-normal">/ month</span></p>
                <p className="text-xs text-slate-500 mt-2">State Indebtedness Ratio: {data.state_financial_health.indebtedness_percent}%</p>
              </div>

              <div className="bg-[#0D1527]/60 border border-slate-800 p-6 rounded-3xl shadow-lg">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Grievance Hotspots (By District)</h3>
                <div className="space-y-3">
                  {data.district_grievance_hotspots.map((h, i) => (
                    <div key={i} className="flex justify-between items-center bg-[#070C18] p-3 rounded-xl border border-slate-800/80">
                      <span className="font-bold text-xs text-white">{h.district}</span>
                      <div className="flex items-center space-x-3 text-xs">
                        <span className="text-slate-400">{h.total_complaints} Cases</span>
                        <span className="text-red-400 font-bold bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">Score: {h.avg_urgency_score}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Right Column: Conversational Copilot Terminal */}
        <div className="lg:col-span-7 bg-[#0D1527]/60 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col h-[560px]">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
            <div className="flex items-center space-x-2">
              <Bot className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm font-bold text-white">CM Governance Assistant</h3>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">Gemini 2.5 Flash</span>
          </div>

          {/* Quick Action Chips */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2 custom-scrollbar">
            {[
              `Summarize top priorities for ${stateName}`,
              `Check Maharashtra water deficit`, // Security trigger test!
            ].map((chip, idx) => (
              <button
                key={idx}
                onClick={() => { setChatInput(chip); }}
                className="text-[11px] bg-[#070C18] hover:bg-slate-800 text-slate-300 border border-slate-800 px-3 py-1.5 rounded-lg whitespace-nowrap transition-all flex items-center space-x-1"
              >
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>{chip}</span>
              </button>
            ))}
          </div>

          {/* Chat Messages Stream */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar text-xs">
            {messages.map((m, i) => (
  <div key={i} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
    <div 
      className={`max-w-[88%] p-4 rounded-2xl ${
        m.sender === 'user' 
          ? 'bg-amber-500 text-slate-950 font-bold rounded-br-none' 
          : 'bg-[#070C18] border border-slate-800 text-slate-200 rounded-bl-none leading-relaxed'
      }`}
      // Parse the markdown string into actual HTML elements
      dangerouslySetInnerHTML={{ __html: formatChatText(m.text) }}
    />
  </div>
))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-[#070C18] border border-slate-800 p-3 rounded-2xl text-xs text-amber-400 animate-pulse">
                  Analyzing state datasets...
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Box */}
          <form onSubmit={handleSendChat} className="mt-4 flex gap-2 pt-3 border-t border-slate-800">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder={`Ask CM Copilot regarding ${stateName}...`}
              className="flex-1 bg-[#070C18] border border-slate-800 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-amber-500"
            />
            <button type="submit" disabled={loading} className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 rounded-xl transition-all">
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

/* ==========================================
   3. PRIME MINISTER NATIONAL INTELLIGENCE TERMINAL
   ========================================== */
function PMView() {
  const [data, setData] = useState(null);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState([
    { sender: 'bot', text: `National Executive AI Copilot initialized. Full cross-functional authorization granted across 36 States/UTs. Select a query or enter a district.` }
  ]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    axios.get(`${API_BASE}/pm/dashboard`).then(res => setData(res.data));
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendChat = async (e) => {
    e?.preventDefault();
    if (!chatInput.trim() || loading) return;

    const userMsg = chatInput;
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setChatInput('');
    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE}/chat`, {
        persona: 'PM',
        message: userMsg
      });
      setMessages(prev => [...prev, { sender: 'bot', text: res.data.response }]);
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'bot', text: 'Error connecting to National Copilot Engine.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* PM Header Banner */}
      <div className="bg-gradient-to-r from-[#0D1527] to-[#162036] border border-slate-800 p-6 rounded-3xl shadow-2xl flex flex-wrap justify-between items-center gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-0.5 rounded-full font-mono font-bold">
              Unrestricted National Authorization
            </span>
          </div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-red-400" />
            <span>Prime Minister National Command Copilot</span>
          </h2>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">Multi-Agent Protocol</p>
          <p className="text-xs font-bold text-amber-400">Google Gemini + FastMCP</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: National Metrics */}
        <div className="lg:col-span-5 space-y-6">
          {data && (
            <>
              <div className="bg-[#0D1527]/60 border border-slate-800 p-6 rounded-3xl shadow-lg flex justify-between items-center">
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total National Grievances</h3>
                  <span className="text-4xl font-black text-amber-400">{data.national_total_complaints}</span>
                </div>
                <Terminal className="w-10 h-10 text-slate-700" />
              </div>

              <div className="bg-[#0D1527]/60 border border-slate-800 p-6 rounded-3xl shadow-lg">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Top Priority National Hotspots</h3>
                <div className="space-y-3">
                  {data.top_priority_national_hotspots.map((h, i) => (
                    <div key={i} className="bg-[#070C18] p-3.5 rounded-2xl border border-slate-800/80 flex justify-between items-center">
                      <div>
                        <span className="text-xs font-bold text-white">{h.district}, {h.state}</span>
                        <span className="block text-[11px] text-slate-400">Queue: {h.complaint_volume} cases ({h.category})</span>
                      </div>
                      <span className="text-xs font-mono font-bold bg-red-500/10 text-red-400 border border-red-500/20 px-2.5 py-1 rounded-lg">
                        Urgency: {h.computed_urgency_score}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Right Column: Conversational PM Copilot */}
        <div className="lg:col-span-7 bg-[#0D1527]/60 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col h-[580px]">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm font-bold text-white">PM Executive Synthesis Assistant</h3>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">Gemini 2.5 Flash + RAG</span>
          </div>

          {/* Quick Edge-Case Prompts */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2 custom-scrollbar">
            {[
              "Run 360° vulnerability on Ananthapuramu",
              "Check water security vs crime in Andaman",
            ].map((chip, idx) => (
              <button
                key={idx}
                onClick={() => { setChatInput(chip); }}
                className="text-[11px] bg-[#070C18] hover:bg-slate-800 text-slate-300 border border-slate-800 px-3 py-1.5 rounded-lg whitespace-nowrap transition-all flex items-center space-x-1"
              >
                <ChevronRight className="w-3 h-3 text-amber-400" />
                <span>{chip}</span>
              </button>
            ))}
          </div>

          {/* Chat Stream */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar text-xs">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[88%] p-4 rounded-2xl ${
                  m.sender === 'user' 
                    ? 'bg-amber-500 text-slate-950 font-bold rounded-br-none' 
                    : 'bg-[#070C18] border border-slate-800 text-slate-200 rounded-bl-none leading-relaxed whitespace-pre-line'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-[#070C18] border border-slate-800 p-3.5 rounded-2xl text-xs text-amber-400 animate-pulse flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Synthesizing cross-functional SQL & Vector RAG datasets...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Form */}
          <form onSubmit={handleSendChat} className="mt-4 flex gap-2 pt-3 border-t border-slate-800">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask PM Copilot to synthesize national data or issue policy directives..."
              className="flex-1 bg-[#070C18] border border-slate-800 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-amber-500"
            />
            <button type="submit" disabled={loading} className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 rounded-xl transition-all">
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}