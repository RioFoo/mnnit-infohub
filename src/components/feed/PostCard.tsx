import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { MessageCircle, Share2, Star, Clock, Bookmark, Link2, Flame, Sparkles, BadgeCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { toast } from '@/hooks/use-toast';
import MediaRenderer from './MediaRenderer';
import EmojiReactionPicker from './EmojiReactionPicker';
import CommentSection from './CommentSection';
import FollowButton from './FollowButton';
import { cn } from '@/lib/utils';

interface PostProfile {
  name: string;
  handle: string;
  avatar_url: string | null;
  branch: string;
}

export interface Post {
  id: string;
  content: string;
  image_url: string | null;
  media_type: string | null;
  tags: string[];
  likes_count: number;
  comments_count: number;
  created_at: string;
  user_id: string;
  profiles: PostProfile | null;
}

interface ReactionCount {
  emoji: string;
  count: number;
  reacted: boolean;
}

interface PostCardProps {
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
}

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const } }
};

const PostCard = ({
  post, reactions, onReact, onRequireAuth, isAuthenticated,
  currentUserId, isFollowingAuthor = false, isFavouriteAuthor = false,
  isFavouritePost = false, onToggleFollow, onToggleFavourite
}: PostCardProps) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const cardRef = useRef<HTMLDivElement>(null);
  const [showComments, setShowComments] = useState(false);
  const [localCommentsCount, setLocalCommentsCount] = useState(post.comments_count);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!cardRef.current || isMobile) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    requestAnimationFrame(() => {
      if (cardRef.current) {
        cardRef.current.style.transform = `perspective(1000px) rotateX(${y * -2}deg) rotateY(${x * 2}deg) translateY(-1px)`;
      }
    });
  }, [isMobile]);

  const handleMouseLeave = useCallback(() => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px) scale(1)';
  }, []);

  const handleShare = async () => {
    const url = window.location.origin;
    const text = `${post.profiles?.name || 'Someone'}: ${post.content.slice(0, 100)}`;
    if (navigator.share) {
      try { await navigator.share({ text, url }); } catch {}
    } else {
      await navigator.clipboard.writeText(`${text}\n${url}`);
    }
  };

  const isOwnPost = currentUserId === post.user_id;

  useEffect(() => {
    setLocalCommentsCount(post.comments_count);
  }, [post.comments_count]);

  return (
    <motion.div variants={itemVariants}>
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={cn(
          'card-bio p-5 transition-transform duration-300 ease-out',
          isFavouritePost && 'ring-1 ring-yellow-500/20 shadow-[0_0_20px_hsl(45,100%,50%,0.08)]'
        )}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Favourite badge */}
        {isFavouritePost && (
          <div className="flex items-center gap-1.5 mb-3 text-[10px] font-mono text-yellow-500/80">
            <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
            <span>From your Favorites</span>
          </div>
        )}

        <div className="flex items-start gap-3.5">
          <button onClick={() => navigate(`/profile/${post.user_id}`)} className="avatar-orbital shrink-0 cursor-pointer">
            {post.profiles?.avatar_url ? (
              <img src={post.profiles.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                {(post.profiles?.name || 'U')[0].toUpperCase()}
              </div>
            )}
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <button onClick={() => navigate(`/profile/${post.user_id}`)} className="font-semibold text-sm hover:text-primary transition-colors">{post.profiles?.name || 'Anonymous'}</button>
              <span className="text-[11px] font-mono text-muted-foreground">@{post.profiles?.handle}</span>
              {post.profiles?.branch && (
                <span className="text-[10px] font-mono text-muted-foreground/40">· {post.profiles.branch}</span>
              )}

              {/* Inline follow button */}
              {!isOwnPost && onToggleFollow && (
                <FollowButton
                  isFollowing={isFollowingAuthor}
                  isFavourite={isFavouriteAuthor}
                  onFollow={() => onToggleFollow(post.user_id)}
                  onFavourite={() => onToggleFavourite?.(post.user_id)}
                  onRequireAuth={onRequireAuth}
                  isAuthenticated={isAuthenticated}
                  isOwnPost={isOwnPost}
                  compact
                />
              )}

              <span className="text-[10px] font-mono text-muted-foreground/30 ml-auto">
                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
              </span>
            </div>

            <div className="divider-glow my-2.5" />

            <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/85">{post.content}</p>

            {/* Media */}
            {post.image_url && <MediaRenderer url={post.image_url} mediaType={post.media_type} />}

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex gap-1.5 mt-3 overflow-x-auto scrollbar-hide pb-1">
                {post.tags.map(tag => (
                  <span key={tag} className="tag-pill text-[10px] whitespace-nowrap shrink-0">#{tag}</span>
                ))}
              </div>
            )}

            <div className="divider-glow my-3" />

            {/* Reactions + Actions */}
            <div className="flex items-center gap-4 flex-wrap">
              <EmojiReactionPicker
                reactions={reactions}
                onReact={(emoji) => onRequireAuth(() => onReact(post.id, emoji), 'Sign in to react!')}
                disabled={!isAuthenticated}
              />

              <div className="flex items-center gap-4 ml-auto">
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={() => setShowComments(!showComments)}
                  className="flex items-center gap-2 text-xs text-muted-foreground hover:text-secondary transition-all"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span className="text-[11px] font-mono tabular-nums">{localCommentsCount}</span>
                </motion.button>

                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-all"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Comments */}
            {showComments && (
              <CommentSection
                postId={post.id}
                commentsCount={localCommentsCount}
                onCountChange={setLocalCommentsCount}
              />
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PostCard;
