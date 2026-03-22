// ./frontend/src/pages/ChatPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Paperclip, FileText, Copy, ThumbsUp, ThumbsDown,
  Sparkles, RotateCcw, Check, ChevronDown,
  Search, Shield, Zap, Globe, MessageSquare,
} from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { updateChatFeedback } from '../api/api';

// ── Inline markdown ────────────────────────────────────────────────────────────
const renderInline = (text) =>
  text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((p, i) => {
    if (p.startsWith('**') && p.endsWith('**'))
      return <strong key={i} className="text-white font-bold">{p.slice(2, -2)}</strong>;
    if (p.startsWith('`') && p.endsWith('`'))
      return (
        <code
          key={i}
          className="bg-white/10 text-violet-300 px-1.5 py-0.5 rounded-md text-[0.7rem] font-mono border border-white/5"
        >
          {p.slice(1, -1)}
        </code>
      );
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
      const lang = line.split(' ')[1] || 'code';
      const code = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) { code.push(lines[i]); i++; }
      els.push(
        <div key={i} className="relative group my-3">
          <div className="absolute top-0 right-0 px-2 py-0.5 text-[9px] font-bold text-neutral-500 uppercase tracking-widest bg-white/5 rounded-bl-xl border-l border-b border-white/10">
            {lang}
          </div>
          <pre className="bg-[#0d0d1a] border border-white/10 rounded-xl p-3 sm:p-4 overflow-x-auto text-emerald-400 text-[11px] sm:text-xs font-mono leading-relaxed shadow-inner">
            <code>{code.join('\n')}</code>
          </pre>
        </div>
      );
    } else if (line.startsWith('### ')) {
      els.push(<h3 key={i} className="text-xs sm:text-sm font-black text-white mt-5 mb-1.5">{line.slice(4)}</h3>);
    } else if (line.startsWith('## ')) {
      els.push(<h2 key={i} className="text-sm sm:text-base font-black text-white mt-6 mb-2 border-b border-white/5 pb-1">{line.slice(3)}</h2>);
    } else if (line.startsWith('# ')) {
      els.push(<h1 key={i} className="text-base sm:text-lg font-black text-white mt-8 mb-3">{line.slice(2)}</h1>);
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      els.push(
        <div key={i} className="flex gap-2.5 my-1 pl-1">
          <span className="mt-2 flex-shrink-0 w-1 h-1 rounded-full bg-violet-500" />
          <span className="text-neutral-300 text-[12px] sm:text-[13px] leading-relaxed">{renderInline(line.slice(2))}</span>
        </div>
      );
    } else if (/^\d+\.\s/.test(line)) {
      const num = line.match(/^(\d+)\./)[1];
      els.push(
        <div key={i} className="flex gap-2.5 my-1 pl-1">
          <span className="text-violet-500 text-[10px] sm:text-xs font-black mt-1 w-4 flex-shrink-0">{num}.</span>
          <span className="text-neutral-300 text-[12px] sm:text-[13px] leading-relaxed">{renderInline(line.replace(/^\d+\.\s/, ''))}</span>
        </div>
      );
    } else if (line.trim() === '') {
      els.push(<div key={i} className="h-2" />);
    } else {
      els.push(
        <p key={i} className="text-neutral-300 text-[12px] sm:text-[13px] leading-relaxed mb-3">
          {renderInline(line)}
        </p>
      );
    }
    i++;
  }
  return els;
};

