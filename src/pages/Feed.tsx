import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Heart, MessageCircle, Share2, Plus, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageHeader } from '@/components/PageHeader';
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

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const } }
};

const PostCard = ({ post, liked, onLike, onRequireAuth }: { post: Post; liked: boolean; onLike: (id: string) => void; onRequireAuth: (fn: () => void, msg: string) => void }) => {
  const cardRef = useRef<HTMLDivElement>(null);

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

            {post.image_url && (
              <div className="mt-3 rounded-xl overflow-hidden border border-border/[0.06]">
                <img src={post.image_url} alt="" className="max-h-72 object-cover w-full" />
              </div>
            )}

            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {post.tags.map(tag => (
                  <span key={tag} className="tag-pill text-[10px]">#{tag}</span>
                ))}
              </div>
            )}

            <div className="divider-glow my-3" />

            {/* Actions */}
            <div className="flex items-center gap-6">
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={() => onRequireAuth(() => onLike(post.id), 'Sign in to like!')}
                className={`flex items-center gap-2 text-xs transition-all group/btn ${liked ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}
              >
                <Heart className={`w-4 h-4 transition-all ${liked ? 'fill-current drop-shadow-[0_0_6px_hsl(var(--primary)/0.5)]' : 'group-hover/btn:scale-110'}`} />
                <span className="text-[11px] font-mono tabular-nums">{post.likes_count}</span>
              </motion.button>
              <button
                onClick={() => onRequireAuth(() => {}, 'Sign in to comment!')}
                className="flex items-center gap-2 text-xs text-muted-foreground hover:text-secondary transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="text-[11px] font-mono tabular-nums">{post.comments_count}</span>
              </button>
              <button className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-all ml-auto">
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

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
      <PageHeader title="FOR YOU">
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }}>
          <Button
            onClick={() => requireAuth(() => setCreateOpen(true), 'Sign in to post')}
            className="gap-2 rounded-xl btn-bio text-sm"
          >
            <Plus className="w-4 h-4" /> Post
          </Button>
        </motion.div>
      </PageHeader>

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-lg bg-card border border-border/10 rounded-2xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-display font-bold">Create Post</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <Textarea placeholder="What's on your mind?" value={newContent} onChange={e => setNewContent(e.target.value)} rows={4} className="bg-muted/15 border-border/[0.08] rounded-xl resize-none text-sm" />
            <Input placeholder="Tags (comma separated)" value={newTags} onChange={e => setNewTags(e.target.value)} className="bg-muted/15 border-border/[0.08] rounded-xl font-mono text-sm" />
            <Button onClick={handleCreatePost} disabled={posting || !newContent.trim()} className="w-full rounded-xl btn-bio">
              {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Publish'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Posts */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-8 h-8 text-primary/40 animate-spin" />
          <p className="text-xs font-mono text-muted-foreground">Loading feed...</p>
        </div>
      ) : posts.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
          <div className="w-16 h-16 rounded-full bg-primary/[0.06] flex items-center justify-center mx-auto mb-4 breathe">
            <MessageCircle className="w-7 h-7 text-primary/30" />
          </div>
          <p className="text-sm font-display text-muted-foreground">No posts yet</p>
        </motion.div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-4 max-w-2xl mx-auto"
        >
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              liked={likedPosts.has(post.id)}
              onLike={handleLike}
              onRequireAuth={requireAuth}
            />
          ))}
        </motion.div>
      )}

      {/* FAB */}
      {user && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: 'spring' }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setCreateOpen(true)}
          className="fixed bottom-24 md:bottom-8 right-6 w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg z-40 pulse-glow"
        >
          <Plus className="w-6 h-6" />
        </motion.button>
      )}

      <AuthPromptDialog open={showAuthPrompt} onOpenChange={setShowAuthPrompt} message={authMessage} />
    </div>
  );
};

export default Feed;
