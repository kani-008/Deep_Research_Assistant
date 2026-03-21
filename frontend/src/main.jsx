// ./frontend/src/main.jsx

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from 'react-error-boundary'
import './index.css'
import App from './App.jsx'

const ErrorFallback = ({ error, resetErrorBoundary }) => {
  return (
    <div className="min-h-screen bg-[#111] text-white flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-red-500/20 text-red-500 flex items-center justify-center mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
      </div>
      <h1 className="text-3xl font-black mb-2 tracking-tight">Something went wrong</h1>
      <p className="text-neutral-400 max-w-md mb-8">We're sorry, but an unexpected error occurred while loading this page. Please try refreshing.</p>
      <div className="bg-white/5 border border-white/10 p-4 rounded-xl text-left w-full max-w-lg overflow-auto text-sm text-red-400 mb-8 font-mono">
        {error.message}
      </div>
      <button 
        onClick={resetErrorBoundary}
        className="px-6 py-3 bg-primary hover:bg-primary-dark rounded-xl font-bold transition-colors shadow-lg shadow-primary/20"
      >
        Reload Application
      </button>
    </div>
  );
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
