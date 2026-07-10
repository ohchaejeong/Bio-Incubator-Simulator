import React from 'react';
import { Microorganism } from '../types';
import { 
  Sparkles, 
  Dna, 
  Activity, 
  Thermometer, 
  Droplet, 
  Wind, 
  ArrowRight,
  ShieldCheck,
  Flame,
  Bug
} from 'lucide-react';

// Pre-defined bacteria profiles
export const MICROORGANISMS: Microorganism[] = [
  {
    id: 'ecoli',
    name: 'Escherichia coli',
    koreanName: '대장균 (E. coli)',
    description: 'A standard model organism for biological synthesis and bio-incubator testing. Extremely fast multiplication cycle with robust cellular structure.',
    optTemp: 37,
    optPh: 7.0,
    oxygenPreference: 'Aerobic',
    oxygenKorean: '호기성 (O₂ 필요)',
    icon: 'Bug',
    baseGrowthRate: 0.35, // Fast
    carryingCapacity: 800 // High density
  },
  {
    id: 'yeast',
    name: 'Saccharomyces cerevisiae',
    koreanName: '효모 (Yeast)',
    description: 'A eukaryotic model organism extensively used in fermentation and cellular synthesis. Prefers mildly acidic environments with moderate thermal control.',
    optTemp: 30,
    optPh: 5.5,
    oxygenPreference: 'Facultative',
    oxygenKorean: '통성 혐기성 (선택적)',
    icon: 'Flame',
    baseGrowthRate: 0.22, // Medium
    carryingCapacity: 600
  },
  {
    id: 'lacto',
    name: 'Lactobacillus acidophilus',
    koreanName: '유산균 (Lactobacillus)',
    description: 'Standard lactic acid-producing bacterium. Highly adaptable, prefers anaerobic/microaerophilic conditions. Excellent for bio-chemical acid simulations.',
    optTemp: 37,
    optPh: 6.0,
    oxygenPreference: 'Microaerophilic',
    oxygenKorean: '미호기성 (미량 O₂)',
    icon: 'ShieldCheck',
    baseGrowthRate: 0.16, // Slow-medium
    carryingCapacity: 500
  },
  {
    id: 'photo',
    name: 'Rhodobacter sphaeroides',
    koreanName: '광합성 세균 (Photosynthetic)',
    description: 'Purple non-sulfur bacterium capable of producing energy via photosynthesis. Highly complex anaerobic replication loop optimized under low oxygen matrices.',
    optTemp: 32,
    optPh: 7.5,
    oxygenPreference: 'Anaerobic',
    oxygenKorean: '혐기성 (O₂ 불필요)',
    icon: 'Sparkles',
    baseGrowthRate: 0.28, // Medium-fast
    carryingCapacity: 700
  }
];

interface BacteriaSelectorProps {
  onSelect: (bacteria: Microorganism) => void;
  onBack: () => void;
}

export default function BacteriaSelector({ onSelect, onBack }: BacteriaSelectorProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-display font-extrabold text-white flex items-center gap-2">
            <Dna className="w-8 h-8 text-cyan-400" />
            Microorganism Selection
          </h2>
          <p className="text-sm text-gray-300 mt-1">
            Choose the target biological profile for simulated incubation inside the petri dish matrix.
          </p>
        </div>
        <button
          onClick={onBack}
          className="px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-xs font-mono font-medium text-gray-200 hover:bg-white/10 transition-colors w-full md:w-auto"
        >
          &larr; Back to Command
        </button>
      </div>

      {/* Grid of Microorganisms */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {MICROORGANISMS.map((bacteria) => {
          // Dynamic icon matching
          const IconComponent = () => {
            switch (bacteria.icon) {
              case 'Bug': return <Bug className="w-6 h-6 text-[#39ff14]" />;
              case 'Flame': return <Flame className="w-6 h-6 text-orange-400" />;
              case 'ShieldCheck': return <ShieldCheck className="w-6 h-6 text-cyan-400" />;
              default: return <Sparkles className="w-6 h-6 text-yellow-400" />;
            }
          };

          const isOptimalClass = bacteria.id === 'ecoli' 
            ? 'border-[#39ff14]/30 hover:border-[#39ff14]/80 hover:shadow-[0_0_20px_rgba(57,255,20,0.15)] bg-gradient-to-br from-emerald-950/10 to-transparent' 
            : 'border-white/10 hover:border-cyan-400/40 hover:shadow-[0_0_20px_rgba(0,220,230,0.15)] bg-gradient-to-br from-cyan-950/10 to-transparent';

          const chipClass = bacteria.id === 'ecoli'
            ? 'bg-[#39ff14]/10 text-[#39ff14] border-[#39ff14]/30'
            : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30';

          return (
            <div
              key={bacteria.id}
              onClick={() => onSelect(bacteria)}
              className={`p-6 rounded-2xl glass-panel cursor-pointer transition-all duration-300 flex flex-col justify-between group relative overflow-hidden ${isOptimalClass}`}
            >
              <div className="absolute -right-16 -top-16 w-36 h-36 bg-white/2 rounded-full blur-2xl group-hover:bg-white/5 transition-all duration-500" />
              
              <div>
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-black/40 rounded-xl border border-white/10 group-hover:scale-105 transition-transform">
                    <IconComponent />
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border ${chipClass}`}>
                    {bacteria.id === 'ecoli' ? 'Recommended' : 'Substrate'}
                  </span>
                </div>

                {/* Names */}
                <div className="space-y-1 mb-3">
                  <h3 className="text-xl font-display font-black text-white group-hover:text-cyan-300 transition-colors">
                    {bacteria.name}
                  </h3>
                  <p className="text-xs font-semibold text-[#39ff14] tracking-wide font-sans">
                    {bacteria.koreanName}
                  </p>
                </div>

                {/* Description */}
                <p className="text-xs text-gray-300 leading-relaxed font-sans mb-6">
                  {bacteria.description}
                </p>
              </div>

              {/* Specs Grid */}
              <div className="bg-black/40 rounded-xl p-4 border border-white/5 grid grid-cols-3 gap-2 text-center text-[11px] font-mono">
                <div className="space-y-1">
                  <div className="flex items-center justify-center gap-1 text-gray-400">
                    <Thermometer className="w-3.5 h-3.5" />
                    <span>TEMP</span>
                  </div>
                  <div className="text-white font-bold text-xs">{bacteria.optTemp}°C</div>
                </div>

                <div className="space-y-1 border-x border-white/5">
                  <div className="flex items-center justify-center gap-1 text-gray-400">
                    <Droplet className="w-3.5 h-3.5" />
                    <span>pH</span>
                  </div>
                  <div className="text-white font-bold text-xs">pH {bacteria.optPh.toFixed(1)}</div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-center gap-1 text-gray-400">
                    <Wind className="w-3.5 h-3.5" />
                    <span>O₂</span>
                  </div>
                  <div className="text-white font-bold text-[9px] leading-tight truncate px-0.5">
                    {bacteria.oxygenPreference}
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="mt-4 flex items-center justify-end text-xs font-mono font-bold text-cyan-400 group-hover:text-[#39ff14] transition-colors gap-1.5 pt-2">
                <span>Configure Conditions</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
