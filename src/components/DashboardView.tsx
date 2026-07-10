import React from 'react';
import { LogEntry } from '../types';
import { 
  Dna, 
  FlaskConical, 
  History, 
  Trophy, 
  BookOpen, 
  Database,
  ArrowRight,
  Sparkles,
  Search,
  Plus
} from 'lucide-react';

interface DashboardViewProps {
  logs: LogEntry[];
  onStartExperiment: () => void;
  onSelectGenome: () => void;
}

export default function DashboardView({ logs, onStartExperiment, onSelectGenome }: DashboardViewProps) {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Welcome Title Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 rounded-2xl glass-panel border-[#00dce6]/20 bg-gradient-to-r from-cyan-950/20 to-transparent">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#39ff14] animate-pulse" />
            <span className="text-xs font-mono font-semibold text-[#39ff14] tracking-widest uppercase">
              Lab Node Alpha-7 Online
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-black text-white tracking-tight leading-none">
            Bio-Incubator Terminal
          </h1>
          <p className="text-sm text-gray-300 mt-2 max-w-xl font-sans font-normal">
            All primary environmental matrices nominal. Awaiting core sequence protocol initiation.
          </p>
        </div>
        <div>
          <button
            onClick={onStartExperiment}
            className="w-full md:w-auto px-6 py-3.5 bg-gradient-to-r from-[#39ff14] to-emerald-500 hover:from-emerald-400 hover:to-green-400 text-[#053900] font-mono text-xs font-bold uppercase tracking-wider rounded-lg shadow-[0_0_25px_rgba(57,255,20,0.4)] hover:shadow-[0_0_35px_rgba(57,255,20,0.6)] active:scale-95 transition-all duration-200 flex items-center justify-center gap-2"
          >
            <FlaskConical className="w-4 h-4 text-[#053900]" />
            Start Experiment
            <ArrowRight className="w-4 h-4 text-[#053900]" />
          </button>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
        
        {/* Core Primary Call To Action Panel */}
        <div 
          onClick={onStartExperiment}
          className="lg:col-span-8 p-8 rounded-2xl glass-panel border-[#39ff14]/30 hover:border-[#39ff14]/60 transition-all duration-300 cursor-pointer group relative overflow-hidden flex flex-col justify-between min-h-[300px] glow-green-hover"
        >
          {/* Decorative glowing background mesh */}
          <div className="absolute -right-20 -top-20 w-60 h-60 bg-[#39ff14]/5 rounded-full blur-3xl group-hover:bg-[#39ff14]/10 transition-all duration-500" />
          
          <div className="flex justify-between items-start z-10">
            <div className="p-4 bg-emerald-950/40 rounded-xl border border-emerald-500/30 text-[#39ff14] shadow-[0_0_15px_rgba(57,255,20,0.15)] group-hover:scale-105 transition-transform duration-300">
              <FlaskConical className="w-8 h-8" />
            </div>
            <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-widest text-[#39ff14] bg-[#39ff14]/10 border border-[#39ff14]/40 flex items-center gap-2 uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-[#39ff14] animate-ping" />
              SYSTEM ACTIVE
            </span>
          </div>

          <div className="z-10 mt-8">
            <h2 className="text-2xl md:text-3xl font-display font-extrabold text-white group-hover:text-[#39ff14] transition-colors flex items-center gap-2">
              Begin Incubation Loop
              <ArrowRight className="w-6 h-6 text-[#39ff14] group-hover:translate-x-2 transition-transform duration-300" />
            </h2>
            <p className="text-sm text-gray-300 mt-2 max-w-xl">
              Initialize real-time synthetic cell division. Choose E. coli, Yeast, or Lactobacillus, establish custom thermal/pH matrices, and monitor logistic curve density.
            </p>
          </div>
        </div>

        {/* Experiment Logs Sidebar Card */}
        <div className="lg:col-span-4 p-6 rounded-2xl glass-panel border-white/10 hover:border-[#00dce6]/40 transition-all duration-300 flex flex-col justify-between min-h-[300px]">
          <div>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2 text-cyan-400">
                <History className="w-5 h-5" />
                <h3 className="text-sm font-mono font-bold uppercase tracking-wider">Experiment Logs</h3>
              </div>
              <span className="text-[10px] font-mono text-gray-400">HISTORY</span>
            </div>

            <div className="space-y-3">
              {logs.length === 0 ? (
                <div className="py-8 text-center text-xs text-gray-400 font-mono">
                  No records stored yet.<br />Initiate simulation to persist logs.
                </div>
              ) : (
                logs.slice(0, 4).map((log) => (
                  <div 
                    key={log.id} 
                    className="flex items-center justify-between p-2.5 rounded bg-black/30 border border-white/5 text-xs font-mono"
                  >
                    <div className="space-y-0.5">
                      <div className="text-gray-100 font-bold">{log.bacteriaName}</div>
                      <div className="text-gray-400 text-[10px]">{log.timestamp}</div>
                    </div>
                    <div className="text-right space-y-0.5">
                      <div className="text-gray-100 font-bold">{log.finalCount}M</div>
                      <div 
                        className={`text-[10px] font-bold ${
                          log.status === 'SUCCESS' 
                            ? 'text-[#39ff14]' 
                            : log.status === 'STAGNANT' 
                            ? 'text-cyan-400' 
                            : 'text-red-400'
                        }`}
                      >
                        {log.status}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="pt-4 border-t border-white/5 text-center">
            <span className="text-[10px] font-mono text-gray-400">
              Auto-saved to Sandbox Storage
            </span>
          </div>
        </div>

        {/* Leaderboard / Ranking Board Card */}
        <div className="lg:col-span-5 p-6 rounded-2xl glass-panel border-white/10 hover:border-cyan-400/30 transition-all duration-300">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2 text-[#39ff14]">
              <Trophy className="w-5 h-5" />
              <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-white">Ranking Board</h3>
            </div>
            <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">LEADERBOARD</span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between p-3 rounded bg-[#39ff14]/5 border border-[#39ff14]/20">
              <div className="flex items-center gap-3">
                <span className="text-[#39ff14] font-black">#1</span>
                <span className="text-white font-medium">Dr. Vance (Lab Lead)</span>
              </div>
              <span className="text-[#39ff14] font-bold">98.4% Efficiency</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded bg-cyan-950/10 border border-cyan-500/10">
              <div className="flex items-center gap-3">
                <span className="text-cyan-400 font-bold">#2</span>
                <span className="text-white font-medium">Unit 04 (AI Synthesizer)</span>
              </div>
              <span className="text-cyan-400 font-bold">92.1% Efficiency</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded bg-black/20 border border-white/5 opacity-60">
              <div className="flex items-center gap-3">
                <span className="text-gray-400">#3</span>
                <span className="text-white">Sys Admin</span>
              </div>
              <span className="text-gray-300">88.9% Efficiency</span>
            </div>
          </div>
        </div>

        {/* Bacteria Encyclopedia Card */}
        <div 
          onClick={onSelectGenome}
          className="lg:col-span-7 p-6 rounded-2xl glass-panel border-white/10 hover:border-[#00dce6]/40 transition-all duration-300 cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2 text-cyan-400">
              <BookOpen className="w-5 h-5" />
              <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-white">Genome Encyclopedia</h3>
            </div>
            <span className="text-[10px] font-mono text-gray-400">DATABASE</span>
          </div>

          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="flex-1 space-y-2">
              <h4 className="text-lg font-display font-bold text-white group-hover:text-cyan-400 transition-colors">
                Cataloged Synthetic Organisms
              </h4>
              <p className="text-xs text-gray-300 leading-relaxed">
                Review complete genetic markers, nutrient requirements, and optimal pH/temperature matrices for E. coli, Yeast, and other biological substrates.
              </p>
            </div>
            
            <div className="w-full md:w-36 h-24 bg-black/40 rounded-xl border border-white/5 flex flex-col items-center justify-center p-3 text-center relative overflow-hidden shrink-0">
              <div className="absolute inset-0 opacity-10 flex items-center justify-center animate-[spin_20s_linear_infinite]">
                <Dna className="w-20 h-20 text-cyan-400" />
              </div>
              <span className="text-2xl font-mono font-black text-cyan-400 drop-shadow-[0_0_10px_rgba(0,220,230,0.5)]">4,092</span>
              <span className="text-[9px] font-mono text-gray-300 uppercase tracking-widest mt-1">GENETIC FILES</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
