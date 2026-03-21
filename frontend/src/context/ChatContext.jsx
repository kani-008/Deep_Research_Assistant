// ./frontend/src/context/ChatContext.jsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { uploadFile, deleteDocument as deleteDocumentApi } from '../api/api';
import toast from 'react-hot-toast';

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

  // ================= LOCAL STORAGE =================

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

  // ================= CHAT =================

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
    setSessions(prev =>
      prev.map(session => {
        if (session.sessionId === sessionId) {
          let newTitle = session.title;

          if (session.messages.length === 0 && message.sender === 'user') {
            newTitle =
              message.text.substring(0, 30) +
              (message.text.length > 30 ? '...' : '');
          }

          return {
            ...session,
            title: newTitle,
            messages: [...session.messages, message]
          };
        }
        return session;
      })
    );
  };

  const deleteSession = (sessionId) => {
    setSessions(prev => prev.filter(s => s.sessionId !== sessionId));
    if (currentSessionId === sessionId) {
      setCurrentSessionId(null);
    }
  };

  // ================= DOCUMENT UPLOAD =================

  const uploadDocument = async (file) => {
    try {
      const tempId = uuidv4();

      const tempDoc = {
        id: tempId,
        name: file.name,
        size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
        status: 'Uploading...',
        uploadedAt: new Date().toISOString()
      };

      setDocuments(prev => [tempDoc, ...prev]);

      await uploadFile(file);

      setDocuments(prev =>
        prev.map(doc =>
          doc.id === tempId
            ? { ...doc, status: 'Processed ✅' }
            : doc
        )
      );

    } catch (error) {
      console.error('Upload failed:', error.message);

      setDocuments(prev =>
        prev.map(doc =>
          doc.name === file.name
            ? { ...doc, status: 'Failed ❌' }
            : doc
        )
      );
    }
  };

  // ================= DELETE DOCUMENT =================

  const deleteDocument = async (docId) => {
    // Optimistically remove from UI
    setDocuments(prev => prev.filter(doc => doc.id !== docId));

    // If it has a real MongoDB uploadId, delete from backend (Drive + Qdrant + DB)
    const doc = documents.find(d => d.id === docId);
    const uploadId = doc?.uploadId;

    if (uploadId) {
      try {
        await deleteDocumentApi(uploadId);
        toast.success('Document deleted from Drive and database');
      } catch (error) {
        console.error('Backend delete failed:', error.message);
        toast.error('Deleted from UI but failed to remove from Drive: ' + error.message);
      }
    }
  };

  // ================= CLEAR DOCUMENTS =================

  const clearDocuments = () => {
    setDocuments([]);
    localStorage.removeItem('documents');
  };

  // ================= RESET APP =================

  const resetApp = () => {
    localStorage.clear();
    setDocuments([]);
    setSessions([]);
    setCurrentSessionId(null);
  };

  return (
    <ChatContext.Provider
      value={{
        sessions,
        currentSessionId,
        setCurrentSessionId,
        createNewChat,
        getChatMessages,
        addMessage,
        deleteSession,
        documents,
        uploadDocument,
        deleteDocument,   // ✅ added
        clearDocuments,   // ✅ added
        resetApp          // ✅ added
      }}
    >
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