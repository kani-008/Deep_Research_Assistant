// src/pages/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload, FileText, Trash2, ExternalLink, Plus, Zap, BarChart2,
  MessageSquare, RefreshCw, File, AlertCircle, CheckCircle2,
  CloudOff, TrendingUp, ArrowRight, Layers, Sparkles
} from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const StatusBadge = ({ status }) => {
  const s = (status || '').toLowerCase();
  if (s.includes('processed') || s.includes('completed') || s.includes('✅'))
    return (
      <span className="inline-flex items-center gap-1 text-[0.65rem] sm:text-[0.7rem] font-semibold text-emerald-400 bg-emerald-500/10 ring-1 ring-emerald-500/20 px-2 py-0.5 rounded-full whitespace-nowrap">
        <CheckCircle2 size={9} />Processed
      </span>
    );
  if (s.includes('failed') || s.includes('❌'))
    return (
      <span className="inline-flex items-center gap-1 text-[0.65rem] sm:text-[0.7rem] font-semibold text-red-400 bg-red-500/10 ring-1 ring-red-500/20 px-2 py-0.5 rounded-full whitespace-nowrap">
        <AlertCircle size={9} />Failed
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 text-[0.65rem] sm:text-[0.7rem] font-semibold text-amber-400 bg-amber-500/10 ring-1 ring-amber-500/20 px-2 py-0.5 rounded-full whitespace-nowrap">
      <CloudOff size={9} />Processing
    </span>
  );
};

