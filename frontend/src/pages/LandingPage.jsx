// src/pages/LandingPage.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ArrowRight, Upload, MessageSquare, Search, Sparkles, Brain,
  Shield, CheckCircle2, ChevronRight, Star, Menu, X
} from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [query, setQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  // close mobile menu on resize to desktop
  useEffect(() => {
    const fn = () => { if (window.innerWidth >= 768) setMobileOpen(false); };
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(isAuthenticated ? '/dashboard' : '/signup');
  };

  const features = [
    {
      icon: Upload, title: 'Instant Indexing',
      desc: "Upload any PDF and it gets chunked, embedded, and ready for search in seconds.",
      accent: 'text-violet-400', bg: 'bg-violet-500/10', ring: 'ring-violet-500/20',
    },
    {
      icon: MessageSquare, title: 'AI Chat',
      desc: 'Ask questions in plain English. Every answer includes exact source citations.',
      accent: 'text-cyan-400', bg: 'bg-cyan-500/10', ring: 'ring-cyan-500/20',
    },
    {
      icon: Search, title: 'Multi-Doc Search',
      desc: 'Query across your entire document library simultaneously.',
      accent: 'text-emerald-400', bg: 'bg-emerald-500/10', ring: 'ring-emerald-500/20',
    },
    {
      icon: Sparkles, title: 'Smart Insights',
      desc: 'Auto-surface patterns, themes, and contradictions across all your documents.',
      accent: 'text-amber-400', bg: 'bg-amber-500/10', ring: 'ring-amber-500/20',
    },
    {
      icon: Brain, title: 'Session Memory',
      desc: 'The AI remembers full conversation context for complex multi-turn research.',
      accent: 'text-pink-400', bg: 'bg-pink-500/10', ring: 'ring-pink-500/20',
    },
    {
      icon: Shield, title: 'Private & Secure',
      desc: 'Enterprise-grade encryption. We never train on your data.',
      accent: 'text-blue-400', bg: 'bg-blue-500/10', ring: 'ring-blue-500/20',
    },
  ];

  const steps = [
    { n: '01', icon: Upload, title: 'Upload your PDFs', desc: 'Drag and drop any PDF. Documents are chunked, embedded, and stored in a vector database instantly.' },
    { n: '02', icon: MessageSquare, title: 'Ask in plain English', desc: 'Type any question. No special syntax — just talk to your documents like a colleague.' },
    { n: '03', icon: Sparkles, title: 'Get cited answers', desc: 'Receive precise answers with exact source references — file name, page number, and context.' },
  ];

  return (
    <div className="min-h-screen bg-[#07070f] text-white overflow-x-hidden">

      {/* ── NAV ──────────────────────────────────────────────────────────── */}
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-[#07070f]/95 backdrop-blur-xl border-b border-white/[0.06]' : ''
      }`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center font-black text-sm shadow-lg shadow-violet-500/25">D</div>
            <span className="font-extrabold text-sm tracking-tight hidden sm:block">Deep Research</span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-6">
            {[['Features', '#features'], ['How it works', '#how'], ['Pricing', '#pricing']].map(([l, h]) => (
              <a key={l} href={h} className="text-[13px] text-neutral-500 hover:text-white transition-colors font-medium">{l}</a>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-2">
            <Link to="/login" className="text-[13px] text-neutral-400 hover:text-white px-4 py-2 rounded-lg hover:bg-white/[0.05] transition-all font-medium">Sign in</Link>
            <Link to="/signup" className="text-[13px] font-bold bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-xl transition-all shadow-lg shadow-violet-600/20">Get started free</Link>
          </div>

          {/* Mobile menu button */}
          <button onClick={() => setMobileOpen(p => !p)} className="md:hidden p-2 text-neutral-400 hover:text-white transition-colors rounded-lg hover:bg-white/[0.05]">
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile dropdown */}
        {mobileOpen && (
          <div className="md:hidden bg-[#0c0c1a] border-t border-white/[0.06] px-4 pb-4 pt-3 space-y-1">
            {[['Features', '#features'], ['How it works', '#how'], ['Pricing', '#pricing']].map(([l, h]) => (
              <a key={l} href={h} onClick={() => setMobileOpen(false)}
                className="block text-sm text-neutral-400 hover:text-white py-2.5 px-2 rounded-lg hover:bg-white/[0.04] transition-all">{l}</a>
            ))}
            <div className="flex gap-2 pt-3 border-t border-white/[0.06] mt-2">
              <Link to="/login" onClick={() => setMobileOpen(false)}
                className="flex-1 text-center text-sm border border-white/[0.1] rounded-xl py-2.5 text-neutral-300 font-medium hover:bg-white/[0.04] transition-all">Sign in</Link>
              <Link to="/signup" onClick={() => setMobileOpen(false)}
                className="flex-1 text-center text-sm bg-violet-600 hover:bg-violet-500 rounded-xl py-2.5 text-white font-bold transition-all">Get started</Link>
            </div>
          </div>
        )}
      </nav>

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 sm:px-6 pt-20 sm:pt-24 pb-16">
        {/* bg effects */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[600px] h-[300px] sm:h-[500px] bg-violet-600/[0.1] rounded-full blur-[100px] sm:blur-[140px]" />
          <div className="absolute bottom-0 right-0 w-[200px] sm:w-[400px] h-[200px] sm:h-[400px] bg-cyan-700/[0.05] rounded-full blur-[80px] sm:blur-[100px]" />
          <div className="absolute inset-0 opacity-[0.02]"
            style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)', backgroundSize: '60px 60px' }} />
        </div>

        <div className="relative z-10 w-full max-w-4xl mx-auto">
          {/* Badge */}
          <span className="inline-flex items-center gap-2 bg-violet-500/[0.12] border border-violet-500/[0.25] text-violet-300 text-[10px] sm:text-[11px] font-bold tracking-[0.12em] uppercase px-3 sm:px-4 py-1.5 rounded-full mb-6 sm:mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse flex-shrink-0" />
            Powered by Advanced RAG
          </span>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-[1.04] tracking-[-0.04em] mb-5 sm:mb-6">
            Research smarter.<br />
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
              Ask your documents.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-neutral-400 max-w-lg sm:max-w-xl mx-auto mb-8 sm:mb-10 leading-relaxed font-light px-2">
            Upload any PDF, then have a conversation with its contents.
            Deep Research surfaces precise, cited answers in seconds.
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="w-full max-w-xl sm:max-w-2xl mx-auto mb-4 sm:mb-5 px-0">
            <div className="flex items-center gap-2 bg-[#0e0e1c] border border-white/[0.08] rounded-2xl p-1.5 sm:p-2 focus-within:border-violet-500/50 focus-within:ring-2 focus-within:ring-violet-500/10 transition-all">
              <Search size={15} className="ml-2 sm:ml-3 flex-shrink-0 text-neutral-600" />
              <input
                type="text" value={query} onChange={e => setQuery(e.target.value)}
                placeholder="Ask anything about your documents…"
                className="flex-1 bg-transparent border-none outline-none text-[13px] text-white placeholder:text-neutral-700 px-1.5 sm:px-2 py-1.5 sm:py-2 min-w-0"
              />
              <button type="submit"
                className="flex-shrink-0 flex items-center gap-1.5 bg-violet-600 hover:bg-violet-500 text-white text-[12px] sm:text-[13px] font-bold px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl transition-all active:scale-[0.97] whitespace-nowrap">
                Try free <ArrowRight size={13} />
              </button>
            </div>
          </form>

          {/* Suggestion chips */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mb-8 sm:mb-10 px-2">
            {['Summarize findings', 'Compare docs', 'Extract dates', 'Generate questions'].map(s => (
              <button key={s} onClick={() => setQuery(s)}
                className="text-[10px] sm:text-[11px] text-neutral-600 border border-white/[0.07] hover:border-violet-500/30 hover:text-neutral-300 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full transition-all hover:bg-violet-500/[0.05]">
                {s}
              </button>
            ))}
          </div>

          {/* Trust row */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-5 text-[11px] sm:text-[12px] text-neutral-600">
            {['No credit card required', 'Enterprise-grade security', 'Never trains on your data'].map((t, i) => (
              <span key={i} className="flex items-center gap-1.5">
                <CheckCircle2 size={11} className="text-emerald-500 flex-shrink-0" /> {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ────────────────────────────────────────────────────────── */}
      <div className="border-y border-white/[0.05] bg-[#0a0a14]">
        <div className="max-w-3xl mx-auto grid grid-cols-3 divide-x divide-white/[0.05]">
          {[['50K+', 'Documents analyzed'], ['98%', 'Answer accuracy'], ['< 2s', 'Response time']].map(([num, label], i) => (
            <div key={i} className="flex flex-col items-center py-6 sm:py-10 px-2 sm:px-4 gap-1">
              <span className="text-xl sm:text-3xl md:text-4xl font-black tracking-tight text-white">{num}</span>
              <span className="text-[10px] sm:text-xs text-neutral-600 font-medium text-center leading-tight">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section id="how" className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <div className="text-center mb-10 sm:mb-16">
          <p className="text-violet-400 text-[10px] sm:text-[11px] font-extrabold tracking-[0.2em] uppercase mb-3">How it works</p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
            From upload to insight<br className="hidden sm:block" /> in three steps.
          </h2>
          <p className="mt-4 text-neutral-500 max-w-md mx-auto text-sm leading-relaxed px-4">
            No setup, no prompting expertise. Just upload, ask, and understand.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
          {steps.map(({ n, icon: Icon, title, desc }, i) => (
            <div key={i} className="relative group bg-[#0d0d1a] border border-white/[0.07] rounded-2xl p-5 sm:p-7 hover:border-violet-500/25 transition-all hover:bg-[#10101e]">
              <div className="flex items-start justify-between mb-4 sm:mb-5">
                <span className="text-3xl sm:text-[2.5rem] font-black text-violet-600/25 font-mono leading-none">{n}</span>
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-violet-500/10 ring-1 ring-violet-500/20 flex items-center justify-center flex-shrink-0">
                  <Icon size={16} className="text-violet-400" />
                </div>
              </div>
              <h3 className="font-bold text-[14px] sm:text-[15px] mb-2 text-white">{title}</h3>
              <p className="text-[12px] sm:text-[13px] text-neutral-500 leading-relaxed">{desc}</p>
              {i < 2 && <ChevronRight size={14} className="absolute -right-2.5 top-1/2 -translate-y-1/2 text-neutral-700 hidden sm:block" />}
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────────────── */}
      <section id="features" className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <p className="text-cyan-400 text-[10px] sm:text-[11px] font-extrabold tracking-[0.2em] uppercase mb-3">Features</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight">Everything you need.</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {features.map(({ icon: Icon, title, desc, accent, bg, ring }, i) => (
              <div key={i} className="bg-[#0d0d1a] border border-white/[0.06] rounded-2xl p-5 sm:p-6 hover:border-white/[0.12] hover:-translate-y-0.5 transition-all">
                <div className={`w-10 h-10 rounded-xl ${bg} ring-1 ${ring} flex items-center justify-center mb-4`}>
                  <Icon size={18} className={accent} />
                </div>
                <h3 className="font-bold text-[14px] text-white mb-2">{title}</h3>
                <p className="text-[12px] sm:text-[13px] text-neutral-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section id="pricing" className="px-4 sm:px-6 py-16 sm:py-24">
        <div className="max-w-2xl mx-auto">
          <div className="relative bg-gradient-to-b from-violet-900/30 to-violet-950/20 border border-violet-500/20 rounded-3xl p-8 sm:p-12 text-center overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] sm:w-[500px] h-[150px] sm:h-[200px] bg-violet-500/10 blur-[60px] sm:blur-[80px]" />
            </div>
            <div className="relative z-10">
              <span className="inline-flex items-center gap-1.5 bg-amber-400/10 border border-amber-400/20 text-amber-400 text-[10px] sm:text-[11px] font-bold tracking-[0.12em] uppercase px-3 py-1.5 rounded-full mb-5 sm:mb-6">
                <Star size={10} className="fill-amber-400" /> Free to start
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight mb-3 sm:mb-4">
                Start researching<br />smarter today.
              </h2>
              <p className="text-neutral-400 text-sm mb-6 sm:mb-8 max-w-sm mx-auto leading-relaxed">
                Join thousands of researchers, students, and teams extracting knowledge faster than ever.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link to="/signup"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-bold px-6 sm:px-7 py-3 rounded-xl transition-all text-sm shadow-xl shadow-violet-600/25">
                  Create free account <ArrowRight size={15} />
                </Link>
                <Link to="/login"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.1] text-white font-semibold px-6 sm:px-7 py-3 rounded-xl transition-all text-sm">
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/[0.06] px-4 sm:px-6 py-6 sm:py-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center font-black text-xs">D</div>
            <span className="text-sm font-bold text-neutral-500">Deep Research</span>
          </Link>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-5 text-[12px] text-neutral-700">
            {['Privacy Policy', 'Terms of Service', 'Contact', 'Docs'].map(l => (
              <a key={l} href="#" className="hover:text-neutral-500 transition-colors">{l}</a>
            ))}
          </div>
          <p className="text-[11px] text-neutral-800">2026 Deep Research AI</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;