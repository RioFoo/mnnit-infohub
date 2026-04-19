import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import type { Easing } from 'framer-motion';

interface PageHeaderProps {
  title: string;
  children?: React.ReactNode;
  className?: string;
}

const ease: Easing = [0.22, 1, 0.36, 1];

export const PageHeader = forwardRef<HTMLDivElement, PageHeaderProps>(({ title, children, className = '' }, ref) => {
  const letters = title.split('');
  const totalLetters = letters.length;
  const typeDuration = 0.06; // per letter
  const cursorDelay = totalLetters * typeDuration + 0.3;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease }}
      className={`flex items-center justify-between mb-8 ${className}`}
    >
      <div className="relative">
        {/* Glow behind text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.6, 0.3] }}
          transition={{ delay: 0.4, duration: 1.2 }}
          className="absolute inset-0 -inset-x-6 -inset-y-3 rounded-2xl pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center, hsl(var(--primary) / 0.15), transparent 70%)',
            filter: 'blur(24px)',
          }}
        />

        <h1
          className="text-2xl md:text-3xl page-header-bio relative flex items-center"
          style={{ perspective: 600 }}
        >
          {/* Terminal prompt prefix */}
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, ease }}
            className="inline-block mr-2 text-primary/40 font-mono text-lg md:text-xl"
          >
            {'> '}
          </motion.span>

          {/* Typewriter letters */}
          {letters.map((letter, i) => (
            <motion.span
              key={`${letter}-${i}`}
              initial={{ opacity: 0, scale: 0.3, filter: 'blur(6px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              transition={{
                delay: 0.15 + i * typeDuration,
                duration: 0.15,
                ease: [0.0, 0.0, 0.2, 1],
              }}
              className="inline-block gradient-text"
              style={{
                marginRight: letter === ' ' ? '0.3em' : '0.02em',
              }}
            >
              {letter === ' ' ? '\u00A0' : letter}
            </motion.span>
          ))}

          {/* Blinking cursor */}
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 1, 0] }}
            transition={{
              delay: 0.15,
              duration: 0.8,
              repeat: Infinity,
              repeatDelay: 0,
              times: [0, 0.1, 0.5, 0.51],
            }}
            className="inline-block w-[3px] h-[1.1em] ml-1 rounded-sm relative top-[2px]"
            style={{
              background: 'hsl(var(--primary))',
              boxShadow: '0 0 8px hsl(var(--primary) / 0.6), 0 0 20px hsl(var(--primary) / 0.3)',
            }}
          />
        </h1>

        {/* Animated underline — sweeps in after typing */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ delay: cursorDelay, duration: 0.5, ease }}
          className="h-[2px] mt-2 rounded-full origin-left"
          style={{
            background: 'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--secondary)), transparent)',
            boxShadow: '0 0 12px hsl(var(--primary) / 0.4)',
          }}
        />

        {/* Scan line effect */}
        <motion.div
          initial={{ left: '0%', opacity: 0 }}
          animate={{ left: '100%', opacity: [0, 1, 1, 0] }}
          transition={{ delay: 0.1, duration: totalLetters * typeDuration + 0.2, ease: 'linear' }}
          className="absolute top-0 bottom-0 w-[2px] pointer-events-none"
          style={{
            background: 'hsl(var(--primary) / 0.3)',
            boxShadow: '0 0 16px 4px hsl(var(--primary) / 0.15)',
          }}
        />
      </div>

      {children}
    </motion.div>
  );
});

PageHeader.displayName = 'PageHeader';
