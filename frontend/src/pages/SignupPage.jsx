// src/pages/SignupPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { signupUser } from '../api/api';
import toast from 'react-hot-toast';

const StrengthDots = ({ password }) => {
  const score = [password.length >= 8, /[A-Z]/.test(password), /\d/.test(password), /[^A-Za-z0-9]/.test(password)].filter(Boolean).length;
  if (!password) return null;
  const colors = ['bg-red-500', 'bg-amber-500', 'bg-yellow-400', 'bg-emerald-500'];
  return (
    <div className="flex items-center gap-1.5 mt-2">
      {[0, 1, 2, 3].map(i => (
        <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i < score ? colors[score - 1] : 'bg-white/[0.07]'}`} />
      ))}
      <span className="text-[10px] text-neutral-600 ml-1 whitespace-nowrap">
        {['', 'Weak', 'Fair', 'Good', 'Strong'][score]}
      </span>
    </div>
  );
};

const SignupPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (isAuthenticated) navigate('/dashboard');
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!name || !email || !password) { setError('Please fill in all fields.'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setLoading(true);
    try {
      await signupUser(name, email, password);
      toast.success('Account created! Please sign in.');
      navigate('/login');
    } catch (err) {
      setError(err.message || 'Error creating account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07070f] flex flex-col lg:flex-row">

      {/* ── Left panel (lg+) ─────────────────────────────────────────── */}
      <div className="hidden lg:flex flex-1 relative bg-[#0a0a16] border-r border-white/[0.05] items-center justify-center p-10 xl:p-14 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-fuchsia-600/[0.07] rounded-full blur-[120px]" />
          <div className="absolute inset-0 opacity-[0.025]"
            style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)', backgroundSize: '56px 56px' }} />
        </div>
        <div className="relative z-10 max-w-sm w-full">
          <Link to="/" className="flex items-center gap-2.5 mb-10">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center font-black shadow-xl shadow-violet-500/30">D</div>
            <span className="font-extrabold text-lg tracking-tight">Deep Research</span>
          </Link>
          <h2 className="text-3xl font-black tracking-tight text-white leading-tight mb-3">
            Your documents.<br />Your answers.
          </h2>
          <p className="text-neutral-500 text-sm leading-relaxed mb-8">
            Create your free account and start extracting knowledge in minutes.
          </p>
          <div className="bg-[#0e0e1c] border border-white/[0.07] rounded-2xl p-5 space-y-3">
            <p className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest">Free plan includes</p>
            {['Unlimited PDF uploads', 'AI chat with citations', 'Multi-document search', 'Analytics dashboard'].map((f, i) => (
              <div key={i} className="flex items-center gap-3 text-[13px] text-neutral-400">
                <CheckCircle2 size={14} className="text-emerald-400 flex-shrink-0" />
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right form panel ─────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-8 py-10 min-h-screen lg:min-h-0">
        <Link to="/" className="lg:hidden flex items-center gap-2 mb-8 self-start sm:self-auto">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center font-black text-sm">D</div>
          <span className="font-extrabold tracking-tight text-sm">Deep Research</span>
        </Link>

        <div className="w-full max-w-sm mx-auto">
          <div className="mb-7">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-1.5">Create your account</h1>
            <p className="text-sm text-neutral-500">Start your research journey. Free forever.</p>
          </div>

          {error && (
            <div className="flex items-start gap-2.5 bg-red-500/[0.08] border border-red-500/20 text-red-400 text-[13px] rounded-xl px-4 py-3 mb-5">
              <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1.5">Full Name</label>
              <div className="relative group">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-600 group-focus-within:text-violet-400 transition-colors pointer-events-none" />
                <input
                  type="text" value={name} onChange={e => setName(e.target.value)}
                  placeholder="Jane Smith" autoComplete="name"
                  className="w-full bg-[#0e0e1c] border border-white/[0.08] focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/10 rounded-xl pl-10 pr-4 py-3 text-[13px] text-white placeholder:text-neutral-700 outline-none transition-all"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1.5">Email Address</label>
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
              <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1.5">Password</label>
              <div className="relative group">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-600 group-focus-within:text-violet-400 transition-colors pointer-events-none" />
                <input
                  type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Min. 8 characters" autoComplete="new-password"
                  className="w-full bg-[#0e0e1c] border border-white/[0.08] focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/10 rounded-xl pl-10 pr-10 py-3 text-[13px] text-white placeholder:text-neutral-700 outline-none transition-all"
                />
                <button type="button" onClick={() => setShowPass(p => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-neutral-400 transition-colors p-0.5">
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              <StrengthDots password={password} />
            </div>

            {/* Terms */}
            <p className="text-[11px] text-neutral-600 leading-relaxed">
              By creating an account you agree to our{' '}
              <a href="#" className="text-neutral-500 hover:text-neutral-300 underline underline-offset-2">Terms</a>
              {' '}and{' '}
              <a href="#" className="text-neutral-500 hover:text-neutral-300 underline underline-offset-2">Privacy Policy</a>.
            </p>

            {/* Submit */}
            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all text-sm shadow-lg shadow-violet-600/20 active:scale-[0.99]">
              {loading
                ? <><div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> Creating account…</>
                : <>Create free account <ArrowRight size={15} /></>}
            </button>
          </form>

          <p className="mt-6 text-center text-[13px] text-neutral-600">
            Already have an account?{' '}
            <Link to="/login" className="text-violet-400 hover:text-violet-300 font-semibold transition-colors">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;