// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import ChatPage from './pages/ChatPage';
import ToolsPage from './pages/ToolsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import LegalPage from './pages/LegalPage';
import DocsPage from './pages/DocsPage';
import ContactPage from './pages/ContactPage';
import { Toaster } from 'react-hot-toast';

const App = () => (
  <AuthProvider>
    <ChatProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/privacy" element={
            <LegalPage title="Privacy Policy" content={[
              { h: "Information We Collect", p: "We collect information you provide directly to us when you create an account, upload documents, and interact with our AI chat service.", list: ["Account information (name, email)", "Uploaded PDF documents for RAG processing", "Chat history and feedback data"] },
              { h: "How We Use Data", p: "Your data is used solely to provide and improve our research assistant services. We do not sell your personal information.", list: ["Document indexing for search queries", "Session persistence for multiple chat rounds", "Internal analytics to improve answer accuracy"] },
              { h: "Security", p: "We implement industry-standard AES-256 encryption for all data at rest and TLS 1.3 for data in transit." }
            ]} />
          } />
          <Route path="/terms" element={
            <LegalPage title="Terms of Service" content={[
              { h: "Acceptance of Terms", p: "By accessing Deep Research, you agree to be bound by these Terms of Service. If you do not agree, do not use the service." },
              { h: "User Conduct", p: "You are responsible for all activity under your account and the legality of the documents you upload.", list: ["No uploading of sensitive PII or illegal material", "No reverse-engineering of our proprietary RAG algorithms", "Usage must comply with fair-use document storage limits"] },
              { h: "Service Limitations", p: "The AI assistant provides informational answers only and should not replace professional verification for critical research." }
            ]} />
          } />
          <Route path="/docs" element={<DocsPage />} />
          <Route path="/contact" element={<ContactPage />} />

          {/* Protected — wrapped in Layout */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Layout><DashboardPage /></Layout>} />
            <Route path="/chat" element={<Layout><ChatPage /></Layout>} />
            <Route path="/chat/:id" element={<Layout><ChatPage /></Layout>} />
            <Route path="/tools" element={<Layout><ToolsPage /></Layout>} />
            <Route path="/analytics" element={<Layout><AnalyticsPage /></Layout>} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ChatProvider>
    <Toaster
      position="bottom-right"
      toastOptions={{
        style: {
          background: '#0e0e1c',
          color: '#fff',
          border: '1px solid rgba(255,255,255,0.08)',
          fontSize: '13px',
          borderRadius: '12px',
          maxWidth: '320px',
        },
      }}
    />
  </AuthProvider>
);

export default App;
