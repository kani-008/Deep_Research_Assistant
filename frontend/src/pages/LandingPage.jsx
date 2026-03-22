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
    navigate('/chat', { state: { initialPrompt: query } });
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
              <a key={l} href={h} className="text-sm text-neutral-500 hover:text-white transition-colors font-medium">{l}</a>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-2">
            <Link to="/chat" className="text-sm font-bold bg-violet-600 hover:bg-violet-500 text-white px-5 py-2 rounded-xl transition-all shadow-lg shadow-violet-600/20">
              {isAuthenticated ? 'Open Research' : 'Try Free'}
            </Link>
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
              <Link to="/chat" onClick={() => setMobileOpen(false)}
                className="flex-1 text-center text-sm bg-violet-600 hover:bg-violet-500 rounded-xl py-2.5 text-white font-bold transition-all">
                {isAuthenticated ? 'Open Research' : 'Try Free'}
              </Link>
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
          <span className="inline-flex items-center gap-2 bg-violet-500/[0.12] border border-violet-500/[0.25] text-violet-300 text-[0.65rem] sm:text-[0.7rem] font-bold tracking-[0.12em] uppercase px-3 sm:px-4 py-1.5 rounded-full mb-6 sm:mb-8">
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
                className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder:text-neutral-700 px-1.5 sm:px-2 py-1.5 sm:py-2 min-w-0"
              />
              <button type="submit"
                className="flex-shrink-0 flex items-center gap-1.5 bg-violet-600 hover:bg-violet-500 text-white text-xs sm:text-sm font-bold px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl transition-all active:scale-[0.97] whitespace-nowrap">
                Try free <ArrowRight size={13} />
              </button>
            </div>
          </form>

          {/* Suggestion chips */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mb-8 sm:mb-10 px-2">
            {['Summarize findings', 'Compare docs', 'Extract dates', 'Generate questions'].map(s => (
              <button key={s} onClick={() => setQuery(s)}
                className="text-[0.65rem] sm:text-[0.7rem] text-neutral-600 border border-white/[0.07] hover:border-violet-500/30 hover:text-neutral-300 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full transition-all hover:bg-violet-500/[0.05]">
                {s}
              </button>
            ))}
          </div>

          {/* Trust row */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-5 text-[0.7rem] sm:text-xs text-neutral-600">
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
              <span className="text-[0.65rem] sm:text-xs text-neutral-600 font-medium text-center leading-tight">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section id="how" className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <div className="text-center mb-10 sm:mb-16">
          <p className="text-violet-400 text-[0.65rem] sm:text-[0.7rem] font-extrabold tracking-[0.2em] uppercase mb-3">How it works</p>
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
              <h3 className="font-bold text-sm sm:text-base mb-2 text-white">{title}</h3>
              <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed">{desc}</p>
              {i < 2 && <ChevronRight size={14} className="absolute -right-2.5 top-1/2 -translate-y-1/2 text-neutral-700 hidden sm:block" />}
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────────────── */}
      <section id="features" className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <p className="text-cyan-400 text-[0.65rem] sm:text-[0.7rem] font-extrabold tracking-[0.2em] uppercase mb-3">Features</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight">Everything you need.</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {features.map(({ icon: Icon, title, desc, accent, bg, ring }, i) => (
              <div key={i} className="bg-[#0d0d1a] border border-white/[0.06] rounded-2xl p-5 sm:p-6 hover:border-white/[0.12] hover:-translate-y-0.5 transition-all">
                <div className={`w-10 h-10 rounded-xl ${bg} ring-1 ${ring} flex items-center justify-center mb-4`}>
                  <Icon size={18} className={accent} />
                </div>
                <h3 className="font-bold text-sm text-white mb-2">{title}</h3>
                <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ──────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-20 sm:py-32 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-violet-600/[0.02] blur-[120px] pointer-events-none" />
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-16 sm:mb-20">
            <p className="text-violet-400 text-[0.7rem] font-extrabold tracking-[0.2em] uppercase mb-4">Pricing Plans</p>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight mb-6">Simple, transparent pricing.</h2>
            <p className="text-neutral-500 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
              Start for free and scale as your research library grows. No hidden fees.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                name: 'Free Researcher',
                price: '0',
                desc: 'Perfect for students and occasional research.',
                features: ['Up to 10 Documents', '50 AI Messages / month', 'Standard Citations', 'Community Support'],
                cta: 'Get Started',
                highlight: false
              },
              {
                name: 'Pro Analyst',
                price: '19',
                desc: 'For professionals handling large document sets.',
                features: ['Unlimited Documents', '5,000 AI Messages', 'Cross-Doc Synthesis', 'Priority Processing', 'API Access (Beta)'],
                cta: 'Go Pro Now',
                highlight: true
              },
              {
                name: 'Enterprise',
                price: 'Custom',
                desc: 'Security and scale for teams and organizations.',
                features: ['Custom Data Retention', 'SSO & Advanced Security', 'Dedicated Support Account', 'Bulk Document Ingestion'],
                cta: 'Contact Sales',
                highlight: false
              }
            ].map((plan, i) => (
              <div key={i} className={`relative flex flex-col p-8 sm:p-10 rounded-3xl border transition-all duration-500 hover:-translate-y-2 ${
                plan.highlight 
                  ? 'bg-violet-600/[0.08] border-violet-500/40 shadow-2xl shadow-violet-600/10' 
                  : 'bg-[#0d0d1a] border-white/[0.08] hover:border-white/[0.15]'
              }`}>
                {plan.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white text-[10px] font-black tracking-widest uppercase px-4 py-1.5 rounded-full shadow-xl">
                    Most Popular
                  </div>
                )}
                <div className="mb-8">
                  <h3 className="text-lg font-bold text-white mb-2">{plan.name}</h3>
                  <p className="text-xs text-neutral-500 leading-relaxed mb-6">{plan.desc}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl sm:text-5xl font-black text-white">{plan.price === 'Custom' ? '' : '$'}{plan.price}</span>
                    <span className="text-neutral-600 text-sm font-medium">{plan.price === 'Custom' ? '' : '/mo'}</span>
                  </div>
                </div>

                <div className="flex-1 space-y-4 mb-10">
                  {plan.features.map((f, j) => (
                    <div key={j} className="flex items-start gap-3 text-[13px] text-neutral-400">
                      <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={() => navigate('/chat')}
                  className={`w-full py-4 rounded-2xl text-[13px] font-black transition-all active:scale-[0.98] ${
                    plan.highlight 
                      ? 'bg-violet-600 hover:bg-violet-500 text-white shadow-xl shadow-violet-600/20' 
                      : 'bg-white/[0.05] hover:bg-white/[0.08] text-white border border-white/[0.1]'
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-32 bg-[#090912]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <p className="text-cyan-400 text-[0.7rem] font-extrabold tracking-[0.2em] uppercase mb-4">FAQ</p>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">Common Questions</h2>
          </div>

          <div className="space-y-4">
            {[
              { q: "How secure are my uploaded documents?", a: "We use enterprise-grade AES-256 encryption. Your documents are stored in isolated buckets, and we never use your data to train public AI models." },
              { q: "What file types are supported?", a: "Currently we support PDF files optimally. Support for DOCX, TXT, and Markdown is coming in our next major update." },
              { q: "Can I search across multiple documents at once?", a: "Yes! Deep Research uses a vector database that allows your queries to target your entire library or specific document collections." },
              { q: "How accurate are the citations?", a: "Extremely. Our RAG engine is forced to quote exact document snippets and provides page/context verification for every answer." }
            ].map((item, i) => (
              <details key={i} className="group bg-[#0d0d1a] border border-white/[0.06] rounded-2xl overflow-hidden [&_summary::-webkit-details-marker]:hidden transition-all hover:bg-[#11111e]">
                <summary className="flex items-center justify-between p-5 sm:p-6 cursor-pointer select-none">
                  <h3 className="text-sm sm:text-base font-bold text-neutral-200 group-hover:text-white transition-colors">{item.q}</h3>
                  <div className="w-8 h-8 rounded-lg bg-white/[0.03] flex items-center justify-center transition-transform duration-300 group-open:rotate-180">
                    <ChevronRight size={16} className="text-neutral-600" />
                  </div>
                </summary>
                <div className="px-5 sm:px-6 pb-6 text-neutral-500 text-sm leading-relaxed border-t border-white/[0.03] pt-4">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────────────────── */}
      <section className="px-4 sm:px-6 py-20 sm:py-32 bg-gradient-to-b from-transparent to-[#0a0a14]">
        <div className="max-w-4xl mx-auto">
          <div className="relative bg-gradient-to-br from-violet-600/20 to-cyan-600/10 border border-white/[0.08] rounded-[2.5rem] p-8 sm:p-20 text-center overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-150 mix-blend-overlay pointer-events-none" />
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.1] mb-8">
                Ready to transform<br />your research?
              </h2>
              <p className="text-neutral-400 text-sm sm:text-base mb-10 max-w-lg mx-auto leading-relaxed">
                Join thousands of power users who are already getting smarter with Deep Research. Free plan available, no strings attached.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/chat" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white text-black font-black px-10 py-4 rounded-2xl transition-all hover:bg-neutral-200 shadow-2xl shadow-white/10 active:scale-[0.98]">
                  {isAuthenticated ? 'Continue Research' : 'Try AI Chat Now'} <ArrowRight size={18} />
                </Link>
                {!isAuthenticated && (
                  <Link to="/signup" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-white font-bold px-10 py-4 rounded-2xl transition-all active:scale-[0.98]">
                    Create Free Account
                  </Link>
                )}
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
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-neutral-600 font-medium">
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
            <Link to="/docs" className="hover:text-white transition-colors">Docs</Link>
          </div>
          <p className="text-[0.65rem] text-neutral-800 font-mono">© 2026 Deep Research AI</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
