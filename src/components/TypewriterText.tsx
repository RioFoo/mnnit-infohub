import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface TypewriterTextProps {
  text: string;
  className?: string;
  speed?: number;
  delay?: number;
  cursor?: boolean;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
}

const TypewriterText = ({
  text,
  className,
  speed = 60,
  delay = 300,
  cursor = true,
  as: Tag = 'h2',
}: TypewriterTextProps) => {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed('');
    setDone(false);
    const timeout = setTimeout(() => {
      let i = 0;
      const interval = setInterval(() => {
        i++;
        setDisplayed(text.slice(0, i));
        if (i >= text.length) {
          clearInterval(interval);
          setDone(true);
        }
      }, speed);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timeout);
  }, [text, speed, delay]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="inline-flex items-baseline"
    >
      <Tag className={cn(className)}>
        {displayed}
        {cursor && (
          <motion.span
            animate={{ opacity: done ? [1, 0] : 1 }}
            transition={done ? { repeat: Infinity, duration: 0.8, ease: 'steps(2)' } : {}}
            className="inline-block w-[3px] h-[0.8em] bg-primary ml-0.5 align-baseline translate-y-[0.05em] rounded-full shadow-[0_0_8px_hsl(var(--primary)/0.6)]"
          />
        )}
      </Tag>
    </motion.div>
  );
};

export default TypewriterText;
