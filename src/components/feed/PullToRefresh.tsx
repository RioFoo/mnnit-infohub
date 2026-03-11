import { useState, useRef, useCallback, type ReactNode } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { Loader2 } from 'lucide-react';
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
  const pullY = useMotionValue(0);
  const touchStartY = useRef(0);
  const pulling = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const indicatorOpacity = useTransform(pullY, [0, 40, PULL_THRESHOLD], [0, 0.5, 1]);
  const indicatorScale = useTransform(pullY, [0, PULL_THRESHOLD], [0.5, 1]);
  const indicatorRotation = useTransform(pullY, [0, PULL_THRESHOLD, MAX_PULL], [0, 180, 360]);
  const indicatorY = useTransform(pullY, v => v * 0.5 - 40);
  const contentY = useTransform(pullY, v => v * 0.4);

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
    // Rubber-band effect: diminishing returns past threshold
    const dampened = deltaY > PULL_THRESHOLD
      ? PULL_THRESHOLD + (deltaY - PULL_THRESHOLD) * 0.3
      : deltaY;
    pullY.set(Math.min(dampened, MAX_PULL));
  }, [refreshing, pullY]);

  const handleTouchEnd = useCallback(async () => {
    if (!pulling.current) return;
    pulling.current = false;
    
    if (pullY.get() >= PULL_THRESHOLD && !refreshing) {
      setRefreshing(true);
      animate(pullY, 60, { type: 'spring', stiffness: 300, damping: 30 });
      try {
        await onRefresh();
      } finally {
        setRefreshing(false);
        animate(pullY, 0, { type: 'spring', stiffness: 400, damping: 30 });
      }
    } else {
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
        className="absolute left-1/2 -translate-x-1/2 z-20 flex items-center justify-center"
      >
        <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center backdrop-blur-sm">
          {refreshing ? (
            <Loader2 className="w-5 h-5 text-primary animate-spin" />
          ) : (
            <motion.div style={{ rotate: indicatorRotation }}>
              <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M19 12l-7 7-7-7" />
              </svg>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Content with pull offset */}
      <motion.div style={{ y: useTransform(pullY, v => v * 0.4) }}>
        {children}
      </motion.div>
    </div>
  );
};

export default PullToRefresh;
