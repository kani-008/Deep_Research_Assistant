// ./frontend/src/pages/LoginPage.jsx

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { loginUser } from '../api/api';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields.');
      return;
    }
    
    setIsLoading(true);
    try {
      // loginUser returns response.data.data from backend with { token, user }
      const response = await loginUser(email, password);
      
      // Verify token and user exist before logging in
      if (!response.token || !response.user) {
        throw new Error('Invalid response from server');
      }
      
      // Store token and user in localStorage (via AuthContext)
      // API interceptor will automatically use token for next requests
      login(response.token, response.user);
      toast.success('Successfully logged in!');
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      toast.error(err.message || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-6 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 opacity-20 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/30 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-accent/30 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <Link to="/" className="absolute top-8 left-8 flex items-center gap-2 group text-white">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center font-bold text-xl shadow-lg shadow-primary/30 group-hover:scale-105 transition-transform">D</div>
        <span className="font-bold text-xl tracking-tight hidden sm:block">Deep Research</span>
      </Link>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="glass rounded-[2rem] p-8 md:p-10 shadow-2xl relative">
          <div className="absolute -top-6 -right-6 bg-gradient-to-tr from-primary to-accent p-4 rounded-2xl shadow-xl rotate-12 flex items-center justify-center">
            <Sparkles className="text-white" size={24} />
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Welcome Back</h1>
            <p className="text-neutral-400 font-medium">Log in to continue your research.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-bold text-neutral-300 uppercase tracking-wider">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-primary transition-colors" size={20} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all placeholder:text-neutral-600"
                />
              </div>
            </div>

            <div className="space-y-2">
               <div className="flex justify-between items-center">
                 <label className="text-sm font-bold text-neutral-300 uppercase tracking-wider">Password</label>
                 <a href="#" className="text-xs font-semibold text-primary hover:text-primary-light transition-colors">Forgot password?</a>
               </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-primary transition-colors" size={20} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all placeholder:text-neutral-600"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 py-4 bg-primary hover:bg-primary-dark disabled:opacity-50 text-white rounded-xl transition-all font-black text-lg shadow-xl shadow-primary/20 mt-8 group"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-neutral-400 font-medium">
            Don't have an account? <Link to="/signup" className="text-white hover:text-primary font-bold transition-colors">Sign up for free</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
