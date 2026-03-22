// src/pages/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload, FileText, Trash2, ExternalLink, Plus, Zap, BarChart2,
  MessageSquare, RefreshCw, File, AlertCircle, CheckCircle2,
  CloudOff, TrendingUp, ArrowRight, Layers
} from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const StatusBadge = ({ status }) => {
  const s = (status || '').toLowerCase();
  if (s.includes('processed') || s.includes('completed') || s.includes('✅'))
    return (
      <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 ring-1 ring-emerald-500/20 px-2 py-0.5 rounded-full whitespace-nowrap">
        <CheckCircle2 size={9} />Processed
      </span>
    );
  if (s.includes('failed') || s.includes('❌'))
    return (
      <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold text-red-400 bg-red-500/10 ring-1 ring-red-500/20 px-2 py-0.5 rounded-full whitespace-nowrap">
        <AlertCircle size={9} />Failed
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold text-amber-400 bg-amber-500/10 ring-1 ring-amber-500/20 px-2 py-0.5 rounded-full whitespace-nowrap">
      <CloudOff size={9} />Processing
    </span>
  );
};

const DocumentRow = ({ doc, onDelete }) => (
  <div className="flex items-center gap-3 px-3 sm:px-4 py-3 rounded-xl border border-white/[0.05] bg-[#0d0d1a] hover:bg-[#10101e] hover:border-white/[0.1] transition-all group">
    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-violet-500/10 ring-1 ring-violet-500/20 flex items-center justify-center flex-shrink-0">
      <FileText size={14} className="text-violet-400" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[12px] sm:text-[13px] font-semibold text-white truncate">{doc.name}</p>
      <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
        <span className="text-[10px] sm:text-[11px] text-neutral-600">{doc.size}</span>
        <span className="text-neutral-800 text-[10px]">·</span>
        <span className="text-[10px] sm:text-[11px] text-neutral-600">{new Date(doc.uploadedAt).toLocaleDateString()}</span>
      </div>
    </div>
    <StatusBadge status={doc.status} />
    <div className="flex items-center gap-0.5 sm:gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
      <button className="p-1.5 hover:bg-white/[0.07] rounded-lg text-neutral-600 hover:text-neutral-300 transition-colors">
        <ExternalLink size={12} />
      </button>
      <button onClick={() => onDelete(doc.id)}
        className="p-1.5 hover:bg-red-500/10 rounded-lg text-neutral-600 hover:text-red-400 transition-colors">
        <Trash2 size={12} />
      </button>
    </div>
  </div>
);

