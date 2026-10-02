import React, { useRef, useState, useCallback } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';

interface SpatialTiltProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number; // Maximum rotation in degrees
  glareOpacity?: number; // Max glare intensity (0 to 1)
  scaleOnHover?: number;
  onClick?: (e: React.MouseEvent) => void;
  disabled?: boolean;
  style?: React.CSSProperties;
  as?: 'div' | 'button';
  type?: 'button' | 'submit' | 'reset';
  id?: string;
  title?: string;
  'aria-label'?: string;
}

export const SpatialTilt: React.FC<SpatialTiltProps> = ({
  children,
  className = '',
  maxTilt = 8,
  glareOpacity = 0.35,
  scaleOnHover = 1.015,
  onClick,
  disabled = false,
  style = {},
  as = 'div',
  type = 'button',
  id,
  title,
  'aria-label': ariaLabel,
}) => {
  const containerRef = useRef<HTMLDivElement | HTMLButtonElement | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Raw mouse coordinates relative to element center (-0.5 to 0.5)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Spring smoothed coordinates
  const springConfig = { damping: 20, stiffness: 320, mass: 0.2 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // Calculate 3D rotations unconditionally at top level
  const rotateX = useTransform(smoothY, [-0.5, 0.5], [maxTilt, -maxTilt]);
  const rotateY = useTransform(smoothX, [-0.5, 0.5], [-maxTilt, maxTilt]);

  // Glare position percentage (0% to 100%)
  const glareX = useTransform(smoothX, [-0.5, 0.5], [0, 100]);
  const glareY = useTransform(smoothY, [-0.5, 0.5], [0, 100]);

  // Unconditional top-level transform for specular glare
  const glareBackground = useTransform(
    [glareX, glareY],
    ([x, y]) =>
      `radial-gradient(circle 140px at ${x}% ${y}%, rgba(255, 255, 255, ${glareOpacity}) 0%, rgba(255, 255, 255, 0.08) 45%, transparent 75%)`
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (disabled || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      mouseX.set(x);
      mouseY.set(y);
    },
    [disabled, mouseX, mouseY]
  );

  const handleMouseEnter = useCallback(() => {
    if (!disabled) setIsHovered(true);
  }, [disabled]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  }, [mouseX, mouseY]);

  const isTouchOrMobile = typeof window !== 'undefined' && (
    'ontouchstart' in window || 
    window.innerWidth <= 768 || 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  const Component = as === 'button' ? motion.button : motion.div;

  if (isTouchOrMobile) {
    return (
      <Component
        ref={containerRef as any}
        id={id}
        type={as === 'button' ? type : undefined}
        title={title}
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={onClick}
        style={style}
        whileTap={disabled ? undefined : { scale: 0.98, transition: { duration: 0.1 } }}
        className={`relative ${className}`}
      >
        {children}
      </Component>
    );
  }

  return (
    <Component
      ref={containerRef as any}
      id={id}
      type={as === 'button' ? type : undefined}
      title={title}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective: 1000,
        transformStyle: 'preserve-3d',
        rotateX,
        rotateY,
        ...style,
      }}
      whileHover={
        disabled
          ? undefined
          : {
              scale: scaleOnHover,
              z: 8,
              transition: { duration: 0.2, ease: 'easeOut' },
            }
      }
      whileTap={
        disabled
          ? undefined
          : {
              scale: 0.98,
              z: 0,
              transition: { duration: 0.1 },
            }
      }
      className={`relative overflow-hidden ${className}`}
    >
      {/* Dynamic Cursor-Following Specular Glare Reflection without conditional hooks */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-30 rounded-[inherit]"
        style={{
          background: glareBackground,
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered && !disabled ? 1 : 0 }}
        transition={{ duration: 0.18 }}
      />

      {/* Card Content with 3D child preservation */}
      <div className="relative z-10 w-full h-full" style={{ transformStyle: 'preserve-3d' }}>
        {children}
      </div>
    </Component>
  );
};
