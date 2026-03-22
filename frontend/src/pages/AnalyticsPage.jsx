// src/pages/AnalyticsPage.jsx
import React, { useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';
import {
  TrendingUp, TrendingDown, BarChart3, Clock, Zap, Layers,
  Download, Share2, CheckCircle, ChevronRight, FileText
} from 'lucide-react';

const weekData = [
  { day: 'Mon', queries: 12, docs: 2, tokens: 450 },
  { day: 'Tue', queries: 18, docs: 4, tokens: 920 },
  { day: 'Wed', queries: 15, docs: 1, tokens: 730 },
  { day: 'Thu', queries: 25, docs: 5, tokens: 1200 },
  { day: 'Fri', queries: 22, docs: 3, tokens: 850 },
  { day: 'Sat', queries: 10, docs: 0, tokens: 300 },
  { day: 'Sun', queries: 14, docs: 2, tokens: 550 },
];

const fileTypes = [
  { name: 'PDF', value: 45, color: '#7c6af7' },
  { name: 'DOCX', value: 25, color: '#22d3ee' },
  { name: 'TXT', value: 15, color: '#a78bfa' },
  { name: 'Other', value: 15, color: '#10b981' },
];

const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0e0e1c] border border-white/[0.1] rounded-xl px-3 py-2.5 shadow-2xl">
      <p className="text-[10px] text-neutral-500 mb-1.5 uppercase tracking-wider font-bold">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-[11px] sm:text-[12px] font-semibold" style={{ color: p.color }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