const DashboardPage = () => {
  const { documents, uploadDocument, deleteDocument, loadDocuments, sessions, loadSessions } = useChat();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isDragOver, setIsDragOver] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await Promise.all([loadDocuments(), loadSessions()]);
      setLoading(false);
    })();
  }, [loadDocuments, loadSessions]);

  const totalDocs = documents.length;
  const processedDocs = documents.filter(d => {
    const s = (d.status || '').toLowerCase();
    return s.includes('processed') || s.includes('completed') || s.includes('✅');
  }).length;
  const totalMsgs = sessions.reduce((a, s) => a + (s.messages?.length || 0), 0);

  const handleUpload = async (file) => {
    if (file.type !== 'application/pdf') { toast.error(`${file.name}: Only PDFs supported`); return; }
    const tid = toast.loading(`Uploading ${file.name}…`);
    try {
      await uploadDocument(file);
      toast.success(`${file.name} indexed!`, { id: tid });
    } catch (err) {
      toast.error(err.message || 'Upload failed', { id: tid });
    }
  };

  const stats = [
    { label: 'Documents', value: loading ? '—' : totalDocs, icon: File, color: 'text-violet-400', bg: 'bg-violet-500/10', ring: 'ring-violet-500/15' },
    { label: 'Processed', value: loading ? '—' : processedDocs, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10', ring: 'ring-emerald-500/15' },
    { label: 'Sessions', value: loading ? '—' : sessions.length, icon: MessageSquare, color: 'text-cyan-400', bg: 'bg-cyan-500/10', ring: 'ring-cyan-500/15' },
    { label: 'Messages', value: loading ? '—' : totalMsgs, icon: TrendingUp, color: 'text-amber-400', bg: 'bg-amber-500/10', ring: 'ring-amber-500/15' },
  ];

  const quickActions = [
    { icon: MessageSquare, label: 'Ask AI', sub: 'Chat with your documents', color: 'bg-violet-500/10 text-violet-400', ring: 'ring-violet-500/20', to: '/chat' },
    { icon: Layers, label: 'Summarize', sub: 'Generate document summaries', color: 'bg-cyan-500/10 text-cyan-400', ring: 'ring-cyan-500/20', to: '/tools' },
    { icon: BarChart2, label: 'Analytics', sub: 'View usage statistics', color: 'bg-amber-500/10 text-amber-400', ring: 'ring-amber-500/20', to: '/analytics' },
    { icon: Zap, label: 'Compare', sub: 'Find differences', color: 'bg-emerald-500/10 text-emerald-400', ring: 'ring-emerald-500/20', to: '/tools' },
  ];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const firstName = user?.name?.split(' ')[0] || 'Researcher';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-5 py-6 sm:py-8 pb-16 space-y-6 sm:space-y-8">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-start sm:items-end justify-between gap-3">
        <div>
          <p className="text-[12px] sm:text-[13px] text-neutral-600 mb-0.5">{greeting},</p>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white leading-tight">
            {firstName}&apos;s Dashboard
          </h1>
        </div>
        <button
          onClick={() => navigate('/chat')}
          className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-500 text-white text-[12px] sm:text-[13px] font-bold px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl transition-all shadow-lg shadow-violet-600/20 flex-shrink-0">
          <Plus size={14} />
          <span className="hidden sm:inline">New Chat</span>
          <span className="sm:hidden">New</span>
        </button>
      </div>

      {/* ── Stats grid ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        {stats.map(({ label, value, icon: Icon, color, bg, ring }, i) => (
          <div key={i} className="bg-[#0d0d1a] border border-white/[0.06] rounded-2xl p-4 sm:p-5 flex items-center gap-3 hover:border-white/[0.1] transition-all group">
            <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl ${bg} ring-1 ${ring} flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform`}>
              <Icon size={16} className={color} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-[11px] font-bold text-neutral-600 uppercase tracking-wider truncate">{label}</p>
              <p className="text-xl sm:text-2xl font-black text-white mt-0.5 leading-none">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Main content ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">

        {/* Documents — takes 2 cols on lg */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-white text-[14px] sm:text-[15px] flex items-center gap-2">
              <Upload size={15} className="text-violet-400" /> Documents
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-[11px] sm:text-[12px] text-neutral-600">{totalDocs} total</span>
              <button
                onClick={async () => { setLoading(true); await loadDocuments(true); setLoading(false); }}
                className="p-1.5 hover:bg-white/[0.06] rounded-lg text-neutral-600 hover:text-neutral-400 transition-colors">
                <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>

          {/* Upload zone */}
          <div
            onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={e => { e.preventDefault(); setIsDragOver(false); Array.from(e.dataTransfer.files).forEach(handleUpload); }}
            className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition-all ${
              isDragOver ? 'border-violet-500/60 bg-violet-500/[0.05] scale-[0.99]' : 'border-white/[0.07] hover:border-white/[0.15] bg-[#0a0a15]'
            }`}
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-violet-500/10 ring-1 ring-violet-500/20 flex items-center justify-center mx-auto mb-3">
              <Upload size={18} className="text-violet-400" />
            </div>
            <h3 className="text-[13px] sm:text-[14px] font-bold text-white mb-1">Upload Documents</h3>
            <p className="text-[11px] sm:text-[12px] text-neutral-600 mb-4 leading-relaxed">
              Drag &amp; drop PDF files here, or click to browse
            </p>
            <label className="inline-flex items-center gap-2 bg-white text-black text-[12px] font-bold px-4 py-2 rounded-xl cursor-pointer hover:bg-neutral-100 transition-colors">
              <Plus size={13} /> Browse Files
              <input type="file" className="hidden" multiple accept=".pdf" onChange={e => Array.from(e.target.files).forEach(handleUpload)} />
            </label>
          </div>

          {/* Document list */}
          <div className="space-y-2">
            {loading ? (
              <div className="flex flex-col items-center py-10 gap-2">
                <RefreshCw size={20} className="animate-spin text-violet-500" />
                <p className="text-[12px] text-neutral-600">Loading documents…</p>
              </div>
            ) : documents.length > 0 ? (
              documents.map(doc => <DocumentRow key={doc.id} doc={doc} onDelete={deleteDocument} />)
            ) : (
              <div className="text-center py-10 text-neutral-700 text-[12px] sm:text-[13px] border border-white/[0.04] rounded-2xl bg-[#0a0a14] leading-relaxed px-4">
                No documents yet. Upload a PDF to get started.
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions + Recent Chats */}
        <div className="space-y-5">
          <h2 className="font-bold text-white text-[14px] sm:text-[15px] flex items-center gap-2">
            <Zap size={15} className="text-cyan-400" /> Quick Actions
          </h2>

          {/* On mobile, show as 2-col grid; on lg show as list */}
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-2.5">
            {quickActions.map(({ icon: Icon, label, sub, color, ring, to }, i) => (
              <button key={i} onClick={() => navigate(to)}
                className="flex items-center gap-3 p-3 sm:p-4 bg-[#0d0d1a] border border-white/[0.06] rounded-xl hover:border-white/[0.12] hover:bg-[#10101e] transition-all group text-left">
                <div className={`w-9 h-9 rounded-xl ${color} ring-1 ${ring} flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform`}>
                  <Icon size={15} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] sm:text-[13px] font-semibold text-white truncate">{label}</p>
                  <p className="text-[10px] sm:text-[11px] text-neutral-600 mt-0.5 truncate hidden sm:block">{sub}</p>
                </div>
                <ArrowRight size={13} className="text-neutral-700 group-hover:text-neutral-400 flex-shrink-0 hidden lg:block" />
              </button>
            ))}
          </div>

          {/* Recent chats */}
          {sessions.length > 0 && (
            <div>
              <h3 className="text-[11px] sm:text-[12px] font-bold text-neutral-600 uppercase tracking-wider mb-3">Recent Chats</h3>
              <div className="space-y-2">
                {sessions.slice(0, 4).map(s => (
                  <button key={s.sessionId} onClick={() => navigate(`/chat/${s.sessionId}`)}
                    className="w-full flex items-center gap-2.5 p-3 bg-[#0d0d1a] border border-white/[0.05] rounded-xl hover:border-white/[0.1] transition-all text-left group">
                    <MessageSquare size={12} className="text-neutral-600 flex-shrink-0" />
                    <span className="text-[12px] text-neutral-400 truncate flex-1 font-medium">{s.title}</span>
                    <ArrowRight size={11} className="text-neutral-700 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;