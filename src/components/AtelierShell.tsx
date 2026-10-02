import React, { useState, useEffect, useRef } from 'react';
import { Type } from 'lucide-react';
import { DynamicIslandNotificationCenter } from './notifications/DynamicIslandNotificationCenter';
import { StudioDustMotes } from './StudioDustMotes';
import { FontSelectorModal } from './common/FontSelectorModal';
import { getSelectedFont, FontOption } from '../utils/fontManager';

interface AtelierShellProps {
  id?: string;
  children: React.ReactNode;
  showStatusBar?: boolean;
  className?: string;
  bottomPadding?: string;
  onNavigateToTab?: (tab: string) => void;
  isWideLayout?: boolean;
  headerContent?: React.ReactNode;
}

export const AtelierShell: React.FC<AtelierShellProps> = ({
  id = 'atelier-page-container',
  children,
  showStatusBar = true,
  className = '',
  bottomPadding = 'pb-20 sm:pb-24',
  onNavigateToTab,
  isWideLayout = false,
  headerContent,
}) => {
  const [currentTime, setCurrentTime] = useState<Date>(() => new Date());
  const [isFontModalOpen, setIsFontModalOpen] = useState(false);
  const [currentFont, setCurrentFont] = useState<FontOption>(() => getSelectedFont());
  
  // Listen for font changes and global open events
  useEffect(() => {
    const handleFontChange = (e: any) => {
      if (e.detail?.font) {
        setCurrentFont(e.detail.font);
      }
    };
    const handleOpenModal = () => setIsFontModalOpen(true);

    window.addEventListener('atelier-font-changed', handleFontChange);
    window.addEventListener('open-font-selector', handleOpenModal);
    return () => {
      window.removeEventListener('atelier-font-changed', handleFontChange);
      window.removeEventListener('open-font-selector', handleOpenModal);
    };
  }, []);
  
  // Multi-source parallax coordinates state with smooth spring-like lerp
  const [parallaxOffset, setParallaxOffset] = useState<{ x: number; y: number; scrollY: number }>({ x: 0, y: 0, scrollY: 0 });
  
  // Detect low-end or mobile screens once
  const isLowEndOrMobile = typeof window !== 'undefined' && (
    window.innerWidth <= 768 || 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  // Target and current refs for silky 60fps interpolation
  const targetOffsetRef = useRef<{ x: number; y: number; scrollY: number }>({ x: 0, y: 0, scrollY: 0 });
  const currentOffsetRef = useRef<{ x: number; y: number; scrollY: number }>({ x: 0, y: 0, scrollY: 0 });
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Multi-input parallax listeners (disabled on mobile for peak performance)
  useEffect(() => {
    if (typeof window === 'undefined' || isLowEndOrMobile) return;

    let isRunning = true;

    // 1. Unified Scroll Listener (captures all scrollable child elements + window)
    const handleScroll = (e: Event) => {
      let scrollPosition = 0;
      const target = e.target;
      
      if (target === document || target === window) {
        scrollPosition = window.scrollY || document.documentElement.scrollTop || 0;
      } else if (target instanceof HTMLElement) {
        scrollPosition = target.scrollTop || 0;
      }

      // Normalized scroll effect (capped for smooth boundaries)
      targetOffsetRef.current.scrollY = Math.min(scrollPosition, 800);
    };

    // 2. Mouse Move Listener for Desktop
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      if (innerWidth === 0 || innerHeight === 0) return;
      
      const nx = ((e.clientX / innerWidth) - 0.5) * 2;
      const ny = ((e.clientY / innerHeight) - 0.5) * 2;
      
      targetOffsetRef.current.x = Math.max(-1, Math.min(1, nx));
      targetOffsetRef.current.y = Math.max(-1, Math.min(1, ny));
    };

    const handleMouseLeave = () => {
      targetOffsetRef.current.x = 0;
      targetOffsetRef.current.y = 0;
    };

    // 3. Touch Drag & Swipe Parallax Listener for Mobile/Tablet
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        touchStartRef.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        };
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!touchStartRef.current || e.touches.length === 0) return;
      const touch = e.touches[0];
      const deltaX = (touch.clientX - touchStartRef.current.x) / (window.innerWidth * 0.4);
      const deltaY = (touch.clientY - touchStartRef.current.y) / (window.innerHeight * 0.4);

      targetOffsetRef.current.x = Math.max(-1, Math.min(1, deltaX));
      targetOffsetRef.current.y = Math.max(-1, Math.min(1, deltaY));
    };

    const handleTouchEnd = () => {
      touchStartRef.current = null;
      // Gently return touch delta to neutral
      targetOffsetRef.current.x = 0;
      targetOffsetRef.current.y = 0;
    };

    // 4. Device Orientation / Gyroscope (subtle natural tilt when tilting phone)
    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma !== null && e.beta !== null) {
        // gamma: left-to-right tilt in degrees [-90 to 90]
        // beta: front-to-back tilt in degrees [-180 to 180], typical holding angle ~45deg
        const tiltX = Math.max(-1, Math.min(1, e.gamma / 35));
        const tiltY = Math.max(-1, Math.min(1, (e.beta - 45) / 35));
        
        targetOffsetRef.current.x = tiltX;
        targetOffsetRef.current.y = tiltY;
      }
    };

    // Register event listeners
    window.addEventListener('scroll', handleScroll, { passive: true, capture: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('touchcancel', handleTouchEnd, { passive: true });

    if (window.DeviceOrientationEvent && typeof (window.DeviceOrientationEvent as any).requestPermission !== 'function') {
      window.addEventListener('deviceorientation', handleOrientation, { passive: true });
    }

    // 5. Smooth physics lerp loop with buttery damping (60-120fps)
    const animate = () => {
      if (!isRunning) return;

      const target = targetOffsetRef.current;
      const current = currentOffsetRef.current;
      
      const lerpFactor = 0.06;
      const scrollLerp = 0.08;

      const dx = target.x - current.x;
      const dy = target.y - current.y;
      const dScroll = target.scrollY - current.scrollY;

      let changed = false;

      if (Math.abs(dx) > 0.0002 || Math.abs(dy) > 0.0002) {
        current.x += dx * lerpFactor;
        current.y += dy * lerpFactor;
        changed = true;
      }

      if (Math.abs(dScroll) > 0.1) {
        current.scrollY += dScroll * scrollLerp;
        changed = true;
      }

      if (changed) {
        setParallaxOffset({ 
          x: current.x, 
          y: current.y,
          scrollY: current.scrollY 
        });
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      isRunning = false;
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);
      window.removeEventListener('deviceorientation', handleOrientation);
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  const hours = String(currentTime.getHours()).padStart(2, '0');
  const minutes = String(currentTime.getMinutes()).padStart(2, '0');
  const liveShortTimeEn = `${hours}:${minutes}`;

  const containerSizing = 'w-full h-[100dvh] min-h-[100dvh] max-w-none';

  const px = parallaxOffset.x;
  const py = parallaxOffset.y;
  const scrollOffset = parallaxOffset.scrollY;

  return (
    <div
      id={id}
      className={`relative w-full ${containerSizing} mx-auto glass-panel-vitality overflow-hidden rounded-none flex flex-col justify-start select-none transition-shadow duration-300 ${className}`}
    >
      {/* ─── Brand Light Gradient Background (White Dominance) ─── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none -z-10 bg-gradient-to-b from-white via-white via-60% to-[#fbf0ea]">
        {/* Soft Brand Light Atmospheric Blooms */}
        <div className="absolute -top-16 -right-16 w-[420px] h-[420px] rounded-full bg-gradient-to-br from-[#fedecb]/30 via-[#fdf2ee]/50 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 -left-20 w-[380px] h-[380px] rounded-full bg-gradient-to-tr from-[#f3d0c4]/20 via-white to-transparent blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-1/4 w-[450px] h-[360px] rounded-full bg-gradient-to-t from-[#fdf2ee]/40 via-white/80 to-transparent blur-3xl pointer-events-none" />

        {/* Ambient Floating Dust Motes (Desktop only, auto-skipped on mobile) */}
        {!isLowEndOrMobile && (
          <StudioDustMotes particleCount={24} speedMultiplier={0.4} intensity={0.5} />
        )}

        {/* Crisp Top Ambient Gradient for optimal status bar & header contrast */}
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-white via-white/70 to-transparent pointer-events-none" />
      </div>

      {/* iOS / Mobile Main Single Header Bar */}
      {showStatusBar && (
        <header
          id="ios-status-bar"
          className="relative z-40 px-3 sm:px-5 pt-[max(0.35rem,env(safe-area-inset-top,0px))] pb-1 sm:pb-2 min-h-[40px] sm:min-h-[48px] flex items-center text-stone-800 text-xs font-semibold tracking-tight shrink-0 select-none bg-transparent"
        >
          {headerContent ? (
            <div className="w-full">{headerContent}</div>
          ) : (
            <div className="w-full flex justify-center items-center">
              <DynamicIslandNotificationCenter onNavigateToTab={onNavigateToTab} />
            </div>
          )}
        </header>
      )}

      <div className={`relative z-20 flex-1 min-h-0 flex flex-col overflow-hidden ${bottomPadding}`}>
        {children}
      </div>

      {/* Font & Typography Selector Modal */}
      <FontSelectorModal
        isOpen={isFontModalOpen}
        onClose={() => setIsFontModalOpen(false)}
      />
    </div>
  );
};
