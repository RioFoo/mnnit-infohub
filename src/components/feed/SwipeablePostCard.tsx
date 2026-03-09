import { useRef, useCallback } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { Heart, Share2 } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import PostCard, { type Post } from './PostCard';

interface ReactionCount {
  emoji: string;
  count: number;
  reacted: boolean;
}

interface SwipeablePostCardProps {
  post: Post;
  reactions: ReactionCount[];
  onReact: (postId: string, emoji: string) => void;
  onRequireAuth: (fn: () => void, msg: string) => void;
  isAuthenticated: boolean;
  currentUserId?: string;
  isFollowingAuthor?: boolean;
  isFavouriteAuthor?: boolean;
  isFavouritePost?: boolean;
  onToggleFollow?: (userId: string) => void;
  onToggleFavourite?: (userId: string) => void;
  onShare?: (post: Post) => void;
}

const SWIPE_THRESHOLD = 80;

const SwipeablePostCard = ({
  post, onReact, onRequireAuth, isAuthenticated, onShare, ...rest
}: SwipeablePostCardProps) => {
  const isMobile = useIsMobile();
  const x = useMotionValue(0);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const swiping = useRef(false);
  const locked = useRef(false); // lock to horizontal once determined

  // Background action indicators
  const leftOpacity = useTransform(x, [0, 40, SWIPE_THRESHOLD], [0, 0.3, 1]);
  const leftScale = useTransform(x, [0, SWIPE_THRESHOLD], [0.5, 1.2]);
  const rightOpacity = useTransform(x, [-SWIPE_THRESHOLD, -40, 0], [1, 0.3, 0]);
  const rightScale = useTransform(x, [-SWIPE_THRESHOLD, 0], [1.2, 0.5]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    swiping.current = false;
    locked.current = false;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const dx = e.touches[0].clientX - touchStartX.current;
    const dy = e.touches[0].clientY - touchStartY.current;

    if (!locked.current) {
      // Determine direction: if vertical > horizontal, don't swipe
      if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 10) {
        locked.current = true;
        swiping.current = false;
        return;
      }
      if (Math.abs(dx) > 10) {
        locked.current = true;
        swiping.current = true;
      }
      return;
    }

    if (!swiping.current) return;

    // Rubber-band dampening
    const dampened = dx > 0
      ? Math.min(dx * 0.6, 140)
      : Math.max(dx * 0.6, -140);
    x.set(dampened);
  }, [x]);

  const handleTouchEnd = useCallback(() => {
    if (!swiping.current) {
      x.set(0);
      return;
    }

    const currentX = x.get();

    if (currentX > SWIPE_THRESHOLD) {
      // Swipe right → like (❤️ reaction)
      onRequireAuth(() => onReact(post.id, '❤️'), 'Sign in to react!');
      animate(x, 0, { type: 'spring', stiffness: 500, damping: 30 });
    } else if (currentX < -SWIPE_THRESHOLD) {
      // Swipe left → share
      if (onShare) onShare(post);
      else {
        const text = `${post.profiles?.name || 'Someone'}: ${post.content.slice(0, 100)}`;
        const url = window.location.origin;
        if (navigator.share) {
          navigator.share({ text, url }).catch(() => {});
        } else {
          navigator.clipboard.writeText(`${text}\n${url}`);
        }
      }
      animate(x, 0, { type: 'spring', stiffness: 500, damping: 30 });
    } else {
      animate(x, 0, { type: 'spring', stiffness: 400, damping: 25 });
    }

    swiping.current = false;
  }, [x, post, onReact, onRequireAuth, onShare]);

  if (!isMobile) {
    return (
      <PostCard
        post={post}
        onReact={onReact}
        onRequireAuth={onRequireAuth}
        isAuthenticated={isAuthenticated}
        {...rest}
      />
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl">
      {/* Left action (like) */}
      <motion.div
        style={{ opacity: leftOpacity, scale: leftScale }}
        className="absolute inset-y-0 left-0 w-20 flex items-center justify-center z-0"
      >
        <div className="w-12 h-12 rounded-full bg-destructive/20 flex items-center justify-center">
          <Heart className="w-6 h-6 text-destructive fill-destructive" />
        </div>
      </motion.div>

      {/* Right action (share) */}
      <motion.div
        style={{ opacity: rightOpacity, scale: rightScale }}
        className="absolute inset-y-0 right-0 w-20 flex items-center justify-center z-0"
      >
        <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center">
          <Share2 className="w-6 h-6 text-secondary" />
        </div>
      </motion.div>

      {/* Swipeable card */}
      <motion.div
        style={{ x }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="relative z-10"
      >
        <PostCard
          post={post}
          onReact={onReact}
          onRequireAuth={onRequireAuth}
          isAuthenticated={isAuthenticated}
          {...rest}
        />
      </motion.div>
    </div>
  );
};

export default SwipeablePostCard;