const DocumentRow = ({ doc, onDelete, isComparing, isSelected, onToggle }) => (
  <div 
    onClick={() => isComparing && onToggle(doc.id)}
    className={`flex items-center gap-3 px-3 sm:px-4 py-3 rounded-xl border transition-all group ${
      isComparing 
        ? isSelected 
          ? 'bg-violet-900/10 border-violet-500/40 ring-1 ring-violet-500/20' 
          : 'bg-[#0d0d1a] border-white/[0.05] hover:border-white/10 cursor-pointer'
        : 'border-white/[0.05] bg-[#0d0d1a] hover:bg-[#10101e] hover:border-white/[0.1]'
    }`}
  >
    <div className="flex items-center flex-1 min-w-0 gap-3">
      {isComparing && (
        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${
          isSelected ? 'bg-violet-600 border-violet-600' : 'border-neutral-700 bg-transparent'
        }`}>
          {isSelected && <CheckCircle2 size={12} className="text-white" />}
        </div>
      )}
      <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
        isSelected ? 'bg-violet-500/20 ring-1 ring-violet-500/30' : 'bg-violet-500/10 ring-1 ring-violet-500/20'
      }`}>
        <FileText size={14} className={isSelected ? 'text-violet-300' : 'text-violet-400'} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-xs sm:text-sm font-semibold truncate transition-colors ${isSelected ? 'text-white' : 'text-neutral-200'}`}>{doc.name}</p>
        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
          <span className="text-[0.65rem] sm:text-[0.7rem] text-neutral-600">{doc.size}</span>
          {!isComparing && (
            <>
              <span className="text-neutral-800 text-[0.65rem]">·</span>
              <span className="text-[0.65rem] sm:text-[0.7rem] text-neutral-600">{new Date(doc.uploadedAt).toLocaleDateString()}</span>
            </>
          )}
        </div>
      </div>
    </div>
    
    {!isComparing && (
      <>
        <StatusBadge status={doc.status} />
        <div className="flex items-center gap-0.5 sm:gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button className="p-1.5 hover:bg-white/[0.07] rounded-lg text-neutral-600 hover:text-neutral-300 transition-colors">
            <ExternalLink size={12} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(doc.id); }}
            className="p-1.5 hover:bg-red-500/10 rounded-lg text-neutral-600 hover:text-red-400 transition-colors">
            <Trash2 size={12} />
          </button>
        </div>
      </>
    )}
  </div>
);

const DashboardPage = () => {
  const { 
    documents, uploadDocument, deleteDocument, loadDocuments, 
    sessions, loadSessions, createNewChat 
  } = useChat();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isDragOver, setIsDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isComparing, setIsComparing] = useState(false);
  const [selectedDocs, setSelectedDocs] = useState([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await Promise.all([loadDocuments(), loadSessions()]);
      setLoading(false);
    })();
  }, [loadDocuments, loadSessions]);

  const toggleDocSelection = (id) => {
    setSelectedDocs(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleExecuteCompare = () => {
    if (selectedDocs.length < 2) {
      toast.error('Select at least 2 documents to compare');
      return;
    }
    const names = documents
      .filter(d => selectedDocs.includes(d.id))
      .map(d => d.name)
      .join(' and ');
    
    const intent = `I need to compare these specific documents: ${names}. Point out their primary differences, core similarities, and any conflicting viewpoints between them.`;
    const id = createNewChat();
    navigate(`/chat/${id}`, { state: { initialPrompt: intent, toolName: 'Comparative Analysis' } });
  };

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
    { label: 'Sessions', value: loading ? '—' : sessions.length, icon: MessageSquare, color: 'text-cyan-400', bg: 'bg-cyan-500/10', ring: 'ring-cyan-500/20' },
    { label: 'Messages', value: loading ? '—' : totalMsgs, icon: TrendingUp, color: 'text-amber-400', bg: 'bg-amber-500/10', ring: 'ring-amber-500/15' },
  ];

  const quickActions = [
    { icon: MessageSquare, label: 'Ask AI', sub: 'Chat with your library', color: 'bg-violet-500/10 text-violet-400', ring: 'ring-violet-500/20', to: '/chat' },
    { icon: Layers, label: 'Compare', sub: 'Analyze two documents', color: 'bg-emerald-500/10 text-emerald-400', ring: 'ring-emerald-500/20', to: 'compare' },
    { icon: Sparkles, label: 'Summarize', sub: 'Get key takeaways', color: 'bg-cyan-500/10 text-cyan-400', ring: 'ring-cyan-500/20', to: '/tools' },
    { icon: BarChart2, label: 'Analytics', sub: 'View usage stats', color: 'bg-amber-500/10 text-amber-400', ring: 'ring-amber-500/20', to: '/analytics' },
  ];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const firstName = user?.name?.split(' ')[0] || 'Researcher';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-5 py-6 sm:py-8 pb-32 space-y-6 sm:space-y-8 relative">
      {/* ── Execute Compare Bar — Floating ─────────────────────────────────── */}
      {isComparing && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-2xl bg-[#121225]/80 backdrop-blur-xl border border-violet-500/30 rounded-2xl p-4 flex items-center justify-between shadow-2xl shadow-violet-500/20 z-50 animate-in slide-in-from-bottom-5 duration-300">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center">
              <Layers size={18} className="text-violet-400" />
            </div>
            <div>
              <p className="text-xs font-black text-white uppercase tracking-widest">Compare Documents</p>
              <p className="text-[0.7rem] text-neutral-500 font-bold">{selectedDocs.length} of 2 selected</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => { setIsComparing(false); setSelectedDocs([]); }}
              className="px-4 py-2 text-[0.7rem] font-bold text-neutral-400 uppercase tracking-widest hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleExecuteCompare}
              disabled={selectedDocs.length < 2}
              className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-xl ${
                selectedDocs.length >= 2 
                ? 'bg-violet-600 text-white hover:bg-violet-500 shadow-violet-600/25' 
                : 'bg-white/5 text-neutral-700 cursor-not-allowed border border-white/5 shadow-none'
              }`}
            >
              Analyze <ArrowRight size={13} />
            </button>
          </div>
        </div>
      )}

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-start sm:items-end justify-between gap-3">
        <div>
          <p className="text-xs sm:text-sm text-neutral-600 mb-0.5 tracking-tight font-medium">{greeting},</p>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white leading-tight">
            {firstName}&apos;s Dashboard
          </h1>
        </div>
      </div>

      {/* ── Stats grid ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        {stats.map(({ label, value, icon: Icon, color, bg, ring }, i) => (
          <div key={i} className="bg-[#0d0d1a] border border-white/[0.06] rounded-2xl p-4 sm:p-5 flex items-center gap-3 hover:border-white/[0.1] transition-all group overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl ${bg} ring-1 ${ring} flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-300`}>
              <Icon size={16} className={color} />
            </div>
            <div className="min-w-0">
              <p className="text-[0.65rem] sm:text-[0.7rem] font-bold text-neutral-600 uppercase tracking-wider truncate">{label}</p>
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
            <h2 className={`font-bold text-sm sm:text-base flex items-center gap-2 transition-colors ${isComparing ? 'text-violet-400' : 'text-white'}`}>
              {isComparing ? <Layers size={15} /> : <FileText size={15} className="text-violet-400" />} {isComparing ? 'Select Documents to Compare' : 'Documents Library'}
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-[0.7rem] sm:text-xs text-neutral-600 font-bold">{totalDocs} total</span>
              <button
                onClick={async () => { setLoading(true); await loadDocuments(true); setLoading(false); }}
                className="p-1.5 hover:bg-white/[0.06] rounded-lg text-neutral-600 hover:text-neutral-400 transition-colors">
                <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>

          {!isComparing && (
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
              <h3 className="text-sm sm:text-sm font-bold text-white mb-1 uppercase tracking-widest">Ingest Knowledge</h3>
              <p className="text-[0.7rem] sm:text-xs text-neutral-600 mb-5 leading-relaxed font-medium">
                Drag &amp; drop PDF files here, or click to browse
              </p>
              <label className="inline-flex items-center gap-2 bg-white text-black text-[11px] font-black uppercase tracking-widest px-6 py-2.5 rounded-xl cursor-pointer hover:bg-neutral-100 transition-all shadow-xl shadow-white/5 active:scale-95">
                <Plus size={13} strokeWidth={3} /> Browse Files
                <input type="file" className="hidden" multiple accept=".pdf" onChange={e => Array.from(e.target.files).forEach(handleUpload)} />
              </label>
            </div>
          )}

          {/* Document list */}
          <div className="space-y-2">
            {loading ? (
              <div className="flex flex-col items-center py-12 gap-3">
                <RefreshCw size={24} className="animate-spin text-violet-500" />
                <p className="text-[10px] text-neutral-600 font-black uppercase tracking-widest">Accessing Vault…</p>
              </div>
            ) : documents.length > 0 ? (
              documents.map(doc => (
                <DocumentRow 
                  key={doc.id} 
                  doc={doc} 
                  onDelete={deleteDocument} 
                  isComparing={isComparing}
                  isSelected={selectedDocs.includes(doc.id)}
                  onToggle={toggleDocSelection}
                />
              ))
            ) : (
              <div className="text-center py-12 text-neutral-700 text-xs font-bold border border-white/[0.04] rounded-2xl bg-[#0a0a14] leading-relaxed px-6 uppercase tracking-widest">
                Vault is empty. Ingest a PDF to initialize.
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions + Recent Chats */}
        <div className="space-y-6">
          <h2 className="font-bold text-white text-sm sm:text-base flex items-center gap-2">
            <Zap size={15} className="text-cyan-400" /> Quick Access
          </h2>

          <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
            {quickActions.map(({ icon: Icon, label, sub, color, ring, to }, i) => (
              <button key={i} 
                onClick={() => {
                  if (to === 'compare') {
                    setIsComparing(true);
                  } else if (label === 'Ask AI') {
                    const id = createNewChat();
                    navigate(`/chat/${id}`);
                  } else {
                    navigate(to);
                  }
                }}
                className={`flex items-center gap-3 p-3.5 sm:p-4 bg-[#0d0d1a] border rounded-2xl transition-all group text-left ${
                  (to === 'compare' && isComparing) 
                  ? 'border-emerald-500/50 bg-emerald-500/5 ring-1 ring-emerald-500/10' 
                  : 'border-white/[0.06] hover:border-white/[0.14] hover:bg-[#10101e]'
                }`}>
                <div className={`w-9 h-9 rounded-xl ${color} ring-1 ${ring} flex items-center justify-center flex-shrink-0 group-hover:rotate-6 transition-all duration-300`}>
                  <Icon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-black text-white tracking-tight grow truncate">{label}</p>
                  <p className="text-[0.65rem] sm:text-[0.7rem] text-neutral-600 mt-0.5 font-bold uppercase tracking-wider truncate hidden sm:block">{sub}</p>
                </div>
                <ArrowRight size={14} className="text-neutral-700 group-hover:text-neutral-400 group-hover:translate-x-1 transition-all flex-shrink-0 hidden lg:block" />
              </button>
            ))}
          </div>

          {/* Recent chats */}
          {sessions.length > 0 && (
            <div className="pt-2">
              <h3 className="text-[10px] font-black text-neutral-700 uppercase tracking-[0.2em] mb-4 px-1">Recent Intelligence</h3>
              <div className="space-y-2">
                {sessions.slice(0, 5).map(s => (
                  <button key={s.sessionId} onClick={() => navigate(`/chat/${s.sessionId}`)}
                    className="w-full flex items-center gap-3 p-3 bg-[#0d0d1a] border border-white/[0.04] rounded-xl hover:bg-[#10101e] hover:border-white/[0.1] transition-all text-left group">
                    <div className="w-8 h-8 rounded-lg bg-white/[0.03] flex items-center justify-center flex-shrink-0 group-hover:bg-violet-500/10 transition-colors">
                      <MessageSquare size={13} className="text-neutral-600 group-hover:text-violet-400 transition-colors" />
                    </div>
                    <span className="text-xs text-neutral-400 group-hover:text-white truncate flex-1 font-bold tracking-tight">{s.title}</span>
                    <ArrowRight size={12} className="text-neutral-800 opacity-0 group-hover:opacity-100 group-hover:text-violet-500 transition-all flex-shrink-0 mr-1" />
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
