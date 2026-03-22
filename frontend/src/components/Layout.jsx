// src/components/Layout.jsx
import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Plus, MessageSquare, LayoutDashboard, Wrench, BarChart3,
  Settings, LogOut, X, Search, Trash2, RefreshCw,
  Menu, ChevronRight, Sparkles, User, Bell, Keyboard,
  HelpCircle, ExternalLink, Moon, Shield, BookOpen,
  ChevronUp, FileText, Zap, Volume2, Globe, Lock
} from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';

// ── Settings Panel ─────────────────────────────────────────────────────────────
const SettingsPanel = ({ onClose, user, logout, navigate, documents }) => {
  const [view, setView] = useState('main'); // 'main' | 'profile'
  const [notifications, setNotifications] = useState(true);
  const [compactMode, setCompactMode] = useState(false);
  const [language, setLanguage] = useState('English (US)');

  const handleLogout = () => {
    onClose();
    logout();
    navigate('/login');
  };

  const Toggle = ({ value, onChange }) => (
    <button
      onClick={(e) => { e.stopPropagation(); onChange(!value); }}
      className={`relative w-8 h-4.5 rounded-full transition-all flex-shrink-0 ${
        value ? 'bg-violet-600' : 'bg-white/[0.1]'
      }`}
      style={{ width: '32px', height: '18px' }}
    >
      <span className={`absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white shadow transition-all duration-200 ${
        value ? 'left-[14px]' : 'left-0.5'
      }`} />
    </button>
  );

  const docCount = documents?.length || 0;
  const docLimit = 10;
  const usagePercent = Math.min((docCount / docLimit) * 100, 100);

  const sections = [
    {
      label: 'Account & Plan',
      items: [
        {
          icon: User,
          label: 'Profile Settings',
          sub: user?.email || 'Manage your account',
          action: () => setView('profile'),
          right: <ChevronRight size={12} className="text-neutral-700 group-hover:text-violet-400" />,
        },
        {
          icon: Zap,
          label: 'Current Plan',
          sub: 'Free Researcher',
          action: () => {},
          right: (
            <span className="text-[0.65rem] font-black bg-gradient-to-r from-violet-500/20 to-purple-500/20 text-violet-400 border border-violet-500/30 px-2 py-0.5 rounded-full">
              FREE
            </span>
          ),
        },
      ],
    },
    {
      label: 'Usage (RAG Storage)',
      custom: (
        <div className="px-4 py-2 space-y-2">
          <div className="flex items-center justify-between text-[0.7rem] font-bold">
            <span className="text-neutral-500 uppercase tracking-widest">Documents</span>
            <span className="text-white">{docCount} <span className="text-neutral-600">/ {docLimit}</span></span>
          </div>
          <div className="h-1.5 w-full bg-white/[0.05] rounded-full overflow-hidden border border-white/[0.05]">
            <div 
              className={`h-full transition-all duration-700 ease-out rounded-full ${
                usagePercent > 80 ? 'bg-amber-500' : 'bg-gradient-to-r from-violet-600 to-purple-600'
              }`}
              style={{ width: `${usagePercent}%` }}
            />
          </div>
        </div>
      )
    },
    {
      label: 'General Preferences',
      items: [
        {
          icon: Globe,
          label: 'Language',
          sub: language,
          action: () => {
            const langs = ['English (US)', 'Spanish', 'French', 'German'];
            const idx = langs.indexOf(language);
            setLanguage(langs[(idx + 1) % langs.length]);
          },
          right: <RefreshCw size={11} className="text-neutral-700" />,
        },
        {
          icon: Bell,
          label: 'Notifications',
          sub: 'Processing alerts',
          action: () => setNotifications(p => !p),
          right: <Toggle value={notifications} onChange={setNotifications} />,
        },
        {
          icon: Moon,
          label: 'Appearance',
          sub: compactMode ? 'Compact' : 'Standard',
          action: () => setCompactMode(p => !p),
          right: <Toggle value={compactMode} onChange={setCompactMode} />,
        },
      ],
    },
  ];

  const ProfileView = () => (
    <div className="flex flex-col animate-in slide-in-from-right-4 duration-300">
      <div className="p-5 border-b border-white/[0.06] bg-white/[0.01]">
        <div className="flex items-center gap-4">
          <div className="relative group">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 p-[1px] shadow-xl shadow-violet-500/20">
              <div className="w-full h-full rounded-2xl bg-[#0f0f1e] flex items-center justify-center overflow-hidden">
                <span className="text-2xl font-black text-violet-400 uppercase tracking-tighter">
                  {user?.name?.substring(0, 2) || user?.email?.substring(0, 2) || 'AD'}
                </span>
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg bg-emerald-500 border-2 border-[#0f0f1e] flex items-center justify-center shadow-lg">
                <Shield size={10} className="text-white" />
            </div>
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-black text-white tracking-tight truncate">{user?.name || 'Deep Researcher'}</h3>
            <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-[0.15em] mt-1">Verified Account</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4 max-h-80 overflow-y-auto custom-scrollbar">
        <div className="space-y-1">
            <label className="text-[10px] font-black text-neutral-700 uppercase tracking-widest px-1">Email Address</label>
            <div className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2.5 text-xs text-neutral-300 font-medium">
                {user?.email || 'not-available@email.com'}
            </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
                <label className="text-[10px] font-black text-neutral-700 uppercase tracking-widest px-1">Account ID</label>
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2.5 text-[10px] text-neutral-500 font-mono truncate">
                    {user?._id?.substring(0, 12) || 'RID-08221'}
                </div>
            </div>
            <div className="space-y-1">
                <label className="text-[10px] font-black text-neutral-700 uppercase tracking-widest px-1">Security</label>
                <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl px-3 py-2.5 text-[10px] text-emerald-400 font-black uppercase flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Protected
                </div>
            </div>
        </div>

        <div className="pt-2">
            <button className="w-full py-3 px-4 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] rounded-xl text-[11px] font-black text-white uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                <Lock size={12} className="text-neutral-500" />
                Change Password
            </button>
        </div>
      </div>

      <div className="mt-auto p-4 border-t border-white/[0.06] bg-white/[0.01]">
        <button onClick={() => setView('main')} className="w-full py-3 text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] hover:text-white transition-colors">
            Return to Dashboard
        </button>
      </div>
    </div>
  );

  return (
    <div className="absolute bottom-full left-0 right-0 mb-3 z-[60] mx-2 animate-in rotate-in fade-in slide-in-from-bottom-2 duration-200">
      {/* Panel */}
      <div className="bg-[#0f0f1e] border border-white/[0.1] rounded-2xl shadow-2xl shadow-black/80 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/[0.06] bg-white/[0.02]">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-lg bg-violet-600/20 flex items-center justify-center border border-violet-500/20">
              <Settings size={12} className="text-violet-400" />
            </div>
            <span className="text-xs font-bold text-neutral-200 tracking-wide">Settings</span>
          </div>
          <button onClick={onClose}
            className="p-1.5 hover:bg-white/[0.07] rounded-lg text-neutral-600 hover:text-neutral-300 transition-colors">
            <X size={14} />
          </button>
        </div>

        {/* Main Content Area */}
        <div className="overflow-y-auto max-h-[60vh] sm:max-h-[450px] custom-scrollbar">
          {view === 'main' ? (
            <div className="py-3 space-y-1">
              {sections.map(({ label, items, custom }, idx) => (
                <div key={idx} className="mb-2">
                  <p className="text-[0.6rem] font-black text-neutral-700 uppercase tracking-[0.2em] px-4 pt-2 pb-1.5">{label}</p>
                  {custom}
                  {items?.map(({ icon: Icon, label: itemLabel, sub, action, right }) => (
                    <button key={itemLabel} onClick={action}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.04] transition-colors text-left group">
                      <div className="w-8 h-8 rounded-xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center flex-shrink-0 group-hover:border-white/[0.15] group-hover:bg-violet-600/10 transition-all">
                        <Icon size={14} className="text-neutral-500 group-hover:text-violet-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-neutral-200 truncate group-hover:text-white transition-colors">{itemLabel}</p>
                        <p className="text-[0.65rem] text-neutral-600 truncate group-hover:text-neutral-500 transition-colors font-medium mt-0.5">{sub}</p>
                      </div>
                      <div className="flex-shrink-0">{right}</div>
                    </button>
                  ))}
                </div>
              ))}
              
              {/* Sign out embedded in scroll area for mobile ease */}
              <div className="px-4 py-2 border-t border-white/[0.04] mt-2">
                <button onClick={handleLogout}
                  className="w-full flex items-center gap-3 py-2 px-1 text-red-500/70 hover:text-red-400 transition-colors group">
                   <LogOut size={14} className="group-hover:-translate-x-1 transition-transform" />
                   <span className="text-xs font-bold uppercase tracking-widest">Sign out account</span>
                </button>
              </div>
            </div>
          ) : (
            <ProfileView />
          )}
        </div>
      </div>

      {/* Popover Arrow */}
      <div className="absolute -bottom-1.5 left-8 w-3 h-3 bg-[#0f0f1e] border-r border-b border-white/[0.1] rotate-45 z-[-1]" />
    </div>
  );
};

