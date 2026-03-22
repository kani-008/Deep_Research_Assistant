// ./frontend/src/context/ChatContext.jsx
// All chat sessions and documents are stored in MongoDB Atlas.
// This context is a thin client-side cache — no localStorage for app data.

import React, { createContext, useContext, useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  uploadFile as uploadFileApi,
  deleteDocument as deleteDocumentApi,
  fetchUploadHistory,
  fetchChatHistory,
} from '../api/api';
import toast from 'react-hot-toast';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  // ─── In-memory session list (sourced from MongoDB via fetchChatHistory) ───
  // Each session: { sessionId, title, messages: [], createdAt }
  const [sessions, setSessions]               = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);

  // ─── In-memory document list (sourced from MongoDB via fetchUploadHistory) ─
  const [documents, setDocuments]             = useState([]);
  const [docsLoaded, setDocsLoaded]           = useState(false);
  const [sessionsLoaded, setSessionsLoaded]   = useState(false);

  // ═══════════════════════════════════════════════════════════════════════════
  // SESSIONS — load from MongoDB
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Load all chat sessions for the current user from MongoDB Atlas.
   * Groups individual chat Q&A pairs by sessionId into session objects.
   */
  const loadSessions = useCallback(async () => {
    if (sessionsLoaded) return;
    try {
      const result = await fetchChatHistory(1, 200); // load up to 200 recent messages
      const chats  = result.data || [];

      // Group by sessionId
      const sessionMap = new Map();
      chats.forEach((chat) => {
        const sid = chat.sessionId;
        if (!sessionMap.has(sid)) {
          sessionMap.set(sid, {
            sessionId: sid,
            title: chat.question.substring(0, 40) + (chat.question.length > 40 ? '...' : ''),
            messages: [],
            createdAt: chat.createdAt,
          });
        }
        const session = sessionMap.get(sid);
        // Reconstruct messages from Q&A pairs
        session.messages.push({
          id: chat._id + '_q',
          sender: 'user',
          text: chat.question,
          timestamp: chat.createdAt,
        });
        session.messages.push({
          id: chat._id + '_a',
          sender: 'ai',
          text: chat.answer,
          timestamp: chat.createdAt,
        });
      });

      const sorted = Array.from(sessionMap.values()).sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      setSessions(sorted);
      setSessionsLoaded(true);
    } catch (err) {
      console.error('Failed to load chat sessions:', err.message);
    }
  }, [sessionsLoaded]);

  // ═══════════════════════════════════════════════════════════════════════════
  // CHAT OPERATIONS
  // ═══════════════════════════════════════════════════════════════════════════

  const createNewChat = useCallback(() => {
    const newSessionId = uuidv4();
    const newSession = {
      sessionId: newSessionId,
      title: 'New Chat',
      messages: [],
      createdAt: new Date().toISOString(),
    };
    setSessions((prev) => [newSession, ...prev]);
    setCurrentSessionId(newSessionId);
    return newSessionId;
  }, []);

  const getChatMessages = useCallback(
    (sessionId) => {
      const session = sessions.find((s) => s.sessionId === sessionId);
      return session ? session.messages : [];
    },
    [sessions]
  );

  /**
   * Add a message to an in-memory session.
   * The actual persistence happens in chatController.js when sendMessage is called.
   */
  const addMessage = useCallback((sessionId, message) => {
    setSessions((prev) =>
      prev.map((session) => {
        if (session.sessionId !== sessionId) return session;

        const newTitle =
          session.messages.length === 0 && message.sender === 'user'
            ? message.text.substring(0, 40) + (message.text.length > 40 ? '...' : '')
            : session.title;

        return {
          ...session,
          title: newTitle,
          messages: [...session.messages, message],
        };
      })
    );
  }, []);

  const deleteSession = useCallback((sessionId) => {
    setSessions((prev) => prev.filter((s) => s.sessionId !== sessionId));
    if (currentSessionId === sessionId) setCurrentSessionId(null);
  }, [currentSessionId]);

  // ═══════════════════════════════════════════════════════════════════════════
  // DOCUMENTS — load from MongoDB
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Load all uploaded documents for the current user from MongoDB Atlas.
   */
  const loadDocuments = useCallback(async () => {
    if (docsLoaded) return;
    try {
      const result = await fetchUploadHistory(1, 100);
      const docs   = (result.data || []).map((d) => ({
        id:         d._id,
        uploadId:   d._id,
        name:       d.originalName,
        size:       formatFileSize(d.fileSize),
        status:     d.status === 'completed' ? 'Processed ✅' : d.status === 'failed' ? 'Failed ❌' : d.status,
        uploadedAt: d.createdAt,
      }));
      setDocuments(docs);
      setDocsLoaded(true);
    } catch (err) {
      console.error('Failed to load documents:', err.message);
    }
  }, [docsLoaded]);

  /**
   * Upload a PDF — sends to backend which ingests into n8n → Drive → Qdrant → MongoDB.
   * On success, adds the returned document record to in-memory state.
   */
  const uploadDocument = useCallback(async (file) => {
    const tempId = uuidv4();

    // Optimistic UI — show uploading state immediately
    const tempDoc = {
      id:         tempId,
      uploadId:   null,
      name:       file.name,
      size:       formatFileSize(file.size),
      status:     'Uploading...',
      uploadedAt: new Date().toISOString(),
    };
    setDocuments((prev) => [tempDoc, ...prev]);

    try {
      const response = await uploadFileApi(file);
      const data     = response.data; // { uploadId, filename, status, driveFileId }

      setDocuments((prev) =>
        prev.map((doc) =>
          doc.id === tempId
            ? {
                ...doc,
                id:       data.uploadId,
                uploadId: data.uploadId,
                name:     data.filename || file.name,
                status:   'Processed ✅',
              }
            : doc
        )
      );
    } catch (error) {
      setDocuments((prev) =>
        prev.map((doc) =>
          doc.id === tempId ? { ...doc, status: 'Failed ❌' } : doc
        )
      );
      throw error; // let caller handle toast
    }
  }, []);

  /**
   * Delete a document — removes from Drive, Qdrant, and MongoDB.
   */
  const deleteDocument = useCallback(async (docId) => {
    // Optimistic removal
    setDocuments((prev) => prev.filter((doc) => doc.id !== docId));

    try {
      await deleteDocumentApi(docId);
      toast.success('Document deleted successfully');
    } catch (error) {
      console.error('Delete failed:', error.message);
      toast.error('Failed to delete document: ' + error.message);
      // Reload to restore accurate state
      setDocsLoaded(false);
    }
  }, []);

  /**
   * Force-refresh documents from MongoDB (e.g. after an error)
   */
  const refreshDocuments = useCallback(() => {
    setDocsLoaded(false);
  }, []);

  /**
   * Force-refresh sessions from MongoDB
   */
  const refreshSessions = useCallback(() => {
    setSessionsLoaded(false);
  }, []);

  // ═══════════════════════════════════════════════════════════════════════════
  // HELPERS
  // ═══════════════════════════════════════════════════════════════════════════

  const formatFileSize = (bytes) => {
    if (!bytes) return '—';
    if (bytes < 1024)       return bytes + ' B';
    if (bytes < 1048576)    return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(2) + ' MB';
  };

  return (
    <ChatContext.Provider
      value={{
        // Sessions
        sessions,
        currentSessionId,
        setCurrentSessionId,
        createNewChat,
        getChatMessages,
        addMessage,
        deleteSession,
        loadSessions,
        refreshSessions,

        // Documents
        documents,
        uploadDocument,
        deleteDocument,
        loadDocuments,
        refreshDocuments,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChat must be used within a ChatProvider');
  return context;
};