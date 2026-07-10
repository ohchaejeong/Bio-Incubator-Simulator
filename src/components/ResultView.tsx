import React from 'react';
import { SimulationDataPoint, ExperimentConfig } from '../types';
import GrowthChart from './GrowthChart';
import { 
  CheckCircle2, 
  AlertOctagon, 
  RefreshCcw, 
  Save, 
  Flame, 
  Sparkles,
  ShieldAlert,
  Dna,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

interface ResultViewProps {
  config: ExperimentConfig;
  history: SimulationDataPoint[];
  finalCount: number;
  score: number;
  status: 'SUCCESS' | 'STAGNANT' | 'FAILED';
  onRetry: () => void;
  onSaveLog: () => void;
}

export default function ResultView({ 
  config, 
  history, 
  finalCount, 
  score, 
  status, 
  onRetry, 
  onSaveLog 
}: ResultViewProps) {
  const { bacteria, temperature, ph, nutrients, oxygenSufficient, incubationTime } = config;

  // Determine localized description strings
  const getStatusTitleEn = () => {
    if (status === 'SUCCESS') return 'SIMULATION SUCCESSFUL!';
    if (status === 'STAGNANT') return 'GROWTH STAGNATED';
    return 'CELLULAR COLLAPSE / DECAY';
  };

  const getStatusTitleKr = () => {
    if (status === 'SUCCESS') return '실험 성공 (Optimal Growth)';
    if (status === 'STAGNANT') return '성장 정체 (Suboptimal Growth)';
    return '세균 사멸 (Cellular Decay)';
  };

  const getStatusDescription = () => {
    if (status === 'SUCCESS') {
      return `The environmental conditions allowed ${bacteria.name} to thrive. Standard replication met carrying capacities within ideal limits.`;
    }
    if (status === 'STAGNANT') {
      return `Replication was severely constrained. Highly suboptimal nutrient levels, pH variables, or temperature mismatches limited the growth matrix.`;
    }
    return `Critical environmental variables caused complete cell death. No exponential growth activated, resulting in cellular decay.`;
  };

  const getEvaluationTier = () => {
    if (score >= 90) return 'Alpha-Class Lab Synthesis (우수 등급)';
    if (score >= 60) return 'Beta-Class Nominal Output (보통 등급)';
    return 'Sub-nominal Growth Yield (미흡 등급)';
  };

  // Status-specific themes
  const primaryColorClass = status === 'SUCCESS' ? 'text-[#39ff14]' : status === 'STAGNANT' ? 'text-cyan-400' : 'text-red-400';
  const primaryBgClass = status === 'SUCCESS' ? 'bg-[#39ff14]/10 border-[#39ff14]/30' : status === 'STAGNANT' ? 'bg-cyan-500/10 border-cyan-500/30' : 'bg-red-500/10 border-red-500/30';
  const badgeGlowClass = status === 'SUCCESS' ? 'shadow-[0_0_20px_rgba(57,255,20,0.4)] border-[#39ff14]' : status === 'STAGNANT' ? 'shadow-[0_0_20px_rgba(0,220,230,0.4)] border-cyan-400' : 'shadow-[0_0_20px_rgba(239,68,68,0.4)] border-red-500';

  return (
    <div className="space-y-8 animate-fade-in text-white">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">[ LAB REPORT - CYCLE SEC_08 ]</span>
          <h2 className="text-2xl md:text-3xl font-display font-black">Post-Experiment Synthesis Report</h2>
          <p className="text-xs text-gray-300">
            Final diagnostic data and logistic regression curves for biological substrate <span className="text-cyan-400 font-bold">{bacteria.name}</span>.
          </p>
        </div>
        <button
          onClick={onRetry}
          className="px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider border border-white/10 hover:bg-white/5 rounded-lg transition-colors flex items-center justify-center gap-1"
        >
          <RefreshCcw className="w-3.5 h-3.5" />
          Re-Configure
        </button>
      </div>

      {/* Main Grid: Left side (Outcome details, Stats, Graph) & Right side (Config settings) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Simulation Outcome & Stats Grid */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Success / Failure Banner Card */}
          <div className={`p-6 rounded-2xl border flex flex-col md:flex-row items-center gap-5 text-center md:text-left ${primaryBgClass}`}>
            <div className={`w-16 h-16 rounded-full flex items-center justify-center bg-black/40 border-2 shrink-0 ${badgeGlowClass}`}>
              {status === 'FAILED' ? (
                <ShieldAlert className={`w-8 h-8 ${primaryColorClass}`} />
              ) : (
                <CheckCircle2 className={`w-8 h-8 ${primaryColorClass}`} />
              )}
            </div>
            <div className="space-y-1">
              <h3 className={`text-2xl font-display font-black tracking-tight ${primaryColorClass}`}>
                {getStatusTitleEn()}
              </h3>
              <p className="text-xs font-bold text-gray-100 uppercase tracking-wider">
                {getStatusTitleKr()}
              </p>
              <p className="text-xs text-gray-300 font-sans leading-relaxed pt-1 max-w-xl">
                {getStatusDescription()}
              </p>
            </div>
          </div>

          {/* Stats Report Grid (Three blocks) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* 1. Concentration block */}
            <div className="p-5 rounded-2xl glass-panel border-white/10 hover:border-cyan-400/20 transition-all flex flex-col justify-between h-[150px]">
              <div className="flex items-center gap-1.5 text-cyan-400 font-mono text-[10px] uppercase tracking-wider">
                <Dna className="w-3.5 h-3.5" />
                <span>Final Concentration</span>
              </div>
              <div className="space-y-0.5 my-2">
                <div className="text-3xl font-display font-black text-white">
                  {finalCount.toFixed(1)}M
                </div>
                <div className="text-[10px] font-mono text-gray-400">Million cells/mL</div>
              </div>
              <div className="pt-2 border-t border-white/5">
                <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${
                  status === 'SUCCESS' ? 'text-[#39ff14]' : status === 'STAGNANT' ? 'text-cyan-400' : 'text-red-400'
                }`}>
                  {status === 'SUCCESS' ? '● Optimal Growth' : status === 'STAGNANT' ? '● Suboptimal Yield' : '● Growth Collapsed'}
                </span>
              </div>
            </div>

            {/* 2. Growth Efficiency block */}
            <div className="p-5 rounded-2xl glass-panel border-white/10 hover:border-cyan-400/20 transition-all flex flex-col justify-between h-[150px]">
              <div className="flex items-center gap-1.5 text-cyan-400 font-mono text-[10px] uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Growth Efficiency</span>
              </div>
              <div className="space-y-2 my-1">
                <div className="text-3xl font-display font-black text-white">
                  {Math.round((finalCount / bacteria.carryingCapacity) * 100)}%
                </div>
                {/* Horizontal simple progress bar */}
                <div className="w-full bg-black/60 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${
                      status === 'SUCCESS' ? 'bg-[#39ff14]' : status === 'STAGNANT' ? 'bg-cyan-400' : 'bg-red-400'
                    }`}
                    style={{ width: `${Math.min(100, Math.round((finalCount / bacteria.carryingCapacity) * 100))}%` }}
                  />
                </div>
              </div>
              <div className="text-[9px] font-mono text-gray-400 uppercase tracking-widest leading-none pt-1">
                Compared to max capacity
              </div>
            </div>

            {/* 3. Lab Evaluation Score block */}
            <div className="p-5 rounded-2xl glass-panel border-white/10 hover:border-cyan-400/20 transition-all flex flex-col justify-between h-[150px]">
              <div className="flex items-center gap-1.5 text-cyan-400 font-mono text-[10px] uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Synthesis Rating</span>
              </div>
              <div className="space-y-0.5 my-2">
                <div className="text-3xl font-display font-black text-white">
                  {score}<span className="text-xs text-gray-400 font-mono"> / 100 pts</span>
                </div>
                <div className="text-[10px] font-mono text-[#39ff14] font-bold tracking-wider uppercase">
                  {score >= 90 ? 'EXCELLENT' : score >= 60 ? 'SATISFACTORY' : 'UNSATISFACTORY'}
                </div>
              </div>
              <div className="text-[9px] font-mono text-gray-400 leading-none truncate">
                {getEvaluationTier()}
              </div>
            </div>

          </div>

          {/* Shaded dynamic Growth Curve graph box */}
          <div className="p-6 rounded-2xl glass-panel border-white/10 space-y-4">
            <h4 className="text-sm font-mono font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2">
              Logistic Growth Trajectory Curve
            </h4>
            <div className="h-[240px]">
              <GrowthChart 
                data={history} 
                maxTime={incubationTime} 
                carryingCapacity={bacteria.carryingCapacity} 
                status={status} 
              />
            </div>
          </div>

        </div>

        {/* Right Side: Environment Settings Overview Panel */}
        <div className="lg:col-span-4 p-6 rounded-2xl glass-panel border-white/10 space-y-4">
          <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2">
            SETUP ENVIRONMENT MATRICES
          </h3>

          <div className="space-y-3 font-mono text-xs">
            <div className="flex justify-between p-3 rounded bg-black/40 border border-white/5">
              <span className="text-gray-400 uppercase">Organism</span>
              <span className="text-white font-bold">{bacteria.name}</span>
            </div>

            <div className="flex justify-between p-3 rounded bg-black/40 border border-white/5">
              <span className="text-gray-400 uppercase">Temperature</span>
              <span className="text-white font-bold">{temperature}°C (Optimum {bacteria.optTemp}°C)</span>
            </div>

            <div className="flex justify-between p-3 rounded bg-black/40 border border-white/5">
              <span className="text-gray-400 uppercase">pH Variable</span>
              <span className="text-white font-bold">pH {ph.toFixed(1)} (Optimum pH {bacteria.optPh.toFixed(1)})</span>
            </div>

            <div className="flex justify-between p-3 rounded bg-black/40 border border-white/5">
              <span className="text-gray-400 uppercase">Nutrient Feed</span>
              <span className="text-[#39ff14] font-bold uppercase">{nutrients}</span>
            </div>

            <div className="flex justify-between p-3 rounded bg-black/40 border border-white/5">
              <span className="text-gray-400 uppercase">Oxygen (O₂)</span>
              <span className="text-cyan-400 font-bold uppercase">
                {oxygenSufficient ? 'SUFFICIENT' : 'INSUFFICIENT'}
              </span>
            </div>

            <div className="flex justify-between p-3 rounded bg-black/40 border border-white/5">
              <span className="text-gray-400 uppercase">Total Period</span>
              <span className="text-white font-bold">{incubationTime} hours</span>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-cyan-500/15 bg-cyan-950/10 text-[11px] text-cyan-300 font-sans leading-relaxed">
            These calibration variables feed directly into the logistic growth rate model:<br />
            <span className="font-mono font-bold block mt-1 text-white text-center">
              dN/dt = r * N * (1 - N / K)
            </span>
          </div>
        </div>

      </div>

      {/* Action Buttons: Retry & Save to Logs list */}
      <div className="flex flex-col sm:flex-row gap-4 justify-end pt-4 border-t border-white/5">
        <button
          onClick={onRetry}
          className="w-full sm:w-auto px-8 py-3.5 border border-cyan-400/40 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 font-mono text-xs font-bold uppercase tracking-wider rounded-lg flex items-center justify-center gap-1.5 transition-all"
        >
          <RefreshCcw className="w-4 h-4" />
          Retry Experiment
        </button>

        <button
          onClick={onSaveLog}
          className="w-full sm:w-auto px-10 py-3.5 bg-[#39ff14] hover:bg-green-400 text-[#053900] font-mono text-xs font-black uppercase tracking-wider rounded-lg flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(57,255,20,0.4)] transition-all"
        >
          <Save className="w-4 h-4" />
          Save to Logs & Exit
        </button>
      </div>

    </div>
  );
}
