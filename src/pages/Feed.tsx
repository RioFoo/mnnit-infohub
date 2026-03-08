import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Heart, MessageCircle, Share2, Plus, Loader2, Sparkles, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
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
      {/* Hero header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="section-title mb-0">Live Feed</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-mono font-bold">
            What's <span className="gradient-text">Happening</span>
          </h1>
        </div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={() => requireAuth(() => setCreateOpen(true), 'Sign in to create posts!')}
            className="gap-2 rounded-xl btn-glow bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="w-4 h-4" /> <span className="hidden sm:inline">New Post</span>
          </Button>
        </motion.div>
      </motion.div>

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="card-3d border-border/50">
          <DialogHeader>
            <DialogTitle className="font-mono flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" /> Create Post
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Textarea placeholder="What's happening at campus?" value={newContent} onChange={e => setNewContent(e.target.value)} rows={4} className="bg-muted/30 border-border/50 rounded-xl" />
            <Input placeholder="Tags (comma separated)" value={newTags} onChange={e => setNewTags(e.target.value)} className="bg-muted/30 border-border/50 rounded-xl" />
            <Button onClick={handleCreatePost} disabled={posting || !newContent.trim()} className="w-full rounded-xl btn-glow">
              {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Post'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Posts */}
      {loading ? (
        <div className="flex justify-center py-16">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
            <Loader2 className="w-8 h-8 text-primary" />
          </motion.div>
        </div>
      ) : posts.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <p className="text-muted-foreground">No posts yet. Be the first to share!</p>
        </motion.div>
      ) : (
        <div className="space-y-4 max-w-2xl mx-auto">
          {posts.map((post, i) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20, rotateX: -3 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ delay: i * 0.06, duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
              className="card-3d p-5 group"
              style={{ perspective: '800px' }}
            >
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="w-11 h-11 rounded-xl bg-primary/15 flex items-center justify-center text-primary font-bold text-sm shrink-0 ring-2 ring-primary/10"
                >
                  {post.profiles?.avatar_url ? (
                    <img src={post.profiles.avatar_url} alt="" className="w-full h-full rounded-xl object-cover" />
                  ) : (
                    (post.profiles?.name || 'U')[0].toUpperCase()
                  )}
                </motion.div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm">{post.profiles?.name || 'Anonymous'}</span>
                    <span className="text-xs text-muted-foreground">@{post.profiles?.handle}</span>
                    <span className="text-xs text-muted-foreground/60">· {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>

                  {post.image_url && (
                    <motion.img
                      src={post.image_url}
                      alt=""
                      className="mt-3 rounded-xl max-h-72 object-cover w-full"
                      whileHover={{ scale: 1.02 }}
                    />
                  )}

                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {post.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-[10px] rounded-lg bg-secondary/10 text-secondary border-secondary/20">{tag}</Badge>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-5 mt-4 pt-3 border-t border-border/30">
                    <motion.button
                      whileTap={{ scale: 0.8 }}
                      onClick={() => requireAuth(() => handleLike(post.id), 'Sign in to like!')}
                      className={`flex items-center gap-1.5 text-xs transition-all ${likedPosts.has(post.id) ? 'text-destructive' : 'text-muted-foreground hover:text-destructive'}`}
                    >
                      <Heart className={`w-4 h-4 ${likedPosts.has(post.id) ? 'fill-current drop-shadow-[0_0_6px_hsl(var(--destructive)/0.5)]' : ''}`} />
                      <span className="font-medium">{post.likes_count}</span>
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.8 }}
                      onClick={() => requireAuth(() => {}, 'Sign in to comment!')}
                      className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-all"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span className="font-medium">{post.comments_count}</span>
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.8 }}
                      className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-all"
                    >
                      <Share2 className="w-4 h-4" />
                    </motion.button>
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
