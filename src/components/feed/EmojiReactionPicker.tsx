import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { SmilePlus } from 'lucide-react';

const EMOJI_LIST = [
  { emoji: '👍', label: 'thumbs up' },
  { emoji: '❤️', label: 'heart' },
  { emoji: '😂', label: 'laugh' },
  { emoji: '😮', label: 'wow' },
  { emoji: '😢', label: 'sad' },
  { emoji: '🔥', label: 'fire' },
  { emoji: '👏', label: 'clap' },
  { emoji: '🎉', label: 'party' },
  { emoji: '💯', label: '100' },
  { emoji: '🤔', label: 'thinking' },
  { emoji: '😍', label: 'love eyes' },
  { emoji: '🚀', label: 'rocket' },
];

interface ReactionCount {
  emoji: string;
  count: number;
  reacted: boolean;
}

interface EmojiReactionPickerProps {
  reactions: ReactionCount[];
  onReact: (emoji: string) => void;
  disabled?: boolean;
}

const pickerMotion = {
  hidden: { opacity: 0, scale: 0.9, y: 8, pointerEvents: 'none' as const },
  visible: { opacity: 1, scale: 1, y: 0, pointerEvents: 'auto' as const },
};

const EmojiReactionPicker = ({ reactions, onReact, disabled }: EmojiReactionPickerProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative inline-flex items-center gap-1.5 flex-wrap" ref={ref}>
      {reactions.filter((r) => r.count > 0).map((r) => (
        <motion.button
          key={r.emoji}
          whileTap={{ scale: 0.85 }}
          onClick={() => !disabled && onReact(r.emoji)}
          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-all border ${
            r.reacted
              ? 'bg-primary/10 border-primary/30 text-primary'
              : 'bg-muted/15 border-border/[0.08] text-muted-foreground hover:border-primary/20'
          }`}
        >
          <span className="text-sm">{r.emoji}</span>
          <span className="font-mono text-[10px] tabular-nums">{r.count}</span>
        </motion.button>
      ))}

      <motion.button
        whileTap={{ scale: 0.85 }}
        onClick={() => !disabled && setOpen(!open)}
        className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-muted/10 border border-border/[0.08] text-muted-foreground hover:text-foreground hover:border-primary/20 transition-all"
      >
        <SmilePlus className="w-3.5 h-3.5" />
      </motion.button>

      <motion.div
        initial={false}
        animate={open ? 'visible' : 'hidden'}
        variants={pickerMotion}
        transition={{ duration: 0.15 }}
        aria-hidden={!open}
        className="absolute bottom-full left-0 mb-2 p-2 rounded-xl bg-card border border-border/10 shadow-2xl z-50 grid grid-cols-6 gap-1 min-w-[180px] origin-bottom-left"
      >
        {EMOJI_LIST.map(({ emoji, label }) => (
          <motion.button
            key={emoji}
            whileHover={{ scale: 1.3 }}
            whileTap={{ scale: 0.8 }}
            onClick={() => {
              onReact(emoji);
              setOpen(false);
            }}
            title={label}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted/20 text-lg transition-colors"
          >
            {emoji}
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
};

export default EmojiReactionPicker;
