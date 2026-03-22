// src/pages/legal/LegalPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Lock, FileText } from 'lucide-react';

const LegalPage = ({ title, content }) => {
  return (
    <div className="min-h-screen bg-[#07070f] text-white selection:bg-violet-500/30">
      <nav className="border-b border-white/[0.06] bg-[#07070f]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <ArrowLeft size={16} className="text-neutral-500 group-hover:text-white group-hover:-translate-x-1 transition-all" />
            <span className="text-sm font-medium text-neutral-400 group-hover:text-white">Back to Home</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center font-black text-[10px]">D</div>
            <span className="font-extrabold text-[12px] tracking-tight">Deep Research</span>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-16 sm:py-24">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
            {title.includes('Privacy') ? <Lock className="text-violet-400" size={24} /> : <FileText className="text-violet-400" size={24} />}
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight">{title}</h1>
        </div>
        
        <div className="prose prose-invert max-w-none space-y-8 text-neutral-400 leading-relaxed font-light">
          {content.map((section, i) => (
            <div key={i} className="space-y-4">
              <h2 className="text-xl font-bold text-white tracking-tight">{section.h}</h2>
              <p className="text-sm sm:text-base">{section.p}</p>
              {section.list && (
                <ul className="space-y-3 pl-4">
                  {section.list.map((item, j) => (
                    <li key={j} className="flex items-start gap-3 text-[13px] sm:text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-violet-500 mt-2 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        <div className="mt-20 pt-10 border-t border-white/[0.06] text-center">
          <p className="text-xs text-neutral-600 mb-6">Last updated: March 23, 2026</p>
          <Link to="/signup" className="inline-flex items-center justify-center px-8 py-3 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl transition-all shadow-xl shadow-violet-600/20">
            Start Researching for Free
          </Link>
        </div>
      </main>
    </div>
  );
};

export default LegalPage;
