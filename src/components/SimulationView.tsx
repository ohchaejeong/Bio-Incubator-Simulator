import React, { useState, useEffect, useRef } from 'react';
import { ExperimentConfig, SimulationDataPoint, LogEntry } from '../types';
import PetriDish from './PetriDish';
import { 
  Play, 
  Pause, 
  FastForward, 
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles,
  Activity,
  AlertOctagon,
  Eye,
  SkipForward
} from 'lucide-react';

interface SimulationViewProps {
  config: ExperimentConfig;
  onSimulationComplete: (history: SimulationDataPoint[], finalCount: number, score: number, status: 'SUCCESS' | 'STAGNANT' | 'FAILED') => void;
  onCancel: () => void;
}

export default function SimulationView({ config, onSimulationComplete, onCancel }: SimulationViewProps) {
  const { bacteria, temperature, ph, nutrients, oxygenSufficient, incubationTime } = config;

  // 1. Calculate coefficients based on inputs
  const tempCoeff = Math.exp(-0.5 * Math.pow((temperature - bacteria.optTemp) / 5, 2));
  const phCoeff = Math.exp(-0.5 * Math.pow((ph - bacteria.optPh) / 1.0, 2));
  
  const nutCoeff = nutrients === 'LOW' ? 0.45 : nutrients === 'NORMAL' ? 1.0 : 1.45;
  
  let oxyCoeff = 1.0;
  if (bacteria.oxygenPreference === 'Aerobic') {
    oxyCoeff = oxygenSufficient ? 1.0 : 0.15;
  } else if (bacteria.oxygenPreference === 'Anaerobic') {
    oxyCoeff = oxygenSufficient ? 0.1 : 1.0;
  } else if (bacteria.oxygenPreference === 'Microaerophilic') {
    oxyCoeff = oxygenSufficient ? 0.6 : 0.4;
  } else if (bacteria.oxygenPreference === 'Facultative') {
    oxyCoeff = oxygenSufficient ? 1.0 : 0.75;
  }

  const totalGrowthCoeff = tempCoeff * phCoeff * nutCoeff * oxyCoeff;
  
  // Logistic parameters
  const isOptimal = totalGrowthCoeff >= 0.65;
  const isStagnant = totalGrowthCoeff >= 0.22 && totalGrowthCoeff < 0.65;
  const isDead = totalGrowthCoeff < 0.22;

  const r = bacteria.baseGrowthRate * totalGrowthCoeff;
  const K = bacteria.carryingCapacity * nutCoeff * Math.max(0.15, tempCoeff * phCoeff * oxyCoeff);

  // States
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(50); // Speed: 1x, 10x, 50x, 100x
  const [elapsedTime, setElapsedTime] = useState<number>(0); // hours
  const [cellCount, setCellCount] = useState<number>(10.0); // starts at 10 Million cells/mL
  const [history, setHistory] = useState<SimulationDataPoint[]>([{ time: 0, cellCount: 10.0 }]);

  // Refs to keep track of values inside interval loop
  const elapsedRef = useRef(0);
  const countRef = useRef(10.0);
  const historyRef = useRef<SimulationDataPoint[]>([{ time: 0, cellCount: 10.0 }]);

  useEffect(() => {
    elapsedRef.current = elapsedTime;
    countRef.current = cellCount;
    historyRef.current = history;
  }, [elapsedTime, cellCount, history]);

  // Main simulation timer tick
  useEffect(() => {
    if (!isPlaying) return;

    const intervalMs = 100; // tick every 100ms
    const timer = setInterval(() => {
      // Calculate virtual time increment based on speed multiplier
      // If speed is 50x, 1 hour passes in 12 ticks (1.2 seconds)
      // dt (hours) = (speedMultiplier / 3600) * (intervalMs / 1000) * 10
      // Let's optimize dt to feel fast but super responsive
      const dt = (speedMultiplier / 20) * (intervalMs / 1000); 
      
      const newTime = Math.min(incubationTime, elapsedRef.current + dt);
      let newCount = countRef.current;

      if (newTime > elapsedRef.current) {
        if (!isDead) {
          // Logistic growth dN = r * N * (1 - N / K) * dt
          const dN = r * newCount * (1 - newCount / K) * dt;
          newCount = Math.max(1.0, newCount + dN);
        } else {
          // Decay/death state - cells slowly fade away from initial seed
          const dN = -0.05 * newCount * dt;
          newCount = Math.max(0.2, newCount + dN);
        }

        const newHistory = [...historyRef.current, { time: newTime, cellCount: newCount }];

        setElapsedTime(newTime);
        setCellCount(newCount);
        setHistory(newHistory);

        // Check for end of experiment
        if (newTime >= incubationTime) {
          setIsPlaying(false);
          clearInterval(timer);
        }
      }
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPlaying, speedMultiplier, incubationTime, r, K, isDead]);

  // Determine current growth phase text
  const getGrowthPhaseText = () => {
    if (isDead) return 'DEATH / DECAY PHASE (사멸기)';
    if (elapsedTime < incubationTime * 0.12) return 'LAG PHASE (유도기)';
    if (cellCount < K * 0.8) return 'LOG / EXPONENTIAL PHASE (대수증식기)';
    return 'STATIONARY PHASE (정지기)';
  };

  const getGrowthPhaseColorClass = () => {
    if (isDead) return 'text-red-400 bg-red-950/20 border-red-500/30';
    if (elapsedTime < incubationTime * 0.12) return 'text-cyan-400 bg-cyan-950/20 border-cyan-500/30';
    if (cellCount < K * 0.8) return 'text-[#39ff14] bg-emerald-950/20 border-emerald-500/30';
    return 'text-yellow-400 bg-yellow-950/20 border-yellow-500/30';
  };

  // Skip simulation to end
  const handleSkipToEnd = () => {
    setIsPlaying(false);
    
    // Calculate final analytic trajectory directly to make it mathematically correct
    const steps = 100;
    const finalHistory: SimulationDataPoint[] = [];
    
    for (let i = 0; i <= steps; i++) {
      const t = (incubationTime / steps) * i;
      let count = 10.0;
      if (!isDead) {
        // Analytic solution to logistic equation: N(t) = (K * N0 * e^(rt)) / (K + N0 * (e^(rt) - 1))
        const ert = Math.exp(r * t);
        count = (K * 10.0 * ert) / (K + 10.0 * (ert - 1));
      } else {
        // Decay analytic solution: N(t) = N0 * e^(-0.05 * t)
        count = Math.max(0.2, 10.0 * Math.exp(-0.05 * t));
      }
      finalHistory.push({ time: t, cellCount: count });
    }

    const finalCount = finalHistory[finalHistory.length - 1].cellCount;
    setElapsedTime(incubationTime);
    setCellCount(finalCount);
    setHistory(finalHistory);
  };

  // Complete simulation and transition to results
  const handleViewAnalysis = () => {
    // Score out of 100 based on total growth efficiency
    const optimalFinalCount = bacteria.carryingCapacity;
    let score = Math.round((cellCount / optimalFinalCount) * 100);
    if (isDead) {
      score = Math.max(5, Math.round(15 - Math.abs(temperature - bacteria.optTemp)));
    }
    score = Math.min(100, Math.max(5, score));

    const status = isOptimal ? 'SUCCESS' : isStagnant ? 'STAGNANT' : 'FAILED';
    onSimulationComplete(history, cellCount, score, status);
  };

  const progressPercent = (elapsedTime / incubationTime) * 100;
  const isFinished = elapsedTime >= incubationTime;

  return (
    <div className="space-y-6 animate-fade-in text-white">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#39ff14] animate-ping" />
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">[ REAL-TIME ANALYZER ACTIVE ]</span>
          </div>
          <h2 className="text-2xl font-display font-black text-white">Bio-Incubator Real-Time Simulation</h2>
          <p className="text-xs text-gray-300">
            Simulating <span className="text-cyan-400 font-bold">{bacteria.name}</span> growth inside circular chamber SEC_08 under customized conditions.
          </p>
        </div>

        {/* Speed & Sim controls */}
        <div className="flex flex-wrap gap-2">
          {/* Pause / Resume button */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            disabled={isFinished}
            className={`px-4 py-2 text-xs font-mono font-bold uppercase tracking-wide rounded-lg border transition-all duration-200 flex items-center gap-1.5 ${
              isFinished 
                ? 'opacity-40 cursor-not-allowed border-white/5 bg-transparent text-gray-500'
                : isPlaying 
                ? 'border-yellow-500/40 bg-yellow-950/15 text-yellow-400 hover:bg-yellow-500/10'
                : 'border-[#39ff14]/40 bg-[#39ff14]/10 text-[#39ff14] hover:bg-[#39ff14]/5'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-yellow-400 stroke-yellow-400" />
                Pause Simulation
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-[#39ff14] stroke-[#39ff14]" />
                Resume Simulation
              </>
            )}
          </button>

          {/* Speed Multiplier Bar - Fully Selection active */}
          <div className="flex bg-black/40 rounded-lg p-0.5 border border-white/10 text-[10px] font-mono font-bold items-center">
            {([10, 50, 100] as const).map((spd) => {
              const active = speedMultiplier === spd;
              return (
                <button
                  key={spd}
                  onClick={() => setSpeedMultiplier(spd)}
                  className={`px-2.5 py-1.5 rounded-md transition-all uppercase tracking-wider ${
                    active 
                      ? 'bg-cyan-500/25 border border-cyan-400/30 text-cyan-400 shadow-[0_0_8px_rgba(0,220,230,0.2)]' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {spd}x
                </button>
              );
            })}
          </div>

          <button
            onClick={handleSkipToEnd}
            disabled={isFinished}
            className="px-3 py-2 text-xs font-mono text-gray-300 border border-white/10 hover:bg-white/5 rounded-lg transition-colors flex items-center gap-1 uppercase tracking-wider font-bold disabled:opacity-40"
          >
            <SkipForward className="w-3.5 h-3.5" />
            Skip
          </button>
        </div>
      </div>

      {/* Primary Simulator Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* Center Canvas Petri Dish simulation (Left / Center of layout) */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center p-8 rounded-2xl glass-panel border-white/10 h-[380px] relative">
          <div className="absolute top-4 left-4 flex items-center gap-1.5 text-xs font-mono font-bold text-gray-300 uppercase bg-black/40 px-3 py-1.5 rounded-lg border border-white/5">
            <Eye className="w-4 h-4 text-cyan-400" />
            VIRTUAL PETRI DISH LENS
          </div>

          <PetriDish
            currentCellCount={cellCount}
            maxCellCount={bacteria.carryingCapacity}
            isOptimal={isOptimal}
            isStagnant={isStagnant}
            isDead={isDead}
            isActive={isPlaying}
          />
        </div>

        {/* Real-time stats read-out (Right side) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 rounded-2xl glass-panel border-white/10 hover:border-cyan-400/20 transition-all duration-300 space-y-4">
            <div className="flex items-center gap-2 border-b border-white/5 pb-3">
              <Activity className="w-5 h-5 text-cyan-400" />
              <h3 className="text-sm font-mono font-black uppercase tracking-wider text-white">INSTRUMENT READ-OUTS</h3>
            </div>

            {/* Cell count readout */}
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest block">
                Current Bacteria Concentration
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-4xl font-display font-black text-white tracking-tight">
                  {cellCount.toFixed(2)}
                </span>
                <span className="text-xs font-mono text-cyan-400 font-bold uppercase">
                  M cells/mL
                </span>
              </div>
            </div>

            {/* Elapsed Time progress readout */}
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/5">
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest block">
                  Elapsed Duration
                </span>
                <span className="text-lg font-mono font-bold text-white flex items-center gap-1.5">
                  <Clock className="w-4.5 h-4.5 text-cyan-400" />
                  {elapsedTime.toFixed(1)}h / {incubationTime}h
                </span>
              </div>

              <div className="space-y-0.5">
                <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest block">
                  Temp / pH Chamber
                </span>
                <span className="text-lg font-mono font-bold text-white uppercase">
                  {temperature}°C / pH {ph.toFixed(1)}
                </span>
              </div>
            </div>

            {/* Growth Phase indicator */}
            <div className="pt-3 border-t border-white/5">
              <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest block mb-2">
                Active Biological Growth Phase
              </span>
              <div className={`px-4 py-2.5 rounded-lg border text-xs font-mono font-bold text-center uppercase tracking-wider border ${getGrowthPhaseColorClass()}`}>
                {getGrowthPhaseText()}
              </div>
            </div>
          </div>

          {/* Suboptimal parameter warnings details */}
          {isDead && (
            <div className="p-4 rounded-xl border border-red-500/30 bg-red-950/20 text-red-300 text-xs font-sans flex items-start gap-2.5">
              <AlertOctagon className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold uppercase block mb-0.5">CRITICAL ENVIRONMENT COLLAPSE</span>
                Lethal conditions inside cell matrix. Rapid replication failed to activate due to chemical pH levels or temperature boundaries. Bacteria are currently decaying.
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Bottom Timeline Countdown Progress Bar */}
      <div className="p-6 rounded-2xl glass-panel border-white/10 space-y-4">
        <div className="flex justify-between items-center text-xs font-mono font-bold">
          <span className="text-gray-300 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-[#39ff14] animate-spin" />
            Simulated Countdown: {progressPercent.toFixed(0)}% Complete
          </span>
          <span className="text-[#39ff14] font-black uppercase tracking-widest">
            {isFinished ? 'PROCESS TERMINATED' : 'CYCLE ACTIVE'}
          </span>
        </div>

        {/* Sleek fluorescent progress bar */}
        <div className="w-full bg-black/60 h-3 rounded-full overflow-hidden border border-white/5">
          <div 
            className={`h-full transition-all duration-300 shadow-[0_0_12px_rgba(57,255,20,0.8)] ${
              isDead 
                ? 'bg-gradient-to-r from-red-600 to-red-400 shadow-[0_0_12px_rgba(239,68,68,0.8)]' 
                : 'bg-gradient-to-r from-[#39ff14] to-emerald-400 shadow-[0_0_12px_rgba(57,255,20,0.8)]'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex justify-between text-[10px] font-mono text-gray-400 font-bold">
          <span>0 hours (Experiment Initiation)</span>
          <span>{incubationTime} hours (Target Cycle Bound)</span>
        </div>
      </div>

      {/* Complete Button bottom - Activated ONLY after reaching 100% */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-white/5">
        <button
          onClick={onCancel}
          className="w-full sm:w-auto px-6 py-3 border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-mono font-bold uppercase tracking-wide rounded-lg transition-colors"
        >
          Abort Experiment
        </button>

        <button
          onClick={handleViewAnalysis}
          disabled={!isFinished}
          className={`w-full sm:w-auto px-10 py-3.5 font-mono text-xs font-black uppercase tracking-widest rounded-lg flex items-center justify-center gap-2 transition-all duration-300 ${
            isFinished
              ? 'bg-cyan-400 text-black hover:bg-cyan-300 hover:shadow-[0_0_20px_rgba(0,220,230,0.6)] cursor-pointer'
              : 'bg-gray-800 text-gray-500 border border-white/5 cursor-not-allowed opacity-40'
          }`}
        >
          <span>View Final Analysis</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}
