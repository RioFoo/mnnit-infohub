import { useState, useRef, useCallback, type ReactNode } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: ReactNode;
}

const PULL_THRESHOLD = 80;
const MAX_PULL = 120;

const PullToRefresh = ({ onRefresh, children }: PullToRefreshProps) => {
  const isMobile = useIsMobile();
  const [refreshing, setRefreshing] = useState(false);
  const [pullProgress, setPullProgress] = useState(0);
  const pullY = useMotionValue(0);
  const touchStartY = useRef(0);
  const pulling = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const indicatorOpacity = useTransform(pullY, [0, 30, PULL_THRESHOLD], [0, 0.6, 1]);
  const indicatorScale = useTransform(pullY, [0, PULL_THRESHOLD], [0.4, 1]);
  const indicatorRotation = useTransform(pullY, [0, PULL_THRESHOLD, MAX_PULL], [0, 180, 360]);
  const indicatorY = useTransform(pullY, v => v * 0.5 - 44);
  const contentY = useTransform(pullY, v => v * 0.4);
  const progressStroke = useTransform(pullY, [0, PULL_THRESHOLD], [0, 100]);
  const strokeOffset = useTransform(progressStroke, v => 113 - (v / 100) * 113);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (refreshing) return;
    const scrollTop = containerRef.current?.closest('[data-scroll-container]')?.scrollTop ?? window.scrollY;
    if (scrollTop <= 5) {
      touchStartY.current = e.touches[0].clientY;
      pulling.current = true;
    }
  }, [refreshing]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!pulling.current || refreshing) return;
    const deltaY = Math.max(0, e.touches[0].clientY - touchStartY.current);
    const dampened = deltaY > PULL_THRESHOLD
      ? PULL_THRESHOLD + (deltaY - PULL_THRESHOLD) * 0.3
      : deltaY;
    const clamped = Math.min(dampened, MAX_PULL);
    pullY.set(clamped);
    setPullProgress(Math.min(clamped / PULL_THRESHOLD, 1));
  }, [refreshing, pullY]);

  const handleTouchEnd = useCallback(async () => {
    if (!pulling.current) return;
    pulling.current = false;
    
    if (pullY.get() >= PULL_THRESHOLD && !refreshing) {
      setRefreshing(true);
      setPullProgress(1);
      animate(pullY, 60, { type: 'spring', stiffness: 300, damping: 30 });
      try {
        await onRefresh();
      } finally {
        setRefreshing(false);
        setPullProgress(0);
        animate(pullY, 0, { type: 'spring', stiffness: 400, damping: 30 });
      }
    } else {
      setPullProgress(0);
      animate(pullY, 0, { type: 'spring', stiffness: 400, damping: 25 });
    }
  }, [pullY, refreshing, onRefresh]);

  if (!isMobile) return <>{children}</>;

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative"
    >
      {/* Pull indicator */}
      <motion.div
        style={{ opacity: indicatorOpacity, scale: indicatorScale, y: indicatorY }}
        className="absolute left-1/2 -translate-x-1/2 z-20 flex flex-col items-center justify-center gap-1.5"
      >
        <div className="relative w-11 h-11 rounded-full bg-background/80 border border-border/30 flex items-center justify-center backdrop-blur-md shadow-[0_0_16px_hsl(var(--primary)/0.15)]">
          {/* Progress ring */}
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 44 44">
            <circle
              cx="22" cy="22" r="18"
              fill="none"
              stroke="hsl(var(--primary) / 0.15)"
              strokeWidth="2.5"
            />
            <motion.circle
              cx="22" cy="22" r="18"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray="113"
              style={{ strokeDashoffset: useTransform(progressStroke, v => 113 - (v / 100) * 113) }}
              className={refreshing ? 'animate-spin origin-center' : ''}
            />
          </svg>
          
          {refreshing ? (
            <RefreshCw className="w-4.5 h-4.5 text-primary animate-spin" />
          ) : (
            <motion.div style={{ rotate: indicatorRotation }}>
              <RefreshCw className="w-4.5 h-4.5 text-primary" />
            </motion.div>
          )}
        </div>
        
        {/* Status text */}
        <motion.span
          className="text-[10px] font-mono text-muted-foreground/80 whitespace-nowrap"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {refreshing ? 'Refreshing…' : pullProgress >= 1 ? 'Release to refresh' : 'Pull to refresh'}
        </motion.span>
      </motion.div>

      {/* Content with pull offset */}
      <motion.div style={{ y: contentY }}>
        {children}
      </motion.div>
    </div>
  );
};

export default PullToRefresh;
