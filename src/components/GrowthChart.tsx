import React from 'react';
import { SimulationDataPoint } from '../types';

interface GrowthChartProps {
  data: SimulationDataPoint[];
  maxTime: number; // e.g. 24
  carryingCapacity: number; // e.g. 800
  status: 'SUCCESS' | 'STAGNANT' | 'FAILED';
}

export default function GrowthChart({ data, maxTime, carryingCapacity, status }: GrowthChartProps) {
  // SVG Canvas dimensions
  const width = 500;
  const height = 220;
  const paddingLeft = 50;
  const paddingRight = 20;
  const paddingTop = 15;
  const paddingBottom = 30;

  const plotWidth = width - paddingLeft - paddingRight;
  const plotHeight = height - paddingTop - paddingBottom;

  // Scale calculations
  const xMax = maxTime || 24;
  const yMax = Math.max(carryingCapacity * 1.1, 100);

  const getX = (t: number) => {
    return paddingLeft + (t / xMax) * plotWidth;
  };

  const getY = (count: number) => {
    return paddingTop + plotHeight - (count / yMax) * plotHeight;
  };

  // Generate gridlines
  const xTicks = 6;
  const yTicks = 4;

  const xGridLines = Array.from({ length: xTicks + 1 }, (_, i) => (xMax / xTicks) * i);
  const yGridLines = Array.from({ length: yTicks + 1 }, (_, i) => (yMax / yTicks) * i);

  // Generate path coordinates
  const pathD = data.length > 0
    ? data.map((d, index) => {
        const x = getX(d.time);
        const y = getY(d.cellCount);
        return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
      }).join(' ')
    : '';

  // Generate area path for shaded fill
  const areaD = data.length > 0
    ? `${pathD} L ${getX(data[data.length - 1].time)} ${getY(0)} L ${getX(data[0].time)} ${getY(0)} Z`
    : '';

  // Color theme
  const strokeColor = status === 'SUCCESS' ? '#39ff14' : status === 'STAGNANT' ? '#00dce6' : '#ef4444';
  const glowId = 'chart-line-glow';
  const gradientId = 'chart-area-grad';

  return (
    <div className="w-full h-full flex flex-col justify-between">
      <div className="flex justify-between items-center mb-2 px-1">
        <span className="text-[11px] font-mono font-medium text-cyan-400 tracking-wider uppercase">
          [ LOGISTIC REGRESSION MATRIX ]
        </span>
        <div className="flex gap-4 text-[10px] font-mono text-gray-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#39ff14]/80" />
            Lag
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400/80" />
            Log
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-yellow-400/80" />
            Stationary
          </span>
          {status === 'FAILED' && (
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500/80" />
              Decay
            </span>
          )}
        </div>
      </div>

      <div className="relative w-full overflow-hidden bg-black/40 rounded border border-white/5 p-2">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
          <defs>
            {/* Glow Filter */}
            <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Gradient Fill */}
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={strokeColor} stopOpacity="0.3" />
              <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Phase Background Shading */}
          {data.length > 0 && (
            <>
              {/* Lag Phase region: first 15% of time */}
              <rect x={getX(0)} y={paddingTop} width={plotWidth * 0.15} height={plotHeight} fill="rgba(255, 255, 255, 0.01)" />
              {/* Log Phase region: 15% to 55% */}
              <rect x={getX(xMax * 0.15)} y={paddingTop} width={plotWidth * 0.40} height={plotHeight} fill="rgba(57, 255, 20, 0.01)" />
              {/* Stationary Phase region: 55% to 85% */}
              <rect x={getX(xMax * 0.55)} y={paddingTop} width={plotWidth * 0.30} height={plotHeight} fill="rgba(250, 204, 21, 0.01)" />
            </>
          )}

          {/* Horizontal Grid Lines */}
          {yGridLines.map((yVal, i) => {
            const y = getY(yVal);
            return (
              <g key={`y-grid-${i}`} className="opacity-40">
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="rgba(255, 255, 255, 0.08)"
                  strokeDasharray="2,2"
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 3}
                  textAnchor="end"
                  className="fill-gray-400 font-mono text-[9px] font-medium"
                >
                  {Math.round(yVal)}M
                </text>
              </g>
            );
          })}

          {/* Vertical Grid Lines */}
          {xGridLines.map((xVal, i) => {
            const x = getX(xVal);
            return (
              <g key={`x-grid-${i}`} className="opacity-40">
                <line
                  x1={x}
                  y1={paddingTop}
                  x2={x}
                  y2={paddingTop + plotHeight}
                  stroke="rgba(255, 255, 255, 0.08)"
                  strokeDasharray="2,2"
                />
                <text
                  x={x}
                  y={paddingTop + plotHeight + 14}
                  textAnchor="middle"
                  className="fill-gray-400 font-mono text-[9px] font-medium"
                >
                  {Math.round(xVal)}h
                </text>
              </g>
            );
          })}

          {/* Shaded Area Under Curve */}
          {areaD && (
            <path
              d={areaD}
              fill={`url(#${gradientId})`}
            />
          )}

          {/* Glowing Growth Path Line */}
          {pathD && (
            <path
              d={pathD}
              fill="none"
              stroke={strokeColor}
              strokeWidth="2.5"
              filter={`url(#${glowId})`}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Carrying Capacity Reference Limit */}
          <line
            x1={paddingLeft}
            y1={getY(carryingCapacity)}
            x2={width - paddingRight}
            y2={getY(carryingCapacity)}
            stroke="rgba(239, 68, 68, 0.35)"
            strokeWidth="1"
            strokeDasharray="4,4"
          />
          <text
            x={width - paddingRight - 4}
            y={getY(carryingCapacity) - 4}
            textAnchor="end"
            className="fill-red-400/70 font-mono text-[8px] uppercase tracking-widest"
          >
            Cap limit: {carryingCapacity}M
          </text>

          {/* Current Status Marker at last data point */}
          {data.length > 0 && (
            <g>
              <circle
                cx={getX(data[data.length - 1].time)}
                cy={getY(data[data.length - 1].cellCount)}
                r="4.5"
                fill={strokeColor}
                stroke="#ffffff"
                strokeWidth="1.5"
                className="animate-pulse"
              />
              <circle
                cx={getX(data[data.length - 1].time)}
                cy={getY(data[data.length - 1].cellCount)}
                r="9"
                fill="none"
                stroke={strokeColor}
                strokeWidth="1"
                className="animate-[ping_2s_infinite]"
              />
            </g>
          )}

          {/* Axes Lines */}
          <line
            x1={paddingLeft}
            y1={paddingTop + plotHeight}
            x2={width - paddingRight}
            y2={paddingTop + plotHeight}
            stroke="rgba(255, 255, 255, 0.2)"
            strokeWidth="1"
          />
          <line
            x1={paddingLeft}
            y1={paddingTop}
            x2={paddingLeft}
            y2={paddingTop + plotHeight}
            stroke="rgba(255, 255, 255, 0.2)"
            strokeWidth="1"
          />
        </svg>
      </div>
    </div>
  );
}
