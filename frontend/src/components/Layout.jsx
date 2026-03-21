// ./frontend/src/components/Layout.jsx

import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  Plus, 
  MessageSquare, 
  LayoutDashboard, 
  Wrench, 
  BarChart3, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Search,
  Trash2,
  FileText
} from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { sessions, currentSessionId, setCurrentSessionId, createNewChat, deleteSession } = useChat();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleNewChat = () => {
    const id = createNewChat();
    navigate(`/chat/${id}`);
    if (window.innerWidth < 768) toggleSidebar();
  };

  const handleSessionClick = (id) => {
    setCurrentSessionId(id);
    navigate(`/chat/${id}`);
    if (window.innerWidth < 768) toggleSidebar();
  };

  return (
    <motion.div 
      initial={false}
      animate={{ width: isOpen ? '280px' : '0px', x: isOpen ? 0 : -280 }}
      className="fixed md:relative z-50 h-screen bg-sidebar border-r border-white/5 flex flex-col overflow-hidden"
    >
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center font-bold text-white shadow-lg shadow-primary/20">D</div>
          <span className="font-bold text-lg text-white">Deep Research</span>
        </div>
        <button className="md:hidden text-neutral-400" onClick={toggleSidebar}>
          <X size={20} />
        </button>
      </div>

      <div className="px-4 mb-6">
        <button 
          onClick={handleNewChat}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all font-medium text-sm"
        >
          <Plus size={18} />
          <span>New Chat</span>
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 space-y-1 custom-scrollbar">
        <div className="px-2 py-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Navigation</div>
        <NavLink 
          to="/dashboard" 
          className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
        >
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </NavLink>
        <NavLink 
          to="/tools" 
          className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
        >
          <Wrench size={18} />
          <span>Advanced Tools</span>
        </NavLink>
        <NavLink 
          to="/analytics" 
          className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
        >
          <BarChart3 size={18} />
          <span>Analytics</span>
        </NavLink>

        <div className="mt-8 px-2 py-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Recent Chats</div>
        <div className="space-y-1">
          {sessions.map(session => (
            <div 
              key={session.sessionId}
              className={`group flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                currentSessionId === session.sessionId ? 'bg-white/10 text-white' : 'text-neutral-400 hover:bg-white/5 hover:text-white'
              }`}
              onClick={() => handleSessionClick(session.sessionId)}
            >
              <div className="flex items-center gap-2 truncate">
                <MessageSquare size={16} />
                <span className="text-sm truncate font-medium">{session.title}</span>
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  deleteSession(session.sessionId);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 text-neutral-500 transition-opacity"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          {sessions.length === 0 && (
            <div className="px-2 py-4 text-center text-xs text-neutral-600">No recent chats</div>
          )}
        </div>
      </nav>

      <div className="mt-auto p-4 border-t border-white/5 bg-sidebar/50">
        <div className="flex items-center gap-2 p-2 rounded-xl hover:bg-white/5 transition-colors group">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center font-semibold text-white">
            {user?.name ? user.name.substring(0, 2).toUpperCase() : 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name || user?.email || 'User'}</p>
            <p className="text-xs text-neutral-500 truncate">Free Plan</p>
          </div>
          <button 
            onClick={() => { logout(); navigate('/login'); }} 
            className="p-1.5 hover:bg-white/10 rounded-lg hover:text-red-400 text-neutral-500 transition-colors" 
            title="Logout"
          >
            <LogOut size={16} />
          </button>
          <button className="p-1.5 hover:bg-white/10 rounded-lg hover:text-white text-neutral-500 transition-colors">
            <Settings size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const Header = ({ toggleSidebar }) => {
  return (
    <header className="h-16 border-b border-white/5 bg-background/50 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-4 md:px-8">
      <div className="flex items-center gap-4">
        <button onClick={toggleSidebar} className="p-2 hover:bg-white/5 rounded-lg transition-colors md:hidden">
          <Menu size={20} />
        </button>
        <div className="relative group hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-primary transition-colors" size={16} />
          <input 
            type="text" 
            placeholder="Search documents or chats..."
            className="bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary w-64 lg:w-96 transition-all"
          />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button className="p-2 hover:bg-white/5 rounded-full transition-colors relative">
          <div className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full ring-2 ring-background"></div>
          <FileText size={20} className="text-neutral-400" />
        </button>
        <div className="w-px h-6 bg-white/10"></div>
        <button className="text-sm font-medium hover:text-white text-neutral-400 transition-colors">Help</button>
      </div>
    </header>
  );
};

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex h-screen bg-background text-neutral-200 overflow-hidden font-sans">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="flex-1 flex flex-col min-w-0 relative">
        <Header toggleSidebar={toggleSidebar} />
        <main className="flex-1 overflow-y-auto custom-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
