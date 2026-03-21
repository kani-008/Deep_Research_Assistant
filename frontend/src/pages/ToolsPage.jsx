// ./frontend/src/pages/ToolsPage.jsx

import React, { useState } from 'react';
import { 
  FileText, 
  Layers, 
  BarChart2, 
  PieChart, 
  Sparkles, 
  Brain, 
  Plus, 
  Search, 
  ArrowRight,
  Zap,
  BookOpen,
  PieChart as PieIcon,
  ChevronRight,
  Download,
  Share2,
  Database
} from 'lucide-react';
import { motion } from 'framer-motion';

const ToolCard = ({ icon: Icon, title, description, badge, onClick, color }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="bg-white/5 border border-white/5 rounded-[2.5rem] p-8 flex flex-col gap-6 hover:bg-white/[0.08] hover:border-white/10 transition-all group relative overflow-hidden"
  >
    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[40px] translate-x-12 -translate-y-12"></div>
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl transition-transform group-hover:scale-110 ${color}`}>
      <Icon size={28} className="text-white" />
    </div>
    <div className="flex-1">
      <div className="flex items-center gap-3 mb-2">
        <h3 className="text-xl font-black text-white">{title}</h3>
        {badge && <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-500/20">{badge}</span>}
      </div>
      <p className="text-sm font-medium text-neutral-400 leading-relaxed">{description}</p>
    </div>
    <button 
      onClick={onClick}
      className="mt-4 flex items-center gap-2 py-3 px-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all font-bold text-sm w-fit group/btn"
    >
      <span>Open Tool</span>
      <ArrowRight size={16} className="text-primary group-hover/btn:translate-x-1 transition-transform" />
    </button>
  </motion.div>
);

const ToolsPage = () => {
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-12 pb-20">
      <header>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-4">
          <Brain size={12} className="text-primary" />
          <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Deep AI Toolbox</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-white mb-3">Advanced <span className="gradient-text">Research Tools</span></h1>
        <p className="text-neutral-400 font-medium max-w-2xl">Supercharge your productivity with our specialized AI tools designed for complex document analysis and knowledge extraction.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
        <ToolCard 
          icon={FileText}
          title="Document Summary Tool"
          description="Generate comprehensive long-form summaries, executive overviews, or bulleted key takeaways from multiple files at once."
          badge="Popular"
          color="bg-blue-600 shadow-blue-600/20"
          onClick={() => {}}
        />
        <ToolCard 
          icon={Layers}
          title="Compare Documents"
          description="Upload two or more documents to find similarities, direct contradictions, and unique insights across different sources."
          badge="Beta"
          color="bg-accent shadow-accent/20"
          onClick={() => {}}
        />
        <ToolCard 
          icon={BarChart2}
          title="Report Generator"
          description="Input a research topic and let AI synthesize your uploaded data into a professionally structured research report."
          color="bg-indigo-600 shadow-indigo-600/20"
          onClick={() => {}}
        />
        <ToolCard 
          icon={Database}
          title="Question Generator"
          description="Automatically generate MCQs, key concepts, or viva questions based on your study materials for better exam prep."
          color="bg-emerald-600 shadow-emerald-600/20"
          onClick={() => {}}
        />
      </div>

      {/* Featured Tool section */}
      <section className="bg-gradient-to-tr from-primary/10 via-accent/5 to-purple-500/10 border border-white/10 rounded-[3rem] p-10 relative overflow-hidden group">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle,rgba(6,182,212,0.1)_0%,transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
        <div className="max-w-3xl relative z-10">
          <div className="w-16 h-16 rounded-[1.5rem] bg-white text-black flex items-center justify-center mb-8 shadow-2xl">
            <Sparkles size={32} />
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Smart Synthesis Engine</h2>
          <p className="text-lg text-neutral-300 font-medium mb-8 leading-relaxed">Our most powerful tool yet. It scans your entire library, identifies cross-document patterns, and builds a comprehensive knowledge graph of your research topics.</p>
          <div className="flex flex-wrap gap-4">
            <button className="px-8 py-4 bg-primary text-white rounded-2xl font-black shadow-2xl shadow-primary/30 hover:bg-primary-dark transition-all flex items-center gap-2 group/btn">
              Start Synthesis
              <Zap size={20} className="fill-white group-hover/btn:scale-125 transition-transform" />
            </button>
            <button className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl font-black hover:bg-white/10 transition-all">
              Learn How it Works
            </button>
          </div>
        </div>
        <div className="absolute top-10 right-10 hidden lg:block opacity-20 pointer-events-none">
          <div className="grid grid-cols-3 gap-2">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="w-12 h-12 border border-white/20 rounded-lg flex items-center justify-center">
                <div className="w-6 h-1 bg-white/20 rounded-full"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ToolsPage;
