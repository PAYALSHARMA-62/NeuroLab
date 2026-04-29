import React from 'react';
import { LabType, LabInfo } from '../types';
import { LayoutDashboard, Zap, Network, Dna, FlaskConical, Github } from 'lucide-react';

const LABS: LabInfo[] = [
  { id: 'dashboard', title: 'Status Center', description: 'Lab health and statistics', icon: 'LayoutDashboard' },
  { id: 'perceptron', title: 'The Perceptron', description: 'Binary classification visualizer', icon: 'Zap' },
  { id: 'neural', title: 'Neural Canvas', description: 'Network architecture & flow', icon: 'Network' },
  { id: 'genetic', title: 'Genetic Engine', description: 'Population evolution', icon: 'Dna' },
];

interface SidebarProps {
  activeLab: LabType;
  onSelect: (id: LabType) => void;
}

const iconMap: Record<string, React.ReactNode> = {
  LayoutDashboard: <LayoutDashboard />,
  Zap: <Zap />,
  Network: <Network />,
  Dna: <Dna />,
};

export default function Sidebar({ activeLab, onSelect }: SidebarProps) {
  return (
    <aside id="sidebar-root" className="w-64 border-r border-lab-border h-full flex flex-col bg-slate-900/30 backdrop-blur-xl">
      <div className="p-8 pb-4">
        <div id="sidebar-brand" className="flex items-center gap-3 text-lab-primary mb-8">
          <FlaskConical className="w-8 h-8" />
          <h1 className="text-xl font-bold tracking-tight font-serif italic">NeuroLab</h1>
        </div>
        
        <nav id="sidebar-nav" className="space-y-1">
          <p className="mono-label mb-4 opacity-50">Discovery Labs</p>
          {LABS.map((lab) => (
            <button
              key={lab.id}
              id={`nav-${lab.id}`}
              onClick={() => onSelect(lab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                activeLab === lab.id 
                ? 'bg-lab-primary/10 text-lab-primary border border-lab-primary/20 shadow-[0_0_15px_rgba(56,189,248,0.1)]' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <div className={`p-1.5 rounded-lg transition-colors ${activeLab === lab.id ? 'bg-lab-primary/20' : 'bg-slate-800'}`}>
                {lab.icon === 'LayoutDashboard' && <LayoutDashboard className="w-4 h-4" />}
                {lab.icon === 'Zap' && <Zap className="w-4 h-4" />}
                {lab.icon === 'Network' && <Network className="w-4 h-4" />}
                {lab.icon === 'Dna' && <Dna className="w-4 h-4" />}
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold">{lab.title}</p>
              </div>
            </button>
          ))}
        </nav>
      </div>
      
      <div id="sidebar-footer" className="mt-auto p-8 pt-4">
        <div id="sidebar-status-card" className="glass-panel p-4 rounded-xl space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="mono-label text-[9px]">Server: Compute Node 01</span>
          </div>
          <p className="text-[10px] text-slate-500 leading-tight">
            NeuroLab is an experimental platform for visualizing neural heuristics.
          </p>
        </div>
        <div className="mt-4 flex justify-between items-center px-1 opacity-40 hover:opacity-100 transition-opacity">
           <span className="text-[8px] font-mono uppercase tracking-widest">v2.5.0-ALPHA</span>
           <Github className="w-3 h-3" />
        </div>
      </div>
    </aside>
  );
}
