import { motion } from 'framer-motion';
import InfoHubLogo from '@/components/InfoHubLogo';

const PageLoadingSkeleton = () => (
  <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-background">
    {/* Animated aurora background */}
    <div aria-hidden="true" className="absolute inset-0">
      <motion.div
        className="absolute -top-32 -left-32 h-[28rem] w-[28rem] rounded-full"
        style={{ background: 'radial-gradient(circle, hsl(var(--primary) / 0.35), transparent 65%)', filter: 'blur(60px)' }}
        animate={{ x: [0, 80, -40, 0], y: [0, 60, -30, 0], scale: [1, 1.15, 0.95, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -bottom-32 -right-32 h-[28rem] w-[28rem] rounded-full"
        style={{ background: 'radial-gradient(circle, hsl(var(--accent) / 0.3), transparent 65%)', filter: 'blur(60px)' }}
        animate={{ x: [0, -60, 40, 0], y: [0, -40, 50, 0], scale: [1, 0.95, 1.15, 1] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 h-[20rem] w-[20rem] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: 'radial-gradient(circle, hsl(var(--secondary) / 0.2), transparent 70%)', filter: 'blur(70px)' }}
        animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0.9, 0.6] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>

    {/* Grid texture */}
    <div
      aria-hidden="true"
      className="absolute inset-0 opacity-[0.06]"
      style={{
        backgroundImage:
          'linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)',
        backgroundSize: '48px 48px',
      }}
    />

    <div className="relative z-10 flex flex-col items-center px-6">
      {/* Orbital rings around logo */}
      <div className="relative flex h-40 w-40 items-center justify-center">
        <motion.div
          className="absolute inset-0 rounded-full border border-primary/30"
          animate={{ rotate: 360, scale: [1, 1.05, 1] }}
          transition={{ rotate: { duration: 8, repeat: Infinity, ease: 'linear' }, scale: { duration: 3, repeat: Infinity, ease: 'easeInOut' } }}
          style={{ borderTopColor: 'hsl(var(--primary))', borderRightColor: 'transparent', borderBottomColor: 'transparent', borderLeftColor: 'transparent', borderWidth: 2 }}
        />
        <motion.div
          className="absolute inset-3 rounded-full border border-secondary/30"
          animate={{ rotate: -360 }}
          transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
          style={{ borderBottomColor: 'hsl(var(--secondary))', borderTopColor: 'transparent', borderRightColor: 'transparent', borderLeftColor: 'transparent', borderWidth: 2 }}
        />
        <motion.div
          className="absolute inset-6 rounded-full border border-accent/30"
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          style={{ borderLeftColor: 'hsl(var(--accent))', borderTopColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: 'transparent', borderWidth: 2 }}
        />

        {/* Pulsing core */}
        <motion.div
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="relative z-10"
        >
          <InfoHubLogo size={64} animate={false} />
        </motion.div>
      </div>

      {/* Title with shimmer */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4 }}
        className="mt-8 text-center"
      >
        <h2
          className="font-display text-2xl font-black tracking-tight bg-clip-text text-transparent bg-[length:200%_100%]"
          style={{
            backgroundImage:
              'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--secondary)), hsl(var(--accent)), hsl(var(--primary)))',
            animation: 'brand-gradient-shift 4s ease-in-out infinite',
          }}
        >
          MNNIT InfoHub
        </h2>
        <motion.p
          className="mt-2 text-xs font-mono uppercase tracking-[0.3em] text-muted-foreground/60"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        >
          Initializing
        </motion.p>
      </motion.div>

      {/* Loading dots */}
      <div className="mt-5 flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-primary"
            animate={{ scale: [1, 1.6, 1], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut', delay: i * 0.18 }}
          />
        ))}
      </div>

      {/* Progress bar */}
      <div className="mt-6 h-0.5 w-48 overflow-hidden rounded-full bg-muted/30">
        <motion.div
          className="h-full w-1/3 rounded-full bg-gradient-to-r from-transparent via-primary to-transparent"
          animate={{ x: ['-100%', '300%'] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>
    </div>
  </div>
);

export default PageLoadingSkeleton;
