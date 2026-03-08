import { useState, useRef, useCallback } from 'react';
import { MessageCircle, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import MediaRenderer from './MediaRenderer';
import EmojiReactionPicker from './EmojiReactionPicker';
import CommentSection from './CommentSection';

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
}

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const } }
};

const PostCard = ({ post, reactions, onReact, onRequireAuth, isAuthenticated }: PostCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [showComments, setShowComments] = useState(false);
  const [localCommentsCount, setLocalCommentsCount] = useState(post.comments_count);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    cardRef.current.style.transform = `perspective(1000px) rotateX(${y * -4}deg) rotateY(${x * 4}deg) translateY(-4px) scale(1.005)`;
  }, []);

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
      // toast handled by caller
    }
  };

  return (
    <motion.div variants={itemVariants}>
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="card-bio p-5 transition-transform duration-300 ease-out"
        style={{ transformStyle: 'preserve-3d' }}
      >
        <div className="flex items-start gap-3.5">
          <div className="avatar-orbital shrink-0">
            {post.profiles?.avatar_url ? (
              <img src={post.profiles.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                {(post.profiles?.name || 'U')[0].toUpperCase()}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm">{post.profiles?.name || 'Anonymous'}</span>
              <span className="text-[11px] font-mono text-muted-foreground">@{post.profiles?.handle}</span>
              {post.profiles?.branch && (
                <span className="text-[10px] font-mono text-muted-foreground/40">· {post.profiles.branch}</span>
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
              <div className="flex flex-wrap gap-1.5 mt-3">
                {post.tags.map(tag => (
                  <span key={tag} className="tag-pill text-[10px]">#{tag}</span>
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
                  onClick={() => onRequireAuth(() => setShowComments(!showComments), 'Sign in to comment!')}
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
                onCountChange={(d) => setLocalCommentsCount(prev => prev + d)}
              />
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PostCard;
