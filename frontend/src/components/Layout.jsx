// src/components/Layout.jsx
import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Plus, MessageSquare, LayoutDashboard, Wrench, BarChart3,
  Settings, LogOut, X, Search, Trash2, RefreshCw,
  Menu, ChevronRight, Sparkles, User, Bell, Keyboard,
  HelpCircle, ExternalLink, Moon, Shield, BookOpen,
  ChevronUp, FileText, Zap, Volume2, Globe
} from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';

// ── Settings Panel ─────────────────────────────────────────────────────────────
const SettingsPanel = ({ onClose, user, logout, navigate }) => {
  const [notifications, setNotifications] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [compactMode, setCompactMode] = useState(false);

  const handleLogout = () => {
    onClose();
    logout();
    navigate('/login');
  };

  const Toggle = ({ value, onChange }) => (
    <button
      onClick={() => onChange(!value)}
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

  const sections = [
    {
      label: 'Account',
      items: [
        {
          icon: User,
          label: 'Profile',
          sub: user?.email || 'Manage your profile',
          action: () => {},
          right: <ExternalLink size={12} className="text-neutral-700" />,
        },
        {
          icon: Shield,
          label: 'Security',
          sub: 'Password & 2FA',
          action: () => {},
          right: <ExternalLink size={12} className="text-neutral-700" />,
        },
        {
          icon: Zap,
          label: 'Upgrade Plan',
          sub: 'You are on Free',
          action: () => {},
          right: (
            <span className="text-[10px] font-bold bg-amber-400/10 text-amber-400 border border-amber-400/20 px-1.5 py-0.5 rounded-full whitespace-nowrap">
              PRO
            </span>
          ),
        },
      ],
    },
    {
      label: 'Preferences',
      items: [
        {
          icon: Bell,
          label: 'Notifications',
          sub: 'Upload & answer alerts',
          action: () => setNotifications(p => !p),
          right: <Toggle value={notifications} onChange={setNotifications} />,
        },
        {
          icon: Volume2,
          label: 'Sound effects',
          sub: 'Play sounds on events',
          action: () => setSoundEnabled(p => !p),
          right: <Toggle value={soundEnabled} onChange={setSoundEnabled} />,
        },
        {
          icon: Moon,
          label: 'Compact mode',
          sub: 'Denser sidebar layout',
          action: () => setCompactMode(p => !p),
          right: <Toggle value={compactMode} onChange={setCompactMode} />,
        },
      ],
    },
    {
      label: 'Resources',
      items: [
        {
          icon: BookOpen,
          label: 'Documentation',
          sub: 'Guides and API reference',
          action: () => window.open('#', '_blank'),
          right: <ExternalLink size={12} className="text-neutral-700" />,
        },
        {
          icon: Keyboard,
          label: 'Keyboard shortcuts',
          sub: 'View all shortcuts',
          action: () => {},
          right: (
            <span className="text-[10px] font-mono text-neutral-600 bg-white/[0.05] px-1.5 py-0.5 rounded border border-white/[0.06]">
              ?
            </span>
          ),
        },
        {
          icon: HelpCircle,
          label: 'Help & Support',
          sub: 'Chat with our team',
          action: () => {},
          right: <ExternalLink size={12} className="text-neutral-700" />,
        },
      ],
    },
  ];

  return (
    <div className="absolute bottom-full left-0 right-0 mb-2 z-[60] mx-2">
      {/* Panel */}
      <div className="bg-[#0f0f1e] border border-white/[0.1] rounded-2xl shadow-2xl shadow-black/60 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <Settings size={13} className="text-neutral-500" />
            <span className="text-[12px] font-bold text-neutral-300 tracking-wide">Settings</span>
          </div>
          <button onClick={onClose}
            className="p-1 hover:bg-white/[0.07] rounded-lg text-neutral-600 hover:text-neutral-300 transition-colors">
            <X size={13} />
          </button>
        </div>

        {/* User summary */}
        <div className="px-4 py-3 border-b border-white/[0.06] flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center font-bold text-[12px] flex-shrink-0 ring-2 ring-violet-500/20">
            {user?.name ? user.name.slice(0, 2).toUpperCase() : 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-white truncate">{user?.name || 'User'}</p>
            <p className="text-[10px] text-neutral-500 truncate">{user?.email || ''}</p>
          </div>
          <span className="text-[9px] font-black uppercase tracking-widest text-neutral-600 bg-white/[0.05] border border-white/[0.07] px-2 py-1 rounded-full flex-shrink-0">
            Free
          </span>
        </div>

        {/* Sections */}
        <div className="overflow-y-auto max-h-72 py-2">
          {sections.map(({ label, items }) => (
            <div key={label}>
              <p className="text-[9px] font-bold text-neutral-700 uppercase tracking-[0.15em] px-4 pt-3 pb-1.5">{label}</p>
              {items.map(({ icon: Icon, label: itemLabel, sub, action, right }) => (
                <button key={itemLabel} onClick={action}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.04] transition-colors text-left group">
                  <div className="w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center flex-shrink-0 group-hover:border-white/[0.1] transition-colors">
                    <Icon size={13} className="text-neutral-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-medium text-neutral-200 truncate">{itemLabel}</p>
                    <p className="text-[10px] text-neutral-600 truncate">{sub}</p>
                  </div>
                  <div className="flex-shrink-0">{right}</div>
                </button>
              ))}
            </div>
          ))}
        </div>

        {/* Footer — Sign out */}
        <div className="border-t border-white/[0.06] px-3 py-2.5">
          <button onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-red-500/[0.08] border border-transparent hover:border-red-500/20 transition-all group">
            <div className="w-7 h-7 rounded-lg bg-red-500/[0.08] flex items-center justify-center flex-shrink-0">
              <LogOut size={13} className="text-red-500/70 group-hover:text-red-400 transition-colors" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-[12px] font-medium text-red-500/70 group-hover:text-red-400 transition-colors">Sign out</p>
              <p className="text-[10px] text-neutral-700">End your session</p>
            </div>
          </button>
        </div>
      </div>

      {/* Arrow pointer */}
      <div className="absolute -bottom-1.5 left-6 w-3 h-3 bg-[#0f0f1e] border-r border-b border-white/[0.1] rotate-45 z-[-1]" />
    </div>
  );
};

// ── Sidebar ────────────────────────────────────────────────────────────────────
const Sidebar = ({ isOpen, onClose }) => {
  const { sessions, currentSessionId, setCurrentSessionId, createNewChat, deleteSession, loadSessions, refreshSessions } = useChat();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const settingsRef = useRef(null);

  useEffect(() => {
    (async () => { setLoading(true); await loadSessions(); setLoading(false); })();
  }, [loadSessions]);

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
    await loadSessions();
    setLoading(false);
  };

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/tools', icon: Wrench, label: 'Tools' },
    { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 lg:relative
          flex flex-col w-64 h-screen flex-shrink-0
          bg-[#0a0a16] border-r border-white/[0.05]
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        {/* Logo row */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-white/[0.04] flex-shrink-0">
          <button onClick={() => navigate('/')} className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center font-black text-sm shadow-lg shadow-violet-500/20 flex-shrink-0">D</div>
            <span className="font-extrabold text-[13px] tracking-tight text-white/90 truncate">Deep Research</span>
          </button>
          <button onClick={onClose} className="p-1.5 hover:bg-white/[0.07] rounded-lg text-neutral-600 hover:text-white transition-colors lg:hidden flex-shrink-0">
            <X size={16} />
          </button>
        </div>

        {/* New Chat */}
        <div className="px-3 pt-3 pb-2 flex-shrink-0">
          <button onClick={handleNewChat}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-[13px] font-semibold rounded-xl transition-all shadow-lg shadow-violet-600/15">
            <Plus size={15} /> New Chat
          </button>
        </div>

        {/* Navigation */}
        <nav className="px-3 pb-3 border-b border-white/[0.04] flex-shrink-0">
          <p className="text-[10px] font-bold text-neutral-700 uppercase tracking-[0.15em] px-2 py-2">Navigation</p>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to} to={to}
              onClick={() => { if (window.innerWidth < 1024) onClose(); }}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all mb-0.5 ${
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
        <div className="flex-1 overflow-y-auto px-3 py-3 min-h-0">
          <div className="flex items-center justify-between px-2 mb-2">
            <p className="text-[10px] font-bold text-neutral-700 uppercase tracking-[0.15em]">Recent Chats</p>
            <button onClick={handleRefresh} className="p-1 hover:bg-white/[0.05] rounded-lg text-neutral-700 hover:text-neutral-500 transition-colors">
              <RefreshCw size={11} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
          {loading ? (
            <div className="flex flex-col items-center py-8 gap-2">
              <RefreshCw size={14} className="animate-spin text-neutral-700" />
              <p className="text-[11px] text-neutral-700">Loading…</p>
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
                  <span className="text-[12px] truncate flex-1 font-medium">{s.title}</span>
                  <button
                    onClick={e => { e.stopPropagation(); deleteSession(s.sessionId); }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-all flex-shrink-0 rounded">
                    <Trash2 size={11} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-[11px] text-neutral-700 py-8">No chats yet</p>
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
            />
          )}

          {/* User row */}
          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] transition-colors">
            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center font-bold text-[11px] flex-shrink-0 ring-2 ring-violet-500/20">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'U'}
            </div>

            {/* Name + plan */}
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold text-white truncate leading-tight">
                {user?.name || user?.email || 'User'}
              </p>
              <p className="text-[10px] text-neutral-600 leading-tight">Free Plan</p>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-0.5 flex-shrink-0">
              {/* Sign out */}
              <button
                onClick={() => { logout(); navigate('/login'); }}
                className="p-1.5 hover:bg-red-500/10 rounded-lg text-neutral-600 hover:text-red-400 transition-all"
                title="Sign out">
                <LogOut size={14} />
              </button>

              {/* Settings toggle */}
              <button
                onClick={() => setSettingsOpen(p => !p)}
                className={`p-1.5 rounded-lg transition-all ${
                  settingsOpen
                    ? 'bg-violet-500/15 text-violet-400 ring-1 ring-violet-500/25'
                    : 'text-neutral-600 hover:bg-white/[0.07] hover:text-neutral-300'
                }`}
                title="Settings">
                <Settings size={14} className={settingsOpen ? 'rotate-45 transition-transform duration-300' : 'transition-transform duration-300'} />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

// ── Header ─────────────────────────────────────────────────────────────────────
const Header = ({ onToggle }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const crumb = () => {
    const p = location.pathname;
    if (p.startsWith('/chat')) return 'Chat';
    if (p === '/dashboard') return 'Dashboard';
    if (p === '/tools') return 'Tools';
    if (p === '/analytics') return 'Analytics';
    return '';
  };

  return (
    <header className="h-14 border-b border-white/[0.05] bg-[#07070f]/80 backdrop-blur-xl sticky top-0 z-30 flex items-center justify-between px-3 sm:px-4 flex-shrink-0">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button onClick={onToggle}
          className="p-2 hover:bg-white/[0.06] rounded-xl transition-colors text-neutral-500 hover:text-white flex-shrink-0">
          <Menu size={18} />
        </button>
        <div className="hidden sm:flex items-center gap-1.5 text-[13px] min-w-0">
          <span className="text-neutral-700 truncate">Deep Research</span>
          <ChevronRight size={12} className="text-neutral-700 flex-shrink-0" />
          <span className="text-neutral-300 font-medium truncate">{crumb()}</span>
        </div>
        <span className="sm:hidden text-[13px] font-semibold text-neutral-300 truncate">{crumb()}</span>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="relative hidden md:block">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-600 pointer-events-none" />
          <input type="text" placeholder="Search…"
            className="bg-white/[0.04] border border-white/[0.07] rounded-xl pl-8 pr-4 py-1.5 text-[12px] text-neutral-400 placeholder:text-neutral-700 outline-none focus:border-violet-500/40 focus:ring-1 focus:ring-violet-500/10 transition-all w-44 lg:w-60" />
        </div>
        <button onClick={() => navigate('/chat')}
          className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-500 text-white text-[12px] font-semibold px-3 py-2 rounded-xl transition-all shadow-md shadow-violet-600/20">
          <Sparkles size={13} />
          <span className="hidden sm:inline">Ask AI</span>
        </button>
      </div>
    </header>
  );
};

// ── Layout ─────────────────────────────────────────────────────────────────────
const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const fn = () => {
      setSidebarOpen(window.innerWidth >= 1024);
    };
    fn();
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);

  return (
    <div className="flex h-screen bg-[#07070f] text-neutral-200 overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header onToggle={() => setSidebarOpen(p => !p)} />
        <main className="flex-1 overflow-y-auto overscroll-contain">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;