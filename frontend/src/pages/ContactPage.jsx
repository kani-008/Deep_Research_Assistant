// src/pages/ContactPage.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, MessageSquare, Send, CheckCircle2, Globe, Clock, MessageCircle } from 'lucide-react';
import { sendContactForm } from '../api/api';
import toast from 'react-hot-toast';

const ContactPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: 'Support Request', message: '' });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await sendContactForm(formData);
      setSubmitted(true);
      toast.success('Message sent! Our team will get back to you shortly.');
    } catch (err) {
      toast.error(err.message || 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const info = [
    { icon: Mail, label: 'Email', value: 'kanishkar.m06@gmail.com', desc: 'Direct Support Desk' },
    { icon: Clock, label: 'Availability', value: '24/7 Monitoring', desc: 'Mon - Fri Priority Desk' },
    { icon: Globe, label: 'Headquarters', value: 'San Francisco, CA', desc: 'Deep Research Team' }
  ];

  return (
    <div className="min-h-screen bg-[#07070f] text-white selection:bg-violet-500/30">
      <nav className="border-b border-white/[0.06] bg-[#07070f]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <ArrowLeft size={16} className="text-neutral-500 group-hover:text-white group-hover:-translate-x-1 transition-all" />
            <span className="text-sm font-medium text-neutral-400 group-hover:text-white font-bold">Home</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center font-black text-[10px]">D</div>
            <span className="font-extrabold text-[12px] tracking-tight">Deep Research</span>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-16 sm:py-24 grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-20">
        
        {/* Left Column - Contact Info */}
        <div className="lg:col-span-2 space-y-12">
          <div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-6">Contact Support</h1>
            <p className="text-neutral-400 text-base sm:text-lg font-light leading-relaxed">
              Have questions about our RAG engine or need help with your account? Our engineers and support specialists are here for you.
            </p>
          </div>

          <div className="space-y-6">
            {info.map((item, i) => (
              <div key={i} className="flex items-start gap-4 p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-violet-500/20 transition-all">
                <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
                  <item.icon className="text-violet-400" size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.15em] text-neutral-600 mb-1">{item.label}</p>
                  <p className="text-sm font-bold text-neutral-200 mb-0.5">{item.value}</p>
                  <p className="text-[11px] text-neutral-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-br from-violet-600/10 to-transparent border border-violet-500/20">
            <div className="flex items-center gap-2 mb-3">
              <MessageCircle size={14} className="text-violet-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-violet-400">Live Chat</span>
            </div>
            <p className="text-[13px] text-neutral-400 leading-relaxed mb-4">
              Real-time support is available for <span className="text-violet-300 font-bold">Pro</span> and <span className="text-cyan-300 font-bold">Enterprise</span> users within the dashboard.
            </p>
          </div>
        </div>

        {/* Right Column - Form */}
        <div className="lg:col-span-3">
          {submitted ? (
            <div className="bg-[#0d0d1a] border border-white/[0.08] rounded-[2.5rem] p-10 sm:p-20 text-center animate-in fade-in zoom-in duration-500">
              <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-8">
                <CheckCircle2 size={40} className="text-emerald-500" />
              </div>
              <h2 className="text-3xl font-black mb-4">Message Received!</h2>
              <p className="text-neutral-500 mb-10 max-w-sm mx-auto leading-relaxed">
                Thank you for reaching out. We've received your request and a member of our team will respond to 
                <span className="text-white font-semibold"> {formData.email} </span> within a few hours.
              </p>
              <button 
                onClick={() => setSubmitted(false)}
                className="inline-flex px-8 py-3 bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-white font-bold rounded-xl transition-all"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <div className="bg-[#0a0a16] border border-white/[0.06] rounded-[2.5rem] p-8 sm:p-12 shadow-2xl shadow-black/40">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-600 ml-1">Full Name</label>
                    <input 
                      required name="name" value={formData.name} onChange={handleChange}
                      placeholder="Jane Cooper"
                      className="w-full bg-white/[0.03] border border-white/[0.08] rounded-2xl px-5 py-4 text-sm text-white placeholder:text-neutral-700 outline-none focus:border-violet-500/50 focus:ring-4 focus:ring-violet-500/5 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-600 ml-1">Work Email</label>
                    <input 
                      required type="email" name="email" value={formData.email} onChange={handleChange}
                      placeholder="jane@company.com"
                      className="w-full bg-white/[0.03] border border-white/[0.08] rounded-2xl px-5 py-4 text-sm text-white placeholder:text-neutral-700 outline-none focus:border-violet-500/50 focus:ring-4 focus:ring-violet-500/5 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-600 ml-1">Subject</label>
                  <select 
                    name="subject" value={formData.subject} onChange={handleChange}
                    className="w-full bg-white/[0.03] border border-white/[0.08] rounded-2xl px-5 py-4 text-sm text-white outline-none focus:border-violet-500/50 transition-all appearance-none"
                  >
                    <option className="bg-[#07070f]">Support Request</option>
                    <option className="bg-[#07070f]">Feedback & Suggestions</option>
                    <option className="bg-[#07070f]">Billing Inquiry</option>
                    <option className="bg-[#07070f]">API & Enterprise</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-600 ml-1">Message</label>
                  <textarea 
                    required name="message" value={formData.message} onChange={handleChange}
                    rows={5} placeholder="Describe your issue or question in detail…"
                    className="w-full bg-white/[0.03] border border-white/[0.08] rounded-2xl px-5 py-4 text-sm text-white placeholder:text-neutral-700 outline-none focus:border-violet-500/50 focus:ring-4 focus:ring-violet-500/5 transition-all resize-none"
                  />
                </div>

                <button 
                  type="submit" disabled={loading}
                  className="w-full flex items-center justify-center gap-3 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-violet-600/20 active:scale-[0.98]"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>Send Message <Send size={16} /></>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
