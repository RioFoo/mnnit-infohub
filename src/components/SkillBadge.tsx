import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SkillBadgeProps {
  skill: string;
  onRemove?: () => void;
  className?: string;
}

const SkillBadge = ({ skill, onRemove, className }: SkillBadgeProps) => (
  <span className={cn(
    'inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-primary/[0.08] text-primary border border-primary/15 transition-all hover:bg-primary/[0.12]',
    className
  )}>
    {skill}
    {onRemove && (
      <button onClick={onRemove} className="hover:text-destructive transition-colors ml-0.5">
        <X className="w-3 h-3" />
      </button>
    )}
  </span>
);

export default SkillBadge;
