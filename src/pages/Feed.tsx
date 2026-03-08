import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Heart, MessageCircle, Share2, Plus, Loader2, Zap, Radio } from 'lucide-react';
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
      {/* ═══ HEADER ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 20, rotateX: -5 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 200 }}
        className="flex items-center justify-between mb-8"
        style={{ perspective: '800px' }}
      >
        <h1 className="text-3xl md:text-4xl page-header-3d">FEED</h1>
        <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.92, y: 1 }}>
          <Button
            onClick={() => requireAuth(() => setCreateOpen(true), 'Sign in to post')}
            className="gap-2 rounded-xl btn-3d bg-primary text-primary-foreground hover:bg-primary/90 font-display tracking-wider text-xs uppercase"
          >
            <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Post</span>
          </Button>
        </motion.div>
      </motion.div>

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="card-3d-pro border-border/30 p-0 overflow-hidden">
          <div className="p-6">
            <DialogHeader>
              <DialogTitle className="font-display tracking-wider flex items-center gap-2 text-sm uppercase">
                <Zap className="w-4 h-4 text-primary" /> New Post
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <Textarea placeholder="What's on your mind?" value={newContent} onChange={e => setNewContent(e.target.value)} rows={4} className="bg-background/40 border-border/30 rounded-xl backdrop-blur-sm" />
              <Input placeholder="Tags (comma separated)" value={newTags} onChange={e => setNewTags(e.target.value)} className="bg-background/40 border-border/30 rounded-xl" />
              <Button onClick={handleCreatePost} disabled={posting || !newContent.trim()} className="w-full rounded-xl btn-3d font-display tracking-wider uppercase text-xs">
                {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Post'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ═══ POSTS ═══ */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-14 h-14 rounded-full border-2 border-primary/20 border-t-primary"
          />
        </div>
      ) : posts.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
          <div className="w-20 h-20 rounded-xl bg-primary/5 flex items-center justify-center mx-auto mb-6 neon-border">
            <Radio className="w-8 h-8 text-primary/60" />
          </div>
          <h3 className="font-display text-lg tracking-wider text-foreground/80">No Posts Yet</h3>
        </motion.div>
      ) : (
        <div className="space-y-4 max-w-2xl mx-auto">
          {posts.map((post, i) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 30, rotateY: -5 }}
              animate={{ opacity: 1, y: 0, rotateY: 0 }}
              transition={{ delay: i * 0.06, duration: 0.5, type: 'spring', stiffness: 250 }}
              className="card-3d-pro p-0 group"
              style={{ perspective: '1000px' }}
            >
              <div className="h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
              <div className="p-5">
                <div className="flex items-start gap-4">
                  <motion.div
                    whileHover={{ scale: 1.1, rotateZ: 5 }}
                    whileTap={{ scale: 0.9 }}
                    className="relative w-11 h-11 shrink-0"
                  >
                    <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-sm overflow-hidden border border-primary/20">
                      {post.profiles?.avatar_url ? (
                        <img src={post.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="font-display">{(post.profiles?.name || 'U')[0].toUpperCase()}</span>
                      )}
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-primary/80 border-2 border-background"
                      style={{ boxShadow: '0 0 6px hsl(var(--neon-cyan) / 0.6)' }} />
                  </motion.div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm">{post.profiles?.name || 'Anonymous'}</span>
                      <span className="text-[10px] text-primary/60 font-mono">@{post.profiles?.handle}</span>
                      <span className="text-[10px] text-muted-foreground/40 font-mono">
                        {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed whitespace-pre-wrap text-foreground/90">{post.content}</p>

                    {post.image_url && (
                      <motion.div whileHover={{ scale: 1.02 }} className="mt-4 rounded-xl overflow-hidden">
                        <img src={post.image_url} alt="" className="max-h-72 object-cover w-full" />
                      </motion.div>
                    )}

                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {post.tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="text-[9px] rounded-md bg-secondary/10 text-secondary border-secondary/20 font-mono">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-6 mt-4 pt-3 border-t border-border/20">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.7, y: 2 }}
                        onClick={() => requireAuth(() => handleLike(post.id), 'Sign in to like!')}
                        className={`flex items-center gap-2 text-xs transition-all group/btn ${likedPosts.has(post.id) ? 'text-destructive' : 'text-muted-foreground hover:text-destructive'}`}
                      >
                        <Heart className={`w-4 h-4 transition-all ${likedPosts.has(post.id) ? 'fill-current drop-shadow-[0_0_8px_hsl(var(--destructive)/0.6)]' : 'group-hover/btn:scale-110'}`} />
                        <span className="font-mono text-[11px]">{post.likes_count}</span>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.7, y: 2 }}
                        onClick={() => requireAuth(() => {}, 'Sign in to comment!')}
                        className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-all"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span className="font-mono text-[11px]">{post.comments_count}</span>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.7, y: 2 }}
                        className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-all"
                      >
                        <Share2 className="w-4 h-4" />
                      </motion.button>
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
