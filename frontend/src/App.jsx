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