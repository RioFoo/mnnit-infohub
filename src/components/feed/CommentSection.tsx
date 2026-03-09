import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles: { name: string; handle: string; avatar_url: string | null } | null;
}

interface CommentSectionProps {
  postId: string;
  commentsCount: number;
  onCountChange: (delta: number) => void;
}

const MAX_COMMENT_LENGTH = 500;

const CommentSection = ({ postId, commentsCount, onCountChange }: CommentSectionProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    const fetchComments = async () => {
      const { data, error } = await (supabase.from as any)('comments')
        .select('*, profiles(name, handle, avatar_url)')
        .eq('post_id', postId)
        .order('created_at', { ascending: true })
        .limit(50);
      if (!error && data) setComments(data as Comment[]);
      setLoading(false);
    };
    fetchComments();
  }, [postId]);

  const handlePost = async () => {
    const trimmed = text.trim();
    if (!trimmed || !user || posting) return;
    if (trimmed.length > MAX_COMMENT_LENGTH) {
      toast.error(`Comment too long (max ${MAX_COMMENT_LENGTH} characters)`);
      return;
    }
    setPosting(true);
    const { error } = await (supabase.from as any)('comments').insert({
      post_id: postId,
      user_id: user.id,
      content: trimmed,
    });
    if (error) {
      toast.error('Failed to post comment');
    } else {
      const { data } = await (supabase.from as any)('comments')
        .select('*, profiles(name, handle, avatar_url)')
        .eq('post_id', postId)
        .order('created_at', { ascending: true })
        .limit(50);
      if (data) setComments(data as Comment[]);
      setText('');
      onCountChange(1);
      await (supabase.from as any)('posts').update({ comments_count: commentsCount + 1 }).eq('id', postId);
    }
    setPosting(false);
  };

  return (
    <div className="mt-3 space-y-3">
      <div className="divider-glow" />

      {loading ? (
        <div className="flex justify-center py-3">
          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <AnimatePresence>
          <div className="space-y-2.5 max-h-60 overflow-y-auto scrollbar-hide">
            {comments.map(c => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-2.5"
              >
                <button
                  onClick={() => navigate(`/profile/${c.user_id}`)}
                  className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-bold shrink-0 overflow-hidden"
                >
                  {c.profiles?.avatar_url ? (
                    <img src={c.profiles.avatar_url} className="w-7 h-7 rounded-full object-cover" alt="" loading="lazy" />
                  ) : (
                    (c.profiles?.name || 'U')[0].toUpperCase()
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigate(`/profile/${c.user_id}`)}
                      className="text-xs font-semibold hover:text-primary transition-colors"
                    >
                      {c.profiles?.name || 'User'}
                    </button>
                    <span className="text-[9px] font-mono text-muted-foreground">
                      {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-xs text-foreground/80 leading-relaxed break-words">{c.content}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}

      {user && (
        <div className="flex gap-2">
          <Input
            value={text}
            onChange={e => setText(e.target.value.slice(0, MAX_COMMENT_LENGTH))}
            placeholder="Write a comment..."
            className="h-9 text-xs bg-muted/10 border-border/[0.08] rounded-xl"
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handlePost()}
            maxLength={MAX_COMMENT_LENGTH}
          />
          <Button
            size="icon"
            onClick={handlePost}
            disabled={posting || !text.trim()}
            className="h-9 w-9 rounded-xl btn-bio shrink-0"
          >
            {posting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
          </Button>
        </div>
      )}
    </div>
  );
};

export default CommentSection;
