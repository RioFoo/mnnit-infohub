import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

/**
 * Subtle top loading bar (NProgress-like) that animates during route transitions.
 * Triggers a quick 0 → 90% trickle on pathname change, then completes to 100% and fades.
 */
const RouteProgressBar = () => {
  const location = useLocation();
  const navType = useNavigationType();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const trickleRef = useRef<number | null>(null);
  const completeRef = useRef<number | null>(null);
  const hideRef = useRef<number | null>(null);
  const firstRender = useRef(true);

  useEffect(() => {
    // Skip the initial mount — only animate on actual route changes
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }

    // Reset any pending timers
    if (trickleRef.current) window.clearInterval(trickleRef.current);
    if (completeRef.current) window.clearTimeout(completeRef.current);
    if (hideRef.current) window.clearTimeout(hideRef.current);

    setVisible(true);
    setProgress(8);

    // Trickle up to ~90%
    trickleRef.current = window.setInterval(() => {
      setProgress((p) => {
        if (p >= 90) return p;
        const remaining = 90 - p;
        const inc = Math.max(1, remaining * 0.15);
        return Math.min(90, p + inc);
      });
    }, 120);

    // Complete shortly after (route chunk should already be warm)
    completeRef.current = window.setTimeout(() => {
      if (trickleRef.current) window.clearInterval(trickleRef.current);
      setProgress(100);
      hideRef.current = window.setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 280);
    }, 320);

    return () => {
      if (trickleRef.current) window.clearInterval(trickleRef.current);
      if (completeRef.current) window.clearTimeout(completeRef.current);
      if (hideRef.current) window.clearTimeout(hideRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, navType]);

  return (
    <div
      aria-hidden
      className="fixed top-0 left-0 right-0 z-[100] h-[2px] pointer-events-none"
      style={{ opacity: visible ? 1 : 0, transition: 'opacity 220ms ease-out' }}
    >
      <div
        className="h-full bg-gradient-to-r from-primary/40 via-primary to-primary/40"
        style={{
          width: `${progress}%`,
          transition: 'width 220ms cubic-bezier(0.22, 1, 0.36, 1)',
          boxShadow:
            '0 0 8px hsl(var(--primary) / 0.6), 0 0 16px hsl(var(--primary) / 0.35)',
        }}
      />
    </div>
  );
};

export default RouteProgressBar;
