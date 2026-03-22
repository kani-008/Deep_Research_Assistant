// src/pages/ChatPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Send, Paperclip, FileText, Copy, ThumbsUp, ThumbsDown,
  Sparkles, RotateCcw, Check, ChevronDown
} from 'lucide-react';
import { useChat } from '../context/ChatContext';
import toast from 'react-hot-toast';
import { sendMessage, uploadFile, updateChatFeedback } from '../api/api';

// ── Inline markdown ────────────────────────────────────────────────────────────
const renderInline = (text) =>
  text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((p, i) => {
    if (p.startsWith('**') && p.endsWith('**'))
      return <strong key={i} className="text-white font-semibold">{p.slice(2, -2)}</strong>;
    if (p.startsWith('`') && p.endsWith('`'))
      return <code key={i} className="bg-black/40 text-emerald-400 px-1 py-0.5 rounded text-[11px] font-mono">{p.slice(1, -1)}</code>;
    return p;
  });

const renderContent = (text) => {
  if (!text) return null;
  const lines = text.split('\n');
  const els = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.startsWith('```')) {
      const code = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) { code.push(lines[i]); i++; }
      els.push(
        <pre key={i} className="bg-black/40 border border-white/10 rounded-xl p-3 sm:p-4 my-3 overflow-x-auto text-emerald-400 text-[11px] sm:text-[12px] font-mono leading-relaxed">
          <code>{code.join('\n')}</code>
        </pre>
      );
    } else if (line.startsWith('### ')) {
      els.push(<h3 key={i} className="text-[13px] sm:text-[14px] font-bold text-white mt-4 mb-1">{line.slice(4)}</h3>);
    } else if (line.startsWith('## ')) {
      els.push(<h2 key={i} className="text-[14px] sm:text-[15px] font-bold text-white mt-5 mb-1.5">{line.slice(3)}</h2>);
    } else if (line.startsWith('# ')) {
      els.push(<h1 key={i} className="text-[15px] sm:text-base font-bold text-white mt-5 mb-2">{line.slice(2)}</h1>);
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      els.push(
        <div key={i} className="flex gap-2 my-0.5">
          <span className="mt-2 flex-shrink-0 w-1 h-1 rounded-full bg-violet-400" />
          <span className="text-neutral-300 text-[12px] sm:text-[13px] leading-relaxed">{renderInline(line.slice(2))}</span>
        </div>
      );
    } else if (/^\d+\.\s/.test(line)) {
      const num = line.match(/^(\d+)\./)[1];
      els.push(
        <div key={i} className="flex gap-2 my-0.5">
          <span className="text-violet-400 text-[10px] sm:text-[11px] font-bold mt-1 w-4 flex-shrink-0">{num}.</span>
          <span className="text-neutral-300 text-[12px] sm:text-[13px] leading-relaxed">{renderInline(line.replace(/^\d+\.\s/, ''))}</span>
        </div>
      );
    } else if (line.trim() === '') {
      els.push(<div key={i} className="h-1.5 sm:h-2" />);
    } else {
      els.push(<p key={i} className="text-neutral-300 text-[12px] sm:text-[13px] leading-relaxed">{renderInline(line)}</p>);
    }
    i++;
  }
  return els;
};

