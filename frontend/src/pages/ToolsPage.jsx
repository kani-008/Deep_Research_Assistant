// src/pages/ToolsPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText, Layers, BarChart2, Database,
  Sparkles, Zap, ArrowRight, CheckCircle2,
  X, Search, ChevronRight, Loader2
} from 'lucide-react';
import { useChat } from '../context/ChatContext';
import toast from 'react-hot-toast';

const ToolCard = ({ icon: Icon, title, desc, badge, accent, bg, ring, onClick }) => (
  <button onClick={onClick}
    className="text-left relative group bg-[#0d0d1a] border border-white/[0.06] rounded-2xl p-5 sm:p-6 flex flex-col gap-4 transition-all hover:border-white/[0.14] hover:bg-[#10101e] hover:-translate-y-0.5 cursor-pointer w-full overflow-hidden">
    <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.02] rounded-full -mr-16 -mt-16 group-hover:bg-white/[0.04] transition-colors" />
    {badge && (
      <span className={`absolute top-4 right-4 text-[0.6rem] sm:text-[0.65rem] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full z-10 ${
        badge === 'Popular'
          ? 'bg-violet-500/15 text-violet-400 ring-1 ring-violet-500/20'
          : 'bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20'
      }`}>{badge}</span>
    )}
    <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl ${bg} ring-1 ${ring} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-500`}>
      <Icon size={18} className={accent} />
    </div>
    <div className="flex-1 relative z-10">
      <h3 className="font-black text-white text-sm sm:text-base mb-1.5 tracking-tight">{title}</h3>
      <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-bold">{desc}</p>
    </div>
    <div className="flex items-center gap-1.5 text-[0.7rem] sm:text-xs font-black uppercase tracking-widest text-neutral-500 group-hover:text-violet-400 transition-colors mt-auto pt-1">
      Initialize Lab <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
    </div>
  </button>
);

const ToolsPage = () => {
  const navigate = useNavigate();
  const { documents, createNewChat } = useChat();
  const [activeTool, setActiveTool] = useState(null);
  const [selectedDocs, setSelectedDocs] = useState([]);

  const tools = [
    {
      id: 'summary',
      icon: FileText, title: 'Document Summary', badge: 'Popular',
      desc: 'Generate comprehensive summaries, executive overviews, or key takeaways from multiple PDFs at once.',
      accent: 'text-violet-400', bg: 'bg-violet-500/10', ring: 'ring-violet-500/20',
      minSelected: 1,
      intent: (names) => `I need a high-level executive summary of these documents: ${names}. Extract the key findings, main arguments, and strategic takeaways.`
    },
    {
      id: 'compare',
      icon: Layers, title: 'Compare Documents', badge: 'Beta',
      desc: 'Upload two or more documents to find similarities, contradictions, and unique insights across sources.',
      accent: 'text-cyan-400', bg: 'bg-cyan-500/10', ring: 'ring-cyan-500/20',
      minSelected: 2,
      intent: (names) => `Perform a comparative analysis on ${names}. Highlight core similarities, identify direct contradictions, and map out unique perspectives exclusive to each source.`
    },
    {
      id: 'report',
      icon: BarChart2, title: 'Report Generator',
      desc: 'Enter a research topic and let AI synthesize your uploaded data into a structured research report.',
      accent: 'text-emerald-400', bg: 'bg-emerald-500/10', ring: 'ring-emerald-500/20',
      minSelected: 1,
      intent: (names) => `Synthesize a structured professional report from these documents: ${names}. Create a cohesive narrative that flows logically through the data.`
    },
    {
      id: 'questions',
      icon: Database, title: 'Exam Prep Hub',
      desc: 'Auto-generate MCQs, key concepts, or exam questions from your study materials for better prep.',
      accent: 'text-amber-400', bg: 'bg-amber-500/10', ring: 'ring-amber-500/20',
      minSelected: 1,
      intent: (names) => `Based on ${names}, generate a list of 10 challenging study questions, key concepts, and a concise glossary of terms found in the text.`
    },
  ];

  const handleExecute = () => {
    if (selectedDocs.length < activeTool.minSelected) {
      toast.error(`Select at least ${activeTool.minSelected} documents for this tool`);
      return;
    }

    const docNames = documents
      .filter(d => selectedDocs.includes(d.id))
      .map(d => d.name)
      .join(' and ');

    const prompt = activeTool.intent(docNames);
    const chatId = createNewChat();
    navigate(`/chat/${chatId}`, { state: { initialPrompt: prompt, toolName: activeTool.title } });
  };

  const toggleDoc = (id) => {
    setSelectedDocs(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 pb-20 space-y-10 relative">
      
      {/* ── Selection Overlay ─────────────────────────────────────────── */}
      {activeTool && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
          <div className="absolute inset-0 bg-[#070712]/90 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setActiveTool(null)} />
          
          <div className="relative w-full max-w-2xl bg-[#0f0f1e] border border-white/[0.08] rounded-[2.5rem] shadow-2xl flex flex-col max-h-[85vh] animate-in zoom-in-95 slide-in-from-bottom-5 duration-500 overflow-hidden">
            {/* Overlay Header */}
            <div className="p-6 sm:p-8 border-b border-white/[0.06] bg-white/[0.01] flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl ${activeTool.bg} flex items-center justify-center border border-white/5`}>
                   <activeTool.icon size={20} className={activeTool.accent} />
                </div>
                <div>
                   <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">{activeTool.title}</h2>
                   <p className="text-[11px] text-neutral-500 font-bold uppercase tracking-widest mt-0.5">Selection Laboratory</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveTool(null)}
                className="w-10 h-10 rounded-full hover:bg-white/[0.05] flex items-center justify-center text-neutral-500 hover:text-white transition-all">
                <X size={20} />
              </button>
            </div>

            {/* Document List */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 custom-scrollbar space-y-3">
              <div className="flex items-center justify-between mb-4 px-1">
                <p className="text-[10px] font-black text-neutral-600 uppercase tracking-widest flex items-center gap-2">
                  <Database size={12} /> Source Documents ({documents.length})
                </p>
                <button 
                  onClick={() => setSelectedDocs(selectedDocs.length === documents.length ? [] : documents.map(d => d.id))}
                  className="text-[10px] font-bold text-violet-400 hover:text-violet-300 uppercase tracking-widest transition-colors"
                >
                  {selectedDocs.length === documents.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>

              {documents.length > 0 ? (
                documents.map(doc => (
                  <button 
                    key={doc.id}
                    onClick={() => toggleDoc(doc.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all text-left group ${
                      selectedDocs.includes(doc.id)
                      ? 'bg-violet-600/10 border-violet-500/40 ring-1 ring-violet-500/20 shadow-lg shadow-violet-500/5'
                      : 'bg-[#0a0a14] border-white/[0.04] hover:border-white/10'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                      selectedDocs.includes(doc.id) ? 'bg-violet-500 border-violet-500' : 'border-neutral-800'
                    }`}>
                      {selectedDocs.includes(doc.id) && <CheckCircle2 size={12} className="text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-bold truncate transition-colors ${selectedDocs.includes(doc.id) ? 'text-white' : 'text-neutral-400 group-hover:text-neutral-200'}`}>{doc.name}</p>
                      <p className="text-[10px] text-neutral-700 font-bold uppercase tracking-widest mt-0.5">{doc.size}</p>
                    </div>
                    <FileText size={16} className={selectedDocs.includes(doc.id) ? 'text-violet-400' : 'text-neutral-800 group-hover:text-neutral-700'} />
                  </button>
                ))
              ) : (
                <div className="text-center py-12 px-4 border border-dashed border-white/5 rounded-3xl">
                   <p className="text-xs text-neutral-600 font-bold uppercase tracking-[0.2em]">Repository Empty</p>
                   <p className="text-[11px] text-neutral-800 mt-2">Upload PDFs in the Dashboard to begin analysis.</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 sm:p-8 bg-white/[0.02] border-t border-white/[0.06] flex items-center justify-between">
              <div className="hidden sm:block">
                <p className="text-xs font-black text-white">{selectedDocs.length} Selected</p>
                <p className="text-[10px] text-neutral-600 font-bold uppercase tracking-widest mt-0.5">Minimum {activeTool.minSelected} required</p>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button 
                  onClick={() => setActiveTool(null)}
                  className="flex-1 sm:flex-none py-3.5 px-6 text-xs font-black text-neutral-500 uppercase tracking-widest hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button 
                  disabled={selectedDocs.length < activeTool.minSelected}
                  onClick={handleExecute}
                  className={`flex-1 sm:flex-none py-3.5 px-10 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                    selectedDocs.length >= activeTool.minSelected
                    ? 'bg-violet-600 text-white shadow-xl shadow-violet-600/25 hover:bg-violet-500 active:scale-95'
                    : 'bg-white/5 text-neutral-800 border border-white/5 pointer-events-none'
                  }`}
                >
                  Launch Tool <ArrowRight size={14} strokeWidth={3} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-black tracking-tighter text-white">Research Laboratory</h1>
        <p className="text-xs sm:text-sm text-neutral-600 font-bold uppercase tracking-[0.15em] max-w-2xl leading-relaxed">
           Deep intelligence tools for cross-document synthesis, comparative mapping, and knowledge extraction.
        </p>
      </div>

      {/* ── Tool grid ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6">
        {tools.map((t, i) => <ToolCard key={i} {...t} onClick={() => { setActiveTool(t); setSelectedDocs([]); }} />)}
      </div>

      {/* ── Featured banner ────────────────────────────────────────────── */}
      <div className="relative bg-[#0d0d1a] border border-white/[0.04] rounded-3xl p-6 sm:px-12 sm:py-16 overflow-hidden group">
        {/* BG glow effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-600/5 blur-[120px] group-hover:bg-violet-600/10 transition-colors duration-1000" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-600/5 blur-[100px]" />
        </div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 items-center gap-12">
          <div className="space-y-6">
            <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-2xl rotate-3 group-hover:rotate-0 transition-transform duration-500">
              <Sparkles size={28} className="text-violet-600" />
            </div>
            <div>
               <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-4">Smart Synthesis Engine</h2>
               <p className="text-neutral-500 text-sm sm:text-base leading-relaxed font-medium">
                Our most advanced neural-RAG tool. It scans your entire library, identifies latent connections between papers, and builds a comprehensive synthesis of your research field.
               </p>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {['Cross-document Analysis', 'Pattern Extraction', 'Knowledge Graphs'].map((f, i) => (
                <div key={i} className="px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06] flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                   <span className="text-[10px] font-black text-neutral-300 uppercase tracking-widest">{f}</span>
                </div>
              ))}
            </div>
            <div className="pt-4">
              <button 
                onClick={() => { setActiveTool({ title: 'Smart Synthesis', id: 'synthesis', bg: 'bg-indigo-500/10', accent: 'text-indigo-400', icon: Sparkles, minSelected: 1, intent: (n) => `Analyze the entire research library with focus on ${n}. Build a cross-document knowledge synthesis.` }); setSelectedDocs([]); }}
                className="group/btn bg-white text-black font-black px-8 py-4 rounded-2xl text-[11px] uppercase tracking-widest flex items-center gap-3 hover:bg-neutral-100 transition-all shadow-2xl shadow-white/10 active:scale-95"
              >
                Launch Primary Synthesis <Zap size={14} fill="currentColor" />
              </button>
            </div>
          </div>

          <div className="hidden lg:grid grid-cols-2 gap-4">
              {[
                { l: 'Pattern Discovery', d: 'Find themes across sources', i: Search, c: 'text-violet-400' },
                { l: 'Conflict Radar', d: 'Identify contradictions', i: Zap, c: 'text-amber-400' },
                { l: 'Insight Mining', d: 'Extract non-obvious data', i: Database, c: 'text-cyan-400' },
                { l: 'Auto-Context', d: 'Maintain cross-doc history', i: Layers, c: 'text-emerald-400' },
              ].map((f, i) => (
                <div key={i} className="p-6 rounded-3xl bg-white/[0.02] border border-white/[0.04] space-y-3 hover:border-white/10 transition-colors">
                  <f.i size={20} className={f.c} />
                  <div>
                    <p className="text-xs font-black text-white uppercase tracking-widest">{f.l}</p>
                    <p className="text-[10px] text-neutral-600 font-bold mt-1 line-clamp-1">{f.d}</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToolsPage;
