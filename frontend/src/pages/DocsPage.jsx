// src/pages/DocsPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Book, Search, MessageSquare, Zap } from 'lucide-react';

const DocsPage = () => {
  const sections = [
    {
      title: 'Getting Started',
      icon: Zap,
      items: ['System requirements', 'Creating your account', 'First document upload', 'Interface overview']
    },
    {
      title: 'Search Syntax',
      icon: Search,
      items: ['Natural language queries', 'Boolean operators', 'Filtering by date', 'Multi-doc synthesis']
    },
    {
      title: 'Advanced AI Chat',
      icon: MessageSquare,
      items: ['Refining answers', 'Source verification', 'Exporting results', 'Collaboration tools']
    }
  ];

  return (
    <div className="min-h-screen bg-[#07070f] text-white selection:bg-violet-500/30">
      <nav className="border-b border-white/[0.06] bg-[#07070f]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <ArrowLeft size={16} className="text-neutral-500 group-hover:text-white group-hover:-translate-x-1 transition-all" />
            <span className="text-sm font-medium text-neutral-400 group-hover:text-white">Home</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center font-black text-[10px]">D</div>
            <span className="font-extrabold text-[12px] tracking-tight">Deep Research</span>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-4 gap-12">
        {/* Sidebar Nav */}
        <aside className="lg:col-span-1 hidden lg:block">
          <div className="sticky top-28 space-y-8">
            {sections.map(s => (
              <div key={s.title}>
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-600 mb-4">{s.title}</h4>
                <ul className="space-y-3">
                  {s.items.map(i => (
                    <li key={i} className="text-sm text-neutral-400 hover:text-white cursor-pointer transition-colors">{i}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </aside>

        {/* Main Content */}
        <main className="lg:col-span-3">
          <div className="flex items-center gap-3 mb-6">
            <Book className="text-violet-500" size={24} />
            <h1 className="text-4xl font-black tracking-tight">Documentation</h1>
          </div>
          <p className="text-lg text-neutral-400 font-light mb-12">Learn how to build, scale, and optimize your research with Deep Research Assistant.</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-16">
            {sections.map(s => (
              <div key={s.title} className="p-8 rounded-3xl bg-[#0d0d1a] border border-white/[0.06] hover:border-violet-500/20 transition-all">
                <s.icon className="text-violet-400 mb-6" size={28} />
                <h3 className="text-xl font-bold mb-3">{s.title}</h3>
                <p className="text-sm text-neutral-500 leading-relaxed mb-6">Step-by-step guides and detailed API reference for our {s.title.toLowerCase()} system.</p>
                <button className="text-[12px] font-bold text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-2">
                  View Docs <ArrowLeft size={14} className="rotate-180" />
                </button>
              </div>
            ))}
          </div>

          <div className="p-10 rounded-[2rem] bg-gradient-to-br from-violet-600/10 to-cyan-600/5 border border-white/[0.08] text-center">
            <h2 className="text-2xl font-bold mb-4">Still need help?</h2>
            <p className="text-neutral-400 text-sm mb-8">Can't find what you're looking for? Our direct support line is open for you.</p>
            <a href="mailto:kanishkar.m06@gmail.com" className="inline-flex px-8 py-3 bg-white text-black font-bold rounded-xl hover:bg-neutral-200 transition-all font-mono">kanishkar.m06@gmail.com</a>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DocsPage;
