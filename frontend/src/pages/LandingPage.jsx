// ./frontend/src/pages/LandingPage.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  Upload, 
  MessageSquare, 
  Search, 
  Sparkles, 
  Brain,
  Shield,
  Zap,
  Globe,
  Database
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const FeatureCard = ({ icon: Icon, title, description, color }) => (
  <motion.div 
    whileHover={{ y: -5, scale: 1.02 }}
    className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/[0.08] transition-all"
  >
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${color}`}>
      <Icon size={24} className="text-white" />
    </div>
    <h3 className="text-xl font-bold mb-2 text-white">{title}</h3>
    <p className="text-neutral-400 text-sm leading-relaxed">{description}</p>
  </motion.div>
);

const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [demoInput, setDemoInput] = useState('');

  const handleStartResearch = () => {
    navigate(isAuthenticated ? '/dashboard' : '/login');
  };

  const handleDemoSubmit = (e) => {
    e.preventDefault();
    if (demoInput.trim()) {
      navigate(`/chat/new?q=${encodeURIComponent(demoInput)}`);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-background text-white selection:bg-primary selection:text-white">
      {/* Background blobs */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 opacity-20 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Nav */}
      <nav className="fixed top-0 left-0 w-full h-20 flex items-center justify-between px-6 md:px-12 z-50 bg-background/50 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center font-bold text-xl text-white shadow-lg shadow-primary/30">D</div>
          <span className="font-bold text-2xl tracking-tight hidden sm:block">Deep Research</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="#features" className="text-neutral-400 hover:text-white transition-colors text-sm font-medium">Features</a>
          <a href="#pricing" className="text-neutral-400 hover:text-white transition-colors text-sm font-medium">Pricing</a>
          <button 
            onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login')}
            className="flex items-center gap-2 py-2 px-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all text-sm font-semibold"
          >
            {isAuthenticated ? 'Dashboard' : 'Sign In'}
          </button>
          <button 
            onClick={handleStartResearch}
            className="hidden md:flex items-center gap-2 py-2 px-6 bg-primary hover:bg-primary-dark rounded-full transition-all text-sm font-bold shadow-lg shadow-primary/20"
          >
            Start Research
          </button>
        </div>
      </nav>

      <main className="pt-32 pb-20">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-8">
              <Sparkles size={14} className="text-primary" />
              <span className="text-xs font-bold uppercase tracking-widest text-neutral-300">Powered by Next-Gen RAG</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-[1.1]">
              Deep Research <span className="gradient-text">Assistant (RAG)</span>
            </h1>
            <p className="text-lg md:text-xl text-neutral-400 max-w-3xl mx-auto mb-12 leading-relaxed">
              Ask questions, analyze massive document sets, and generate deep insights using advanced AI Retrieval-Augmented Generation.
            </p>
          </motion.div>

          {/* ChatGPT-like input demo */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="max-w-3xl mx-auto relative group"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-[2rem] blur opacity-25 group-focus-within:opacity-50 transition-opacity"></div>
            <form 
              onSubmit={handleDemoSubmit}
              className="relative p-2 bg-surface border border-white/10 rounded-[1.8rem] flex items-center gap-2 shadow-2xl"
            >
              <div className="p-3 bg-white/5 rounded-2xl group-focus-within:text-primary transition-colors">
                <Brain size={24} />
              </div>
              <input 
                type="text" 
                value={demoInput}
                onChange={(e) => setDemoInput(e.target.value)}
                placeholder="Ask anything about your research documents..."
                className="flex-1 bg-transparent border-none outline-none text-lg px-2"
              />
              <button 
                type="submit"
                className="p-3 bg-primary hover:bg-primary-dark rounded-2xl transition-all shadow-lg shadow-primary/20 text-white"
              >
                <ArrowRight size={24} />
              </button>
            </form>
            <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs text-neutral-500 font-medium">
              <span>Try:</span>
              <button 
                onClick={() => setDemoInput('Summarize the latest research on LLMs')}
                className="px-3 py-1 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-colors"
              >
                Summarize latest LLM research
              </button>
              <button 
                onClick={() => setDemoInput('Compare the technical specs of iPhone 15 vs 16')}
                className="px-3 py-1 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-colors"
              >
                Compare technical specs
              </button>
            </div>
          </motion.div>
        </div>

        {/* Features Section */}
        <section id="features" className="max-w-6xl mx-auto px-6 mt-40">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Unleash the Power of Your Data</h2>
            <p className="text-neutral-400 max-w-2xl mx-auto">Our advanced RAG engine processes massive amounts of information to give you precise, cited answers in seconds.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard 
              icon={Upload}
              title="Upload Documents"
              description="Drop PDF, DOCX, or TXT files. We'll index them automatically for instant retrieval."
              color="bg-blue-500/20"
            />
            <FeatureCard 
              icon={MessageSquare}
              title="AI Chat"
              description="Have context-aware conversations with your documents. Ask questions and get cited answers."
              color="bg-primary/20"
            />
            <FeatureCard 
              icon={Search}
              title="Multi-Document Search"
              description="Search across hundreds of documents simultaneously. Find exactly what you need in seconds."
              color="bg-accent/20"
            />
            <FeatureCard 
              icon={Sparkles}
              title="Smart Insights"
              description="Automatically detect themes, patterns, and insights across your entire document library."
              color="bg-yellow-500/20"
            />
            <FeatureCard 
              icon={Brain}
              title="Memory Chat"
              description="Our AI remembers the context of your research session, enabling complex follow-up questions."
              color="bg-purple-500/20"
            />
            <FeatureCard 
              icon={Shield}
              title="Secure & Private"
              description="Your data is encrypted and secure. We respect your privacy and never train on your data."
              color="bg-emerald-500/20"
            />
          </div>
        </section>

        {/* CTA Section */}
        <section className="mt-40 px-6 max-w-6xl mx-auto">
          <div className="bg-gradient-to-r from-primary/20 to-accent/20 border border-white/10 rounded-[2.5rem] p-12 text-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/20 transition-all duration-700"></div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 relative z-10">Ready to transform your research?</h2>
            <p className="text-neutral-400 text-lg mb-10 relative z-10 max-w-2xl mx-auto">Join thousands of researchers and students using AI to work smarter, not harder.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
              <button 
                onClick={handleStartResearch}
                className="w-full sm:w-auto px-10 py-4 bg-primary hover:bg-primary-dark rounded-2xl transition-all font-bold text-lg shadow-xl shadow-primary/20 flex items-center justify-center gap-2 group/btn"
              >
                Get Started for Free
                <ArrowRight size={20} className="group-hover/btn:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={() => navigate('/chat')}
                className="w-full sm:w-auto px-10 py-4 bg-white/5 border border-white/10 hover:bg-white/10 rounded-2xl transition-all font-bold text-lg flex items-center justify-center gap-2 group/demo"
              >
                Try Demo
                <ArrowRight size={20} className="group-hover/demo:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center font-bold text-white">D</div>
            <span className="font-bold text-xl tracking-tight">Deep Research</span>
          </div>
          <div className="flex items-center gap-8 text-neutral-500 text-sm">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Contact Us</a>
          </div>
          <p className="text-neutral-600 text-xs">© 2026 Deep Research Assistant AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
