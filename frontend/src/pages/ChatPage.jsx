// ./frontend/src/pages/ChatPage.jsx

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Send, Paperclip, FileText, Copy, ThumbsUp, ThumbsDown,
  Sparkles, RotateCcw, Check, ChevronDown,
} from 'lucide-react';
import { useChat } from '../context/ChatContext';
import toast from 'react-hot-toast';
import { sendMessage, uploadFile, updateChatFeedback } from '../api/api';

// ─── Markdown-like renderer ───────────────────────────────────────────────────

const formatInline = (text) => {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**'))
      return <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
    if (part.startsWith('`') && part.endsWith('`'))
      return <code key={i} className="bg-black/40 text-emerald-400 px-1.5 py-0.5 rounded text-xs font-mono">{part.slice(1, -1)}</code>;
    return part;
  });
};

const renderText = (text) => {
  if (!text) return null;
  const lines    = text.split('\n');
  const elements = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith('```')) {
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) { codeLines.push(lines[i]); i++; }
      elements.push(
        <pre key={i} className="bg-black/40 border border-white/10 rounded-xl p-4 my-3 overflow-x-auto">
          <code className="text-emerald-400 text-sm font-mono">{codeLines.join('\n')}</code>
        </pre>
      );
    } else if (line.startsWith('### ')) {
      elements.push(<h3 key={i} className="text-base font-bold text-white mt-4 mb-1">{line.slice(4)}</h3>);
    } else if (line.startsWith('## ')) {
      elements.push(<h2 key={i} className="text-lg font-bold text-white mt-5 mb-2">{line.slice(3)}</h2>);
    } else if (line.startsWith('# ')) {
      elements.push(<h1 key={i} className="text-xl font-bold text-white mt-5 mb-2">{line.slice(2)}</h1>);
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      elements.push(
        <div key={i} className="flex gap-2 my-0.5">
          <span className="mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-primary" />
          <span className="text-neutral-200 text-sm leading-relaxed">{formatInline(line.slice(2))}</span>
        </div>
      );
    } else if (/^\d+\.\s/.test(line)) {
      const num = line.match(/^(\d+)\./)[1];
      elements.push(
        <div key={i} className="flex gap-3 my-0.5">
          <span className="text-primary font-bold text-xs mt-0.5 flex-shrink-0 w-4">{num}.</span>
          <span className="text-neutral-200 text-sm leading-relaxed">{formatInline(line.replace(/^\d+\.\s/, ''))}</span>
        </div>
      );
    } else if (line.trim() === '') {
      elements.push(<div key={i} className="h-2" />);
    } else {
      elements.push(
        <p key={i} className="text-neutral-200 text-sm leading-relaxed">{formatInline(line)}</p>
      );
    }
    i++;
  }
  return elements;
};

// ─── Message Bubble ───────────────────────────────────────────────────────────

