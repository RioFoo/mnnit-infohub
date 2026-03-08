import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Heart, MessageCircle, Share2, Plus, Loader2, ImagePlus } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

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
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [newTags, setNewTags] = useState('');
  const [posting, setPosting] = useState(false);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());

  const fetchPosts = async () => {
    const { data } = await supabase
      .from('posts')
      .select('*, profiles(name, handle, avatar_url, branch)')
      .order('created_at', { ascending: false })
      .limit(50);
    if (data) setPosts(data as unknown as Post[]);
    setLoading(false);
  };

  const fetchLikes = async () => {
    if (!user) return;
    const { data } = await supabase.from('likes').select('post_id').eq('user_id', user.id);
    if (data) setLikedPosts(new Set(data.map(l => l.post_id)));
  };

  useEffect(() => {
    fetchPosts();
    fetchLikes();

    const channel = supabase.channel('posts-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => fetchPosts())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const handleCreatePost = async () => {
    if (!newContent.trim() || !user) return;
    setPosting(true);
    const tags = newTags.split(',').map(t => t.trim()).filter(Boolean);
    const { error } = await supabase.from('posts').insert({
      user_id: user.id,
      content: newContent,
      tags,
    });
    if (error) toast.error(error.message);
    else {
      toast.success('Post created!');
      setNewContent('');
      setNewTags('');
      setCreateOpen(false);
      fetchPosts();
    }
    setPosting(false);
  };

  const handleLike = async (postId: string) => {
    if (!user) return;
    if (likedPosts.has(postId)) {
      await supabase.from('likes').delete().eq('post_id', postId).eq('user_id', user.id);
      setLikedPosts(prev => { const n = new Set(prev); n.delete(postId); return n; });
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes_count: Math.max(0, p.likes_count - 1) } : p));
    } else {
      await supabase.from('likes').insert({ post_id: postId, user_id: user.id });
      setLikedPosts(prev => new Set(prev).add(postId));
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes_count: p.likes_count + 1 } : p));
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-mono font-bold text-primary">Feed</h1>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1">
              <Plus className="w-4 h-4" /> Post
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle className="font-mono">Create Post</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Textarea placeholder="What's happening at MNNIT?" value={newContent} onChange={e => setNewContent(e.target.value)} rows={4} />
              <Input placeholder="Tags (comma separated)" value={newTags} onChange={e => setNewTags(e.target.value)} />
              <Button onClick={handleCreatePost} disabled={posting || !newContent.trim()} className="w-full">
                {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Post'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>No posts yet. Be the first to post!</p>
        </div>
      ) : (
        posts.map((post, i) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass rounded-xl p-4 hover:border-primary/30 transition-all"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                {(post.profiles?.name || 'U')[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{post.profiles?.name || 'Anonymous'}</span>
                  <span className="text-xs text-muted-foreground">@{post.profiles?.handle}</span>
                  <span className="text-xs text-muted-foreground">· {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
                </div>
                <p className="mt-1 text-sm whitespace-pre-wrap">{post.content}</p>
                {post.image_url && (
                  <img src={post.image_url} alt="" className="mt-2 rounded-lg max-h-64 object-cover" />
                )}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {post.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-[10px]">{tag}</Badge>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-4 mt-3">
                  <button
                    onClick={() => handleLike(post.id)}
                    className={`flex items-center gap-1 text-xs transition-colors ${likedPosts.has(post.id) ? 'text-destructive' : 'text-muted-foreground hover:text-destructive'}`}
                  >
                    <Heart className={`w-4 h-4 ${likedPosts.has(post.id) ? 'fill-current' : ''}`} />
                    {post.likes_count}
                  </button>
                  <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
                    <MessageCircle className="w-4 h-4" />
                    {post.comments_count}
                  </button>
                  <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))
      )}
    </div>
  );
};

export default Feed;
