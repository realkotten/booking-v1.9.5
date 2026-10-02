import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  radius: number;
  baseAlpha: number;
  alpha: number;
  vx: number;
  vy: number;
  phase: number;
  phaseSpeed: number;
  colorType: number; // 0: warm gold, 1: champagne amber, 2: soft ivory, 3: subtle brass
}

interface StudioDustMotesProps {
  className?: string;
  particleCount?: number;
  speedMultiplier?: number;
  intensity?: number;
}

export const StudioDustMotes: React.FC<StudioDustMotesProps> = ({
  className = '',
  particleCount = 55,
  speedMultiplier = 0.7,
  intensity = 0.85,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Disable completely on mobile / low-end or reduced motion for peak 60fps performance
  const isMobileOrReducedMotion = typeof window !== 'undefined' && (
    window.innerWidth <= 768 || 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  useEffect(() => {
    if (isMobileOrReducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    // Color palette for dust motes in studio light with airy pastel accents
    const moteColors = [
      { r: 255, g: 235, b: 195 }, // Soft Champagne
      { r: 191, g: 221, b: 244 }, // Powder Blue (#bfddf4)
      { r: 222, g: 212, b: 245 }, // Delicate Lavender (#ded4f5)
      { r: 248, g: 208, b: 222 }, // Blush Pink (#f8d0de)
      { r: 254, g: 213, b: 193 }, // Warm Peach (#fed5c1)
      { r: 255, g: 255, b: 255 }, // Studio Specular Diamond Light
    ];

    const particles: Particle[] = [];

    const initParticles = () => {
      particles.length = 0;
      for (let i = 0; i < particleCount; i++) {
        const radius = Math.random() * 2.2 + 0.6; // 0.6px to 2.8px
        const baseAlpha = (Math.random() * 0.45 + 0.15) * intensity;
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius,
          baseAlpha,
          alpha: baseAlpha,
          vx: (Math.random() - 0.5) * 0.25 * speedMultiplier,
          vy: -(Math.random() * 0.35 + 0.1) * speedMultiplier, // Gently drifting upwards
          phase: Math.random() * Math.PI * 2,
          phaseSpeed: (Math.random() * 0.015 + 0.005) * speedMultiplier,
          colorType: Math.floor(Math.random() * moteColors.length),
        });
      }
    };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
      initParticles();
    };

    window.addEventListener('resize', handleResize);
    initParticles();

    let lastTime = performance.now();

    const render = (currentTime: number) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Organic sinusoidal floating motion
        p.phase += p.phaseSpeed;
        const wobbleX = Math.sin(p.phase * 1.3) * 0.35;
        const wobbleY = Math.cos(p.phase * 0.8) * 0.15;

        p.x += (p.vx + wobbleX) * dt * 60;
        p.y += (p.vy + wobbleY) * dt * 60;

        // Twinkle / gentle breathing of alpha
        p.alpha = p.baseAlpha * (0.65 + 0.35 * Math.sin(p.phase * 2));

        // Wrap around boundaries with soft buffer
        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        } else if (p.y > height + 10) {
          p.y = -10;
          p.x = Math.random() * width;
        }

        if (p.x < -10) {
          p.x = width + 10;
        } else if (p.x > width + 10) {
          p.x = -10;
        }

        const color = moteColors[p.colorType];

        // Draw soft glowing mote
        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${p.alpha})`;

        // Add soft radial halo to larger motes
        if (p.radius > 1.4) {
          ctx.shadowColor = `rgba(${color.r}, ${color.g}, ${color.b}, ${p.alpha * 0.8})`;
          ctx.shadowBlur = p.radius * 4;
        }

        ctx.fill();
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [particleCount, speedMultiplier, intensity]);

  if (isMobileOrReducedMotion) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`absolute inset-0 w-full h-full pointer-events-none select-none ${className}`}
      style={{ mixBlendMode: 'screen' }}
    />
  );
};
