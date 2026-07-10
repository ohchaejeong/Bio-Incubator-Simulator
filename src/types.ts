export interface Microorganism {
  id: string;
  name: string;
  koreanName: string;
  description: string;
  optTemp: number; // Optimal Temperature in °C
  optPh: number;   // Optimal pH
  oxygenPreference: 'Aerobic' | 'Facultative' | 'Microaerophilic' | 'Anaerobic';
  oxygenKorean: string;
  icon: string; // Lucide icon name
  baseGrowthRate: number; // r
  carryingCapacity: number; // K (Million cells/mL)
}

export interface ExperimentConfig {
  bacteria: Microorganism;
  temperature: number;
  ph: number;
  nutrients: 'LOW' | 'NORMAL' | 'HIGH';
  oxygenSufficient: boolean;
  incubationTime: number; // hours: 6, 12, 24, 48
}

export interface SimulationDataPoint {
  time: number; // elapsed hours
  cellCount: number; // Million cells/mL
}

export interface LogEntry {
  id: string;
  timestamp: string;
  bacteriaName: string;
  bacteriaKorean: string;
  config: {
    temp: number;
    ph: number;
    nutrients: string;
    oxygen: string;
    time: number;
  };
  finalCount: number;
  score: number;
  status: 'SUCCESS' | 'STAGNANT' | 'FAILED';
}