import { motion, AnimatePresence } from 'framer-motion';

// ── Sidebar ────────────────────────────────────────────────────────────────────
const Sidebar = ({ isOpen, onClose }) => {
  const { 
    sessions, 
    currentSessionId, 
    setCurrentSessionId, 
    createNewChat, 
    deleteSession, 
    loadSessions, 
    refreshSessions,
    documents,
    loadDocuments
  } = useChat();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const settingsRef = useRef(null);

  useEffect(() => {
    (async () => { 
      setLoading(true); 
      await Promise.all([loadSessions(), loadDocuments()]);
      setLoading(false); 
    })();
  }, [loadSessions, loadDocuments]);

  // Close settings panel when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target)) {
        setSettingsOpen(false);
      }
    };
    if (settingsOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [settingsOpen]);

  const go = (path) => {
    navigate(path);
    if (window.innerWidth < 1024) onClose();
  };

  const handleNewChat = () => {
    const id = createNewChat();
    go(`/chat/${id}`);
  };

  const handleRefresh = async () => {
    refreshSessions();
    setLoading(true);
    await Promise.all([loadSessions(), loadDocuments()]);
    setLoading(false);
  };

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/tools', icon: Wrench, label: 'Tools' },
    { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  ];

  const sidebarVariants = {
    open: { 
      x: 0, 
      transition: { type: 'spring', stiffness: 300, damping: 30 } 
    },
    closed: { 
      x: '-100%', 
      transition: { type: 'spring', stiffness: 300, damping: 30 } 
    }
  };

  return (
    <>
      {/* Mobile backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden" 
            onClick={onClose} 
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={isOpen ? 'open' : 'closed'}
        variants={sidebarVariants}
        className={`
          fixed inset-y-0 left-0 z-50 lg:relative
          flex flex-col w-72 lg:w-64 h-screen flex-shrink-0
          bg-[#0a0a16] border-r border-white/[0.05]
          shadow-2xl lg:shadow-none
        `}
      >
        {/* Logo row */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-white/[0.04] flex-shrink-0">
          <button onClick={() => navigate('/')} className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center font-black text-sm shadow-lg shadow-violet-500/20 flex-shrink-0">D</div>
            <span className="font-extrabold text-sm tracking-tight text-white/90 truncate">Deep Research</span>
          </button>
          <button onClick={onClose} className="p-1.5 hover:bg-white/[0.07] rounded-lg text-neutral-600 hover:text-white transition-colors lg:hidden flex-shrink-0">
            <X size={16} />
          </button>
        </div>

        {/* New Chat */}
        <div className="px-3 pt-3 pb-2 flex-shrink-0">
          <button onClick={handleNewChat}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-[13px] font-black rounded-xl transition-all shadow-lg shadow-violet-600/15 group active:scale-[0.98]">
            <Plus size={15} className="group-hover:rotate-90 transition-transform duration-300" /> New Chat
          </button>
        </div>

        {/* Navigation */}
        <nav className="px-3 pb-3 border-b border-white/[0.04] flex-shrink-0">
          <p className="text-[0.65rem] font-bold text-neutral-700 uppercase tracking-[0.15em] px-2 py-2">Navigation</p>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to} to={to}
              onClick={() => { if (window.innerWidth < 1024) onClose(); }}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all mb-0.5 ${
                  isActive
                    ? 'bg-violet-500/10 text-violet-300 ring-1 ring-violet-500/20'
                    : 'text-neutral-500 hover:bg-white/[0.04] hover:text-neutral-300'
                }`
              }
            >
              <Icon size={16} className="flex-shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Recent chats */}
        <div className="flex-1 overflow-y-auto px-3 py-3 min-h-0 custom-scrollbar">
          <div className="flex items-center justify-between px-2 mb-2">
            <p className="text-[0.65rem] font-bold text-neutral-700 uppercase tracking-[0.15em]">Recent Chats</p>
            <button onClick={handleRefresh} className="p-1 hover:bg-white/[0.05] rounded-lg text-neutral-700 hover:text-neutral-500 transition-colors">
              <RefreshCw size={11} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
          {loading ? (
            <div className="flex flex-col items-center py-8 gap-2">
              <RefreshCw size={14} className="animate-spin text-neutral-700" />
              <p className="text-[0.7rem] text-neutral-700">Loading…</p>
            </div>
          ) : sessions.length > 0 ? (
            <div className="space-y-0.5">
              {sessions.map(s => (
                <div
                  key={s.sessionId}
                  onClick={() => { setCurrentSessionId(s.sessionId); go(`/chat/${s.sessionId}`); }}
                  className={`group flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
                    currentSessionId === s.sessionId
                      ? 'bg-white/[0.07] text-white'
                      : 'text-neutral-500 hover:bg-white/[0.04] hover:text-neutral-300'
                  }`}
                >
                  <MessageSquare size={12} className="flex-shrink-0" />
                  <span className="text-xs truncate flex-1 font-medium">{s.title}</span>
                  <button
                    onClick={e => { e.stopPropagation(); deleteSession(s.sessionId); }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-all flex-shrink-0 rounded">
                    <Trash2 size={11} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-[0.7rem] text-neutral-700 py-8 italic font-light">No chats yet</p>
          )}
        </div>

        {/* ── User footer with Settings Panel ─────────────────────────── */}
        <div className="flex-shrink-0 px-3 py-3 border-t border-white/[0.04] relative" ref={settingsRef}>

          {/* Settings panel — renders above the footer */}
          {settingsOpen && (
            <SettingsPanel
              onClose={() => setSettingsOpen(false)}
              user={user}
              logout={logout}
              navigate={navigate}
              documents={documents}
            />
          )}

          {/* User row */}
          <button
            onClick={() => setSettingsOpen(p => !p)}
            className={`w-full flex items-center gap-2.5 p-2 rounded-xl transition-all border ${
              settingsOpen
                ? 'bg-white/[0.05] border-white/[0.1] shadow-xl'
                : 'bg-white/[0.02] border-white/[0.04] hover:border-white/[0.1] hover:bg-white/[0.04]'
            }`}
          >
            {/* Avatar */}
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center font-bold text-[0.7rem] flex-shrink-0 ring-1 ring-white/10 shadow-lg">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'U'}
            </div>

            {/* Name + plan */}
            <div className="flex-1 min-w-0 text-left">
              <p className="text-xs font-bold text-white truncate leading-tight">
                {user?.name?.split(' ')[0] || 'Researcher'}
              </p>
              <p className="text-[0.65rem] text-neutral-600 leading-tight font-medium uppercase tracking-tighter">Free Tier</p>
            </div>

            <Settings size={14} className={`text-neutral-600 transition-all duration-500 ${settingsOpen ? 'rotate-180 text-violet-400' : 'group-hover:text-neutral-400'}`} />
          </button>
        </div>
      </motion.aside>
    </>
  );
};

// ── Header ─────────────────────────────────────────────────────────────────────
const Header = ({ onToggle }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { createNewChat } = useChat();

  const crumb = () => {
    const p = location.pathname;
    if (p.startsWith('/chat')) return 'Chat';
    if (p === '/dashboard') return 'Dashboard';
    if (p === '/tools') return 'Tools';
    if (p === '/analytics') return 'Analytics';
    return '';
  };

  const handleAskAI = () => {
    const id = createNewChat();
    navigate(`/chat/${id}`);
  };

  return (
    <header className="h-14 border-b border-white/[0.05] bg-[#07070f]/80 backdrop-blur-xl sticky top-0 z-30 flex items-center justify-between px-3 sm:px-4 flex-shrink-0">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button onClick={onToggle}
          className="p-2 hover:bg-white/[0.06] rounded-xl transition-colors text-neutral-500 hover:text-white flex-shrink-0">
          <Menu size={18} />
        </button>
        <div className="hidden sm:flex items-center gap-1.5 text-sm min-w-0">
          <span className="text-neutral-700 truncate">Deep Research</span>
          <ChevronRight size={12} className="text-neutral-700 flex-shrink-0" />
          <span className="text-neutral-300 font-medium truncate">{crumb()}</span>
        </div>
        <span className="sm:hidden text-sm font-semibold text-neutral-300 truncate">{crumb()}</span>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <button onClick={handleAskAI}
          className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold px-3 py-2 rounded-xl transition-all shadow-md shadow-violet-600/20 active:scale-[0.98]">
          <Sparkles size={13} />
          <span>Ask AI</span>
        </button>
      </div>
    </header>
  );
};

// ── Layout ─────────────────────────────────────────────────────────────────────
const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024;
    }
    return true;
  });

  useEffect(() => {
    const handleResize = () => {
      // If we cross the 1024px threshold, reset to default state
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      } else if (sidebarOpen && window.innerWidth < 1024) {
        // Automatically close when shrinking to mobile if it was explicitly open
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [sidebarOpen]);

  return (
    <div className="flex h-screen bg-[#07070f] text-neutral-200 overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className={`flex-1 flex flex-col min-w-0 overflow-hidden transition-all duration-300 ${
        sidebarOpen && window.innerWidth >= 1024 ? 'lg:ml-0' : 'lg:ml-[-256px]'
      }`}>
        <Header onToggle={() => setSidebarOpen(p => !p)} />
        <main className="flex-1 overflow-y-auto overscroll-contain">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
