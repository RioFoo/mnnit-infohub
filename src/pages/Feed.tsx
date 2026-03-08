import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Heart, MessageCircle, Share2, Plus, Loader2, TrendingUp, Zap, Radio, Signal } from 'lucide-react';
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
    else { toast.success('Post created!'); setNewContent(''); setNewTags(''); setCreateOpen(false); fetchPosts(); }
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
      {/* ═══ HERO HEADER ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative mb-10"
      >
        {/* Decorative HUD lines */}
        <div className="absolute -left-4 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-primary/30 to-transparent" />
        
        <div className="flex items-end justify-between gap-4">
          <div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-3 mb-3"
            >
              <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center border border-primary/20 neon-border">
                <Signal className="w-5 h-5 text-primary" />
              </div>
              <div>
                <span className="section-title mb-0">Transmission Feed</span>
              </div>
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-display font-bold tracking-wider">
              <span className="text-foreground">LIVE</span>{' '}
              <span className="gradient-text-aurora">STREAM</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-2 max-w-md">
              Real-time campus communications • <span className="status-live text-primary text-xs">Broadcasting</span>
            </p>
          </div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={() => requireAuth(() => setCreateOpen(true), 'Sign in to create posts!')}
              className="gap-2 rounded-lg btn-neon bg-primary text-primary-foreground hover:bg-primary/90 font-display tracking-wider text-xs uppercase"
            >
              <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Transmit</span>
            </Button>
          </motion.div>
        </div>
        
        <div className="cyber-line mt-6" />
      </motion.div>

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="holo-card border-border/30 p-0 overflow-hidden">
          <div className="data-stream-bg p-6">
            <DialogHeader>
              <DialogTitle className="font-display tracking-wider flex items-center gap-2 text-sm uppercase">
                <Zap className="w-4 h-4 text-primary" /> New Transmission
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <Textarea placeholder="Broadcast your message..." value={newContent} onChange={e => setNewContent(e.target.value)} rows={4} className="bg-background/40 border-border/30 rounded-lg backdrop-blur-sm" />
              <Input placeholder="Tags (comma separated)" value={newTags} onChange={e => setNewTags(e.target.value)} className="bg-background/40 border-border/30 rounded-lg" />
              <Button onClick={handleCreatePost} disabled={posting || !newContent.trim()} className="w-full rounded-lg btn-neon font-display tracking-wider uppercase text-xs">
                {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Transmit'}
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
            className="w-16 h-16 rounded-full border-2 border-primary/20 border-t-primary"
          />
          <span className="text-xs font-display text-muted-foreground tracking-widest uppercase">Loading transmissions...</span>
        </div>
      ) : posts.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
          <div className="w-24 h-24 rounded-xl bg-primary/5 flex items-center justify-center mx-auto mb-6 neon-border">
            <Radio className="w-10 h-10 text-primary/60" />
          </div>
          <h3 className="font-display text-lg tracking-wider text-foreground/80">No Transmissions</h3>
          <p className="text-muted-foreground text-sm mt-2">Be the first to broadcast.</p>
        </motion.div>
      ) : (
        <div className="space-y-5 max-w-2xl mx-auto">
          {posts.map((post, i) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 30, rotateX: -5 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ delay: i * 0.08, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
              className="holo-card p-0 group"
              style={{ perspective: '1000px' }}
            >
              {/* Top accent line */}
              <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
              
              <div className="p-5">
                <div className="flex items-start gap-4">
                  {/* Avatar with energy ring */}
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="relative w-12 h-12 shrink-0"
                  >
                    <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center text-primary font-bold text-sm overflow-hidden border border-primary/20">
                      {post.profiles?.avatar_url ? (
                        <img src={post.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="font-display">{(post.profiles?.name || 'U')[0].toUpperCase()}</span>
                      )}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-primary/80 border-2 border-background" 
                      style={{ boxShadow: '0 0 8px hsl(var(--neon-cyan) / 0.6)' }} />
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
                      <motion.div whileHover={{ scale: 1.02 }} className="mt-4 rounded-lg overflow-hidden hud-corner">
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
                        whileTap={{ scale: 0.7 }}
                        onClick={() => requireAuth(() => handleLike(post.id), 'Sign in to like!')}
                        className={`flex items-center gap-2 text-xs transition-all group/btn ${likedPosts.has(post.id) ? 'text-destructive' : 'text-muted-foreground hover:text-destructive'}`}
                      >
                        <Heart className={`w-4 h-4 transition-all ${likedPosts.has(post.id) ? 'fill-current drop-shadow-[0_0_8px_hsl(var(--destructive)/0.6)]' : 'group-hover/btn:scale-110'}`} />
                        <span className="font-mono text-[11px]">{post.likes_count}</span>
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.7 }}
                        onClick={() => requireAuth(() => {}, 'Sign in to comment!')}
                        className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-all"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span className="font-mono text-[11px]">{post.comments_count}</span>
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.7 }}
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
