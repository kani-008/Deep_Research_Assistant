// ./frontend/src/pages/ChatPage.jsx

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Send, 
  Paperclip, 
  FileText, 
  Cpu, 
  User, 
  Copy, 
  RefreshCw, 
  ThumbsUp, 
  ThumbsDown,
  Sparkles,
  Search,
  ChevronDown,
  MessageSquare,
  Plus
} from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { sendMessage, uploadFile } from '../api/api';

const MessageBubble = ({ message }) => {
  const isAI = message.sender === 'ai';
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={`flex gap-4 p-4 md:p-6 mb-2 rounded-[1.5rem] leading-relaxed transition-all group ${
        isAI ? 'chat-bubble-ai border-l-4 border-l-primary/50' : 'chat-bubble-user ml-12 border-l-4 border-l-accent/50 self-end'
      }`}
    >
      <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center font-bold text-white shadow-xl ${
        isAI ? 'bg-primary' : 'bg-accent'
      }`}>
        {isAI ? <Cpu size={20} /> : <User size={20} />}
      </div>
      <div className="flex-1 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-neutral-500 uppercase tracking-widest">{isAI ? 'Deep Assistant' : 'You'}</span>
          <div className="opacity-0 group-hover:opacity-100 flex items-center gap-3 text-neutral-500 transition-all">
            <button className="hover:text-white"><Copy size={14} /></button>
            {isAI && (
              <>
                <button className="hover:text-white"><ThumbsUp size={14} /></button>
                <button className="hover:text-white"><ThumbsDown size={14} /></button>
              </>
            )}
          </div>
        </div>
        <div className="text-[15px] font-medium leading-[1.6]">
          {message.text}
        </div>
        
        {message.files && message.files.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {message.files.map((file, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-neutral-300">
                <FileText size={14} className="text-primary" />
                <span>{file.name}</span>
              </div>
            ))}
          </div>
        )}

        {isAI && message.sources && (
          <div className="pt-4 border-t border-white/5 animate-fade-in">
            <p className="text-[11px] font-black text-neutral-600 uppercase tracking-widest mb-2 flex items-center gap-2">
              <Search size={12} />
              Verified Sources
            </p>
            <div className="flex flex-wrap gap-2">
              {message.sources.map((source, i) => (
                <div key={i} className="px-3 py-1 bg-primary/5 border border-primary/20 rounded-lg text-[11px] font-bold text-primary flex items-center gap-1.5 cursor-pointer hover:bg-primary/10 transition-colors">
                  <FileText size={10} />
                  <span>{source.filename} (Page {source.page})</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

const ChatPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { sessions, currentSessionId, setCurrentSessionId, addMessage, createNewChat, getChatMessages } = useChat();
  
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState([]);
  const messagesEndRef = useRef(null);

  const currentMessages = getChatMessages(id);
  const session = sessions.find(s => s.sessionId === id);

  useEffect(() => {
    if (id && id !== currentSessionId) {
      setCurrentSessionId(id);
    } else if (!id) {
       // If no ID, handle it
    }
  }, [id]);

  useEffect(() => {
    scrollToBottom();
  }, [currentMessages, isTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (e) => {
    e?.preventDefault();
    if ((!input.trim() && attachedFiles.length === 0) || isTyping) return;

    let targetId = id;
    if (!targetId) {
      targetId = createNewChat();
      navigate(`/chat/${targetId}`);
    }

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: input,
      files: [...attachedFiles],
      timestamp: new Date().toISOString()
    };

    addMessage(targetId, userMessage);
    setInput('');
    setAttachedFiles([]);
    setIsTyping(true);

    try {
      // Real API Call
      const aiText = await sendMessage(input || "Analyze the uploaded file", targetId);
      
      const aiResponse = {
        id: Date.now() + 1,
        sender: 'ai',
        text: aiText,
        timestamp: new Date().toISOString()
      };
      addMessage(targetId, aiResponse);
    } catch (err) {
      toast.error(err.message || 'Failed to communicate with Deep Assistant');
      addMessage(targetId, {
        id: Date.now() + 1,
        sender: 'ai',
        text: 'Sorry, I encountered an internal error. Please try again.',
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(f => f.type === 'application/pdf');
    if (validFiles.length !== files.length) {
      toast.error('Only PDF files are allowed for ingestion');
    }
    if (validFiles.length === 0) return;

    for (const file of validFiles) {
      let loadingId;
      try {
        loadingId = toast.loading(`Uploading ${file.name}...`);
        await uploadFile(file, id);
        setAttachedFiles(prev => [...prev, file]);
        toast.success(`${file.name} uploaded and indexed successfully!`, { id: loadingId });
      } catch (err) {
        toast.error(`Failed to upload ${file.name}: ${err.message}`, { id: loadingId });
      }
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInput(suggestion);
  };

  if (!id && sessions.length > 0) {
    navigate(`/chat/${sessions[0].sessionId}`);
    return null;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden relative">
      {/* Background patterns */}
      <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden opacity-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary rounded-full blur-[100px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent rounded-full blur-[100px]"></div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-6 custom-scrollbar">
        {currentMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-2xl mx-auto space-y-8 animate-fade-in pt-20">
            <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-tr from-primary to-accent flex items-center justify-center shadow-2xl animate-bounce">
              <Sparkles size={40} className="text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-white mb-4">Deep Research Assistant</h2>
              <p className="text-lg text-neutral-400 font-medium">Hello! I'm your research assistant. Ask me anything about your documents or start a new analysis.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
              {[
                "Summarize my recent research papers",
                "Compare the methodology sections",
                "Find discrepancies in data results",
                "Draft a report on the main findings"
              ].map((query, i) => (
                <button 
                  key={i} 
                  onClick={() => handleSuggestionClick(query)}
                  className="p-4 bg-white/5 border border-white/5 rounded-2xl text-sm font-bold text-neutral-400 hover:bg-white/10 hover:text-white transition-all text-left flex items-center gap-3 group"
                >
                  <MessageSquare size={16} className="text-primary group-hover:scale-110 transition-transform" />
                  {query}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-4">
            {currentMessages.map(msg => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            
            {isTyping && (
              <div className="flex gap-4 p-6 chat-bubble-ai rounded-[1.5rem] w-fit border-l-4 border-l-primary/30">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center animate-pulse">
                  <Cpu size={20} className="text-white" />
                </div>
                <div className="flex flex-col gap-2 justify-center">
                  <div className="flex gap-1.5 items-center">
                    <div className="w-2 h-2 bg-neutral-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                    <div className="w-2 h-2 bg-neutral-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-neutral-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                  <span className="text-xs font-black text-neutral-600 uppercase tracking-widest">Assistant is thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Suggested Follow-ups */}
      {currentMessages.length > 0 && !isTyping && currentMessages[currentMessages.length-1].sender === 'ai' && (
        <div className="max-w-4xl mx-auto w-full px-4 md:px-8 mb-4">
          <div className="flex flex-wrap gap-2">
            {currentMessages[currentMessages.length-1].suggestions?.map((item, i) => (
              <button 
                key={i} 
                onClick={() => handleSuggestionClick(item)}
                className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs font-bold text-neutral-400 hover:bg-white/10 hover:text-white hover:border-white/20 transition-all flex items-center gap-2 group"
              >
                <Plus size={14} className="text-primary group-hover:rotate-90 transition-transform" />
                {item}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="border-t border-white/5 bg-background/80 backdrop-blur-xl p-4 md:p-6 pb-8">
        <div className="max-w-4xl mx-auto relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-3xl blur opacity-0 group-focus-within:opacity-20 transition-opacity"></div>
          
          {attachedFiles.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3 bg-white/5 p-2 rounded-2xl border border-white/10">
              {attachedFiles.map((file, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-surface border border-white/10 rounded-xl text-xs font-bold text-white shadow-lg">
                  <FileText size={14} className="text-primary" />
                  <span className="max-w-[150px] truncate">{file.name}</span>
                  <button onClick={() => setAttachedFiles(prev => prev.filter((_, idx) => idx !== i))} className="hover:text-red-400">
                    <RefreshCw size={12} className="rotate-45" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <form 
            onSubmit={handleSend}
            className="relative flex items-end gap-2 p-2 bg-surface border border-white/10 rounded-3xl shadow-2xl"
          >
            <div className="flex flex-col gap-1 p-1">
              <label className="p-3 text-neutral-500 hover:text-white transition-colors cursor-pointer block rounded-2xl hover:bg-white/5">
                <Paperclip size={22} />
                <input type="file" className="hidden" multiple onChange={handleFileUpload} />
              </label>
            </div>
            <textarea 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask a question about your documents..."
              rows={1}
              className="flex-1 bg-transparent border-none outline-none text-md px-2 py-3 resize-none max-h-48 custom-scrollbar"
            />
            <button 
              type="submit"
              disabled={(!input.trim() && attachedFiles.length === 0) || isTyping}
              className={`p-3 rounded-2xl transition-all shadow-xl flex items-center justify-center ${
                (!input.trim() && attachedFiles.length === 0) || isTyping 
                ? 'bg-neutral-800 text-neutral-600' 
                : 'bg-primary hover:bg-primary-dark text-white shadow-primary/20'
              }`}
            >
              <Send size={22} />
            </button>
          </form>
          <p className="mt-3 text-center text-[10px] uppercase tracking-[0.2em] font-black text-neutral-600">AI can make mistakes. Verify important information.</p>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
