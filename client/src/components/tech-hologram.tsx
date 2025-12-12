import { useEffect, useRef, useState } from "react";

interface TechHologramProps {
  type: "computer" | "circuit" | "server" | "mobile" | "network" | "code" | "chip";
  size?: number;
  className?: string;
  particleCount?: number;
  interactive?: boolean;
}

interface ShapePoint {
  x: number;
  y: number;
  z: number;
}

const createTechShapes = (): Record<string, ShapePoint[]> => ({
  computer: (() => {
    const points: ShapePoint[] = [];
    for (let x = -0.8; x <= 0.8; x += 0.08) {
      points.push({ x, y: 0.5, z: 0 });
      points.push({ x, y: -0.1, z: 0 });
    }
    for (let y = -0.1; y <= 0.5; y += 0.08) {
      points.push({ x: -0.8, y, z: 0 });
      points.push({ x: 0.8, y, z: 0 });
    }
    for (let x = -0.6; x <= 0.6; x += 0.15) {
      for (let y = 0; y <= 0.4; y += 0.12) {
        points.push({ x, y, z: 0.05 });
      }
    }
    for (let x = -0.15; x <= 0.15; x += 0.08) {
      points.push({ x, y: -0.25, z: 0 });
    }
    for (let x = -0.4; x <= 0.4; x += 0.08) {
      points.push({ x, y: -0.4, z: 0 });
      points.push({ x, y: -0.5, z: 0 });
    }
    return points;
  })(),
  
  circuit: (() => {
    const points: ShapePoint[] = [];
    for (let x = -0.25; x <= 0.25; x += 0.1) {
      for (let y = -0.25; y <= 0.25; y += 0.1) {
        points.push({ x, y, z: 0 });
      }
    }
    for (let i = 0.35; i <= 0.8; i += 0.1) {
      points.push({ x: i, y: 0, z: 0 });
      points.push({ x: -i, y: 0, z: 0 });
      points.push({ x: 0, y: i, z: 0 });
      points.push({ x: 0, y: -i, z: 0 });
    }
    const diagonals = [
      [0.35, 0.35], [0.5, 0.5], [0.65, 0.65],
      [-0.35, 0.35], [-0.5, 0.5], [-0.65, 0.65],
      [0.35, -0.35], [0.5, -0.5], [0.65, -0.65],
      [-0.35, -0.35], [-0.5, -0.5], [-0.65, -0.65],
    ];
    diagonals.forEach(([x, y]) => {
      points.push({ x, y, z: 0 });
    });
    const corners = [[0.8, 0.8], [-0.8, 0.8], [0.8, -0.8], [-0.8, -0.8]];
    corners.forEach(([x, y]) => {
      points.push({ x, y, z: 0.1 });
    });
    return points;
  })(),
  
  server: (() => {
    const points: ShapePoint[] = [];
    for (let y = -0.8; y <= 0.8; y += 0.2) {
      for (let x = -0.4; x <= 0.4; x += 0.1) {
        points.push({ x, y, z: 0 });
      }
      points.push({ x: -0.4, y, z: 0.15 });
      points.push({ x: 0.4, y, z: 0.15 });
    }
    for (let y = -0.7; y <= 0.7; y += 0.25) {
      points.push({ x: -0.3, y, z: 0.1 });
      points.push({ x: 0.35, y, z: 0.1 });
    }
    for (let x = -0.4; x <= 0.4; x += 0.1) {
      points.push({ x, y: 0.85, z: 0 });
      points.push({ x, y: -0.85, z: 0 });
    }
    return points;
  })(),
  
  mobile: (() => {
    const points: ShapePoint[] = [];
    for (let y = -0.85; y <= 0.85; y += 0.08) {
      points.push({ x: -0.35, y, z: 0 });
      points.push({ x: 0.35, y, z: 0 });
    }
    for (let x = -0.3; x <= 0.3; x += 0.08) {
      points.push({ x, y: -0.85, z: 0 });
      points.push({ x, y: 0.85, z: 0 });
    }
    for (let x = -0.25; x <= 0.25; x += 0.12) {
      for (let y = -0.6; y <= 0.5; y += 0.15) {
        points.push({ x, y, z: 0.05 });
      }
    }
    points.push({ x: 0, y: 0.75, z: 0.05 });
    points.push({ x: 0, y: -0.75, z: 0.05 });
    points.push({ x: -0.1, y: 0.75, z: 0.05 });
    points.push({ x: 0.1, y: 0.75, z: 0.05 });
    return points;
  })(),
  
  network: (() => {
    const points: ShapePoint[] = [];
    points.push({ x: 0, y: 0, z: 0.1 });
    const nodePositions: [number, number][] = [
      [0, 0.7], [0.6, 0.35], [0.6, -0.35],
      [0, -0.7], [-0.6, -0.35], [-0.6, 0.35],
    ];
    nodePositions.forEach(([x, y]) => {
      points.push({ x, y, z: 0 });
      for (let t = 0.25; t < 1; t += 0.25) {
        points.push({ x: x * t, y: y * t, z: 0.05 });
      }
    });
    for (let i = 0; i < nodePositions.length; i++) {
      const [x1, y1] = nodePositions[i];
      const [x2, y2] = nodePositions[(i + 1) % nodePositions.length];
      for (let t = 0.33; t < 1; t += 0.33) {
        points.push({ x: x1 + (x2 - x1) * t, y: y1 + (y2 - y1) * t, z: 0 });
      }
    }
    return points;
  })(),
  
  code: (() => {
    const points: ShapePoint[] = [];
    for (let t = 0; t <= 1; t += 0.15) {
      points.push({ x: -0.85 + t * 0.25, y: 0.5 - t * 0.5, z: 0 });
      points.push({ x: -0.6 - t * 0.25, y: 0 - t * 0.5, z: 0 });
    }
    for (let t = 0; t <= 1; t += 0.15) {
      points.push({ x: 0.85 - t * 0.25, y: 0.5 - t * 0.5, z: 0 });
      points.push({ x: 0.6 + t * 0.25, y: 0 - t * 0.5, z: 0 });
    }
    const lineYs = [0.35, 0.15, -0.05, -0.25, -0.45];
    lineYs.forEach((y, idx) => {
      const width = 0.3 + (idx % 3) * 0.15;
      const startX = -0.3 + (idx % 2) * 0.1;
      for (let x = startX; x <= startX + width; x += 0.1) {
        points.push({ x, y, z: 0.05 });
      }
    });
    return points;
  })(),
  
  chip: (() => {
    const points: ShapePoint[] = [];
    for (let x = -0.35; x <= 0.35; x += 0.1) {
      for (let y = -0.35; y <= 0.35; y += 0.1) {
        points.push({ x, y, z: 0 });
      }
    }
    for (let x = -0.4; x <= 0.4; x += 0.15) {
      points.push({ x, y: 0.4, z: 0 });
      points.push({ x, y: -0.4, z: 0 });
    }
    for (let y = -0.4; y <= 0.4; y += 0.15) {
      points.push({ x: 0.4, y, z: 0 });
      points.push({ x: -0.4, y, z: 0 });
    }
    for (let i = 0; i < 6; i++) {
      const pos = -0.25 + i * 0.1;
      points.push({ x: pos, y: 0.55, z: 0 });
      points.push({ x: pos, y: 0.7, z: 0 });
      points.push({ x: pos, y: -0.55, z: 0 });
      points.push({ x: pos, y: -0.7, z: 0 });
      points.push({ x: 0.55, y: pos, z: 0 });
      points.push({ x: 0.7, y: pos, z: 0 });
      points.push({ x: -0.55, y: pos, z: 0 });
      points.push({ x: -0.7, y: pos, z: 0 });
    }
    return points;
  })(),
});