// ── Message bubble ─────────────────────────────────────────────────────────────
const Bubble = ({ message }) => {
  const isAI = message.sender === 'ai';
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(null);

  const copy = () => {
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const feedback = async (v) => {
    setLiked(v);
    if (message.chatId) {
      try { await updateChatFeedback(message.chatId, { rating: v ? 5 : 1, isAccurate: v }); } catch {}
    }
  };

  if (!isAI) {
    return (
      <div className="flex justify-end mb-4 sm:mb-5 group">
        <div className="max-w-[85%] sm:max-w-[75%]">
          <div className="bg-violet-600/15 border border-violet-500/20 text-white rounded-2xl rounded-tr-sm px-3.5 sm:px-4 py-3 text-[12px] sm:text-[13px] leading-relaxed">
            {message.text}
          </div>
          {message.files?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-2 justify-end">
              {message.files.map((f, i) => (
                <span key={i} className="flex items-center gap-1 bg-white/[0.05] border border-white/[0.08] text-neutral-400 text-[10px] sm:text-[11px] px-2 py-1 rounded-lg">
                  <FileText size={9} className="text-violet-400" /> {f.name}
                </span>
              ))}
            </div>
          )}
          <p className="text-[10px] text-neutral-700 mt-1 text-right">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 sm:mb-7 group">
      <div className="flex gap-2.5 sm:gap-3 items-start">
        <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-lg shadow-violet-500/20">
          <Sparkles size={12} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] sm:text-[11px] font-bold text-neutral-500 uppercase tracking-widest">Deep Assistant</span>
            <span className="text-[10px] text-neutral-700">
              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <div className="space-y-0.5">{renderContent(message.text)}</div>

          {message.sources?.length > 0 && (
            <div className="mt-3 pt-3 border-t border-white/[0.05]">
              <p className="text-[9px] sm:text-[10px] font-bold text-neutral-700 uppercase tracking-widest mb-1.5">Sources</p>
              <div className="flex flex-wrap gap-1.5">
                {message.sources.map((src, i) => (
                  <span key={i} className="flex items-center gap-1 text-[10px] sm:text-[11px] text-violet-400 bg-violet-500/[0.08] border border-violet-500/20 px-2 py-1 rounded-lg">
                    <FileText size={9} /> {src.filename} p.{src.page}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-0.5 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={copy} className="flex items-center gap-1.5 p-1.5 hover:bg-white/[0.06] rounded-lg text-[10px] sm:text-[11px] text-neutral-700 hover:text-neutral-400 transition-colors">
              {copied ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
            <button onClick={() => feedback(true)} className={`p-1.5 hover:bg-white/[0.06] rounded-lg transition-colors ${liked === true ? 'text-emerald-400' : 'text-neutral-700 hover:text-neutral-400'}`}>
              <ThumbsUp size={11} />
            </button>
            <button onClick={() => feedback(false)} className={`p-1.5 hover:bg-white/[0.06] rounded-lg transition-colors ${liked === false ? 'text-red-400' : 'text-neutral-700 hover:text-neutral-400'}`}>
              <ThumbsDown size={11} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const TypingDots = () => (
  <div className="flex gap-2.5 items-start mb-6">
    <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center flex-shrink-0">
      <Sparkles size={12} className="text-white animate-pulse" />
    </div>
    <div>
      <p className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest mb-2">Deep Assistant</p>
      <div className="flex items-center gap-1.5 py-1">
        {[0, 150, 300].map(d => (
          <span key={d} className="w-1.5 h-1.5 rounded-full bg-violet-400/60 animate-bounce" style={{ animationDelay: `${d}ms` }} />
        ))}
      </div>
    </div>
  </div>
);

const SUGGESTIONS = [
  'Summarize the key findings',
  'What are the main topics?',
  'Compare the methodologies',
  'Extract all important dates',
];

// ── Main ───────────────────────────────────────────────────────────────────────
const ChatPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { sessions, currentSessionId, setCurrentSessionId, addMessage, createNewChat, getChatMessages, loadSessions } = useChat();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const messagesEndRef = useRef(null);
  const scrollRef = useRef(null);
  const textareaRef = useRef(null);
  const messages = getChatMessages(id);

  useEffect(() => { loadSessions(); }, [loadSessions]);
  useEffect(() => { if (id && id !== currentSessionId) setCurrentSessionId(id); }, [id, currentSessionId, setCurrentSessionId]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isTyping]);
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 160) + 'px';
    }
  }, [input]);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    setShowScrollBtn(scrollHeight - scrollTop - clientHeight > 120);
  };

  const handleSend = async (e) => {
    e?.preventDefault();
    const trimmed = input.trim();
    if ((!trimmed && !attachedFiles.length) || isTyping) return;
    let targetId = id;
    if (!targetId) { targetId = createNewChat(); navigate(`/chat/${targetId}`); }
    addMessage(targetId, { id: Date.now(), sender: 'user', text: trimmed, files: [...attachedFiles], timestamp: new Date().toISOString() });
    setInput(''); setAttachedFiles([]); setIsTyping(true);
    try {
      const aiText = await sendMessage(trimmed || 'Analyze the uploaded file', targetId);
      addMessage(targetId, { id: Date.now() + 1, sender: 'ai', text: aiText, timestamp: new Date().toISOString() });
    } catch (err) {
      toast.error(err.message || 'Failed to reach Deep Assistant');
      addMessage(targetId, { id: Date.now() + 1, sender: 'ai', text: 'Sorry, I encountered an error. Please try again.', timestamp: new Date().toISOString() });
    } finally { setIsTyping(false); }
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    const valid = files.filter(f => f.type === 'application/pdf');
    if (valid.length !== files.length) toast.error('Only PDF files are supported');
    if (!valid.length) return;
    for (const file of valid) {
      const tid = toast.loading(`Uploading ${file.name}…`);
      try { await uploadFile(file, id); setAttachedFiles(p => [...p, file]); toast.success(`${file.name} ready`, { id: tid }); }
      catch (err) { toast.error(err.message, { id: tid }); }
    }
    // Reset file input
    e.target.value = '';
  };

  if (!id && sessions.length > 0) { navigate(`/chat/${sessions[0].sessionId}`); return null; }

  const isEmpty = messages.length === 0;

  return (
    <div className="flex flex-col bg-[#07070f] relative" style={{ height: 'calc(100vh - 56px)' }}>

      {/* Messages area */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto overscroll-contain"
      >
        <div className="max-w-2xl mx-auto px-3 sm:px-4 md:px-6 py-6 sm:py-8">
          {isEmpty ? (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center gap-6 sm:gap-8 px-2">
              <div className="relative">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center shadow-2xl shadow-violet-500/30">
                  <Sparkles size={22} className="text-white" />
                </div>
                <div className="absolute -inset-3 bg-gradient-to-br from-violet-500/10 to-purple-500/10 rounded-3xl blur-xl -z-10" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black tracking-tight text-white mb-2">How can I help you today?</h2>
                <p className="text-[12px] sm:text-[13px] text-neutral-500 max-w-xs sm:max-w-sm leading-relaxed">
                  Ask me anything about your uploaded documents. I will surface precise, cited answers.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-sm sm:max-w-lg">
                {SUGGESTIONS.map((s, i) => (
                  <button key={i} onClick={() => setInput(s)}
                    className="p-3 sm:p-3.5 bg-[#0d0d1a] border border-white/[0.07] hover:border-violet-500/30 hover:bg-[#10101e] rounded-xl text-[12px] sm:text-[13px] text-neutral-400 hover:text-white text-left transition-all group">
                    <span className="text-violet-400 mr-1.5 group-hover:translate-x-0.5 inline-block transition-transform">→</span>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map(msg => <Bubble key={msg.id} message={msg} />)}
              {isTyping && <TypingDots />}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Scroll to bottom button */}
      {showScrollBtn && (
        <button
          onClick={() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })}
          className="absolute bottom-28 sm:bottom-32 right-4 sm:right-5 w-8 h-8 bg-[#0e0e1c] border border-white/[0.1] rounded-full flex items-center justify-center shadow-xl hover:bg-[#14141f] transition-all z-10">
          <ChevronDown size={15} className="text-neutral-400" />
        </button>
      )}

      {/* Input bar */}
      <div className="border-t border-white/[0.05] bg-[#07070f] px-3 sm:px-4 py-3 sm:py-4 flex-shrink-0">
        <div className="max-w-2xl mx-auto">
          {/* Attached file chips */}
          {attachedFiles.length > 0 && (
            <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-2 sm:mb-3">
              {attachedFiles.map((f, i) => (
                <span key={i} className="flex items-center gap-1.5 bg-[#0e0e1c] border border-white/[0.08] text-[11px] sm:text-[12px] text-white px-2.5 sm:px-3 py-1.5 rounded-xl">
                  <FileText size={10} className="text-violet-400 flex-shrink-0" />
                  <span className="max-w-[80px] sm:max-w-[120px] truncate">{f.name}</span>
                  <button onClick={() => setAttachedFiles(p => p.filter((_, j) => j !== i))} className="text-neutral-600 hover:text-red-400 ml-0.5 flex-shrink-0">×</button>
                </span>
              ))}
            </div>
          )}

          {/* Text input */}
          <div className="relative bg-[#0e0e1c] border border-white/[0.08] rounded-2xl hover:border-white/[0.12] focus-within:border-violet-500/50 focus-within:ring-2 focus-within:ring-violet-500/10 transition-all">
            <div className="flex items-end gap-1.5 sm:gap-2 p-2 sm:p-3">
              {/* Attach button */}
              <label className="p-1.5 sm:p-2 text-neutral-600 hover:text-neutral-300 transition-colors cursor-pointer rounded-xl hover:bg-white/[0.05] flex-shrink-0">
                <Paperclip size={16} />
                <input type="file" className="hidden" multiple accept=".pdf" onChange={handleFileUpload} />
              </label>

              {/* Textarea */}
              <textarea
                ref={textareaRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder="Message Deep Assistant…"
                rows={1}
                className="flex-1 bg-transparent border-none outline-none text-[13px] text-white placeholder:text-neutral-700 resize-none py-1 sm:py-1.5 max-h-40 leading-relaxed min-w-0"
              />

              {/* Send button */}
              <button
                onClick={handleSend}
                disabled={(!input.trim() && !attachedFiles.length) || isTyping}
                className={`p-2 sm:p-2.5 rounded-xl flex-shrink-0 transition-all active:scale-95 ${
                  (!input.trim() && !attachedFiles.length) || isTyping
                    ? 'bg-white/[0.04] text-neutral-700 cursor-not-allowed'
                    : 'bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-600/20'
                }`}
              >
                {isTyping ? <RotateCcw size={15} className="animate-spin" /> : <Send size={15} />}
              </button>
            </div>
          </div>

          <p className="text-center text-[9px] sm:text-[10px] text-neutral-800 mt-1.5 tracking-wider uppercase">
            Deep Assistant may make mistakes — verify important information
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;