import { UserPlus, UserCheck, Star, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface FollowButtonProps {
  isFollowing: boolean;
  isFavourite: boolean;
  onFollow: () => void;
  onFavourite: () => void;
  onRequireAuth: (fn: () => void, msg: string) => void;
  isAuthenticated: boolean;
  isOwnPost?: boolean;
  compact?: boolean;
  loading?: boolean;
}

const FollowButton = ({
  isFollowing, isFavourite, onFollow, onFavourite,
  onRequireAuth, isAuthenticated: _isAuthenticated, isOwnPost, compact = true, loading
}: FollowButtonProps) => {
  if (isOwnPost) return null;

  return (
    <div className="flex items-center gap-1">
      {/* Follow/Following */}
      <motion.button
        whileTap={{ scale: 0.85 }}
        onClick={() => onRequireAuth(onFollow, 'Sign in to follow')}
        disabled={loading}
        className={cn(
          'flex items-center gap-1 rounded-lg transition-all text-[10px] font-mono',
          compact ? 'px-2 py-1' : 'px-3 py-1.5',
          isFollowing
            ? 'bg-primary/[0.06] text-primary border border-primary/20'
            : 'bg-muted/10 text-muted-foreground hover:text-primary hover:bg-primary/[0.04] border border-border/[0.08]'
        )}
      >
        {loading ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : isFollowing ? (
          <><UserCheck className="w-3 h-3" />{!compact && 'Following'}</>
        ) : (
          <><UserPlus className="w-3 h-3" />{!compact && 'Follow'}</>
        )}
      </motion.button>

      {/* Favourite star */}
      <AnimatePresence>
        {isFollowing && (
          <motion.button
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            whileTap={{ scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            onClick={() => onRequireAuth(onFavourite, 'Sign in to favourite')}
            className={cn(
              'w-6 h-6 rounded-lg flex items-center justify-center transition-all',
              isFavourite
                ? 'text-yellow-500 bg-yellow-500/10 shadow-[0_0_8px_hsl(45,100%,50%,0.25)]'
                : 'text-muted-foreground/30 hover:text-yellow-500'
            )}
          >
            <Star className={cn('w-3 h-3', isFavourite && 'fill-current')} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FollowButton;
