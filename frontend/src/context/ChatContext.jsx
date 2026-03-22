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
  sendMessage as sendMessageApi
} from '../api/api';
import toast from 'react-hot-toast';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [sessions, setSessions]                 = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [documents, setDocuments]               = useState([]);
  const [docsLoaded, setDocsLoaded]             = useState(false);
  const [sessionsLoaded, setSessionsLoaded]     = useState(false);

  // ═══════════════════════════════════════════════════════════════════════════
  // SESSIONS
  // ═══════════════════════════════════════════════════════════════════════════

  const loadSessions = useCallback(async () => {
    if (sessionsLoaded) return;
    try {
      const result = await fetchChatHistory(1, 200);
      const chats  = result.data || [];

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
        session.messages.push({ id: chat._id + '_q', sender: 'user', text: chat.question, timestamp: chat.createdAt });
        session.messages.push({ id: chat._id + '_a', sender: 'ai',   text: chat.answer,   timestamp: chat.createdAt });
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

  const createNewChat = useCallback(() => {
    const newSessionId = uuidv4();
    setSessions((prev) => [
      { sessionId: newSessionId, title: 'New Chat', messages: [], createdAt: new Date().toISOString() },
      ...prev,
    ]);
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

  const addMessage = useCallback((sessionId, message) => {
    setSessions((prev) =>
      prev.map((session) => {
        if (session.sessionId !== sessionId) return session;
        const newTitle =
          session.messages.length === 0 && message.sender === 'user'
            ? message.text.substring(0, 40) + (message.text.length > 40 ? '...' : '')
            : session.title;
        return { ...session, title: newTitle, messages: [...session.messages, message] };
      })
    );
  }, []);

  const deleteSession = useCallback((sessionId) => {
    setSessions((prev) => prev.filter((s) => s.sessionId !== sessionId));
    if (currentSessionId === sessionId) setCurrentSessionId(null);
  }, [currentSessionId]);

  const refreshSessions = useCallback(() => setSessionsLoaded(false), []);

  // ═══════════════════════════════════════════════════════════════════════════
  // DOCUMENTS
  // ═══════════════════════════════════════════════════════════════════════════

  const loadDocuments = useCallback(async (force = false) => {
    if (docsLoaded && !force) return;
    try {
      const result = await fetchUploadHistory(1, 100);
      const docs = (result.data || []).map((d) => ({
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
   * Upload a PDF.
   *
   * api.js uploadFile() returns the full axios response object.
   * Backend response shape:
   *   { success: true, message: "...", data: { uploadId, filename, status, driveFileId } }
   *
   * So we read:
   *   axiosResponse.data          → { success, message, data: {...} }
   *   axiosResponse.data.success  → true/false
   *   axiosResponse.data.data.uploadId → the real MongoDB _id
   */
  const uploadDocument = useCallback(async (file) => {
    const tempId = uuidv4();

    // Optimistic UI
    setDocuments((prev) => [
      { id: tempId, uploadId: null, name: file.name, size: formatFileSize(file.size), status: 'Uploading...', uploadedAt: new Date().toISOString() },
      ...prev,
    ]);

    try {
      const axiosResponse = await uploadFileApi(file);
      // axiosResponse.data is the backend JSON body
      const body = axiosResponse.data; // { success, message, data: { uploadId, filename, ... } }

      if (body.success && body.data?.uploadId) {
        // ✅ Upload + ingestion succeeded
        setDocuments((prev) =>
          prev.map((doc) =>
            doc.id === tempId
              ? {
                  ...doc,
                  id:       body.data.uploadId,  // real MongoDB _id
                  uploadId: body.data.uploadId,
                  name:     body.data.filename || file.name,
                  status:   'Processed ✅',
                }
              : doc
          )
        );
      } else {
        // ❌ Backend returned success:false (n8n 422 failure)
        setDocuments((prev) =>
          prev.map((doc) =>
            doc.id === tempId
              ? {
                  ...doc,
                  id:       body.data?.uploadId || tempId,
                  uploadId: body.data?.uploadId || null,
                  status:   'Failed ❌',
                }
              : doc
          )
        );
        throw new Error(body.message || 'RAG ingestion failed. Please try again.');
      }
    } catch (error) {
      // Network/HTTP error — mark as failed
      setDocuments((prev) =>
        prev.map((doc) => doc.id === tempId ? { ...doc, status: 'Failed ❌' } : doc)
      );
      throw error; // let DashboardPage show the toast
    }
  }, []);

  /**
   * Delete a document from Drive + Qdrant + MongoDB.
   * Always uses doc.uploadId (real MongoDB _id), never the temp frontend UUID.
   */
  const deleteDocument = useCallback(async (docId) => {
    let realUploadId = docId;

    // Capture real MongoDB _id BEFORE removing from state
    setDocuments((prev) => {
      const doc = prev.find((d) => d.id === docId);
      if (doc?.uploadId) realUploadId = doc.uploadId;
      return prev.filter((d) => d.id !== docId); // optimistic removal
    });

    try {
      await deleteDocumentApi(realUploadId);
      toast.success('Document deleted successfully');
    } catch (error) {
      console.error('Delete failed:', error.message);
      toast.error('Failed to delete: ' + error.message);
      setDocsLoaded(false); // re-fetch to restore accurate state
    }
  }, []);

  const refreshDocuments = useCallback(() => setDocsLoaded(false), []);

  const sendMessage = useCallback(async (message, sessionId) => {
    return await sendMessageApi(message, sessionId);
  }, []);

  // ═══════════════════════════════════════════════════════════════════════════
  // HELPERS
  // ═══════════════════════════════════════════════════════════════════════════

  const formatFileSize = (bytes) => {
    if (!bytes) return '—';
    if (bytes < 1024)    return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(2) + ' MB';
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
        loadSessions,
        refreshSessions,
        documents,
        uploadDocument,
        deleteDocument,
        loadDocuments,
        refreshDocuments,
        sendMessage,
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
