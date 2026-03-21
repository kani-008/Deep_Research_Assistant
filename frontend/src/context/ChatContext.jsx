// ./frontend/src/context/ChatContext.jsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [sessions, setSessions] = useState(() => {
    const saved = localStorage.getItem('chat_sessions');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [currentSessionId, setCurrentSessionId] = useState(() => {
    const lastSession = localStorage.getItem('last_session_id');
    return lastSession || null;
  });

  const [documents, setDocuments] = useState(() => {
    const saved = localStorage.getItem('documents');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('chat_sessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    if (currentSessionId) {
      localStorage.setItem('last_session_id', currentSessionId);
    }
  }, [currentSessionId]);

  useEffect(() => {
    localStorage.setItem('documents', JSON.stringify(documents));
  }, [documents]);

  const createNewChat = () => {
    const newSessionId = uuidv4();
    const newSession = {
      sessionId: newSessionId,
      title: 'New Chat',
      messages: [],
      createdAt: new Date().toISOString()
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSessionId);
    return newSessionId;
  };

  const getChatMessages = (sessionId) => {
    const session = sessions.find(s => s.sessionId === sessionId);
    return session ? session.messages : [];
  };

  const addMessage = (sessionId, message) => {
    setSessions(prev => prev.map(session => {
      if (session.sessionId === sessionId) {
        // Update title if it's the first user message
        let newTitle = session.title;
        if (session.messages.length === 0 && message.sender === 'user') {
          newTitle = message.text.substring(0, 30) + (message.text.length > 30 ? '...' : '');
        }
        return {
          ...session,
          title: newTitle,
          messages: [...session.messages, message]
        };
      }
      return session;
    }));
  };

  const deleteSession = (sessionId) => {
    setSessions(prev => prev.filter(s => s.sessionId !== sessionId));
    if (currentSessionId === sessionId) {
      setCurrentSessionId(null);
    }
  };

  const uploadDocument = (file) => {
    const newDoc = {
      id: uuidv4(),
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
      status: 'Uploaded',
      uploadedAt: new Date().toISOString()
    };
    setDocuments(prev => [newDoc, ...prev]);
  };

  return (
    <ChatContext.Provider value={{
      sessions,
      currentSessionId,
      setCurrentSessionId,
      createNewChat,
      getChatMessages,
      addMessage,
      deleteSession,
      documents,
      uploadDocument
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
