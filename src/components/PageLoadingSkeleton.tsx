import { motion } from 'framer-motion';
import InfoHubLogo from '@/components/InfoHubLogo';

const shimmerTransition = {
  duration: 1.4,
  repeat: Infinity,
  ease: 'easeInOut' as const,
};

const PageLoadingSkeleton = () => (
  <div className="min-h-screen flex items-center justify-center px-5">
    <motion.div
      initial={{ opacity: 0, y: 18, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
      className="w-full max-w-md"
    >
      <div className="relative overflow-hidden rounded-[1.75rem] border border-border/15 bg-card/50 backdrop-blur-xl px-6 py-8 shadow-[0_0_40px_hsl(var(--primary)/0.12)]">
        <motion.div
          aria-hidden="true"
          className="absolute inset-0"
          animate={{ opacity: [0.2, 0.35, 0.2] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            background: 'radial-gradient(circle at top, hsl(var(--primary) / 0.14), transparent 55%)',
          }}
        />

        <div className="relative z-10 flex flex-col items-center text-center">
          <InfoHubLogo size={72} />
          <motion.h2
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.25 }}
            className="mt-4 text-2xl font-display font-black tracking-tight text-foreground"
          >
            MNNIT InfoHub
          </motion.h2>
          <p className="mt-2 text-sm font-mono text-muted-foreground">
            Loading your campus space...
          </p>

          <div className="mt-6 w-full space-y-3">
            {[0, 1, 2].map((item) => (
              <div
                key={item}
                className="h-12 overflow-hidden rounded-2xl border border-border/10 bg-muted/20"
              >
                <motion.div
                  className="h-full w-1/2 rounded-2xl bg-primary/15"
                  animate={{ x: ['-10%', '120%'] }}
                  transition={{ ...shimmerTransition, delay: item * 0.12 }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  </div>
);

export default PageLoadingSkeleton;
