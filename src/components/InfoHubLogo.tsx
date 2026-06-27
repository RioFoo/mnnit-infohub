import { motion } from 'framer-motion';
const LOGO_VERSION = 'v5-20260627-opt';
const LOGO_SIZES = [64, 96, 128, 192, 256, 384] as const;
const pickLogoSrc = (renderPx: number) => {
  // Account for high-DPR screens
  const target = renderPx * (typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 3) : 2);
  const chosen = LOGO_SIZES.find((s) => s >= target) ?? LOGO_SIZES[LOGO_SIZES.length - 1];
  return `/infohub-logo-${chosen}.webp?${LOGO_VERSION}`;
};

interface InfoHubLogoProps {
  size?: number;
  className?: string;
  animate?: boolean;
}

const InfoHubLogo = ({ size = 40, className = '', animate = true }: InfoHubLogoProps) => {
  const infohubSymbol = pickLogoSrc(size);
  return (
    <motion.div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size, perspective: 800 }}
      whileHover={animate ? { 
        scale: 1.15, 
        rotateY: 15, 
        rotateX: -10,
      } : undefined}
      whileTap={animate ? { scale: 0.95 } : undefined}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {/* Outer glow pulse */}
      <motion.div
        className="absolute inset-[-30%] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, hsl(var(--primary) / 0.25), transparent 70%)',
        }}
        animate={animate ? {
          scale: [1, 1.3, 1],
          opacity: [0.4, 0.1, 0.4],
        } : undefined}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Logo image with 3D depth shadow */}
      <motion.img
        src={infohubSymbol}
        alt="MNNIT InfoHub logo"
        width={size}
        height={size}
        loading="eager"
        decoding="async"
        className="w-full h-full object-contain relative z-10"
        style={{
          filter: 'drop-shadow(0 0 12px hsl(var(--primary) / 0.5)) drop-shadow(0 4px 8px hsl(var(--primary) / 0.2))',
          transformStyle: 'preserve-3d',
        }}
        animate={animate ? {
          filter: [
            'drop-shadow(0 0 12px hsl(var(--primary) / 0.5)) drop-shadow(0 4px 8px hsl(var(--primary) / 0.2))',
            'drop-shadow(0 0 20px hsl(var(--primary) / 0.7)) drop-shadow(0 6px 12px hsl(var(--primary) / 0.3))',
            'drop-shadow(0 0 12px hsl(var(--primary) / 0.5)) drop-shadow(0 4px 8px hsl(var(--primary) / 0.2))',
          ]
        } : undefined}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Highlight sweep */}
      <motion.div
        className="absolute inset-0 rounded-full pointer-events-none z-20 overflow-hidden"
        style={{ maskImage: 'radial-gradient(circle, black 40%, transparent 70%)' }}
      >
        <motion.div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(105deg, transparent 40%, hsl(var(--primary) / 0.15) 45%, hsl(var(--primary) / 0.3) 50%, hsl(var(--primary) / 0.15) 55%, transparent 60%)',
          }}
          animate={animate ? { x: ['-100%', '200%'] } : undefined}
          transition={{ duration: 3, repeat: Infinity, repeatDelay: 2, ease: 'easeInOut' }}
        />
      </motion.div>
    </motion.div>
  );
};

export default InfoHubLogo;