// ── Message Bubble ─────────────────────────────────────────────────────────────
const MessageBubble = ({ message }) => {
  const isAI = message.sender === 'ai';
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(null);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFeedback = async (v) => {
    setLiked(v);
    if (message.chatId) {
      try { await updateChatFeedback(message.chatId, { rating: v ? 5 : 1, isAccurate: v }); } catch {}
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex w-full mb-3 ${isAI ? 'justify-start' : 'justify-end'}`}
    >
      <div className={`flex gap-2 w-full ${isAI ? 'flex-row' : 'flex-row-reverse'} ${isAI ? 'max-w-full' : 'max-w-[88%] sm:max-w-[75%]'}`}>
        
        {/* AI Avatar */}
        {isAI && (
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-violet-600/20 flex items-center justify-center flex-shrink-0 mt-0.5 border border-violet-500/20">
            <Sparkles size={11} className="text-violet-400" />
          </div>
        )}

        <div className={`flex flex-col ${isAI ? 'items-start max-w-[calc(100%-2.5rem)]' : 'items-end'} gap-1 min-w-0`}>
          
          {isAI && (
            <span className="text-[8px] font-black text-neutral-700 uppercase tracking-widest px-0.5 mb-0.5">
              Assistant
            </span>
          )}

          <div className={`
            relative overflow-hidden shadow-sm
            ${isAI
              ? 'bg-[#0e0e1c]/95 border border-white/5 rounded-2xl rounded-tl-sm backdrop-blur-md w-full'
              : 'bg-violet-600 text-white rounded-2xl rounded-tr-sm'
            }
          `}>
            {/* Subtle top gloss for AI bubble */}
            {isAI && (
              <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/[0.015] to-transparent pointer-events-none" />
            )}

            <div className={`relative z-10 px-3 py-2.5 sm:px-4 sm:py-3`}>
              {isAI ? (
                <div className="text-[12px] sm:text-[13px] leading-relaxed text-neutral-200 overflow-x-auto">
                  {renderContent(message.text)}
                </div>
              ) : (
                <p className="text-[12px] sm:text-[13px] leading-snug font-medium whitespace-pre-wrap break-words">
                  {message.text}
                </p>
              )}
            </div>

            {/* User attached files */}
            {!isAI && message.files?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 px-3 pb-2.5 -mt-1">
                {message.files.map((f, i) => (
                  <div key={i} className="flex items-center gap-1.5 bg-white/10 border border-white/10 text-[9px] px-2 py-1 rounded-lg">
                    <FileText size={9} className="text-violet-200 flex-shrink-0" />
                    <span className="truncate max-w-[80px] sm:max-w-[120px] font-bold">{f.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AI footer: sources + actions */}
          {isAI && (
            <div className="flex flex-col gap-1.5 mt-1 w-full">
              {message.sources?.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {message.sources.map((src, i) => (
                    <span
                      key={i}
                      className="flex items-center gap-1 text-[9px] text-violet-400 bg-violet-600/5 border border-violet-500/10 px-2 py-0.5 rounded-lg"
                    >
                      <FileText size={8} /> {src.filename} <span className="opacity-30">·</span> p.{src.page}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-0.5 opacity-50 hover:opacity-100 transition-opacity">
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-1 px-1.5 py-1 hover:bg-white/5 rounded-lg text-[9px] font-bold text-neutral-600 hover:text-neutral-400 transition-all"
                >
                  {copied ? <Check size={9} className="text-emerald-400" /> : <Copy size={9} />}
                  <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
                </button>
                <div className="w-px h-2 bg-white/5 mx-0.5" />
                <button
                  onClick={() => handleFeedback(true)}
                  className={`p-1 hover:bg-white/5 rounded-lg transition-all ${liked === true ? 'text-emerald-400' : 'text-neutral-700 hover:text-neutral-400'}`}
                >
                  <ThumbsUp size={10} />
                </button>
                <button
                  onClick={() => handleFeedback(false)}
                  className={`p-1 hover:bg-white/5 rounded-lg transition-all ${liked === false ? 'text-red-400' : 'text-neutral-700 hover:text-neutral-400'}`}
                >
                  <ThumbsDown size={10} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// ── Typing Indicator ───────────────────────────────────────────────────────────
const TypingIndicator = () => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex gap-2 mb-4"
  >
    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-violet-600/20 flex items-center justify-center flex-shrink-0 mt-0.5 border border-violet-500/20">
      <Sparkles size={11} className="text-violet-400 animate-pulse" />
    </div>
    <div className="bg-[#0e0e1c]/80 border border-white/5 rounded-2xl rounded-tl-sm px-4 py-3 backdrop-blur-md flex items-center gap-1.5">
      {[0, 150, 300].map((d) => (
        <motion.span
          key={d}
          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 0.75, repeat: Infinity, delay: d / 1000 }}
          className="w-1.5 h-1.5 rounded-full bg-violet-400"
        />
      ))}
    </div>
  </motion.div>
);

// ── Suggestion chips ───────────────────────────────────────────────────────────
const SUGGESTIONS = [
  { icon: Search,       text: 'Summarize key findings' },
  { icon: Globe,        text: 'Analyze global impact' },
  { icon: Zap,          text: 'Extract quick action items' },
  { icon: MessageSquare,text: 'What is the main topic?' },
];

// ── Main ChatPage ──────────────────────────────────────────────────────────────
const ChatPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const {
    sessions,
    currentSessionId,
    setCurrentSessionId,
    addMessage,
    createNewChat,
    getChatMessages,
    loadSessions,
    uploadDocument,
    sendMessage,
  } = useChat();

  const [input, setInput]               = useState('');
  const [isTyping, setIsTyping]         = useState(false);
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  const messagesEndRef = useRef(null);
  const scrollRef      = useRef(null);
  const textareaRef    = useRef(null);

  const messages = getChatMessages(id);
  const isEmpty  = messages.length === 0;

  // ── effects ────────────────────────────────────────────────────────────────
  useEffect(() => { if (isAuthenticated) loadSessions(); }, [loadSessions, isAuthenticated]);
  useEffect(() => { if (id && id !== currentSessionId) setCurrentSessionId(id); }, [id, currentSessionId, setCurrentSessionId]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isTyping]);

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 140) + 'px';
  }, [input]);

  useEffect(() => {
    if (location.state?.initialPrompt) {
      const prompt = location.state.initialPrompt;
      window.history.replaceState({}, document.title);
      handleSend(null, prompt);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state, id]);

  // ── send ───────────────────────────────────────────────────────────────────
  const handleSend = async (e, forcedText = null) => {
    e?.preventDefault();
    const text = forcedText ?? input.trim();
    if ((!text && !attachedFiles.length) || isTyping) return;

    let targetId = id;
    if (!targetId) {
      targetId = createNewChat();
      navigate(`/chat/${targetId}`, { replace: true });
    }

    addMessage(targetId, {
      id: Date.now(),
      sender: 'user',
      text,
      files: [...attachedFiles],
      timestamp: new Date().toISOString(),
    });

    if (!forcedText) setInput('');
    setAttachedFiles([]);
    setIsTyping(true);

    try {
      const aiText = await sendMessage(text || 'Analyze the uploaded file', targetId);
      addMessage(targetId, { id: Date.now() + 1, sender: 'ai', text: aiText, timestamp: new Date().toISOString() });
    } catch (err) {
      toast.error(err.message || 'Error processing request');
      addMessage(targetId, { id: Date.now() + 1, sender: 'ai', text: 'Encountered an issue connecting to the AI core. Please try again.', timestamp: new Date().toISOString() });
    } finally {
      setIsTyping(false);
    }
  };

  // ── file upload ────────────────────────────────────────────────────────────
  const onFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    const valid = files.filter(f => f.type === 'application/pdf');
    if (valid.length !== files.length) toast.error('Only PDF files are supported');
    if (!valid.length) return;

    for (const file of valid) {
      const tid = toast.loading(`Uploading ${file.name}…`);
      try {
        await uploadDocument(file);
        setAttachedFiles(p => [...p, file]);
        toast.success(`${file.name} ready`, { id: tid });
      } catch (err) {
        toast.error(err.message, { id: tid });
      }
    }
    e.target.value = '';
  };

  // ── redirect if no session ─────────────────────────────────────────────────
  if (!id && isAuthenticated && sessions.length > 0) {
    navigate(`/chat/${sessions[0].sessionId}`);
    return null;
  }

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <div
      className="flex flex-col bg-[#07070f] text-white font-sans relative overflow-hidden"
      style={{ height: 'calc(100dvh - 56px)' }}
    >
      {/* Guest banner */}
      {!isAuthenticated && (
        <motion.div
          initial={{ y: -40 }}
          animate={{ y: 0 }}
          className="flex-shrink-0 bg-violet-600/10 border-b border-violet-500/20 px-3 sm:px-5 py-2 flex items-center justify-between z-40 gap-3"
        >
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse flex-shrink-0" />
            <p className="text-[10px] font-black text-violet-400 uppercase tracking-widest truncate">
              Demo · History not saved
            </p>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <Link
              to="/login"
              className="text-[10px] font-black text-neutral-400 hover:text-white uppercase tracking-widest px-2.5 py-1.5 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="text-[10px] font-black bg-violet-600 text-white uppercase tracking-widest px-2.5 py-1.5 rounded-lg shadow-lg shadow-violet-600/20 hover:bg-violet-500 transition-all whitespace-nowrap"
            >
              Sign Up
            </Link>
          </div>
        </motion.div>
      )}

      {/* Ambient gradients */}
      <div className="absolute top-0 left-1/4 w-72 sm:w-[480px] h-72 sm:h-[480px] bg-violet-600/5 blur-[100px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-1/4 w-60 sm:w-[360px] h-60 sm:h-[360px] bg-indigo-600/5 blur-[80px] rounded-full pointer-events-none -z-10" />

      {/* ── Scrollable messages area ── */}
      <div
        ref={scrollRef}
        onScroll={(e) => {
          const el = e.currentTarget;
          setShowScrollBtn(el.scrollHeight - el.scrollTop - el.clientHeight > 120);
        }}
        className="flex-1 overflow-y-auto overscroll-contain"
        style={{ scrollbarWidth: 'thin', scrollbarColor: '#1f1f2e transparent' }}
      >
        <div className="max-w-2xl mx-auto w-full px-3 sm:px-5 md:px-6 py-6 sm:py-10">
          <AnimatePresence mode="popLayout">
            {isEmpty ? (
              /* ── Welcome / empty state ── */
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center min-h-[50vh] text-center px-2"
              >
                {/* Icon */}
                <div className="relative mb-6">
                  <div className="absolute -inset-4 bg-gradient-to-tr from-violet-500/15 to-indigo-500/15 rounded-full blur-2xl" />
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-[1.5rem] sm:rounded-[2rem] bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center shadow-2xl shadow-violet-500/30 border border-white/15">
                    <Sparkles size={28} className="text-white sm:hidden" />
                    <Sparkles size={36} className="text-white hidden sm:block" />
                  </div>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-3">
                  Start your research.
                </h2>
                <p className="text-neutral-500 text-sm leading-relaxed max-w-xs sm:max-w-sm mb-8">
                  Upload documents and ask precise questions. I'll turn complex papers into clear, cited insights.
                </p>

                {/* Suggestion chips */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 w-full max-w-xs sm:max-w-none">
                  {SUGGESTIONS.map((s, i) => (
                    <motion.button
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      key={i}
                      onClick={() => setInput(s.text)}
                      className="flex items-center gap-3 p-3 sm:p-4 bg-white/[0.03] border border-white/[0.07] hover:border-violet-500/30 hover:bg-white/[0.05] rounded-xl sm:rounded-2xl text-left transition-all"
                    >
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-violet-600/10 flex items-center justify-center flex-shrink-0">
                        <s.icon size={13} className="text-violet-400" />
                      </div>
                      <span className="text-[12px] sm:text-[13px] text-neutral-400 font-semibold">{s.text}</span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            ) : (
              /* ── Message list ── */
              <div key="messages" className="flex flex-col">
                {messages.map((msg) => (
                  <MessageBubble key={msg.id} message={msg} />
                ))}
                {isTyping && <TypingIndicator />}
              </div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} className="h-2" />
        </div>
      </div>

      {/* ── Scroll-to-bottom button ── */}
      <AnimatePresence>
        {showScrollBtn && (
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            onClick={() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })}
            className="absolute bottom-24 sm:bottom-28 right-4 sm:right-6 w-9 h-9 bg-[#0e0e1c] border border-white/10 rounded-xl flex items-center justify-center shadow-xl backdrop-blur-xl hover:bg-white/10 transition-all z-20"
          >
            <ChevronDown size={16} className="text-neutral-400" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Input Area ── */}
      <div className="flex-shrink-0 bg-transparent px-3 sm:px-5 pb-3 sm:pb-6 pt-2 relative z-30">
        <div className="max-w-2xl mx-auto">

          {/* Attached files strip */}
          <AnimatePresence>
            {attachedFiles.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                className="flex flex-wrap gap-1.5 mb-2 px-1"
              >
                {attachedFiles.map((f, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-1.5 bg-violet-600/10 border border-violet-500/20 px-2.5 py-1.5 rounded-xl"
                  >
                    <FileText size={11} className="text-violet-400 flex-shrink-0" />
                    <span className="text-[11px] text-white/90 font-bold max-w-[100px] sm:max-w-[150px] truncate">{f.name}</span>
                    <button
                      onClick={() => setAttachedFiles(p => p.filter((_, j) => j !== i))}
                      className="w-4 h-4 rounded-full hover:bg-white/10 flex items-center justify-center text-neutral-500 hover:text-white transition-colors text-sm leading-none"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main input box */}
          <div className="relative">
            <div className="bg-[#0d0d1a]/95 border border-white/[0.08] rounded-2xl sm:rounded-[1.5rem] focus-within:border-violet-500/40 focus-within:bg-[#0e0e1c] transition-all duration-300 backdrop-blur-xl ring-1 ring-white/[0.03] shadow-[0_-10px_30px_-8px_rgba(7,7,15,0.8)]">
              
              {/* Textarea row */}
              <div className="flex items-end gap-1 px-2 py-2 sm:px-3 sm:py-2.5">
                {/* Attach */}
                <label className="p-2 text-neutral-600 hover:text-violet-400 transition-all cursor-pointer rounded-xl hover:bg-white/5 flex-shrink-0">
                  <Paperclip size={16} />
                  <input type="file" className="hidden" multiple accept=".pdf" onChange={onFileUpload} />
                </label>

                {/* Textarea */}
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
                  }}
                  placeholder="Ask Deep Assistant anything…"
                  rows={1}
                  className="flex-1 bg-transparent border-none focus:ring-0 text-[13px] sm:text-[14px] text-white placeholder:text-neutral-700 resize-none py-2 px-2 max-h-36 leading-relaxed font-medium min-w-0"
                />

                {/* Send button */}
                <button
                  onClick={handleSend}
                  disabled={(!input.trim() && !attachedFiles.length) || isTyping}
                  className={`
                    w-8 h-8 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-200
                    ${(!input.trim() && !attachedFiles.length) || isTyping
                      ? 'bg-white/[0.03] text-neutral-800 cursor-not-allowed'
                      : 'bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-600/25 hover:scale-105 active:scale-95'
                    }
                  `}
                >
                  {isTyping
                    ? <RotateCcw size={13} className="animate-spin" />
                    : <Send size={13} className="translate-x-px" />
                  }
                </button>
              </div>
            </div>
          </div>

          {/* Footer label */}
          <div className="flex items-center justify-center gap-3 mt-2 sm:mt-3 opacity-25">
            <div className="flex items-center gap-1">
              <Shield size={8} className="text-neutral-600" />
              <span className="text-[8px] sm:text-[9px] text-neutral-600 font-bold uppercase tracking-widest">End-to-End Encrypted</span>
            </div>
            <span className="text-neutral-700">·</span>
            <span className="text-[8px] sm:text-[9px] text-neutral-600 font-bold uppercase tracking-widest">Deep Research v2.5</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;