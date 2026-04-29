import React from 'react';
import { motion } from 'motion/react';
import { Activity, Beaker, Brain, Cpu, Globe, Layers, Zap } from 'lucide-react';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

const statsData = [
  { name: 'Synapses', val: 4500 },
  { name: 'Epochs', val: 1200 },
  { name: 'Neurons', val: 890 },
  { name: 'Latent', val: 2400 },
];

export default function Dashboard() {
  return (
    <div id="dashboard-root" className="space-y-8 max-w-6xl mx-auto p-4 sm:p-8">
      <header id="dashboard-header" className="space-y-2">
        <div className="flex items-center gap-2 text-lab-primary">
          <Activity className="w-4 h-4" />
          <p className="mono-label">System Online</p>
        </div>
        <h1 className="text-4xl font-bold tracking-tight">Intelligence Oversight</h1>
        <p className="text-slate-400 max-w-2xl">
          Welcome to NeuroLab v2. Monitor real-time heuristic simulations and architectural 
          transparency across various artificial neural models.
        </p>
      </header>

      <div id="quick-stats-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { icon: Brain, label: 'Cognitive Load', val: '42%', color: 'text-lab-primary', id: 'stat-cog-load' },
          { icon: Cpu, label: 'Compute Power', val: '1.2 TFLOPS', color: 'text-lab-accent', id: 'stat-compute' },
          { icon: Globe, label: 'Network Depth', val: '12 Layers', color: 'text-yellow-400', id: 'stat-depth' },
          { icon: Zap, label: 'Throughput', val: '850 req/s', color: 'text-green-400', id: 'stat-throughput' },
        ].map((item, i) => (
          <motion.div
            key={i}
            id={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-panel p-6 rounded-2xl border-l-4 border-l-lab-primary"
          >
            <item.icon className={`w-5 h-5 mb-4 ${item.color}`} />
            <p className="mono-label text-slate-500">{item.label}</p>
            <p className="text-2xl font-bold font-mono mt-1">{item.val}</p>
          </motion.div>
        ))}
      </div>

      <div id="detailed-stats-grid" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div id="heuristic-chart-card" className="lg:col-span-2 glass-panel rounded-3xl p-8 space-y-6">
           <div className="flex justify-between items-center">
             <h3 className="font-semibold text-lg flex items-center gap-2">
               <Layers className="w-5 h-5 text-lab-primary" />
               Global Heuristic Stats
             </h3>
             <span className="mono-label text-[10px] bg-slate-800 px-2 py-1 rounded">Live Feed</span>
           </div>
           
           <div id="bar-chart-container" className="h-64 w-full relative">
             <ResponsiveContainer width="100%" height="100%" minWidth={0}>
               <BarChart data={statsData}>
                 <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} />
                 <YAxis hide />
                 <Tooltip 
                  cursor={{ fill: 'rgba(56,189,248,0.1)' }}
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                 />
                 <Bar dataKey="val" fill="#38bdf8" radius={[4, 4, 0, 0]} />
               </BarChart>
             </ResponsiveContainer>
           </div>
        </div>

        <div id="active-labs-card" className="glass-panel rounded-3xl p-8 space-y-6">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Beaker className="w-5 h-5 text-lab-accent" />
            Active Labs
          </h3>
          
          <div id="labs-status-list" className="space-y-4">
             {[
               { name: 'Perceptron Class', time: 'Active', id: 'lab-status-perceptron' },
               { name: 'CNN Layers', time: 'Hibernating', id: 'lab-status-cnn' },
               { name: 'Evolutionary Grid', time: 'Active', id: 'lab-status-evo' },
             ].map((lab, i) => (
               <div key={i} id={lab.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 border border-lab-border">
                 <span className="text-sm font-medium">{lab.name}</span>
                 <span className={`text-[10px] px-2 py-0.5 rounded-full ${lab.time === 'Active' ? 'bg-green-500/10 text-green-400' : 'bg-slate-700 text-slate-500'}`}>
                   {lab.time}
                 </span>
               </div>
             ))}
          </div>

          <div className="pt-4 border-t border-lab-border">
            <p className="text-xs text-slate-400 leading-relaxed italic">
              "The goal of AI isn't to build a perfect machine, but to understand the mechanics of learning itself."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
