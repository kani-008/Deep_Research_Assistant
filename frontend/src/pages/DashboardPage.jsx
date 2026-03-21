// ./frontend/src/pages/DashboardPage.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload, File, Trash2, ExternalLink, Plus, Zap, BarChart2,
  BookOpen, PieChart, Clock, Layers, ArrowRight, FileText, MessageSquare
} from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { motion } from 'framer-motion';

const QuickAction = ({ icon: Icon, title, description, onClick, color }) => (
  <button onClick={onClick}
    className="group flex flex-col items-start gap-4 p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/[0.08] transition-all text-left w-full relative overflow-hidden"
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

const DocumentRow = ({ doc, onDelete }) => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
    className="flex items-center gap-4 p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/[0.08] transition-all group"
  >
    <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-primary border border-white/10 flex-shrink-0">
      <FileText size={20} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-white truncate">{doc.name}</p>
      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
        <span className="text-xs text-neutral-500 font-medium">{doc.size}</span>
        <span className="text-xs text-neutral-600">•</span>
        <span className={`text-xs font-bold px-1.5 py-0.5 rounded uppercase tracking-tighter ${
          doc.status.includes('✅') || doc.status === 'Processed ✅' 
            ? 'text-emerald-400 bg-emerald-500/10' 
            : doc.status.includes('❌') 
            ? 'text-red-400 bg-red-500/10'
            : 'text-yellow-400 bg-yellow-500/10'
        }`}>
          {doc.status}
        </span>
      </div>
    </div>
    <div className="hidden sm:flex items-center gap-1 text-xs text-neutral-500 flex-shrink-0">
      <Clock size={14} />
      <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
    </div>
    <div className="flex items-center gap-2 flex-shrink-0">
      <button className="p-2 hover:bg-white/10 rounded-lg text-neutral-400 transition-colors">
        <ExternalLink size={16} />
      </button>
      <button onClick={() => onDelete(doc.id)}
        className="p-2 hover:bg-red-500/20 hover:text-red-400 rounded-lg text-neutral-400 transition-colors opacity-0 group-hover:opacity-100">
        <Trash2 size={16} />
      </button>
    </div>
  </motion.div>
);

const DashboardPage = () => {
  const { documents, uploadDocument, deleteDocument, sessions } = useChat();
  const navigate = useNavigate();
  const [isDragOver, setIsDragOver] = useState(false);

  // Dynamic stats from real data
  const totalDocs = documents.length;
  const processedDocs = documents.filter(d => d.status?.includes('✅')).length;
  const totalMessages = sessions.reduce((acc, s) => acc + (s.messages?.length || 0), 0);
  const totalChats = sessions.length;

  const handleDragOver = (e) => { e.preventDefault(); setIsDragOver(true); };
  const handleDragLeave = () => setIsDragOver(false);
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    Array.from(e.dataTransfer.files).forEach(file => uploadDocument(file));
  };
  const handleFileSelect = (e) => {
    Array.from(e.target.files).forEach(file => uploadDocument(file));
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-10 pb-20">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-2 tracking-tight">
            Research <span className="gradient-text">Dashboard</span>
          </h1>
          <p className="text-neutral-400 font-medium">Overview of your research documents and available tools.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 py-2 px-5 bg-primary/20 text-primary border border-primary/20 rounded-xl hover:bg-primary hover:text-white transition-all font-bold text-sm shadow-xl shadow-primary/10">
            <Plus size={18} />
            <span>Invite Team</span>
          </button>
        </div>
      </header>

      {/* Dynamic Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Documents', value: totalDocs, icon: File, color: 'text-blue-400', bg: 'bg-blue-400/10' },
          { label: 'Processed Docs', value: processedDocs, icon: Layers, color: 'text-purple-400', bg: 'bg-purple-400/10' },
          { label: 'Chat Sessions', value: totalChats, icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
          { label: 'Messages Sent', value: totalMessages, icon: BookOpen, color: 'text-emerald-400', bg: 'bg-emerald-400/10' }
        ].map((stat, i) => (
          <div key={i} className="p-5 bg-white/5 border border-white/5 rounded-[1.5rem] flex items-center gap-4 hover:border-white/10 transition-colors group">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${stat.bg} ${stat.color} transition-transform group-hover:scale-110`}>
              <stat.icon size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest truncate">{stat.label}</p>
              <p className="text-2xl font-black text-white mt-0.5">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Documents section */}
        <div className="lg:col-span-2 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-3">
              <Upload size={22} className="text-primary" />
              Recent Documents
            </h2>
            <span className="text-xs text-neutral-500 font-medium">{totalDocs} total</span>
          </div>

          {/* Upload zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-[1.5rem] p-8 text-center transition-all ${
              isDragOver ? 'border-primary bg-primary/10 scale-[0.99]' : 'border-white/10 bg-white/[0.03] hover:border-white/20'
            }`}
          >
            <Upload size={40} className="mx-auto mb-3 text-neutral-500" />
            <h3 className="text-base font-bold text-white mb-1">Upload New Documents</h3>
            <p className="text-neutral-500 text-sm mb-5">Drag and drop your PDF files here or click to browse.</p>
            <label className="inline-flex items-center gap-2 py-2.5 px-6 bg-white border border-white/10 rounded-xl hover:bg-neutral-100 transition-all font-bold text-sm text-black cursor-pointer shadow-xl">
              <Plus size={16} />
              <span>Browse Files</span>
              <input type="file" className="hidden" multiple accept=".pdf" onChange={handleFileSelect} />
            </label>
          </div>

          {/* Document list */}
          <div className="space-y-2">
            {documents.length > 0 ? (
              documents.map(doc => (
                <DocumentRow key={doc.id} doc={doc} onDelete={deleteDocument} />
              ))
            ) : (
              <div className="p-10 text-center rounded-[1.5rem] border border-white/5 bg-white/5 text-neutral-600 italic text-sm">
                No documents uploaded yet. Upload a PDF to get started.
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-5">
          <h2 className="text-xl font-bold text-white flex items-center gap-3">
            <Zap size={22} className="text-accent" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 gap-3">
            <QuickAction
              icon={MessageSquare} title="Ask AI"
              description="Start a chat with your documents for deep research."
              color="bg-primary shadow-lg shadow-primary/20"
              onClick={() => navigate('/chat')}
            />
            <QuickAction
              icon={Layers} title="Summarize Docs"
              description="Create a long-form summary of selected files."
              color="bg-accent shadow-lg shadow-accent/20"
              onClick={() => navigate('/tools')}
            />
            <QuickAction
              icon={BarChart2} title="Compare Files"
              description="Find common themes and key differences."
              color="bg-purple-600 shadow-lg shadow-purple-600/20"
              onClick={() => navigate('/tools')}
            />
            <QuickAction
              icon={PieChart} title="Generate Report"
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