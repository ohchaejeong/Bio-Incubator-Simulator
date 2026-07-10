import React, { useState } from 'react';
import { Microorganism, ExperimentConfig } from '../types';
import { 
  Thermometer, 
  Droplet, 
  Sparkles, 
  Flame, 
  ShieldCheck, 
  Bug,
  Compass,
  AlertTriangle,
  Play,
  RotateCcw
} from 'lucide-react';

interface SetupViewProps {
  selectedBacteria: Microorganism;
  onStartSimulation: (config: ExperimentConfig) => void;
  onBack: () => void;
}

export default function SetupView({ selectedBacteria, onStartSimulation, onBack }: SetupViewProps) {
  // Pre-populate with optimal values
  const [temperature, setTemperature] = useState<number>(selectedBacteria.optTemp);
  const [ph, setPh] = useState<number>(selectedBacteria.optPh);
  const [nutrients, setNutrients] = useState<'LOW' | 'NORMAL' | 'HIGH'>('NORMAL');
  const [oxygenSufficient, setOxygenSufficient] = useState<boolean>(
    selectedBacteria.oxygenPreference === 'Aerobic' || selectedBacteria.oxygenPreference === 'Microaerophilic'
  );
  const [incubationTime, setIncubationTime] = useState<number>(24); // Default 24H

  const handleStart = () => {
    onStartSimulation({
      bacteria: selectedBacteria,
      temperature,
      ph,
      nutrients,
      oxygenSufficient,
      incubationTime
    });
  };

  const resetToOptimal = () => {
    setTemperature(selectedBacteria.optTemp);
    setPh(selectedBacteria.optPh);
    setNutrients('NORMAL');
    setOxygenSufficient(
      selectedBacteria.oxygenPreference === 'Aerobic' || selectedBacteria.oxygenPreference === 'Microaerophilic'
    );
    setIncubationTime(24);
  };

  // Icon switcher for visual display
  const renderBacteriaIcon = () => {
    const classStr = "w-10 h-10 text-[#39ff14] drop-shadow-[0_0_8px_rgba(57,255,20,0.6)]";
    switch (selectedBacteria.icon) {
      case 'Bug': return <Bug className={classStr} />;
      case 'Flame': return <Flame className="w-10 h-10 text-orange-400 drop-shadow-[0_0_8px_rgba(251,146,60,0.6)]" />;
      case 'ShieldCheck': return <ShieldCheck className="w-10 h-10 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]" />;
      default: return <Sparkles className="w-10 h-10 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]" />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-white">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-black/50 rounded-2xl border border-white/10 shrink-0">
            {renderBacteriaIcon()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">[ Selected Subject ]</span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-[#39ff14]/10 text-[#39ff14] border border-[#39ff14]/30 rounded uppercase">Ready</span>
            </div>
            <h2 className="text-2xl font-display font-black tracking-tight leading-tight">{selectedBacteria.name}</h2>
            <p className="text-xs text-gray-300 font-sans mt-0.5">{selectedBacteria.koreanName} - {selectedBacteria.description}</p>
          </div>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <button
            onClick={resetToOptimal}
            className="flex-1 md:flex-none px-4 py-2 border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-mono font-bold tracking-wide uppercase rounded-lg transition-colors flex items-center justify-center gap-1.5"
            title="Reset config to optimal conditions for this bacteria"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Optimal Preset
          </button>
          <button
            onClick={onBack}
            className="flex-1 md:flex-none px-4 py-2 border border-white/10 bg-black/40 hover:bg-white/5 text-xs font-mono font-bold tracking-wide uppercase rounded-lg transition-colors flex items-center justify-center"
          >
            Change Subject
          </button>
        </div>
      </div>

      {/* Grid of Parameter Configuration Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">

        {/* 1. Temp Configuration */}
        <div className="p-5 rounded-2xl glass-panel border-white/10 hover:border-cyan-400/30 transition-all duration-300 flex flex-col justify-between min-h-[220px]">
          <div className="flex justify-between items-center border-b border-white/5 pb-2">
            <span className="text-xs font-mono font-black text-cyan-400 tracking-wider uppercase">Temp Matrix (C°)</span>
            <Thermometer className="w-4 h-4 text-cyan-400" />
          </div>

          <div className="flex-grow flex flex-col justify-center py-4">
            <div className="text-center font-display font-black text-4xl text-cyan-400 drop-shadow-[0_0_8px_rgba(0,220,230,0.5)]">
              {temperature}°C
            </div>
            {/* Target indicator warning if suboptimal */}
            <div className="text-center text-[10px] font-mono text-gray-400 mt-1">
              Optimum: <span className="text-white font-bold">{selectedBacteria.optTemp}°C</span>
            </div>
          </div>

          <div className="relative pt-2">
            <input 
              id="temp-slider-input"
              type="range" 
              min="20" 
              max="45" 
              value={temperature}
              onChange={(e) => setTemperature(parseInt(e.target.value))}
              className="w-full cursor-pointer accent-[#39ff14]"
            />
            <div className="flex justify-between mt-2 text-[10px] font-mono text-gray-400 font-bold">
              <span>20°C</span>
              <span>30°C</span>
              <span>45°C</span>
            </div>
          </div>
        </div>

        {/* 2. pH Configuration */}
        <div className="p-5 rounded-2xl glass-panel border-white/10 hover:border-cyan-400/30 transition-all duration-300 flex flex-col justify-between min-h-[220px]">
          <div className="flex justify-between items-center border-b border-white/5 pb-2">
            <span className="text-xs font-mono font-black text-cyan-400 tracking-wider uppercase">pH Level (Acidity)</span>
            <Droplet className="w-4 h-4 text-cyan-400" />
          </div>

          <div className="flex-grow flex flex-col justify-center py-4">
            <div className="text-center font-display font-black text-4xl text-cyan-400 drop-shadow-[0_0_8px_rgba(0,220,230,0.5)]">
              {ph.toFixed(1)}
            </div>
            <div className="text-center text-[10px] font-mono text-gray-400 mt-1">
              Optimum: <span className="text-white font-bold">pH {selectedBacteria.optPh.toFixed(1)}</span>
            </div>
          </div>

          <div className="relative pt-2">
            <input 
              id="ph-slider-input"
              type="range" 
              min="40" 
              max="90" 
              step="1"
              value={ph * 10}
              onChange={(e) => setPh(parseInt(e.target.value) / 10)}
              className="w-full cursor-pointer"
            />
            <div className="flex justify-between mt-2 text-[10px] font-mono text-gray-400 font-bold">
              <span>pH 4.0</span>
              <span>pH 6.5</span>
              <span>pH 9.0</span>
            </div>
          </div>
        </div>

        {/* 3. Nutrient Level Configuration */}
        <div className="p-5 rounded-2xl glass-panel border-white/10 hover:border-cyan-400/30 transition-all duration-300 flex flex-col justify-between min-h-[220px]">
          <div className="flex justify-between items-center border-b border-white/5 pb-2">
            <span className="text-xs font-mono font-black text-cyan-400 tracking-wider uppercase">Nutrient Matrix</span>
            <Sparkles className="w-4 h-4 text-cyan-400" />
          </div>

          {/* Fully Selectable Nutrient Choice Bar */}
          <div className="flex-grow flex flex-col justify-center gap-2 py-3">
            {(['LOW', 'NORMAL', 'HIGH'] as const).map((lvl) => {
              const isActive = nutrients === lvl;
              return (
                <button
                  key={lvl}
                  onClick={() => setNutrients(lvl)}
                  className={`w-full py-2 rounded-lg border text-xs font-mono font-bold uppercase tracking-wider transition-all duration-200 ${
                    isActive
                      ? 'border-[#39ff14] bg-[#39ff14]/15 text-[#39ff14] shadow-[0_0_15px_rgba(57,255,20,0.25)] font-extrabold'
                      : 'border-white/10 bg-black/30 text-gray-300 hover:bg-white/5'
                  }`}
                >
                  {lvl}
                </button>
              );
            })}
          </div>

          <div className="text-[9px] font-mono text-center text-gray-400 mt-1 uppercase tracking-widest">
            Determines carrying capacity
          </div>
        </div>

        {/* 4. Oxygen Level Configuration */}
        <div className="p-5 rounded-2xl glass-panel border-white/10 hover:border-cyan-400/30 transition-all duration-300 flex flex-col justify-between min-h-[220px]">
          <div className="flex justify-between items-center border-b border-white/5 pb-2">
            <span className="text-xs font-mono font-black text-cyan-400 tracking-wider uppercase">Oxygen Level (O₂)</span>
            <Compass className="w-4 h-4 text-cyan-400" />
          </div>

          <div className="flex-grow flex flex-col justify-center items-center py-4">
            <div className={`text-sm font-mono font-extrabold tracking-widest mb-3 uppercase ${
              oxygenSufficient ? 'text-[#39ff14]' : 'text-gray-400'
            }`}>
              {oxygenSufficient ? 'SUFFICIENT (호기)' : 'INSUFFICIENT (혐기)'}
            </div>

            {/* Custom toggle switch */}
            <div className="relative inline-block w-16 align-middle select-none transition duration-200 ease-in">
              <input
                id="oxygen-toggle"
                type="checkbox"
                checked={oxygenSufficient}
                onChange={(e) => setOxygenSufficient(e.target.checked)}
                className="sr-only"
              />
              <label
                htmlFor="oxygen-toggle"
                className={`block overflow-hidden h-8 rounded-full cursor-pointer transition-all duration-300 ${
                  oxygenSufficient ? 'bg-[#39ff14]/80' : 'bg-gray-800 border border-white/10'
                }`}
              >
                <span
                  className={`block h-6 w-6 rounded-full bg-white shadow-lg transform transition-all duration-300 mt-1 ${
                    oxygenSufficient ? 'translate-x-9' : 'translate-x-1'
                  }`}
                />
              </label>
            </div>
          </div>

          <div className="text-[9px] font-mono text-center text-gray-400 leading-tight">
            Target profile prefers:<br />
            <span className="text-white font-bold uppercase">{selectedBacteria.oxygenPreference}</span>
          </div>
        </div>

        {/* 5. Incubation Time Cycle Selection */}
        <div className="p-5 rounded-2xl glass-panel border-white/10 hover:border-cyan-400/30 transition-all duration-300 flex flex-col justify-between min-h-[220px]">
          <div className="flex justify-between items-center border-b border-white/5 pb-2">
            <span className="text-xs font-mono font-black text-cyan-400 tracking-wider uppercase">Incubation Period</span>
            <RotateCcw className="w-4 h-4 text-cyan-400" />
          </div>

          {/* Time Cycle buttons - Fully Interactive Option Grid */}
          <div className="flex-grow grid grid-cols-2 gap-2 py-3 items-center">
            {([6, 12, 24, 48] as const).map((t) => {
              const isActive = incubationTime === t;
              return (
                <button
                  key={t}
                  onClick={() => setIncubationTime(t)}
                  className={`py-3 rounded-lg border text-xs font-mono font-extrabold uppercase tracking-widest transition-all duration-200 ${
                    isActive
                      ? 'border-[#39ff14] bg-[#39ff14]/15 text-[#39ff14] shadow-[0_0_15px_rgba(57,255,20,0.25)]'
                      : 'border-white/10 bg-black/30 text-gray-300 hover:bg-white/5'
                  }`}
                >
                  {t}H
                </button>
              );
            })}
          </div>

          <div className="text-[9px] font-mono text-center text-gray-400 uppercase tracking-widest">
            Maximum countdown time
          </div>
        </div>

      </div>

      {/* Warnings & Visual Feedbacks based on parameters selection closeness to optimal */}
      {(() => {
        // Simple indicator calculations to warn if they are far off
        const tDiff = Math.abs(temperature - selectedBacteria.optTemp);
        const pDiff = Math.abs(ph - selectedBacteria.optPh);
        const prefersAerobic = selectedBacteria.oxygenPreference === 'Aerobic' || selectedBacteria.oxygenPreference === 'Microaerophilic';
        const oxygenMismatch = prefersAerobic !== oxygenSufficient;

        if (tDiff > 8 || pDiff > 1.5 || oxygenMismatch) {
          return (
            <div className="p-4 rounded-xl border border-yellow-500/30 bg-yellow-950/20 text-yellow-300 text-xs font-sans flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold uppercase tracking-wider block mb-0.5">Suboptimal Condition Mismatch Detected</span>
                Your parameters deviate substantially from the organism's optimal requirements. The cell growth rate may decay or flatline. Reset to the optimal preset to guarantee high-density synthesis, or proceed to simulate a suboptimal cellular decline.
              </div>
            </div>
          );
        }
        return (
          <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-950/20 text-emerald-300 text-xs font-sans flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold uppercase tracking-wider block mb-0.5">Environmental Calibration Aligned</span>
              All environmental calibration metrics reside within ideal margins of error. Expect rapid cellular division and optimal carrying density metrics inside the simulation.
            </div>
          </div>
        );
      })()}

      {/* Primary Simulation Start Action */}
      <div className="flex justify-center pt-4">
        <button
          onClick={handleStart}
          className="px-12 py-4 bg-gradient-to-r from-[#39ff14] to-emerald-500 text-[#053900] font-mono text-sm font-black uppercase tracking-wider rounded-xl shadow-[0_0_25px_rgba(57,255,20,0.5)] hover:shadow-[0_0_35px_rgba(57,255,20,0.7)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center gap-2"
        >
          <Play className="w-4.5 h-4.5 fill-[#053900] text-[#053900]" />
          Start Simulation Loop
        </button>
      </div>
    </div>
  );
}
