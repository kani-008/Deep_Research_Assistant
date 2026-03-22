import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Paperclip, FileText, Copy, ThumbsUp, ThumbsDown,
  Sparkles, RotateCcw, Check, ChevronDown, Plus, 
  Search, Shield, Zap, Globe, MessageSquare, LogIn, UserPlus
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
      return <code key={i} className="bg-white/10 text-violet-300 px-1.5 py-0.5 rounded-md text-[0.75rem] font-mono border border-white/5">{p.slice(1, -1)}</code>;
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
      const parts = line.split(' ');
      const lang = parts[1] || 'code';
      const code = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) { code.push(lines[i]); i++; }
      els.push(
        <div key={i} className="relative group my-4">
          <div className="absolute top-0 right-0 px-3 py-1 text-[10px] font-bold text-neutral-500 uppercase tracking-widest bg-white/5 rounded-bl-xl border-l border-b border-white/10 backdrop-blur-md">
            {lang}
          </div>
          <pre className="bg-[#0d0d1a] border border-white/10 rounded-2xl p-4 sm:p-5 overflow-x-auto text-emerald-400 text-xs sm:text-[13px] font-mono leading-relaxed shadow-inner">
            <code>{code.join('\n')}</code>
          </pre>
        </div>
      );
    } else if (line.startsWith('### ')) {
      els.push(<h3 key={i} className="text-sm sm:text-base font-black text-white mt-6 mb-2">{line.slice(4)}</h3>);
    } else if (line.startsWith('## ')) {
      els.push(<h2 key={i} className="text-base sm:text-lg font-black text-white mt-8 mb-3 border-b border-white/5 pb-1">{line.slice(3)}</h2>);
    } else if (line.startsWith('# ')) {
      els.push(<h1 key={i} className="text-lg sm:text-xl font-black text-white mt-10 mb-4">{line.slice(2)}</h1>);
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      els.push(
        <div key={i} className="flex gap-3 my-1.5 pl-1">
          <span className="mt-2.5 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-violet-500 shadow-sm shadow-violet-500/50" />
          <span className="text-neutral-300 text-[13px] sm:text-[15px] leading-relaxed">{renderInline(line.slice(2))}</span>
        </div>
      );
    } else if (/^\d+\.\s/.test(line)) {
      const num = line.match(/^(\d+)\./)[1];
      els.push(
        <div key={i} className="flex gap-3 my-1.5 pl-1">
          <span className="text-violet-500 text-xs sm:text-sm font-black mt-1 w-5 flex-shrink-0">{num}.</span>
          <span className="text-neutral-300 text-[13px] sm:text-[15px] leading-relaxed">{renderInline(line.replace(/^\d+\.\s/, ''))}</span>
        </div>
      );
    } else if (line.trim() === '') {
      els.push(<div key={i} className="h-3" />);
    } else {
      els.push(<p key={i} className="text-neutral-300 text-[13px] sm:text-[15px] leading-relaxed mb-4">{renderInline(line)}</p>);
    }
    i++;
  }
  return els;
};