const MessageBubble = ({ message }) => {
  const isAI      = message.sender === 'ai';
  const [copied, setCopied]  = useState(false);
  const [liked,  setLiked]   = useState(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFeedback = async (value) => {
    setLiked(value);
    if (message.chatId) {
      try {
        await updateChatFeedback(message.chatId, { rating: value ? 5 : 1, isAccurate: value });
      } catch {/* silent */}
    }
  };

  if (!isAI) {
    return (
      <div className="flex justify-end mb-6 group">
        <div className="max-w-[75%]">
          <div className="bg-primary/20 border border-primary/30 text-white rounded-2xl rounded-tr-sm px-5 py-3.5 text-sm leading-relaxed">
            {message.text}
          </div>
          {message.files?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2 justify-end">
              {message.files.map((file, i) => (
                <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-neutral-400">
                  <FileText size={12} className="text-primary" />
                  {file.name}
                </div>
              ))}
            </div>
          )}
          <p className="text-[10px] text-neutral-600 mt-1.5 text-right">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8 group">
      <div className="flex gap-3 items-start">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0 mt-0.5 shadow-lg shadow-primary/20">
          <Sparkles size={15} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Deep Assistant</span>
            <span className="text-[10px] text-neutral-600">
              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          <div className="text-neutral-200 space-y-1">{renderText(message.text)}</div>

          {message.sources?.length > 0 && (
            <div className="mt-4 pt-4 border-t border-white/5">
              <p className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest mb-2">Sources</p>
              <div className="flex flex-wrap gap-2">
                {message.sources.map((source, i) => (
                  <div key={i} className="px-2.5 py-1 bg-primary/5 border border-primary/20 rounded-lg text-[11px] font-medium text-primary flex items-center gap-1.5">
                    <FileText size={10} />
                    {source.filename} · p.{source.page}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={handleCopy} className="p-1.5 hover:bg-white/10 rounded-lg text-neutral-600 hover:text-neutral-300 transition-colors flex items-center gap-1.5 text-xs">
              {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
            <button onClick={() => handleFeedback(true)} className={`p-1.5 hover:bg-white/10 rounded-lg transition-colors ${liked === true ? 'text-emerald-400' : 'text-neutral-600 hover:text-neutral-300'}`}>
              <ThumbsUp size={13} />
            </button>
            <button onClick={() => handleFeedback(false)} className={`p-1.5 hover:bg-white/10 rounded-lg transition-colors ${liked === false ? 'text-red-400' : 'text-neutral-600 hover:text-neutral-300'}`}>
              <ThumbsDown size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const TypingIndicator = () => (
  <div className="mb-8 flex gap-3 items-start">
    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary/20">
      <Sparkles size={15} className="text-white animate-pulse" />
    </div>
    <div className="flex-1">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Deep Assistant</span>
      </div>
      <div className="flex items-center gap-1.5 py-2">
        <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  </div>
);

const SUGGESTIONS = [
  'Summarize the key findings in my documents',
  'What are the main topics covered?',
  'Compare the methodologies across documents',
  'Extract all important dates and deadlines',
];

// ─── Main ChatPage ────────────────────────────────────────────────────────────

const ChatPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    sessions,
    currentSessionId,
    setCurrentSessionId,
    addMessage,
    createNewChat,
    getChatMessages,
    loadSessions,
  } = useChat();

  const [input,         setInput]         = useState('');
  const [isTyping,      setIsTyping]       = useState(false);
  const [attachedFiles, setAttachedFiles]  = useState([]);
  const [showScrollBtn, setShowScrollBtn]  = useState(false);

  const messagesEndRef = useRef(null);
  const scrollAreaRef  = useRef(null);
  const textareaRef    = useRef(null);

  const currentMessages = getChatMessages(id);

  // Load sessions from MongoDB on first mount
  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  // Sync URL param → current session
  useEffect(() => {
    if (id && id !== currentSessionId) setCurrentSessionId(id);
  }, [id]);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages, isTyping]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  }, [input]);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    setShowScrollBtn(scrollHeight - scrollTop - clientHeight > 200);
  };

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  // ─── Send message ─────────────────────────────────────────────────────────

  const handleSend = async (e) => {
    e?.preventDefault();
    const trimmed = input.trim();
    if ((!trimmed && attachedFiles.length === 0) || isTyping) return;

    // Create new session if none active
    let targetId = id;
    if (!targetId) {
      targetId = createNewChat();
      navigate(`/chat/${targetId}`);
    }

    // Optimistic user message
    const userMessage = {
      id:        Date.now(),
      sender:    'user',
      text:      trimmed,
      files:     [...attachedFiles],
      timestamp: new Date().toISOString(),
    };
    addMessage(targetId, userMessage);
    setInput('');
    setAttachedFiles([]);
    setIsTyping(true);

    try {
      // POST /api/chat → stored in MongoDB, returns AI answer string
      const aiText = await sendMessage(trimmed || 'Analyze the uploaded file', targetId);

      addMessage(targetId, {
        id:        Date.now() + 1,
        sender:    'ai',
        text:      aiText,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      toast.error(err.message || 'Failed to reach Deep Assistant');
      addMessage(targetId, {
        id:        Date.now() + 1,
        sender:    'ai',
        text:      'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString(),
      });
    } finally {
      setIsTyping(false);
    }
  };

  // ─── File upload ──────────────────────────────────────────────────────────

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    const valid = files.filter((f) => f.type === 'application/pdf');
    if (valid.length !== files.length) toast.error('Only PDF files are supported');
    if (!valid.length) return;

    for (const file of valid) {
      const toastId = toast.loading(`Uploading ${file.name}…`);
      try {
        await uploadFile(file, id);
        setAttachedFiles((prev) => [...prev, file]);
        toast.success(`${file.name} ready`, { id: toastId });
      } catch (err) {
        toast.error(`Failed: ${err.message}`, { id: toastId });
      }
    }
  };

  // Redirect to first session if no id and sessions exist
  if (!id && sessions.length > 0) {
    navigate(`/chat/${sessions[0].sessionId}`);
    return null;
  }

  const isEmpty = currentMessages.length === 0;

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] relative bg-background">
      {/* Messages area */}
      <div
        ref={scrollAreaRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto custom-scrollbar"
      >
        <div className="max-w-3xl mx-auto px-4 md:px-6 py-8">
          {isEmpty ? (
            /* Welcome screen */
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-2xl shadow-primary/30">
                  <Sparkles size={32} className="text-white" />
                </div>
                <div className="absolute -inset-2 bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl blur-xl -z-10" />
              </div>
              <div className="space-y-3">
                <h2 className="text-2xl md:text-3xl font-bold text-white">How can I help you today?</h2>
                <p className="text-neutral-400 text-sm max-w-md">
                  Ask me anything about your uploaded documents. I'll search through them and give you precise, accurate answers.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl">
                {SUGGESTIONS.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(s)}
                    className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-2xl text-sm text-neutral-300 hover:text-white text-left transition-all group"
                  >
                    <span className="text-primary mr-2 group-hover:translate-x-0.5 inline-block transition-transform">→</span>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {currentMessages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
              {isTyping && <TypingIndicator />}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Scroll-to-bottom button */}
      {showScrollBtn && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-28 right-6 p-2.5 bg-surface border border-white/10 rounded-full shadow-xl hover:bg-white/10 transition-all z-10"
        >
          <ChevronDown size={18} className="text-neutral-400" />
        </button>
      )}

      {/* Input area */}
      <div className="border-t border-white/5 bg-background/95 backdrop-blur-xl px-4 py-4">
        <div className="max-w-3xl mx-auto">
          {/* Attached files */}
          {attachedFiles.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {attachedFiles.map((file, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white">
                  <FileText size={12} className="text-primary" />
                  <span className="max-w-[120px] truncate">{file.name}</span>
                  <button
                    onClick={() => setAttachedFiles((prev) => prev.filter((_, idx) => idx !== i))}
                    className="text-neutral-500 hover:text-red-400 transition-colors"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Input box */}
          <div className="relative bg-white/5 border border-white/10 rounded-2xl hover:border-white/20 focus-within:border-primary/50 focus-within:bg-white/[0.07] transition-all shadow-xl">
            <div className="flex items-end gap-2 p-3">
              {/* Attach */}
              <label className="p-2 text-neutral-500 hover:text-white transition-colors cursor-pointer rounded-xl hover:bg-white/5 flex-shrink-0">
                <Paperclip size={19} />
                <input type="file" className="hidden" multiple accept=".pdf" onChange={handleFileUpload} />
              </label>

              {/* Textarea */}
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
                }}
                placeholder="Message Deep Assistant…"
                rows={1}
                className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder:text-neutral-600 resize-none py-1.5 max-h-48 custom-scrollbar leading-relaxed"
              />

              {/* Send */}
              <button
                onClick={handleSend}
                disabled={(!input.trim() && !attachedFiles.length) || isTyping}
                className={`p-2.5 rounded-xl transition-all flex-shrink-0 ${
                  (!input.trim() && !attachedFiles.length) || isTyping
                    ? 'bg-white/5 text-neutral-600 cursor-not-allowed'
                    : 'bg-primary hover:bg-primary/80 text-white shadow-lg shadow-primary/20'
                }`}
              >
                {isTyping
                  ? <RotateCcw size={18} className="animate-spin" />
                  : <Send size={18} />
                }
              </button>
            </div>
          </div>

          <p className="text-center text-[10px] text-neutral-700 mt-2 tracking-wider uppercase">
            Deep Assistant can make mistakes · Verify important information
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;