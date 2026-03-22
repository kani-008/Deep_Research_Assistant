// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { loginUser } from '../api/api';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (isAuthenticated) navigate('/dashboard');
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    try {
      const res = await loginUser(email, password);
      if (!res.token || !res.user) throw new Error('Invalid server response');
      login(res.token, res.user);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07070f] flex flex-col lg:flex-row">

      {/* ── Left decorative panel (lg+) ──────────────────────────────── */}
      <div className="hidden lg:flex flex-1 relative bg-[#0a0a16] border-r border-white/[0.05] items-center justify-center p-10 xl:p-14 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-violet-600/[0.08] rounded-full blur-[120px]" />
          <div className="absolute inset-0 opacity-[0.025]"
            style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)', backgroundSize: '56px 56px' }} />
        </div>
        <div className="relative z-10 max-w-sm w-full">
          <Link to="/" className="flex items-center gap-2.5 mb-10">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center font-black shadow-xl shadow-violet-500/30">D</div>
            <span className="font-extrabold text-lg tracking-tight">Deep Research</span>
          </Link>
          <h2 className="text-3xl font-black tracking-tight text-white leading-tight mb-3">
            Turn your documents<br />into answers.
          </h2>
          <p className="text-neutral-500 text-sm leading-relaxed mb-8">
            Upload PDFs and get cited, precise answers powered by Retrieval-Augmented Generation.
          </p>
          <div className="space-y-3">
            {['Upload any PDF instantly', 'Ask in plain English', 'Get cited, precise answers', 'Cross-document intelligence'].map((f, i) => (
              <div key={i} className="flex items-center gap-3 text-[13px] text-neutral-400">
                <div className="w-5 h-5 rounded-full bg-violet-500/15 ring-1 ring-violet-500/25 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 size={11} className="text-violet-400" />
                </div>
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right form panel ─────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-8 py-10 min-h-screen lg:min-h-0">
        {/* Mobile logo */}
        <Link to="/" className="lg:hidden flex items-center gap-2 mb-8 self-start sm:self-auto">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center font-black text-sm">D</div>
          <span className="font-extrabold tracking-tight text-sm">Deep Research</span>
        </Link>

        <div className="w-full max-w-sm mx-auto">
          <div className="mb-7">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-1.5">Welcome back</h1>
            <p className="text-sm text-neutral-500">Sign in to continue your research.</p>
          </div>

          {error && (
            <div className="flex items-start gap-2.5 bg-red-500/[0.08] border border-red-500/20 text-red-400 text-[13px] rounded-xl px-4 py-3 mb-5">
              <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1.5">Email</label>
              <div className="relative group">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-600 group-focus-within:text-violet-400 transition-colors pointer-events-none" />
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@company.com" autoComplete="email"
                  className="w-full bg-[#0e0e1c] border border-white/[0.08] focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/10 rounded-xl pl-10 pr-4 py-3 text-[13px] text-white placeholder:text-neutral-700 outline-none transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">Password</label>
                <a href="#" className="text-[11px] text-violet-400 hover:text-violet-300 font-semibold transition-colors">Forgot password?</a>
              </div>
              <div className="relative group">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-600 group-focus-within:text-violet-400 transition-colors pointer-events-none" />
                <input
                  type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" autoComplete="current-password"
                  className="w-full bg-[#0e0e1c] border border-white/[0.08] focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/10 rounded-xl pl-10 pr-10 py-3 text-[13px] text-white placeholder:text-neutral-700 outline-none transition-all"
                />
                <button type="button" onClick={() => setShowPass(p => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-neutral-400 transition-colors p-0.5">
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all text-sm shadow-lg shadow-violet-600/20 mt-2 active:scale-[0.99]">
              {loading
                ? <><div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> Signing in…</>
                : <>Sign in <ArrowRight size={15} /></>}
            </button>
          </form>

          <p className="mt-6 text-center text-[13px] text-neutral-600">
            No account?{' '}
            <Link to="/signup" className="text-violet-400 hover:text-violet-300 font-semibold transition-colors">
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;