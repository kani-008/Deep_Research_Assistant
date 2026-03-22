// src/pages/ToolsPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText, Layers, BarChart2, Database,
  Sparkles, Zap, ArrowRight, CheckCircle2
} from 'lucide-react';

const ToolCard = ({ icon: Icon, title, desc, badge, accent, bg, ring, onClick, intent }) => (
  <button onClick={() => onClick(intent, title)}
    className="text-left relative group bg-[#0d0d1a] border border-white/[0.06] rounded-2xl p-5 sm:p-6 flex flex-col gap-4 transition-all hover:border-white/[0.14] hover:bg-[#10101e] hover:-translate-y-0.5 cursor-pointer w-full">
    {badge && (
      <span className={`absolute top-4 right-4 text-[0.6rem] sm:text-[0.65rem] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${
        badge === 'Popular'
          ? 'bg-violet-500/15 text-violet-400 ring-1 ring-violet-500/20'
          : 'bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20'
      }`}>{badge}</span>
    )}
    <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl ${bg} ring-1 ${ring} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-500`}>
      <Icon size={18} className={accent} />
    </div>
    <div className="flex-1">
      <h3 className="font-bold text-white text-sm sm:text-base mb-1.5">{title}</h3>
      <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-medium">{desc}</p>
    </div>
    <div className="flex items-center gap-1.5 text-[0.7rem] sm:text-xs font-bold text-neutral-500 group-hover:text-violet-400 transition-colors mt-auto pt-1">
      Initialize Tool <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
    </div>
  </button>
);

const ToolsPage = () => {
  const navigate = useNavigate();
  
  const handleToolClick = (intent, title) => {
    // Navigate to chat and pass the intent in state
    navigate('/chat', { state: { initialPrompt: intent, toolName: title } });
  };

  const tools = [
    {
      icon: FileText, title: 'Document Summary', badge: 'Popular',
      desc: 'Generate comprehensive summaries, executive overviews, or key takeaways from multiple PDFs at once.',
      accent: 'text-violet-400', bg: 'bg-violet-500/10', ring: 'ring-violet-500/20',
      intent: 'Please analyze my documents and provide a comprehensive executive summary with key takeaways.'
    },
    {
      icon: Layers, title: 'Compare Documents', badge: 'Beta',
      desc: 'Upload two or more documents to find similarities, contradictions, and unique insights across sources.',
      accent: 'text-cyan-400', bg: 'bg-cyan-500/10', ring: 'ring-cyan-500/20',
      intent: 'Can you compare my uploaded documents? Identify common patterns, key differences, and any contradictions between them.'
    },
    {
      icon: BarChart2, title: 'Report Generator',
      desc: 'Enter a research topic and let AI synthesize your uploaded data into a structured research report.',
      accent: 'text-emerald-400', bg: 'bg-emerald-500/10', ring: 'ring-emerald-500/20',
      intent: 'I need a structured research report. Please synthesize the data from my documents into a professional overview.'
    },
    {
      icon: Database, title: 'Question Generator',
      desc: 'Auto-generate MCQs, key concepts, or exam questions from your study materials for better prep.',
      accent: 'text-amber-400', bg: 'bg-amber-500/10', ring: 'ring-amber-500/20',
      intent: 'Generate 5 study questions and key concept definitions based on the core information in my documents.'
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-5 py-6 sm:py-8 pb-16 space-y-6 sm:space-y-8">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white mb-1">Advanced Tools</h1>
        <p className="text-xs sm:text-sm text-neutral-600 font-medium">Specialized AI tools for complex document analysis and knowledge extraction.</p>
      </div>

      {/* ── Tool grid ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {tools.map((t, i) => <ToolCard key={i} {...t} onClick={handleToolClick} />)}
      </div>

      {/* ── Featured banner ────────────────────────────────────────────── */}
      <div className="relative bg-gradient-to-br from-violet-900/25 via-purple-900/15 to-[#0d0d1a] border border-violet-500/20 rounded-3xl p-6 sm:p-10 overflow-hidden">
        {/* BG glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-[300px] sm:w-[400px] h-[200px] sm:h-[300px] bg-violet-600/10 blur-[60px] sm:blur-[80px]" />
          <div className="absolute bottom-0 right-0 w-[200px] sm:w-[300px] h-[150px] sm:h-[200px] bg-purple-600/5 blur-[50px] sm:blur-[60px]" />
        </div>

        {/* Decorative dots — desktop only */}
        <div className="absolute top-8 right-8 hidden xl:grid grid-cols-3 gap-2 opacity-10">
          {Array(9).fill(0).map((_, i) => (
            <div key={i} className="w-10 h-10 border border-white/20 rounded-lg flex items-center justify-center">
              <div className="w-4 h-0.5 bg-white/30 rounded-full" />
            </div>
          ))}
        </div>

        <div className="relative z-10 max-w-xl">
          {/* Icon */}
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white flex items-center justify-center mb-5 sm:mb-6 shadow-2xl">
            <Sparkles size={24} className="text-violet-600" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-3">Smart Synthesis Engine</h2>
          <p className="text-neutral-400 text-sm sm:text-sm leading-relaxed mb-5 sm:mb-6 font-light">
            Our most powerful tool. It scans your entire document library, identifies cross-document patterns,
            and builds a comprehensive knowledge graph of your research topics.
          </p>

          {/* Feature chips */}
          <div className="flex flex-wrap gap-2 mb-6 sm:mb-8">
            {['Cross-document analysis', 'Pattern detection', 'Knowledge graph', 'Auto-citations'].map((f, i) => (
              <span key={i} className="flex items-center gap-1.5 text-[0.7rem] sm:text-xs text-violet-300 bg-violet-500/[0.08] border border-violet-500/20 px-2.5 sm:px-3 py-1.5 rounded-full font-bold">
                <CheckCircle2 size={10} /> {f}
              </span>
            ))}
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button onClick={() => handleToolClick('Perform a full library synthesis and identify deep patterns across all my research.', 'Smart Synthesis')}
              className="flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-black px-5 sm:px-7 py-3 rounded-xl text-sm sm:text-sm transition-all shadow-xl shadow-violet-600/25 active:scale-[0.98]">
              Start Synthesis <Zap size={15} className="fill-white" />
            </button>
            <button className="flex items-center justify-center gap-2 bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] text-white font-bold px-5 sm:px-7 py-3 rounded-xl text-sm sm:text-sm transition-all">
              Documentation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToolsPage;
