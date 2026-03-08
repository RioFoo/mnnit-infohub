import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Heart, MessageCircle, Share2, Plus, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { AuthPromptDialog } from '@/components/AuthPromptDialog';

interface Post {
  id: string;
  content: string;
  image_url: string | null;
  tags: string[];
  likes_count: number;
  comments_count: number;
  created_at: string;
  user_id: string;
  profiles: { name: string; handle: string; avatar_url: string | null; branch: string } | null;
}

const Feed = () => {
  const { user } = useAuth();
  const { showAuthPrompt, setShowAuthPrompt, authMessage, requireAuth } = useAuthGuard();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [newTags, setNewTags] = useState('');
  const [posting, setPosting] = useState(false);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());

  const fetchPosts = async () => {
    const { data } = await (supabase.from as any)('posts')
      .select('*, profiles(name, handle, avatar_url, branch)')
      .order('created_at', { ascending: false })
      .limit(50);
    if (data) setPosts(data as unknown as Post[]);
    setLoading(false);
  };

  const fetchLikes = async () => {
    if (!user) return;
    const { data } = await (supabase.from as any)('likes').select('post_id').eq('user_id', user.id);
    if (data) setLikedPosts(new Set(data.map((l: any) => l.post_id)));
  };

  useEffect(() => {
    fetchPosts();
    if (user) fetchLikes();
    const channel = supabase.channel('posts-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => fetchPosts())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const handleCreatePost = async () => {
    if (!newContent.trim() || !user) return;
    setPosting(true);
    const tags = newTags.split(',').map(t => t.trim()).filter(Boolean);
    const { error } = await (supabase.from as any)('posts').insert({ user_id: user.id, content: newContent, tags });
    if (error) toast.error(error.message);
    else { toast.success('Posted!'); setNewContent(''); setNewTags(''); setCreateOpen(false); fetchPosts(); }
    setPosting(false);
  };

  const handleLike = async (postId: string) => {
    if (!user) return;
    if (likedPosts.has(postId)) {
      await (supabase.from as any)('likes').delete().eq('post_id', postId).eq('user_id', user.id);
      setLikedPosts(prev => { const n = new Set(prev); n.delete(postId); return n; });
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes_count: Math.max(0, p.likes_count - 1) } : p));
    } else {
      await (supabase.from as any)('likes').insert({ post_id: postId, user_id: user.id });
      setLikedPosts(prev => new Set(prev).add(postId));
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes_count: p.likes_count + 1 } : p));
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
        className="flex items-center justify-between mb-8"
      >
        <h1 className="text-2xl md:text-3xl page-header gradient-text">Feed</h1>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            onClick={() => requireAuth(() => setCreateOpen(true), 'Sign in to post')}
            className="gap-2 rounded-xl btn-premium text-sm"
          >
            <Plus className="w-4 h-4" /> New Post
          </Button>
        </motion.div>
      </motion.div>

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="float-card border-border/20 sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Create Post
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <Textarea placeholder="What's on your mind?" value={newContent} onChange={e => setNewContent(e.target.value)} rows={4} className="bg-muted/20 border-border/20 rounded-xl resize-none focus:border-primary/30 focus:ring-1 focus:ring-primary/10 transition-all" />
            <Input placeholder="Tags (comma separated)" value={newTags} onChange={e => setNewTags(e.target.value)} className="bg-muted/20 border-border/20 rounded-xl" />
            <Button onClick={handleCreatePost} disabled={posting || !newContent.trim()} className="w-full rounded-xl btn-premium">
              {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Publish'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Posts */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-8 h-8 text-primary/40 animate-spin" />
          <p className="text-sm text-muted-foreground">Loading posts...</p>
        </div>
      ) : posts.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-muted/30 flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-7 h-7 text-muted-foreground/40" />
          </div>
          <p className="text-sm text-muted-foreground">No posts yet. Be the first to share!</p>
        </motion.div>
      ) : (
        <div className="space-y-4 max-w-2xl mx-auto">
          {posts.map((post, i) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
              className="float-card group"
            >
              <div className="p-5">
                <div className="flex items-start gap-3.5">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-xl bg-primary/8 flex items-center justify-center text-primary font-semibold text-sm overflow-hidden shrink-0 border border-border/20">
                    {post.profiles?.avatar_url ? (
                      <img src={post.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span>{(post.profiles?.name || 'U')[0].toUpperCase()}</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm">{post.profiles?.name || 'Anonymous'}</span>
                      <span className="text-xs text-muted-foreground">@{post.profiles?.handle}</span>
                      <span className="text-xs text-muted-foreground/50">·</span>
                      <span className="text-xs text-muted-foreground/50">
                        {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="mt-2.5 text-sm leading-relaxed whitespace-pre-wrap text-foreground/90">{post.content}</p>

                    {post.image_url && (
                      <div className="mt-3 rounded-xl overflow-hidden border border-border/10">
                        <img src={post.image_url} alt="" className="max-h-72 object-cover w-full" />
                      </div>
                    )}

                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {post.tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="text-[10px] rounded-md bg-primary/6 text-primary/80 border-primary/10 font-medium">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-6 mt-4 pt-3 border-t border-border/10">
                      <button
                        onClick={() => requireAuth(() => handleLike(post.id), 'Sign in to like!')}
                        className={`flex items-center gap-2 text-xs transition-all group/btn ${likedPosts.has(post.id) ? 'text-destructive' : 'text-muted-foreground hover:text-destructive'}`}
                      >
                        <Heart className={`w-4 h-4 transition-all ${likedPosts.has(post.id) ? 'fill-current scale-110' : 'group-hover/btn:scale-110'}`} />
                        <span className="text-[11px] font-medium tabular-nums">{post.likes_count}</span>
                      </button>
                      <button
                        onClick={() => requireAuth(() => {}, 'Sign in to comment!')}
                        className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-all"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span className="text-[11px] font-medium tabular-nums">{post.comments_count}</span>
                      </button>
                      <button className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-all">
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AuthPromptDialog open={showAuthPrompt} onOpenChange={setShowAuthPrompt} message={authMessage} />
    </div>
  );
};

export default Feed;
