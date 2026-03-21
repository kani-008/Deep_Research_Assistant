// ./frontend/src/pages/AnalyticsPage.jsx

import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart as PieIcon, 
  Clock, 
  Zap, 
  Layers, 
  Download, 
  Share2, 
  File, 
  ChevronRight,
  TrendingUp as TrendingUpIcon,
  CircleCheck,
  LayoutDashboard
} from 'lucide-react';
import { motion } from 'framer-motion';

const data = [
  { name: 'Mon', questions: 12, tokens: 450, docs: 2 },
  { name: 'Tue', questions: 18, tokens: 920, docs: 4 },
  { name: 'Wed', questions: 15, tokens: 730, docs: 1 },
  { name: 'Thu', questions: 25, tokens: 1200, docs: 5 },
  { name: 'Fri', questions: 22, tokens: 850, docs: 3 },
  { name: 'Sat', questions: 10, tokens: 300, docs: 0 },
  { name: 'Sun', questions: 14, tokens: 550, docs: 2 },
];

const pieData = [
  { name: 'PDF', value: 45, color: '#06b6d4' },
  { name: 'DOCX', value: 25, color: '#6366f1' },
  { name: 'TXT', value: 15, color: '#a855f7' },
  { name: 'Other', value: 15, color: '#10b981' },
];

const StatCard = ({ title, value, change, icon: Icon, color }) => (
  <div className="bg-white/5 border border-white/5 rounded-[2rem] p-8 flex flex-col gap-4 hover:bg-white/[0.08] hover:border-white/10 transition-all group overflow-hidden relative">
    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[40px] translate-x-12 -translate-y-12"></div>
    <div className="flex items-center justify-between">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-xl transition-transform group-hover:scale-110 ${color}`}>
        <Icon size={24} className="text-white" />
      </div>
      {change && (
        <span className={`flex items-center gap-1 text-xs font-black ${change > 0 ? 'text-emerald-500' : 'text-red-500'} bg-white/5 px-2 py-1 rounded-full`}>
          {change > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          {Math.abs(change)}%
        </span>
      )}
    </div>
    <div>
      <p className="text-xs font-black text-neutral-500 uppercase tracking-widest">{title}</p>
      <p className="text-3xl font-black text-white mt-1">{value}</p>
    </div>
  </div>
);

const AnalyticsPage = () => {
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-12 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-5xl font-black text-white mb-2 tracking-tight">System <span className="gradient-text">Analytics</span></h1>
          <p className="text-neutral-400 font-medium tracking-tight">Real-time performance metrics and usage statistics of your Deep Research Assistant.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 py-2 px-5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all font-bold text-sm">
            <Download size={18} className="text-neutral-400" />
            <span>Export Report</span>
          </button>
          <button className="flex items-center gap-2 py-2 px-5 bg-primary rounded-xl hover:bg-primary-dark transition-all font-bold text-sm shadow-xl shadow-primary/20 text-white">
            <Share2 size={18} />
            <span>Share Dashboard</span>
          </button>
        </div>
      </header>

      {/* Hero stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Questions" value="1,284" change={12} icon={BarChart3} color="bg-primary shadow-primary/20" />
        <StatCard title="Documents Indexed" value="87" change={24} icon={Layers} color="bg-accent shadow-accent/20" />
        <StatCard title="Topics Detected" value="412" change={-4} icon={Zap} color="bg-yellow-500 shadow-yellow-500/20" />
        <StatCard title="Avg. Resp Time" value="1.4s" change={8} icon={Clock} color="bg-purple-600 shadow-purple-600/20" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main chart */}
        <div className="lg:col-span-2 bg-white/5 border border-white/5 rounded-[2.5rem] p-8 space-y-8 hover:bg-white/[0.08] transition-all group overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] translate-x-32 -translate-y-32"></div>
          <div className="flex items-center justify-between relative z-10">
            <div>
              <h2 className="text-xl font-black text-white">Research Activity</h2>
              <p className="text-xs font-medium text-neutral-500 tracking-widest uppercase mt-1">Questions vs Document Uploads</p>
            </div>
            <div className="flex items-center gap-4 bg-white/5 p-1 rounded-xl border border-white/5">
              <button className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold transition-all">Today</button>
              <button className="px-3 py-1.5 bg-primary/20 text-primary border border-primary/20 rounded-lg text-xs font-bold transition-all shadow-lg">Last 7 Days</button>
              <button className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold transition-all">Month</button>
            </div>
          </div>
          
          <div className="h-[350px] w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorQuestions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorDocs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                  dataKey="name" 
                  stroke="rgba(255,255,255,0.3)" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.3)" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(value) => `${value}`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#171717', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', color: '#fff' }}
                  itemStyle={{ fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="questions" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#colorQuestions)" />
                <Area type="monotone" dataKey="docs" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorDocs)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          
          <div className="grid grid-cols-3 gap-4 pt-4 relative z-10 border-t border-white/5">
            {[
              { label: 'Highest Pulse', value: '25 Queries', unit: 'Thu', color: 'text-primary' },
              { label: 'Growth rate', value: '+142%', unit: 'This Week', color: 'text-emerald-500' },
              { label: 'Response accuracy', value: '98.4%', unit: 'System Avg', color: 'text-purple-500' }
            ].map((item, i) => (
              <div key={i}>
                <p className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] mb-1">{item.label}</p>
                <div className="flex items-baseline gap-2">
                  <span className={`text-lg font-black ${item.color}`}>{item.value}</span>
                  <span className="text-[10px] font-bold text-neutral-600">{item.unit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Side charts */}
        <div className="flex flex-col gap-8">
          {/* File distribution */}
          <div className="bg-white/5 border border-white/5 rounded-[2.5rem] p-8 hover:bg-white/[0.08] transition-all group overflow-hidden relative flex-1">
             <h2 className="text-xl font-black text-white mb-6">File Composition</h2>
             <div className="h-[200px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie
                     data={pieData}
                     cx="50%"
                     cy="50%"
                     innerRadius={60}
                     outerRadius={80}
                     paddingAngle={5}
                     dataKey="value"
                   >
                     {pieData.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={entry.color} />
                     ))}
                   </Pie>
                   <Tooltip 
                    contentStyle={{ backgroundColor: '#171717', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', color: '#fff' }}
                  />
                 </PieChart>
               </ResponsiveContainer>
             </div>
             <div className="space-y-3 mt-4">
               {pieData.map((item, i) => (
                 <div key={i} className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                     <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                     <span className="text-sm font-bold text-neutral-300">{item.name} Files</span>
                   </div>
                   <span className="text-sm font-black text-white">{item.value}%</span>
                 </div>
               ))}
             </div>
          </div>

          <div className="bg-gradient-to-tr from-emerald-600/20 to-teal-500/20 border border-emerald-500/20 rounded-[2.5rem] p-8 flex items-center justify-between group">
             <div>
                <CircleCheck size={40} className="text-emerald-500 mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-black text-white mb-1">System Health</h3>
                <p className="text-sm text-emerald-400 font-bold opacity-80">All services operational</p>
             </div>
             <ChevronRight size={24} className="text-emerald-500/50 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
