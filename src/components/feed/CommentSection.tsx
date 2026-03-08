import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

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

const CommentSection = ({ postId, commentsCount, onCountChange }: CommentSectionProps) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await (supabase.from as any)('comments')
        .select('*, profiles(name, handle, avatar_url)')
        .eq('post_id', postId)
        .order('created_at', { ascending: true })
        .limit(50);
      if (data) setComments(data as Comment[]);
      setLoading(false);
    };
    fetch();
  }, [postId]);

  const handlePost = async () => {
    if (!text.trim() || !user) return;
    setPosting(true);
    const { error } = await (supabase.from as any)('comments').insert({
      post_id: postId,
      user_id: user.id,
      content: text.trim(),
    });
    if (error) { toast.error(error.message); }
    else {
      // Refetch comments
      const { data } = await (supabase.from as any)('comments')
        .select('*, profiles(name, handle, avatar_url)')
        .eq('post_id', postId)
        .order('created_at', { ascending: true })
        .limit(50);
      if (data) setComments(data as Comment[]);
      setText('');
      onCountChange(1);
      // Update post comments_count
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
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-bold shrink-0">
                  {c.profiles?.avatar_url ? (
                    <img src={c.profiles.avatar_url} className="w-7 h-7 rounded-full object-cover" alt="" />
                  ) : (
                    (c.profiles?.name || 'U')[0].toUpperCase()
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold">{c.profiles?.name || 'User'}</span>
                    <span className="text-[9px] font-mono text-muted-foreground">
                      {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-xs text-foreground/80 leading-relaxed">{c.content}</p>
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
            onChange={e => setText(e.target.value)}
            placeholder="Write a comment..."
            className="h-9 text-xs bg-muted/10 border-border/[0.08] rounded-xl"
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handlePost()}
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
