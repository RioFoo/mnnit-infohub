import { motion } from 'framer-motion';

interface PageHeaderProps {
  title: string;
  children?: React.ReactNode;
  className?: string;
}

const letterVariants = {
  hidden: { opacity: 0, y: 20, rotateX: -90, filter: 'blur(8px)' },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    rotateX: 0,
    filter: 'blur(0px)',
    transition: {
      delay: i * 0.05,
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

const underlineVariants = {
  hidden: { scaleX: 0, opacity: 0 },
  visible: {
    scaleX: 1,
    opacity: 1,
    transition: { delay: 0.4, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

const glowVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: [0, 0.6, 0.3],
    transition: { delay: 0.3, duration: 1.2, ease: 'easeOut' },
  },
};

export const PageHeader = ({ title, children, className = '' }: PageHeaderProps) => {
  const letters = title.split('');

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={`flex items-center justify-between mb-8 ${className}`}
    >
      <div className="relative">
        {/* Glow behind text */}
        <motion.div
          variants={glowVariants}
          initial="hidden"
          animate="visible"
          className="absolute inset-0 -inset-x-4 -inset-y-2 rounded-2xl pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center, hsl(var(--primary) / 0.12), transparent 70%)',
            filter: 'blur(20px)',
          }}
        />
        
        <h1
          className="text-2xl md:text-3xl page-header-bio relative"
          style={{ perspective: 600 }}
        >
          {letters.map((letter, i) => (
            <motion.span
              key={`${letter}-${i}`}
              custom={i}
              variants={letterVariants}
              initial="hidden"
              animate="visible"
              className="inline-block gradient-text"
              style={{
                transformOrigin: 'bottom center',
                marginRight: letter === ' ' ? '0.3em' : '0.02em',
              }}
            >
              {letter === ' ' ? '\u00A0' : letter}
            </motion.span>
          ))}
        </h1>

        {/* Animated underline */}
        <motion.div
          variants={underlineVariants}
          initial="hidden"
          animate="visible"
          className="h-[2px] mt-1.5 rounded-full origin-left"
          style={{
            background: 'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--secondary)), transparent)',
            boxShadow: '0 0 12px hsl(var(--primary) / 0.4)',
          }}
        />
      </div>

      {children}
    </motion.div>
  );
};
