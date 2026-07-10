import React, { useState } from 'react';
import { LogEntry, Microorganism, ExperimentConfig, SimulationDataPoint } from './types';
import DashboardView from './components/DashboardView';
import BacteriaSelector, { MICROORGANISMS } from './components/BacteriaSelector';
import SetupView from './components/SetupView';
import SimulationView from './components/SimulationView';
import ResultView from './components/ResultView';
import { 
  FlaskConical, 
  Dna, 
  TrendingUp, 
  Cpu, 
  Sparkles,
  Database,
  ArrowRight
} from 'lucide-react';

export default function App() {
  // 1. App Navigation State
  const [activeTab, setActiveTab] = useState<'incubator' | 'genome' | 'analysis' | 'systems'>('incubator');
  const [viewState, setViewState] = useState<'dashboard' | 'select-bacteria' | 'setup-conditions' | 'simulation' | 'results'>('dashboard');

  // 2. Preset Historical Logs
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: 'EXP-902',
      timestamp: '2026-07-09 18:42',
      bacteriaName: 'Escherichia coli',
      bacteriaKorean: '대장균 (E. coli)',
      config: { temp: 37, ph: 7.0, nutrients: 'NORMAL', oxygen: 'SUFFICIENT', time: 12 },
      finalCount: 800,
      score: 100,
      status: 'SUCCESS'
    },
    {
      id: 'EXP-901',
      timestamp: '2026-07-08 14:10',
      bacteriaName: 'Lactobacillus acidophilus',
      bacteriaKorean: '유산균 (Lactobacillus)',
      config: { temp: 22, ph: 4.5, nutrients: 'LOW', oxygen: 'SUFFICIENT', time: 24 },
      finalCount: 38,
      score: 12,
      status: 'FAILED'
    },
    {
      id: 'EXP-900',
      timestamp: '2026-07-07 11:15',
      bacteriaName: 'Saccharomyces cerevisiae',
      bacteriaKorean: '효모 (Yeast)',
      config: { temp: 30, ph: 5.5, nutrients: 'NORMAL', oxygen: 'INSUFFICIENT', time: 24 },
      finalCount: 580,
      score: 91,
      status: 'SUCCESS'
    }
  ]);

  // 3. Selection & Configuration State
  const [selectedBacteria, setSelectedBacteria] = useState<Microorganism | null>(null);
  const [activeConfig, setActiveConfig] = useState<ExperimentConfig | null>(null);
  const [simulationResult, setSimulationResult] = useState<{
    history: SimulationDataPoint[];
    finalCount: number;
    score: number;
    status: 'SUCCESS' | 'STAGNANT' | 'FAILED';
  } | null>(null);

  // 4. Navigation Actions
  const handleStartExperiment = () => {
    setSelectedBacteria(null);
    setViewState('select-bacteria');
  };

  const handleSelectBacteria = (bacteria: Microorganism) => {
    setSelectedBacteria(bacteria);
    setViewState('setup-conditions');
  };

  const handleStartSimulation = (config: ExperimentConfig) => {
    setActiveConfig(config);
    setViewState('simulation');
  };

  const handleSimulationComplete = (
    history: SimulationDataPoint[], 
    finalCount: number, 
    score: number, 
    status: 'SUCCESS' | 'STAGNANT' | 'FAILED'
  ) => {
    setSimulationResult({ history, finalCount, score, status });
    setViewState('results');
  };

  const handleSaveLog = () => {
    if (!activeConfig || !simulationResult) return;

    // Create a new Log Entry and add to the top of logs state
    const newId = `EXP-${900 + logs.length + 1}`;
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newEntry: LogEntry = {
      id: newId,
      timestamp: formattedDate,
      bacteriaName: activeConfig.bacteria.name,
      bacteriaKorean: activeConfig.bacteria.koreanName,
      config: {
        temp: activeConfig.temperature,
        ph: activeConfig.ph,
        nutrients: activeConfig.nutrients,
        oxygen: activeConfig.oxygenSufficient ? 'SUFFICIENT' : 'INSUFFICIENT',
        time: activeConfig.incubationTime
      },
      finalCount: Math.round(simulationResult.finalCount),
      score: simulationResult.score,
      status: simulationResult.status
    };

    setLogs([newEntry, ...logs]);
    
    // Clear and redirect to dashboard
    setViewState('dashboard');
    setActiveConfig(null);
    setSelectedBacteria(null);
    setSimulationResult(null);
  };

  const handleCancelExperiment = () => {
    // Clear and redirect to dashboard
    setViewState('dashboard');
    setActiveConfig(null);
    setSelectedBacteria(null);
    setSimulationResult(null);
  };

  const handleBottomNavClick = (tab: 'incubator' | 'genome' | 'analysis' | 'systems') => {
    setActiveTab(tab);
    if (tab === 'incubator') {
      setViewState('dashboard');
    } else if (tab === 'genome') {
      setViewState('select-bacteria');
    } else if (tab === 'analysis') {
      if (simulationResult) {
        setViewState('results');
      } else {
        // If no results, show select bacteria to initiate an experiment
        setViewState('select-bacteria');
      }
    } else if (tab === 'systems') {
      // jump back to setup conditions if possible or default to selection
      if (selectedBacteria) {
        setViewState('setup-conditions');
      } else {
        setViewState('select-bacteria');
      }
    }
  };

  return (
    <div className="bg-lab-grid min-h-screen text-[#e5e2e1] pb-24 md:pb-8">
      {/* 1. Futuristic Top AppBar */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-[#0c0c0c]/85 backdrop-blur-md border-b border-white/10 z-50 flex items-center justify-between px-6 shadow-[0_4px_20px_rgba(0,0,0,0.8)]">
        <div 
          onClick={() => {
            setViewState('dashboard');
            setActiveTab('incubator');
          }} 
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <Database className="w-5 h-5 text-[#39ff14] group-hover:scale-110 transition-transform drop-shadow-[0_0_8px_rgba(57,255,20,0.6)]" />
          <span className="font-display font-black text-white text-lg tracking-wider">
            CULTURE LAB
          </span>
        </div>

        {/* Desktop Nav Items */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-mono font-bold">
          <button 
            onClick={() => handleBottomNavClick('incubator')}
            className={`transition-colors py-1.5 uppercase tracking-widest relative ${
              activeTab === 'incubator' ? 'text-[#39ff14]' : 'text-gray-400 hover:text-white'
            }`}
          >
            Incubator
            {activeTab === 'incubator' && (
              <span className="absolute -bottom-4 left-0 right-0 h-0.5 bg-[#39ff14] shadow-[0_0_8px_rgba(57,255,20,0.8)]" />
            )}
          </button>
          
          <button 
            onClick={() => handleBottomNavClick('genome')}
            className={`transition-colors py-1.5 uppercase tracking-widest relative ${
              activeTab === 'genome' ? 'text-[#39ff14]' : 'text-gray-400 hover:text-white'
            }`}
          >
            Genome
            {activeTab === 'genome' && (
              <span className="absolute -bottom-4 left-0 right-0 h-0.5 bg-[#39ff14] shadow-[0_0_8px_rgba(57,255,20,0.8)]" />
            )}
          </button>

          <button 
            onClick={() => handleBottomNavClick('analysis')}
            className={`transition-colors py-1.5 uppercase tracking-widest relative ${
              activeTab === 'analysis' ? 'text-[#39ff14]' : 'text-gray-400 hover:text-white'
            }`}
          >
            Analysis
            {activeTab === 'analysis' && (
              <span className="absolute -bottom-4 left-0 right-0 h-0.5 bg-[#39ff14] shadow-[0_0_8px_rgba(57,255,20,0.8)]" />
            )}
          </button>

          <button 
            onClick={() => handleBottomNavClick('systems')}
            className={`transition-colors py-1.5 uppercase tracking-widest relative ${
              activeTab === 'systems' ? 'text-[#39ff14]' : 'text-gray-400 hover:text-white'
            }`}
          >
            Systems
            {activeTab === 'systems' && (
              <span className="absolute -bottom-4 left-0 right-0 h-0.5 bg-[#39ff14] shadow-[0_0_8px_rgba(57,255,20,0.8)]" />
            )}
          </button>
        </nav>

        {/* Top Node identifier info */}
        <div className="hidden lg:flex items-center gap-1.5 font-mono text-[10px] text-[#39ff14]/80 uppercase bg-[#39ff14]/10 border border-[#39ff14]/35 px-3 py-1 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-[#39ff14] animate-pulse" />
          <span>PORT: 3000 // STANDBY</span>
        </div>
      </header>

      {/* 2. Main Content View Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12 w-full flex-grow">
        
        {viewState === 'dashboard' && (
          <DashboardView 
            logs={logs} 
            onStartExperiment={handleStartExperiment}
            onSelectGenome={() => handleBottomNavClick('genome')}
          />
        )}

        {viewState === 'select-bacteria' && (
          <BacteriaSelector 
            onSelect={handleSelectBacteria}
            onBack={() => setViewState('dashboard')}
          />
        )}

        {viewState === 'setup-conditions' && selectedBacteria && (
          <SetupView
            selectedBacteria={selectedBacteria}
            onStartSimulation={handleStartSimulation}
            onBack={() => setViewState('select-bacteria')}
          />
        )}

        {viewState === 'simulation' && activeConfig && (
          <SimulationView
            config={activeConfig}
            onSimulationComplete={handleSimulationComplete}
            onCancel={handleCancelExperiment}
          />
        )}

        {viewState === 'results' && activeConfig && simulationResult && (
          <ResultView
            config={activeConfig}
            history={simulationResult.history}
            finalCount={simulationResult.finalCount}
            score={simulationResult.score}
            status={simulationResult.status}
            onRetry={() => setViewState('setup-conditions')}
            onSaveLog={handleSaveLog}
          />
        )}

      </main>

      {/* 3. Mobile Bottom Navigation Drawer */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-[#0c0c0c]/90 backdrop-blur-lg border-t border-white/10 z-50 flex justify-around items-center px-4 shadow-[0_-4px_24px_rgba(0,0,0,0.8)]">
        <button 
          onClick={() => handleBottomNavClick('incubator')}
          className={`flex flex-col items-center justify-center transition-all ${
            activeTab === 'incubator' ? 'text-[#39ff14] scale-105 drop-shadow-[0_0_10px_rgba(57,255,20,0.5)]' : 'text-gray-400 hover:text-white'
          }`}
        >
          <FlaskConical className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider">INCUBATOR</span>
        </button>

        <button 
          onClick={() => handleBottomNavClick('genome')}
          className={`flex flex-col items-center justify-center transition-all ${
            activeTab === 'genome' ? 'text-[#39ff14] scale-105 drop-shadow-[0_0_10px_rgba(57,255,20,0.5)]' : 'text-gray-400 hover:text-white'
          }`}
        >
          <Dna className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider">GENOME</span>
        </button>

        <button 
          onClick={() => handleBottomNavClick('analysis')}
          className={`flex flex-col items-center justify-center transition-all ${
            activeTab === 'analysis' ? 'text-[#39ff14] scale-105 drop-shadow-[0_0_10px_rgba(57,255,20,0.5)]' : 'text-gray-400 hover:text-white'
          }`}
        >
          <TrendingUp className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider">ANALYSIS</span>
        </button>

        <button 
          onClick={() => handleBottomNavClick('systems')}
          className={`flex flex-col items-center justify-center transition-all ${
            activeTab === 'systems' ? 'text-[#39ff14] scale-105 drop-shadow-[0_0_10px_rgba(57,255,20,0.5)]' : 'text-gray-400 hover:text-white'
          }`}
        >
          <Cpu className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider">SYSTEMS</span>
        </button>
      </nav>
    </div>
  );
}