// ── Message bubble ─────────────────────────────────────────────────────────────
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
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex w-full mb-6 ${isAI ? 'justify-start' : 'justify-end'}`}
    >
      <div className={`flex gap-3 max-w-[85%] sm:max-w-[75%] ${isAI ? 'flex-row' : 'flex-row-reverse'}`}>
        {/* Avatar - Only for AI */}
        {isAI ? (
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center flex-shrink-0 mt-1 shadow-lg shadow-violet-500/20">
            <Sparkles size={14} className="text-white" />
          </div>
        ) : (
          <div className="w-2" /> // Spacer for user side to align bubbles slightly
        )}

        {/* Bubble Content */}
        <div className={`flex-1 min-w-0 flex flex-col ${isAI ? 'items-start' : 'items-end'} gap-1`}>
          {isAI && (
            <div className="flex items-center gap-2 px-1 mb-1">
              <span className="text-[9px] font-black text-neutral-600 uppercase tracking-widest">Assistant</span>
              <span className="text-[9px] text-neutral-800 font-medium">
                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          )}

          <div className={`
            relative p-3 sm:p-3.5 rounded-2xl overflow-hidden shadow-sm
            ${isAI 
              ? 'bg-[#0e0e1c]/90 border border-white/5 rounded-tl-sm backdrop-blur-md' 
              : 'bg-violet-600 text-white rounded-tr-sm shadow-violet-900/10'
            }
          `}>
            {isAI && (
              <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
            )}
            
            <div className={isAI ? 'relative z-10' : ''}>
              {isAI ? (
                <div className="text-[13px] sm:text-[14px] leading-relaxed text-neutral-200">
                   {renderContent(message.text)}
                </div>
              ) : (
                <p className="text-[13px] sm:text-[14px] leading-relaxed font-medium">{message.text}</p>
              )}
            </div>

            {/* User attached files */}
            {!isAI && message.files?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-white/10">
                {message.files.map((f, i) => (
                  <div key={i} className="flex items-center gap-1.5 bg-white/10 border border-white/10 text-[10px] px-2 py-1 rounded-lg backdrop-blur-sm">
                    <FileText size={10} className="text-violet-200" />
                    <span className="truncate max-w-[100px] font-bold">{f.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AI Sources & Metadata */}
          {isAI && (
            <div className="flex flex-col gap-2 mt-2 w-full">
              {message.sources?.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {message.sources.map((src, i) => (
                    <motion.span whileHover={{ scale: 1.02 }} key={i} className="flex items-center gap-1 text-[10px] text-violet-400 bg-violet-600/5 border border-violet-500/10 px-2.5 py-1 rounded-lg cursor-default transition-all hover:bg-violet-600/10">
                      <FileText size={9} /> {src.filename} <span className="opacity-30">•</span> {src.page}
                    </motion.span>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-0.5 opacity-60 hover:opacity-100 transition-opacity">
                <button onClick={copyToClipboard} className="flex items-center gap-1 p-1.5 hover:bg-white/[0.03] rounded-lg text-[9px] font-bold text-neutral-600 hover:text-neutral-400 transition-all">
                  {copied ? <Check size={10} className="text-emerald-400" /> : <Copy size={10} />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
                <div className="w-px h-2 bg-white/5 mx-1" />
                <button onClick={() => handleFeedback(true)} className={`p-1.5 hover:bg-white/[0.03] rounded-lg transition-all ${liked === true ? 'text-emerald-400' : 'text-neutral-700 hover:text-neutral-400'}`}>
                  <ThumbsUp size={11} />
                </button>
                <button onClick={() => handleFeedback(false)} className={`p-1.5 hover:bg-white/[0.03] rounded-lg transition-all ${liked === false ? 'text-red-400' : 'text-neutral-700 hover:text-neutral-400'}`}>
                  <ThumbsDown size={11} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const TypingIndicator = () => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="flex gap-3 mb-8"
  >
    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center flex-shrink-0 shadow-lg shadow-violet-500/20">
      <Sparkles size={16} className="text-white animate-pulse" />
    </div>
    <div className="flex-1 max-w-[100px]">
      <div className="flex items-center gap-3 px-1 mb-1.5">
        <span className="text-[10px] font-black text-neutral-600 uppercase tracking-widest">Deep Assistant</span>
      </div>
      <div className="bg-[#0e0e1c]/80 border border-white/5 rounded-3xl rounded-tl-sm p-4 backdrop-blur-md flex items-center justify-center gap-1.5 h-11">
        {[0, 150, 300].map(d => (
          <motion.span 
            key={d} 
            animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 0.8, repeat: Infinity, delay: d/1000 }}
            className="w-1.5 h-1.5 rounded-full bg-violet-400" 
          />
        ))}
      </div>
    </div>
  </motion.div>
);

const SUGGESTIONS = [
  { icon: Search, text: 'Summarize key findings' },
  { icon: Globe, text: 'Analyze global impact' },
  { icon: Zap, text: 'Extract quick action items' },
  { icon: MessageSquare, text: 'What is the main topic?' },
];

const ChatPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const {
    sessions,
    currentSessionId,
    setCurrentSessionId,
    addMessage,
    createNewChat,
    getChatMessages,
    loadSessions,
    uploadDocument,
    sendMessage
  } = useChat();
  
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  
  const messagesEndRef = useRef(null);
  const scrollRef = useRef(null);
  const textareaRef = useRef(null);
  
  const messages = getChatMessages(id);

  useEffect(() => { 
    if (isAuthenticated) loadSessions(); 
  }, [loadSessions, isAuthenticated]);
  useEffect(() => { if (id && id !== currentSessionId) setCurrentSessionId(id); }, [id, currentSessionId, setCurrentSessionId]);
  useEffect(() => { 
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); 
  }, [messages, isTyping]);
  
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 160) + 'px';
    }
  }, [input]);

  useEffect(() => {
    if (location.state?.initialPrompt) {
      const prompt = location.state.initialPrompt;
      window.history.replaceState({}, document.title);
      handleSend(null, prompt);
    }
  }, [location.state, id]);

  const handleSend = async (e, forcedText = null) => {
    e?.preventDefault();
    const textToUse = forcedText || input.trim();
    if ((!textToUse && !attachedFiles.length) || isTyping) return;
    
    let targetId = id;
    if (!targetId) { 
      targetId = createNewChat(); 
      navigate(`/chat/${targetId}`, { replace: true }); 
    }
    
    addMessage(targetId, { 
      id: Date.now(), 
      sender: 'user', 
      text: textToUse, 
      files: [...attachedFiles], 
      timestamp: new Date().toISOString() 
    });
    
    if (!forcedText) setInput(''); 
    setAttachedFiles([]); 
    setIsTyping(true);
    
    try {
      const aiText = await sendMessage(textToUse || 'Analyze the uploaded file', targetId);
      addMessage(targetId, { id: Date.now() + 1, sender: 'ai', text: aiText, timestamp: new Date().toISOString() });
    } catch (err) {
      toast.error(err.message || 'Error processing request');
      addMessage(targetId, { id: Date.now() + 1, sender: 'ai', text: 'Encountered an issue connecting to the AI core. Please try again.', timestamp: new Date().toISOString() });
    } finally { setIsTyping(false); }
  };

  const onFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    const valid = files.filter(f => f.type === 'application/pdf');
    if (valid.length !== files.length) toast.error('Only PDF files supported');
    if (!valid.length) return;

    for (const file of valid) {
      const tid = toast.loading(`Preparing ${file.name}…`);
      try {
        await uploadDocument(file);
        setAttachedFiles(p => [...p, file]);
        toast.success(`${file.name} uploaded`, { id: tid });
      } catch (err) {
        toast.error(err.message, { id: tid });
      }
    }
    e.target.value = '';
  };

  const isEmpty = messages.length === 0;

  if (!id && isAuthenticated && sessions.length > 0) {
    navigate(`/chat/${sessions[0].sessionId}`);
    return null;
  }

  return (
    <div className="flex flex-col bg-[#07070f] relative overflow-hidden" style={{ height: 'calc(100vh - 56px)' }}>
      
      {/* Professional Guest Banner */}
      {!isAuthenticated && (
        <motion.div 
          initial={{ y: -50 }}
          animate={{ y: 0 }}
          className="bg-violet-600/10 border-b border-violet-500/20 px-4 py-2.5 flex items-center justify-between backdrop-blur-md z-40"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
            <p className="text-[11px] font-black text-violet-400 uppercase tracking-widest">
              Demo Environment <span className="text-neutral-600 mx-1">•</span> History will not be saved
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/login" className="text-[10px] font-black text-neutral-400 hover:text-white uppercase tracking-widest px-3 py-1.5 transition-colors">Sign In</Link>
            <Link to="/signup" className="text-[10px] font-black bg-violet-600 text-white uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-lg shadow-violet-600/20 hover:bg-violet-500 transition-all">Sign Up Free</Link>
          </div>
        </motion.div>
      )}
      {/* Decorative backdrop gradients */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-violet-600/5 blur-[120px] rounded-full pointer-events-none -z-10 animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-indigo-600/5 blur-[100px] rounded-full pointer-events-none -z-10" />

      {/* Main viewport */}
      <div
        ref={scrollRef}
        onScroll={(e) => setShowScrollBtn(e.target.scrollHeight - e.target.scrollTop - e.target.clientHeight > 150)}
        className="flex-1 overflow-y-auto overscroll-contain no-scrollbar"
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6 md:px-8 py-10 sm:py-16">
          <AnimatePresence mode="popLayout">
            {isEmpty ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="flex flex-col items-center justify-center min-h-[55vh] text-center"
              >
                <div className="relative mb-8">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                    className="absolute -inset-4 bg-gradient-to-tr from-violet-500/20 to-indigo-500/20 rounded-full blur-2xl" 
                  />
                  <div className="relative w-20 h-20 rounded-[2rem] bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center shadow-2xl shadow-violet-500/40 border border-white/20">
                    <Sparkles size={40} className="text-white" />
                  </div>
                </div>

                <div className="max-w-md mx-auto mb-12">
                  <h2 className="text-3xl font-black tracking-tight text-white mb-4 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/70">
                    Start your research.
                  </h2>
                  <p className="text-neutral-500 text-[15px] leading-relaxed">
                    Upload your documents and ask precise questions. I'll translate complex papers into clear, cited insights.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                  {SUGGESTIONS.map((s, i) => (
                    <motion.button 
                      whileHover={{ scale: 1.02, translateY: -2 }}
                      whileTap={{ scale: 0.98 }}
                      key={i} 
                      onClick={() => setInput(s.text)}
                      className="flex items-center gap-3 p-4 bg-white/[0.03] border border-white/[0.08] hover:border-violet-500/30 hover:bg-white/[0.05] rounded-2xl text-left transition-all"
                    >
                      <div className="w-8 h-8 rounded-xl bg-violet-600/10 flex items-center justify-center flex-shrink-0">
                        <s.icon size={14} className="text-violet-400" />
                      </div>
                      <span className="text-[13px] sm:text-[14px] text-neutral-400 font-bold group-hover:text-white">{s.text}</span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            ) : (
              <div key="messages">
                {messages.map(msg => <MessageBubble key={msg.id} message={msg} />)}
                {isTyping && <TypingIndicator />}
              </div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} className="h-4" />
        </div>
      </div>

      {/* Floating UI Elements */}
      <AnimatePresence>
        {showScrollBtn && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            onClick={() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })}
            className="absolute bottom-32 right-6 w-10 h-10 bg-white/[0.05] border border-white/10 rounded-2xl flex items-center justify-center shadow-2xl backdrop-blur-xl hover:bg-white/[0.08] transition-all z-20 group"
          >
            <ChevronDown size={18} className="text-neutral-400 group-hover:text-white group-hover:translate-y-0.5 transition-all" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Input Area */}
      <div className="border-t border-white/[0.05] bg-[#07070f]/95 backdrop-blur-md px-4 py-4 sm:py-6 relative z-30">
        <div className="max-w-3xl mx-auto relative">
          {/* File attachments bar */}
          <AnimatePresence>
            {attachedFiles.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="flex flex-wrap gap-2 mb-3 px-1"
              >
                {attachedFiles.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 bg-violet-600/10 border border-violet-500/20 px-3 py-2 rounded-2xl">
                    <FileText size={12} className="text-violet-400" />
                    <span className="text-xs text-white/90 font-bold max-w-[150px] truncate">{f.name}</span>
                    <button onClick={() => setAttachedFiles(p => p.filter((_, j) => j !== i))} className="w-5 h-5 rounded-full hover:bg-white/10 flex items-center justify-center text-neutral-500 hover:text-white transition-colors">×</button>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Glass Input Container */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-600/20 to-indigo-600/20 rounded-[1.8rem] opacity-0 group-focus-within:opacity-100 blur transition duration-500" />
            <div className={`
              relative bg-[#0d0d1a] border border-white/[0.08] rounded-[1.6rem] 
              focus-within:border-violet-500/40 focus-within:bg-[#0e0e1c]
              transition-all duration-300 shadow-xl
            `}>
              <div className="flex items-end p-2 sm:p-2.5">
                <label className="p-3 text-neutral-600 hover:text-violet-400 transition-all cursor-pointer rounded-2xl hover:bg-white/[0.05] group">
                  <Paperclip size={20} className="group-hover:rotate-12 transition-transform" />
                  <input type="file" className="hidden" multiple accept=".pdf" onChange={onFileUpload} />
                </label>

                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  placeholder="Ask Deep Assistant anything…"
                  rows={1}
                  className="flex-1 bg-transparent border-none focus:ring-0 text-[15px] text-white placeholder:text-neutral-700 resize-none py-3 px-2 max-h-40 leading-relaxed font-medium"
                />

                <div className="flex items-center gap-2 pr-1 pb-1">
                  <button
                    onClick={handleSend}
                    disabled={(!input.trim() && !attachedFiles.length) || isTyping}
                    className={`
                      w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-300
                      ${(!input.trim() && !attachedFiles.length) || isTyping
                        ? 'bg-white/[0.04] text-neutral-700 cursor-not-allowed opacity-50'
                        : 'bg-violet-600 hover:bg-violet-500 text-white shadow-xl shadow-violet-600/30 ring-2 ring-violet-400/20 hover:scale-105 active:scale-95'
                      }
                    `}
                  >
                    {isTyping ? <RotateCcw size={18} className="animate-spin" /> : <Send size={18} className="translate-x-0.5 -translate-y-0.5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between px-4 mt-3">
             <div className="flex items-center gap-1.5 opacity-40">
                <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">System Secure</span>
             </div>
             <p className="text-[10px] text-neutral-700 font-bold uppercase tracking-[0.2em]">
                Deep Assistant <span className="text-neutral-800 mx-1">/</span> V2.5 Professional
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