interface Particle {
  x: number;
  y: number;
  z: number;
  targetX: number;
  targetY: number;
  targetZ: number;
  size: number;
  opacity: number;
  phase: number;
  speed: number;
  colorType: number;
}

export function TechHologram({ 
  type, 
  size = 200, 
  className = "",
  particleCount = 400,
  interactive = true 
}: TechHologramProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const timeRef = useRef(0);
  const mouseRef = useRef({ x: 0, y: 0 });
  const rotationRef = useRef(0);
  const [isReady, setIsReady] = useState(false);

  const techShapes = createTechShapes();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const shape = techShapes[type] || techShapes.computer;
    const particles: Particle[] = [];

    shape.forEach((point) => {
      for (let i = 0; i < 2; i++) {
        particles.push({
          x: (Math.random() - 0.5) * 2,
          y: (Math.random() - 0.5) * 2,
          z: (Math.random() - 0.5) * 0.5,
          targetX: point.x + (Math.random() - 0.5) * 0.05,
          targetY: point.y + (Math.random() - 0.5) * 0.05,
          targetZ: point.z + (Math.random() - 0.5) * 0.05,
          size: Math.random() * 2.5 + 2,
          opacity: Math.random() * 0.4 + 0.6,
          phase: Math.random() * Math.PI * 2,
          speed: Math.random() * 0.5 + 0.5,
          colorType: Math.floor(Math.random() * 4),
        });
      }
    });

    const extraCount = Math.min(50, Math.max(0, particleCount - particles.length));
    for (let i = 0; i < extraCount; i++) {
      const randomShapePoint = shape[Math.floor(Math.random() * shape.length)];
      particles.push({
        x: (Math.random() - 0.5) * 2,
        y: (Math.random() - 0.5) * 2,
        z: (Math.random() - 0.5) * 0.5,
        targetX: randomShapePoint.x + (Math.random() - 0.5) * 0.3,
        targetY: randomShapePoint.y + (Math.random() - 0.5) * 0.3,
        targetZ: randomShapePoint.z + (Math.random() - 0.5) * 0.2,
        size: Math.random() * 1.5 + 1,
        opacity: Math.random() * 0.25 + 0.15,
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.3 + 0.2,
        colorType: Math.floor(Math.random() * 4),
      });
    }

    particlesRef.current = particles;
    setIsReady(true);

    const getColor = (colorType: number, opacity: number): string => {
      switch (colorType) {
        case 0:
          return `rgba(0, 191, 255, ${opacity})`;
        case 1:
          return `rgba(124, 58, 237, ${opacity})`;
        case 2:
          return `rgba(50, 180, 255, ${opacity})`;
        default:
          return `rgba(255, 255, 255, ${opacity})`;
      }
    };

    const centerX = size / 2;
    const centerY = size / 2;
    const scale = size * 0.4;

    const animate = () => {
      timeRef.current += 0.016;
      rotationRef.current += 0.003;
      ctx.clearRect(0, 0, size, size);

      const cosR = Math.cos(rotationRef.current);
      const sinR = Math.sin(rotationRef.current);

      const projectedParticles: { p: Particle; screenX: number; screenY: number; depth: number }[] = [];

      particlesRef.current.forEach((particle) => {
        const pulseFactor = Math.sin(timeRef.current * particle.speed + particle.phase) * 0.15 + 0.85;

        particle.x += (particle.targetX - particle.x) * 0.08;
        particle.y += (particle.targetY - particle.y) * 0.08;
        particle.z += (particle.targetZ - particle.z) * 0.08;

        const waveX = Math.sin(timeRef.current * 0.8 + particle.phase) * 0.015;
        const waveY = Math.cos(timeRef.current * 0.6 + particle.phase) * 0.01;

        let localX = particle.x + waveX;
        let localY = particle.y + waveY;
        let localZ = particle.z;

        if (interactive) {
          const normalizedMouseX = (mouseRef.current.x - centerX) / scale;
          const normalizedMouseY = (mouseRef.current.y - centerY) / scale;
          const dx = normalizedMouseX - localX;
          const dy = normalizedMouseY - localY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < 0.5 && dist > 0) {
            const force = (0.5 - dist) * 0.15;
            localX -= dx * force;
            localY -= dy * force;
          }
        }

        const rotatedX = localX * cosR - localZ * sinR;
        const rotatedZ = localX * sinR + localZ * cosR;

        const perspective = 1 / (1 - rotatedZ * 0.2);
        const screenX = centerX + rotatedX * scale * perspective;
        const screenY = centerY - localY * scale * perspective;

        projectedParticles.push({
          p: particle,
          screenX,
          screenY,
          depth: rotatedZ,
        });
      });

      projectedParticles.sort((a, b) => a.depth - b.depth);

      projectedParticles.forEach(({ p, screenX, screenY, depth }) => {
        const pulseFactor = Math.sin(timeRef.current * p.speed + p.phase) * 0.2 + 0.8;
        const depthScale = 1 + depth * 0.3;
        const baseOpacity = p.opacity * pulseFactor * Math.max(0.5, depthScale);

        const gradient = ctx.createRadialGradient(
          screenX, screenY, 0,
          screenX, screenY, p.size * 4 * depthScale
        );
        gradient.addColorStop(0, getColor(p.colorType, baseOpacity));
        gradient.addColorStop(0.4, getColor(p.colorType, baseOpacity * 0.5));
        gradient.addColorStop(1, "rgba(0, 191, 255, 0)");

        ctx.beginPath();
        ctx.arc(screenX, screenY, p.size * pulseFactor * 2 * depthScale, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(screenX, screenY, p.size * 0.4 * pulseFactor * depthScale, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${baseOpacity * 0.85})`;
        ctx.fill();
      });

      for (let i = 0; i < projectedParticles.length; i++) {
        const p1 = projectedParticles[i];
        for (let j = i + 1; j < projectedParticles.length; j++) {
          const p2 = projectedParticles[j];
          const dx = p1.screenX - p2.screenX;
          const dy = p1.screenY - p2.screenY;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 25 && distance > 0) {
            const lineOpacity = (1 - distance / 25) * 0.2;
            ctx.beginPath();
            ctx.moveTo(p1.screenX, p1.screenY);
            ctx.lineTo(p2.screenX, p2.screenY);
            ctx.strokeStyle = `rgba(0, 191, 255, ${lineOpacity})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    if (interactive) {
      canvas.addEventListener("mousemove", handleMouseMove);
    }
    animate();

    return () => {
      if (interactive) {
        canvas.removeEventListener("mousemove", handleMouseMove);
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [type, size, particleCount, interactive]);

  return (
    <div 
      className={`relative flex items-center justify-center ${className}`} 
      style={{ width: size, height: size }}
    >
      <canvas
        ref={canvasRef}
        style={{ 
          width: size, 
          height: size,
          display: "block",
          opacity: isReady ? 1 : 0,
          transition: "opacity 0.5s ease-out",
        }}
        className={interactive ? "cursor-crosshair" : ""}
      />
      <div 
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{ 
          background: "radial-gradient(circle, rgba(0,191,255,0.1) 0%, rgba(124,58,237,0.05) 50%, transparent 70%)",
          filter: "blur(15px)",
        }}
      />
    </div>
  );
}