const StatCard = ({ title, value, change, icon: Icon, accent, bg, ring }) => (
  <div className="bg-[#0d0d1a] border border-white/[0.06] rounded-2xl p-4 sm:p-5 flex items-center gap-3 hover:border-white/[0.1] transition-all group">
    <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl ${bg} ring-1 ${ring} flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform`}>
      <Icon size={17} className={accent} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[10px] sm:text-[11px] font-bold text-neutral-600 uppercase tracking-wider mb-0.5 truncate">{title}</p>
      <p className="text-xl sm:text-2xl font-black text-white tracking-tight leading-none">{value}</p>
    </div>
    {change !== undefined && (
      <span className={`flex items-center gap-0.5 text-[10px] sm:text-[11px] font-bold px-1.5 sm:px-2 py-1 rounded-lg flex-shrink-0 ${
        change >= 0 ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10'
      }`}>
        {change >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
        {Math.abs(change)}%
      </span>
    )}
  </div>
);

const AnalyticsPage = () => {
  const [range, setRange] = useState('7d');

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-5 py-6 sm:py-8 pb-16 space-y-5 sm:space-y-7">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">Analytics</h1>
          <p className="text-[12px] sm:text-[13px] text-neutral-600 mt-0.5">Performance metrics and usage statistics.</p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button className="flex items-center gap-1.5 text-[12px] text-neutral-400 border border-white/[0.08] hover:border-white/[0.15] bg-transparent hover:bg-white/[0.04] px-3 py-2 rounded-xl transition-all font-medium">
            <Download size={13} /> <span className="hidden sm:inline">Export</span>
          </button>
          <button className="flex items-center gap-1.5 text-[12px] text-white bg-violet-600 hover:bg-violet-500 px-3 py-2 rounded-xl transition-all font-semibold shadow-lg shadow-violet-600/20">
            <Share2 size={13} /> <span className="hidden sm:inline">Share</span>
          </button>
        </div>
      </div>

      {/* ── Stat cards ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        <StatCard title="Total Queries" value="1,284" change={12} icon={BarChart3} accent="text-violet-400" bg="bg-violet-500/10" ring="ring-violet-500/15" />
        <StatCard title="Docs Indexed" value="87" change={24} icon={Layers} accent="text-cyan-400" bg="bg-cyan-500/10" ring="ring-cyan-500/15" />
        <StatCard title="Topics Found" value="412" change={-4} icon={Zap} accent="text-amber-400" bg="bg-amber-500/10" ring="ring-amber-500/15" />
        <StatCard title="Avg Response" value="1.4s" change={8} icon={Clock} accent="text-emerald-400" bg="bg-emerald-500/10" ring="ring-emerald-500/15" />
      </div>

      {/* ── Charts row ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">

        {/* Area chart — full width on mobile, 2/3 on lg */}
        <div className="lg:col-span-2 bg-[#0d0d1a] border border-white/[0.06] rounded-2xl p-4 sm:p-6">
          <div className="flex items-start justify-between mb-4 sm:mb-6 gap-3 flex-wrap">
            <div>
              <h2 className="font-bold text-white text-[14px] sm:text-[15px]">Research Activity</h2>
              <p className="text-[11px] sm:text-[12px] text-neutral-600 mt-0.5">Queries vs document uploads</p>
            </div>
            <div className="flex items-center gap-1 bg-[#0a0a14] border border-white/[0.06] rounded-xl p-1 flex-shrink-0">
              {['7d', '30d', '90d'].map(r => (
                <button key={r} onClick={() => setRange(r)}
                  className={`text-[10px] sm:text-[11px] font-bold px-2.5 sm:px-3 py-1.5 rounded-lg transition-all ${
                    range === r ? 'bg-violet-600 text-white' : 'text-neutral-600 hover:text-neutral-300'
                  }`}>
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="h-48 sm:h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weekData} margin={{ top: 0, right: 0, left: -24, bottom: 0 }}>
                <defs>
                  <linearGradient id="gQ" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c6af7" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#7c6af7" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gD" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="day" stroke="transparent" tick={{ fill: '#4b4b5e', fontSize: 10 }} tickLine={false} />
                <YAxis stroke="transparent" tick={{ fill: '#4b4b5e', fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip content={<Tip />} />
                <Area type="monotone" dataKey="queries" name="Queries" stroke="#7c6af7" strokeWidth={2} fill="url(#gQ)" dot={false} />
                <Area type="monotone" dataKey="docs" name="Docs" stroke="#22d3ee" strokeWidth={2} fill="url(#gD)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center gap-4 sm:gap-5 mt-4 sm:mt-5 pt-3 sm:pt-4 border-t border-white/[0.05] flex-wrap">
            {[
              { dot: 'bg-violet-500', label: 'Queries', val: '116 this week' },
              { dot: 'bg-cyan-500', label: 'Uploads', val: '17 this week' },
            ].map(({ dot, label, val }, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${dot} flex-shrink-0`} />
                <span className="text-[11px] sm:text-[12px] text-neutral-500">{label}</span>
                <span className="text-[11px] sm:text-[12px] font-semibold text-white">{val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Side column */}
        <div className="flex flex-col gap-4 sm:gap-5">
          {/* Pie chart */}
          <div className="bg-[#0d0d1a] border border-white/[0.06] rounded-2xl p-4 sm:p-6 flex-1">
            <h2 className="font-bold text-white text-[14px] sm:text-[15px] mb-0.5">File Types</h2>
            <p className="text-[11px] sm:text-[12px] text-neutral-600 mb-3 sm:mb-4">Document composition</p>
            <div className="h-32 sm:h-36">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={fileTypes} cx="50%" cy="50%" innerRadius={38} outerRadius={56} paddingAngle={4} dataKey="value">
                    {fileTypes.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip content={<Tip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-y-2 gap-x-3 mt-3">
              {fileTypes.map((f, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: f.color }} />
                    <span className="text-[11px] sm:text-[12px] text-neutral-400">{f.name}</span>
                  </div>
                  <span className="text-[11px] sm:text-[12px] font-bold text-white">{f.value}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Health card */}
          <div className="bg-gradient-to-br from-emerald-600/10 to-teal-600/10 border border-emerald-500/15 rounded-2xl p-4 sm:p-5 flex items-center justify-between group cursor-pointer hover:border-emerald-500/30 transition-all">
            <div>
              <CheckCircle className="text-emerald-400 mb-1.5 sm:mb-2" size={20} />
              <h3 className="font-bold text-white text-[13px] sm:text-[14px]">System Health</h3>
              <p className="text-[11px] sm:text-[12px] text-emerald-400/80 mt-0.5">All services operational</p>
            </div>
            <ChevronRight size={17} className="text-emerald-500/40 group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
          </div>
        </div>
      </div>

      {/* ── Bar chart ──────────────────────────────────────────────────── */}
      <div className="bg-[#0d0d1a] border border-white/[0.06] rounded-2xl p-4 sm:p-6">
        <div className="flex items-start justify-between mb-4 sm:mb-6 gap-3 flex-wrap">
          <div>
            <h2 className="font-bold text-white text-[14px] sm:text-[15px]">Token Usage</h2>
            <p className="text-[11px] sm:text-[12px] text-neutral-600 mt-0.5">Daily API consumption</p>
          </div>
          <span className="text-[11px] sm:text-[12px] font-bold text-violet-400 bg-violet-500/10 border border-violet-500/20 px-3 py-1.5 rounded-xl whitespace-nowrap">
            5,000 / 10,000 tokens
          </span>
        </div>
        <div className="h-36 sm:h-44">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weekData} margin={{ top: 0, right: 0, left: -24, bottom: 0 }} barSize={22}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="day" stroke="transparent" tick={{ fill: '#4b4b5e', fontSize: 10 }} tickLine={false} />
              <YAxis stroke="transparent" tick={{ fill: '#4b4b5e', fontSize: 10 }} tickLine={false} axisLine={false} />
              <Tooltip content={<Tip />} />
              <Bar dataKey="tokens" name="Tokens" fill="#7c6af7" radius={[5, 5, 0, 0]} fillOpacity={0.85} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Activity table ─────────────────────────────────────────────── */}
      <div className="bg-[#0d0d1a] border border-white/[0.06] rounded-2xl overflow-hidden">
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-white/[0.05] flex items-center justify-between">
          <h2 className="font-bold text-white text-[14px] sm:text-[15px]">Recent Activity</h2>
          <span className="text-[11px] sm:text-[12px] text-neutral-600">Last 7 days</span>
        </div>
        <div className="divide-y divide-white/[0.04]">
          {[
            { action: 'Queried EV motor power specs', doc: 'EV_Racing_Rules.pdf', time: '2h ago', type: 'query' },
            { action: 'Uploaded EIOT Lab Manual', doc: 'EIOT-lab-manual.pdf', time: '4h ago', type: 'upload' },
            { action: 'Queried trip itinerary highlights', doc: 'Trip to keralam.pdf', time: '6h ago', type: 'query' },
            { action: 'Generated document summary', doc: 'UX-V2.pdf', time: '1d ago', type: 'summary' },
          ].map((row, i) => (
            <div key={i} className="flex items-center gap-3 px-4 sm:px-6 py-3 hover:bg-white/[0.02] transition-colors">
              <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                row.type === 'upload' ? 'bg-cyan-500/10' : row.type === 'summary' ? 'bg-amber-500/10' : 'bg-violet-500/10'
              }`}>
                <FileText size={12} className={row.type === 'upload' ? 'text-cyan-400' : row.type === 'summary' ? 'text-amber-400' : 'text-violet-400'} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] sm:text-[13px] text-white font-medium truncate">{row.action}</p>
                <p className="text-[10px] sm:text-[11px] text-neutral-600 mt-0.5 truncate">{row.doc}</p>
              </div>
              <span className="text-[10px] sm:text-[11px] text-neutral-700 flex-shrink-0 whitespace-nowrap">{row.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;