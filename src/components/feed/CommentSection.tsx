import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { formatDistanceToNow } from 'date-fns';
import { Trash2, Send, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface CommentRow {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

interface Comment extends CommentRow {
  profiles: { name: string | null; handle: string | null; avatar_url: string | null } | null;
}

interface CommentSectionProps {
  postId: string;
  commentsCount?: number;
  onCountChange: (count: number) => void;
}

const CommentSection = ({ postId, onCountChange }: CommentSectionProps) => {
  const { user, profile } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchComments = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('id, post_id, user_id, content, created_at')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      if (data) {
        const userIds = [...new Set(data.map((c) => c.user_id))];
        let profileMap = new Map<string, { id: string; name: string | null; handle: string | null; avatar_url: string | null }>();
        if (userIds.length > 0) {
          const { data: profilesData } = await supabase
            .from('profiles')
            .select('id, name, handle, avatar_url')
            .in('id', userIds);
          profileMap = new Map((profilesData ?? []).map((p) => [p.id, p]));
        }
        const enriched: Comment[] = data.map((c) => {
          const p = profileMap.get(c.user_id);
          return {
            ...c,
            profiles: p ? { name: p.name, handle: p.handle, avatar_url: p.avatar_url } : null,
          };
        });
        setComments(enriched);
        onCountChange(enriched.length);
      }
    } catch (err) {
      console.error('Failed to fetch comments:', err);
    } finally {
      setLoading(false);
    }
  }, [postId, onCountChange]);

  useEffect(() => {
    fetchComments();
    const channel = supabase
      .channel(`comments:${postId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'comments', filter: `post_id=eq.${postId}` },
        async (payload) => {
          const newRow = payload.new as CommentRow;
          try {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('id, name, handle, avatar_url')
              .eq('id', newRow.user_id)
              .maybeSingle();
            setComments((cur) => {
              if (cur.some((c) => c.id === newRow.id)) return cur;
              const updated = [
                ...cur,
                {
                  ...newRow,
                  profiles: profileData
                    ? { name: profileData.name, handle: profileData.handle, avatar_url: profileData.avatar_url }
                    : null,
                },
              ];
              onCountChange(updated.length);
              return updated;
            });
          } catch (err) {
            console.error('Error processing new comment:', err);
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'comments', filter: `post_id=eq.${postId}` },
        (payload) => {
          const oldRow = payload.old as CommentRow;
          setComments((prev) => {
            const updated = prev.filter((c) => c.id !== oldRow.id);
            onCountChange(updated.length);
            return updated;
          });
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [postId, fetchComments, onCountChange]);

  const handleSubmit = async () => {
    if (!user) {
      toast.error('Please sign in to comment');
      return;
    }
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('comments')
        .insert({ post_id: postId, user_id: user.id, content: newComment.trim() });
      if (error) throw error;
      setNewComment('');
    } catch {
      toast.error('Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      const { error } = await supabase.from('comments').delete().eq('id', commentId);
      if (error) throw error;
    } catch {
      toast.error('Failed to delete comment');
    }
  };

  return (
    <div className="mt-3 space-y-3 border-t border-border/30 pt-3">
      {user && (
        <div className="flex gap-2">
          <Avatar className="w-7 h-7 shrink-0 mt-0.5">
            <AvatarImage src={profile?.avatar_url ?? undefined} />
            <AvatarFallback className="text-[10px] bg-muted/30 font-bold">
              {(profile?.name || 'U')[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 flex gap-2 items-end">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="min-h-[36px] max-h-[120px] resize-none text-sm py-2 px-3 rounded-xl"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
            />
            <Button
              size="icon"
              onClick={handleSubmit}
              disabled={!newComment.trim() || submitting}
              className="h-9 w-9 rounded-xl shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-2 text-xs text-muted-foreground py-2">
          <MessageCircle className="w-3.5 h-3.5 animate-pulse" />
          Loading comments...
        </div>
      ) : comments.length === 0 ? (
        <p className="text-xs text-muted-foreground/60 py-1">No comments yet. Be the first!</p>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-2 group">
              <Avatar className="w-6 h-6 shrink-0 mt-0.5">
                <AvatarImage src={comment.profiles?.avatar_url ?? undefined} />
                <AvatarFallback className="text-[9px] bg-muted/30 font-bold">
                  {(comment.profiles?.name || 'U')[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-semibold">{comment.profiles?.name || 'Unknown'}</span>
                  <span className="text-[10px] text-muted-foreground/50">
                    @{comment.profiles?.handle || 'user'} ·{' '}
                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-xs text-foreground/85 whitespace-pre-wrap break-words mt-0.5">
                  {comment.content}
                </p>
              </div>
              {user?.id === comment.user_id && (
                <button
                  onClick={() => handleDelete(comment.id)}
                  className={cn(
                    'p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 text-muted-foreground hover:text-destructive shrink-0 self-start mt-0.5'
                  )}
                  aria-label="Delete comment"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentSection;
