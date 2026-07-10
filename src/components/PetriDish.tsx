import React, { useEffect, useRef, useMemo } from 'react';

interface PetriDishProps {
  currentCellCount: number; // in Million cells/mL
  maxCellCount: number; // K
  isOptimal: boolean;
  isStagnant: boolean;
  isDead: boolean;
  isActive: boolean;
}

interface Colony {
  id: number;
  x: number;
  y: number;
  maxRadius: number;
  appearRatio: number; // growthRatio at which it begins to appear (0 to 1)
  color: string;
  quadrant: number;
}

// Deterministic pseudo-random number generator for stable colony placement
function createRandom(seed: number) {
  let s = seed;
  return function() {
    const x = Math.sin(s++) * 10000;
    return x - Math.floor(x);
  };
}

export default function PetriDish({
  currentCellCount,
  maxCellCount,
  isOptimal,
  isStagnant,
  isDead,
  isActive
}: PetriDishProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const cx = 135; // Center X of 270x270 canvas
  const cy = 135; // Center Y of 270x270 canvas
  const R = 110;  // Radius of the agar surface (slightly inside the rim)

  // Streaking quadrant counts
  const q1Count = 180;
  const q2Count = 120;
  const q3Count = 70;
  const q4Count = 35;

  // Pre-generate deterministic colony spots along streaking lines
  const colonies = useMemo<Colony[]>(() => {
    const list: Colony[] = [];
    const random = createRandom(12345); // Fixed seed for stable layout

    // Sector 1: Very dense zig-zags (initial streak)
    // Spans top-right angle range roughly [-0.1, 1.5]
    for (let i = 0; i < q1Count; i++) {
      const progress = i / q1Count;
      const baseAngle = -0.1 + progress * 1.6;
      const wave = Math.sin(progress * Math.PI * 25) * 0.12; 
      const angle = baseAngle + wave + (random() - 0.5) * 0.05;

      const baseRadius = R - 12 - progress * 25;
      const rDist = baseRadius + Math.cos(progress * Math.PI * 25) * 4 + (random() - 0.5) * 3;

      const x = cx + Math.cos(angle) * rDist;
      const y = cy + Math.sin(angle) * rDist;

      // Overcrowded small colonies
      const maxRadius = 0.8 + random() * 1.0;
      const appearRatio = 0.03 + progress * 0.4; // appear very early

      // Shades of red
      const colors = ['#800f2f', '#a4133c', '#c9184a', '#ff4d6d', '#ff758f'];
      const color = colors[Math.floor(random() * colors.length)];

      list.push({ id: i, x, y, maxRadius, appearRatio, color, quadrant: 1 });
    }

    // Sector 2: Medium dense zig-zags
    // Spans top-left angle range roughly [1.5, 3.1]
    for (let i = 0; i < q2Count; i++) {
      const progress = i / q2Count;
      const baseAngle = 1.5 + progress * 1.6;
      const wave = Math.sin(progress * Math.PI * 15) * 0.18;
      const angle = baseAngle + wave + (random() - 0.5) * 0.06;

      const baseRadius = R - 12 - progress * 35;
      const rDist = baseRadius + Math.cos(progress * Math.PI * 15) * 6 + (random() - 0.5) * 4;

      const x = cx + Math.cos(angle) * rDist;
      const y = cy + Math.sin(angle) * rDist;

      // Medium sized colonies
      const maxRadius = 1.6 + random() * 1.4;
      const appearRatio = 0.18 + progress * 0.45; // appear mid-growth

      const colors = ['#a4133c', '#c9184a', '#ff4d6d', '#ff758f', '#ff85a1'];
      const color = colors[Math.floor(random() * colors.length)];

      list.push({ id: q1Count + i, x, y, maxRadius, appearRatio, color, quadrant: 2 });
    }

    // Sector 3: Loose zig-zags
    // Spans bottom-left angle range roughly [3.1, 4.7]
    for (let i = 0; i < q3Count; i++) {
      const progress = i / q3Count;
      const baseAngle = 3.1 + progress * 1.6;
      const wave = Math.sin(progress * Math.PI * 8) * 0.25;
      const angle = baseAngle + wave + (random() - 0.5) * 0.08;

      const baseRadius = R - 15 - progress * 45;
      const rDist = baseRadius + Math.cos(progress * Math.PI * 8) * 8 + (random() - 0.5) * 5;

      const x = cx + Math.cos(angle) * rDist;
      const y = cy + Math.sin(angle) * rDist;

      // Large, partially isolated colonies
      const maxRadius = 2.8 + random() * 1.8;
      const appearRatio = 0.38 + progress * 0.42;

      const colors = ['#c9184a', '#ff4d6d', '#ff758f', '#ff85a1', '#f72585'];
      const color = colors[Math.floor(random() * colors.length)];

      list.push({ id: q1Count + q2Count + i, x, y, maxRadius, appearRatio, color, quadrant: 3 });
    }

    // Sector 4: Very loose looping track yielding isolated circular colonies
    // Spans bottom-right angle range [4.7, 6.1]
    for (let i = 0; i < q4Count; i++) {
      const progress = i / q4Count;
      const angle = 4.7 + progress * 1.4 + (random() - 0.5) * 0.1;

      const rDist = R - 20 - progress * 55 + Math.sin(progress * Math.PI * 3) * 12 + (random() - 0.5) * 6;

      const x = cx + Math.cos(angle) * rDist;
      const y = cy + Math.sin(angle) * rDist;

      // Beautiful large isolated circular colonies
      const maxRadius = 4.5 + random() * 2.5;
      const appearRatio = 0.58 + progress * 0.38; // appear late

      const colors = ['#ff4d6d', '#ff758f', '#f72585', '#b5179e', '#7209b7'];
      const color = colors[Math.floor(random() * colors.length)];

      list.push({ id: q1Count + q2Count + q3Count + i, x, y, maxRadius, appearRatio, color, quadrant: 4 });
    }

    return list;
  }, []);

  // Main animation / render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      // 1. Clear background transparent/dark
      ctx.fillStyle = '#0c0c0c';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 2. Draw Realistic 3D Solid Agar Gel disk (Pale Yellow Agar Background)
      const agarGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, R + 5);
      agarGrad.addColorStop(0, '#fdfcf0');   // Milky light cream center
      agarGrad.addColorStop(0.7, '#faf4d3'); // Soft warm yellow
      agarGrad.addColorStop(0.95, '#f5ebbe'); // Semi-translucent agar amber edge
      agarGrad.addColorStop(1, '#e3d69b');    // Outer edge shadow inside dish wall

      ctx.beginPath();
      ctx.arc(cx, cy, R + 4, 0, Math.PI * 2);
      ctx.fillStyle = agarGrad;
      ctx.fill();

      // Soft outer ring shadow on the agar surface
      ctx.beginPath();
      ctx.arc(cx, cy, R + 4, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
      ctx.lineWidth = 3;
      ctx.stroke();

      // 3. Draw Faint Scratch Lines (Streaking Track left by the inoculating loop)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
      ctx.lineWidth = 0.8;

      // Sector 1 scratches
      ctx.beginPath();
      for (let i = 0; i < q1Count; i++) {
        const progress = i / q1Count;
        const baseAngle = -0.1 + progress * 1.6;
        const wave = Math.sin(progress * Math.PI * 25) * 0.12; 
        const angle = baseAngle + wave;
        const baseRadius = R - 12 - progress * 25;
        const rDist = baseRadius + Math.cos(progress * Math.PI * 25) * 4;
        const px = cx + Math.cos(angle) * rDist;
        const py = cy + Math.sin(angle) * rDist;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();

      // Sector 2 scratches
      ctx.beginPath();
      for (let i = 0; i < q2Count; i++) {
        const progress = i / q2Count;
        const baseAngle = 1.5 + progress * 1.6;
        const wave = Math.sin(progress * Math.PI * 15) * 0.18;
        const angle = baseAngle + wave;
        const baseRadius = R - 12 - progress * 35;
        const rDist = baseRadius + Math.cos(progress * Math.PI * 15) * 6;
        const px = cx + Math.cos(angle) * rDist;
        const py = cy + Math.sin(angle) * rDist;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();

      // Sector 3 scratches
      ctx.beginPath();
      for (let i = 0; i < q3Count; i++) {
        const progress = i / q3Count;
        const baseAngle = 3.1 + progress * 1.6;
        const wave = Math.sin(progress * Math.PI * 8) * 0.25;
        const angle = baseAngle + wave;
        const baseRadius = R - 15 - progress * 45;
        const rDist = baseRadius + Math.cos(progress * Math.PI * 8) * 8;
        const px = cx + Math.cos(angle) * rDist;
        const py = cy + Math.sin(angle) * rDist;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();

      // Sector 4 scratches
      ctx.beginPath();
      for (let i = 0; i < q4Count; i++) {
        const progress = i / q4Count;
        const angle = 4.7 + progress * 1.4;
        const rDist = R - 20 - progress * 55 + Math.sin(progress * Math.PI * 3) * 12;
        const px = cx + Math.cos(angle) * rDist;
        const py = cy + Math.sin(angle) * rDist;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();

      // 4. Calculate Growth Ratio (Log Phase triggers gradual appearance and size increase)
      const maxCount = Math.max(maxCellCount, 1);
      const growthRatio = Math.min(1.0, Math.max(0.0, currentCellCount / maxCount));

      // 5. Draw colonies along streaking lines
      colonies.forEach(colony => {
        // If the cell growth hasn't reached this colony's trigger, skip drawing
        if (growthRatio < colony.appearRatio) return;

        // Calculate smooth size scaling from 0 to maxRadius
        const progressSinceAppearance = (growthRatio - colony.appearRatio) / (1.0 - colony.appearRatio);
        let currentRadius = colony.maxRadius * Math.pow(Math.min(1.0, progressSinceAppearance), 0.5);

        // Adjust colors and size based on overall health
        let color = colony.color;
        if (isDead) {
          // Dead/decaying colonies look dried-out, dark grey/brownish red
          color = 'rgba(102, 60, 60, 0.85)';
          currentRadius *= 0.6; // shrink slightly due to desiccation/decay
        } else if (isStagnant) {
          // Stagnant colonies remain slightly smaller
          currentRadius *= 0.8;
        }

        // Draw 3D Dome Colony with highlight
        ctx.save();
        
        // Soft outer shadow/glow for larger colonies
        if (currentRadius > 1.8) {
          ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
          ctx.shadowBlur = 3;
          ctx.shadowOffsetY = 1;
        }

        // Base colony circle
        ctx.beginPath();
        ctx.arc(colony.x, colony.y, currentRadius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();

        ctx.restore();

        // Glistening wet/dome specular highlight for organic realism
        if (currentRadius > 2.2 && !isDead) {
          ctx.beginPath();
          ctx.arc(colony.x - currentRadius * 0.32, colony.y - currentRadius * 0.32, currentRadius * 0.22, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
          ctx.fill();
        }
      });

      // 6. Realistic specular shine sweep across the petri dish surface
      ctx.beginPath();
      ctx.arc(cx, cy, R + 2, Math.PI * 1.1, Math.PI * 1.55);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.lineWidth = 1.8;
      ctx.stroke();

      // Outer glassy reflection line
      ctx.beginPath();
      ctx.arc(cx, cy, R + 6, Math.PI * 0.1, Math.PI * 0.65);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // 7. Petri Dish outer plastic glass rims
      ctx.beginPath();
      ctx.arc(cx, cy, R + 8, 0, Math.PI * 2);
      ctx.strokeStyle = isDead 
        ? 'rgba(239, 68, 68, 0.35)' 
        : isStagnant 
        ? 'rgba(0, 220, 230, 0.4)' 
        : 'rgba(57, 255, 20, 0.45)';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx, cy, R + 12, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      ctx.stroke();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [currentCellCount, maxCellCount, isOptimal, isStagnant, isDead, isActive, colonies]);

  return (
    <div className="relative flex items-center justify-center">
      {/* Outer Ambient Glow Circle */}
      <div 
        className={`absolute w-[250px] h-[250px] rounded-full blur-3xl transition-all duration-700 opacity-25 ${
          isDead 
            ? 'bg-red-500 shadow-[0_0_80px_rgba(239,68,68,0.5)]' 
            : isStagnant 
            ? 'bg-cyan-500 shadow-[0_0_80px_rgba(0,220,230,0.5)]' 
            : 'bg-green-500 shadow-[0_0_80px_rgba(57,255,20,0.5)]'
        }`}
      />

      {/* Holographic scanner ring overlay */}
      <div 
        className={`absolute w-[265px] h-[265px] rounded-full border-2 border-dashed pointer-events-none animate-[spin_40s_linear_infinite] ${
          isDead 
            ? 'border-red-500/20' 
            : isStagnant 
            ? 'border-cyan-500/20' 
            : 'border-green-500/20'
        }`}
      />

      {/* Static grid target HUD marker */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="w-[280px] h-[280px] rounded-full border border-white/5 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-3 bg-cyan-400/50" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0.5 h-3 bg-cyan-400/50" />
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-0.5 bg-cyan-400/50" />
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-0.5 bg-cyan-400/50" />
          <div className="absolute top-2 left-6 text-[9px] font-mono text-cyan-400/40 tracking-widest uppercase">
            Dish SEC_08
          </div>
          <div className="absolute bottom-2 right-6 text-[9px] font-mono text-cyan-400/40 tracking-widest uppercase">
            MATRIX CALIBRATED
          </div>
        </div>
      </div>

      {/* Actual canvas */}
      <canvas
        ref={canvasRef}
        width={270}
        height={270}
        className="relative z-10 rounded-full cursor-crosshair"
      />
    </div>
  );
}
