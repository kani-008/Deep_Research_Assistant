// ./frontend/src/pages/DashboardPage.jsx

import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Upload, 
  File, 
  Trash2, 
  ExternalLink, 
  MoreVertical, 
  MoreHorizontal,
  ChevronRight,
  Plus,
  Zap,
  BarChart2,
  BookOpen,
  PieChart,
  Calendar,
  Clock,
  Layers,
  ArrowRight,
  CheckCircle2,
  X,
  FileText,
  MessageSquare
} from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { motion, AnimatePresence } from 'framer-motion';

const QuickAction = ({ icon: Icon, title, description, onClick, color }) => (
  <button 
    onClick={onClick}
    className="group flex flex-col items-start gap-4 p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/[0.08] transition-all text-left w-full h-full relative overflow-hidden"
  >
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${color}`}>
      <Icon size={24} className="text-white" />
    </div>
    <div className="flex-1">
      <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
      <p className="text-sm text-neutral-400 leading-relaxed">{description}</p>
    </div>
    <div className="absolute top-4 right-4 text-neutral-600 group-hover:text-primary transition-colors">
      <ArrowRight size={20} />
    </div>
  </button>
);

const DocumentRow = ({ doc }) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex items-center gap-4 p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/[0.08] transition-all group"
  >
    <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-primary border border-white/10">
      <FileText size={20} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-white truncate">{doc.name}</p>
      <div className="flex items-center gap-2 mt-0.5">
        <span className="text-xs text-neutral-500 font-medium">{doc.size}</span>
        <span className="text-xs text-neutral-600">•</span>
        <span className="text-xs text-emerald-500 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded uppercase tracking-tighter">{doc.status}</span>
      </div>
    </div>
    <div className="hidden sm:flex items-center gap-4 text-xs text-neutral-500">
      <div className="flex items-center gap-1">
        <Clock size={14} />
        <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
      </div>
    </div>
    <div className="flex items-center gap-2">
      <button className="p-2 hover:bg-white/10 rounded-lg text-neutral-400 transition-colors">
        <ExternalLink size={16} />
      </button>
      <button className="p-2 hover:bg-red-500/20 hover:text-red-400 rounded-lg text-neutral-400 transition-colors opacity-0 group-hover:opacity-100">
        <Trash2 size={16} />
      </button>
    </div>
  </motion.div>
);

const DashboardPage = () => {
  const { documents, uploadDocument } = useChat();
  const navigate = useNavigate();
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    files.forEach(file => uploadDocument(file));
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => uploadDocument(file));
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-12 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-2 tracking-tight">Research <span className="gradient-text">Dashboard</span></h1>
          <p className="text-neutral-400 font-medium">Overview of your research documents and available tools.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex -space-x-3 overflow-hidden p-1">
            <div className="inline-block h-10 w-10 rounded-full ring-4 ring-background bg-slate-400 border-2 border-primary shadow-lg shadow-primary/20 flex items-center justify-center font-bold text-white text-xs">JD</div>
            <div className="inline-block h-10 w-10 rounded-full ring-4 ring-background bg-slate-600 border-2 border-accent shadow-lg shadow-accent/20 flex items-center justify-center font-bold text-white text-xs">SM</div>
            <div className="inline-block h-10 w-10 rounded-full ring-4 ring-background bg-slate-800 border-2 border-white/10 shadow-lg flex items-center justify-center font-bold text-white text-xs">+3</div>
          </div>
          <button className="flex items-center gap-2 py-2 px-5 bg-primary/20 text-primary border border-primary/20 rounded-xl hover:bg-primary hover:text-white transition-all font-bold text-sm shadow-xl shadow-primary/10">
            <Plus size={18} />
            <span>Invite Team</span>
          </button>
        </div>
      </header>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Documents', value: documents.length, icon: File, color: 'text-blue-400', bg: 'bg-blue-400/10' },
          { label: 'Topics Identified', value: 24, icon: Layers, color: 'text-purple-400', bg: 'bg-purple-400/10' },
          { label: 'Smart Insights', value: 142, icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
          { label: 'Queries Asked', value: 87, icon: BookOpen, color: 'text-emerald-400', bg: 'bg-emerald-400/10' }
        ].map((stat, i) => (
          <div key={i} className="p-6 bg-white/5 border border-white/5 rounded-[2rem] flex items-center gap-5 hover:border-white/10 transition-colors group">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${stat.bg} ${stat.color} transition-transform group-hover:scale-110`}>
              <stat.icon size={22} />
            </div>
            <div>
              <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest">{stat.label}</p>
              <p className="text-2xl font-black text-white mt-1">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Document section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-3">
              <Upload size={24} className="text-primary" />
              Recent Documents
            </h2>
            <button className="text-sm font-semibold text-primary hover:underline transition-all">View All Docs</button>
          </div>

          <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-[2rem] p-8 text-center transition-all ${
              isDragOver ? 'border-primary bg-primary/10 scale-[0.99] shadow-inner' : 'border-white/10 bg-white/[0.03] hover:border-white/20'
            }`}
          >
            <Upload size={48} className="mx-auto mb-4 text-neutral-500" />
            <h3 className="text-lg font-bold text-white mb-1">Upload New Documents</h3>
            <p className="text-neutral-500 text-sm mb-6 max-w-sm mx-auto">Drag and drop your PDF, DOCX or TXT files here or click to browse.</p>
            <label className="inline-flex items-center gap-2 py-3 px-8 bg-white border border-white/10 rounded-2xl hover:bg-neutral-100 transition-all font-bold text-sm text-black cursor-pointer shadow-2xl">
              <Plus size={18} />
              <span>Browse Files</span>
              <input type="file" className="hidden" multiple onChange={handleFileSelect} />
            </label>
          </div>

          <div className="space-y-3">
            {documents.length > 0 ? (
              documents.map(doc => <DocumentRow key={doc.id} doc={doc} />)
            ) : (
              <div className="p-12 text-center rounded-[2rem] border border-white/5 bg-white/5 text-neutral-600 italic">
                No documents uploaded yet.
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions section */}
        <div className="space-y-6">
          <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-3">
            <Zap size={24} className="text-accent" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 gap-4">
            <QuickAction 
              icon={MessageSquare}
              title="Ask AI"
              description="Start a chat with your documents for deep research."
              color="bg-primary shadow-lg shadow-primary/20"
              onClick={() => navigate('/chat')}
            />
            <QuickAction 
              icon={Layers}
              title="Summarize Docs"
              description="Create a long-form summary of selected files."
              color="bg-accent shadow-lg shadow-accent/20"
              onClick={() => navigate('/tools')}
            />
            <QuickAction 
              icon={BarChart2}
              title="Compare Files"
              description="Find common themes and key differences."
              color="bg-purple-600 shadow-lg shadow-purple-600/20"
              onClick={() => navigate('/tools')}
            />
            <QuickAction 
              icon={PieChart}
              title="Generate Report"
              description="Export insights in professional PDF format."
              color="bg-emerald-600 shadow-lg shadow-emerald-600/20"
              onClick={() => navigate('/tools')}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
