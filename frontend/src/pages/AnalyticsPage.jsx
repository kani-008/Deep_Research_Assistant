import React, { useState, useMemo, useEffect } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';
import {
  TrendingUp, TrendingDown, BarChart3, Clock, Zap, Layers,
  Download, Share2, CheckCircle, ChevronRight, FileText, Database,
  Loader2, RotateCcw
} from 'lucide-react';
import { fetchAnalyticsDataApi } from '../api/api';
import toast from 'react-hot-toast';

const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0e0e1c] border border-white/[0.1] rounded-xl px-3 py-2.5 shadow-2xl backdrop-blur-xl">
      <p className="text-[0.65rem] text-neutral-500 mb-1.5 uppercase tracking-widest font-black">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-[11px] font-bold flex items-center gap-2" style={{ color: p.color }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: p.color }} />
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

const StatCard = ({ title, value, change, icon: Icon, accent, bg, ring }) => (
  <div className="bg-[#0d0d1a] border border-white/[0.06] rounded-2xl p-4 md:p-5 flex items-center gap-3 sm:gap-4 hover:border-violet-500/20 transition-all group relative overflow-hidden">
    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    <div className={`w-10 h-10 md:w-11 md:h-11 rounded-xl ${bg} ring-1 ${ring} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
      <Icon size={18} className={accent} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[9px] sm:text-[10px] md:text-[11px] font-black text-neutral-600 uppercase tracking-widest mb-1.5 whitespace-normal break-words leading-tight">
        {title}
      </p>
      <p className="text-lg sm:text-xl md:text-2xl font-black text-white tracking-tight leading-none break-all">
        {value}
      </p>
    </div>
    {change !== undefined && (
      <span className={`flex items-center gap-0.5 text-[9px] md:text-[10px] font-black px-1.5 md:px-2 py-1 rounded-lg flex-shrink-0 ${
        change >= 0 ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10'
      }`}>
        {change >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
        {Math.abs(change)}%
      </span>
    )}
  </div>
);

const AnalyticsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [range, setRange] = useState('7d');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchAnalyticsDataApi();
        if (res && res.success) {
          setData(res.data);
          setError(false);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error('Analytics Fetch Error:', err);
        setError(true);
        toast.error('Cloud DB sync failed — Check cluster health');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // ── Robust Defaults & Transformation ──────────────────────────────────────────
  
  const stats = useMemo(() => ({
    queries: data?.stats?.queries || 0,
    docs: data?.stats?.docs || 0,
    topics: data?.stats?.topics || 0,
    response: data?.stats?.response || '0.0s'
  }), [data]);

  const fileTypes = useMemo(() => {
    if (data?.fileTypes?.length > 0) return data.fileTypes;
    return [{ name: 'System Idle', value: 100, color: 'rgba(255,255,255,0.03)' }];
  }, [data]);

  const recent = useMemo(() => data?.recent || [], [data]);

  const chartData = useMemo(() => {
    // Always generate last 7 days for a consistent chart view
    const days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().split('T')[0];
      
      const entry = data?.activity?.find(a => a._id === iso);
      const upload = data?.uploads?.find(u => u._id === iso);
      
      return {
        date: d.toLocaleDateString('en-US', { weekday: 'short' }),
        queries: entry?.queries || 0,
        docs: upload?.count || 0,
        tokens: entry?.tokens || 0
      };
    }).reverse();
    
    return days;
  }, [data]);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 size={32} className="text-violet-500 animate-spin" />
        <p className="text-xs font-black text-neutral-600 uppercase tracking-widest">Syncing with Research Cluster...</p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-6">
        <div className="w-16 h-16 rounded-[2rem] bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-2">
            <Database size={28} className="text-red-500 opacity-60" />
        </div>
        <h2 className="text-xl font-black text-white">Cluster Synchronization Failed</h2>
        <p className="max-w-xs text-xs text-neutral-600 font-bold uppercase tracking-widest leading-loose">
           Could not establish a stable connection to the cloud analytics stream.
        </p>
        <button onClick={() => window.location.reload()} className="bg-violet-600 text-white text-[11px] font-black uppercase tracking-widest px-6 py-3 rounded-xl shadow-xl shadow-violet-600/20">
           Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-5 py-8 sm:py-10 pb-20 space-y-8 sm:space-y-10">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
             <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Connected to Cloud DB</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">Advanced Insights</h1>
          <p className="text-sm text-neutral-600 font-medium">Aggregated data stream from Research cluster.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 text-xs font-black text-neutral-400 border border-white/[0.08] hover:border-violet-500/30 hover:bg-white/[0.04] px-4 py-2.5 rounded-xl transition-all uppercase tracking-widest">
            <Download size={14} /> Export
          </button>
          <button onClick={() => window.location.reload()} className="flex items-center gap-2 text-xs font-black text-white bg-violet-600 hover:bg-violet-500 px-4 py-2.5 rounded-xl transition-all shadow-xl shadow-violet-600/30 uppercase tracking-widest active:scale-95">
            <RotateCcw size={14} /> Refresh
          </button>
        </div>
      </div>

      {/* ── Stat cards ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Queries" value={stats.queries?.toLocaleString()} change={15} icon={BarChart3} accent="text-violet-400" bg="bg-violet-500/10" ring="ring-violet-500/15" />
        <StatCard title="Docs Managed" value={stats.docs?.toLocaleString()} change={5} icon={Layers} accent="text-cyan-400" bg="bg-cyan-500/10" ring="ring-cyan-500/15" />
        <StatCard title="Context Points" value={stats.topics?.toLocaleString()} change={12} icon={Zap} accent="text-amber-400" bg="bg-amber-500/10" ring="ring-amber-500/15" />
        <StatCard title="Cluster Latency" value={stats.response} change={-2} icon={Clock} accent="text-emerald-400" bg="bg-emerald-500/10" ring="ring-emerald-500/15" />
      </div>

      {/* ── Charts row ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Area chart */}
        <div className="lg:col-span-2 bg-[#0d0d1a] border border-white/[0.06] rounded-[2rem] p-6 lg:p-8 relative">
          <div className="flex items-start justify-between mb-8 flex-wrap gap-4 relative z-10">
            <div>
              <h2 className="font-black text-white text-lg">Cloud Activity Stream</h2>
              <p className="text-xs text-neutral-600 font-bold uppercase tracking-widest mt-1">Daily interaction density</p>
            </div>
            <div className="flex items-center gap-1 bg-[#0a0a14] border border-white/[0.06] rounded-2xl p-1">
              {['7d', '30d'].map(r => (
                <button key={r} onClick={() => setRange(r)}
                  className={`text-[11px] font-black px-4 py-2 rounded-xl transition-all uppercase tracking-widest ${
                    range === r ? 'bg-violet-600 text-white' : 'text-neutral-600 hover:text-neutral-300'
                  }`}>
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="h-64 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -24, bottom: 0 }}>
                <defs>
                  <linearGradient id="gQ" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c6af7" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#7c6af7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="date" stroke="transparent" tick={{ fill: '#4b4b5e', fontSize: 11, fontWeight: 700 }} tickLine={false} />
                <YAxis stroke="transparent" tick={{ fill: '#4b4b5e', fontSize: 11, fontWeight: 700 }} tickLine={false} axisLine={false} />
                <Tooltip content={<Tip />} />
                <Area type="monotone" dataKey="queries" name="Queries" stroke="#7c6af7" strokeWidth={3} fill="url(#gQ)" dot={{ fill: '#7c6af7', r: 4, stroke: '#0d0d1a' }} />
                <Area type="monotone" dataKey="docs" name="Uploads" stroke="#22d3ee" strokeWidth={3} fill="none" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Side stats */}
        <div className="flex flex-col gap-6">
          <div className="bg-[#0d0d1a] border border-white/[0.06] rounded-[2rem] p-6 flex-1 relative overflow-hidden">
            <h2 className="font-black text-white text-base">Resource Map</h2>
            <p className="text-[11px] text-neutral-600 font-bold uppercase tracking-widest mt-1 mb-6">File Type distribution</p>
            
            <div className="h-40 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={fileTypes} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={8} dataKey="value" stroke="none">
                    {fileTypes.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip content={<Tip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-black text-white leading-none">{stats.docs}</span>
                <span className="text-[9px] text-neutral-600 uppercase font-black tracking-widest mt-1">Files</span>
              </div>
            </div>

            <div className="space-y-2 mt-4">
              {fileTypes.map((f, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-xl">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full shadow-sm" style={{ backgroundColor: f.color }} />
                    <span className="text-xs font-bold text-neutral-400">{f.name}</span>
                  </div>
                  <span className="text-xs font-black text-white">{f.value}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#0d0d1a] border border-white/[0.06] rounded-2xl p-5 flex items-center justify-between group cursor-pointer hover:border-violet-500/30 transition-all">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-violet-600/10 flex items-center justify-center text-violet-400">
                <Database size={18} />
              </div>
              <div>
                <h3 className="font-black text-white text-sm">Cluster Stats</h3>
                <p className="text-[10px] text-neutral-600 font-bold uppercase tracking-widest mt-1">Syncing every 60s</p>
              </div>
            </div>
            <ChevronRight size={16} className="text-neutral-700" />
          </div>
        </div>
      </div>

      {/* Inference Bar Chart */}
      <div className="bg-[#0d0d1a] border border-white/[0.06] rounded-[2rem] p-6 sm:p-8">
        <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
          <div>
            <h2 className="font-black text-white text-lg">Inference Traffic</h2>
            <p className="text-xs text-neutral-600 font-bold uppercase tracking-widest mt-1">Token density across cluster</p>
          </div>
          <span className="text-[11px] font-black text-violet-400 bg-violet-600/10 border border-violet-500/20 px-4 py-2 rounded-xl whitespace-nowrap uppercase tracking-widest">
            {chartData.reduce((acc, d) => acc + d.tokens, 0).toLocaleString()} Avg Tokens
          </span>
        </div>
        <div className="h-44 sm:h-52">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 0, right: 0, left: -24, bottom: 0 }} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
              <XAxis dataKey="date" stroke="transparent" tick={{ fill: '#4b4b5e', fontSize: 11, fontWeight: 700 }} tickLine={false} />
              <YAxis stroke="transparent" tick={{ fill: '#4b4b5e', fontSize: 11, fontWeight: 700 }} tickLine={false} axisLine={false} />
              <Tooltip content={<Tip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
              <Bar dataKey="tokens" name="Tokens" fill="#7c6af7" radius={[8, 8, 0, 0]} fillOpacity={0.8} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* History Log */}
      <div className="bg-[#0d0d1a] border border-white/[0.06] rounded-[2rem] overflow-hidden shadow-2xl">
        <div className="px-6 py-5 border-b border-white/[0.05] flex items-center justify-between">
          <h2 className="font-black text-white text-base">Interaction Event Log</h2>
          <div className="flex items-center gap-1.5 opacity-40">
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
             <span className="text-[9px] font-black text-neutral-500 uppercase tracking-widest">Real-time Stream</span>
          </div>
        </div>
        <div className="divide-y divide-white/[0.03]">
          {recent.length === 0 ? (
            <div className="px-6 py-10 text-center text-neutral-700 font-bold uppercase tracking-widest">No cloud events recorded</div>
          ) : (
            recent.map((row, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4 hover:bg-white/[0.02] transition-colors group">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  row.type === 'upload' ? 'bg-cyan-500/10' : 'bg-violet-500/10'
                }`}>
                  <FileText size={14} className={row.type === 'upload' ? 'text-cyan-400' : 'text-violet-400'} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs md:text-sm text-white font-bold leading-snug uppercase tracking-tight break-words py-0.5">{row.action}</p>
                  <p className="text-[9px] md:text-[10px] text-neutral-600 font-bold uppercase tracking-widest mt-0.5">{new Date(row.time).toLocaleString()}</p>
                </div>
                <span className="text-[10px] md:text-[11px] text-neutral-700 font-black uppercase flex-shrink-0 whitespace-nowrap hidden sm:inline-block">Logged</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
