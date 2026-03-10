import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Plus, Loader2, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageHeader } from '@/components/PageHeader';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useFollowState } from '@/hooks/useFollowState';
import { AuthPromptDialog } from '@/components/AuthPromptDialog';
import { type Post } from '@/components/feed/PostCard';
import SwipeablePostCard from '@/components/feed/SwipeablePostCard';
import PullToRefresh from '@/components/feed/PullToRefresh';
import CreatePostDialog from '@/components/feed/CreatePostDialog';
import { toast } from 'sonner';

interface ReactionRow {
  post_id: string;
  emoji: string;
  user_id: string;
}

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } }
};

const Feed = () => {
  const { user } = useAuth();
  const { showAuthPrompt, setShowAuthPrompt, authMessage, requireAuth } = useAuthGuard();
  const { isFollowing, isFavourite, toggleFollow, toggleFavourite, favouriteIds, followedIds } = useFollowState();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [allReactions, setAllReactions] = useState<ReactionRow[]>([]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const { data, error } = await (supabase.from as any)('posts')
        .select('*, profiles(name, handle, avatar_url, branch)')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) {
        console.error('Error fetching posts:', error);
        toast.error('Failed to load posts');
      }
      if (data) setPosts(data as unknown as Post[]);
    } catch (err) {
      console.error('Failed to fetch posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReactions = async () => {
    const { data } = await (supabase.from as any)('reactions').select('post_id, emoji, user_id');
    if (data) setAllReactions(data);
  };

  useEffect(() => {
    fetchPosts();
    fetchReactions();
    const channel = supabase.channel('posts-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => fetchPosts())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  // Sort posts: favourite authors first, then followed, then others
  const sortedPosts = useMemo(() => {
    if (!user) return posts;
    const favSet = new Set(favouriteIds);
    const followSet = new Set(followedIds);

    return [...posts].sort((a, b) => {
      const aFav = favSet.has(a.user_id) ? 0 : followSet.has(a.user_id) ? 1 : 2;
      const bFav = favSet.has(b.user_id) ? 0 : followSet.has(b.user_id) ? 1 : 2;
      if (aFav !== bFav) return aFav - bFav;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [posts, favouriteIds, followedIds, user]);

  const getReactionsForPost = (postId: string) => {
    const postReactions = allReactions.filter(r => r.post_id === postId);
    const emojiMap = new Map<string, { count: number; reacted: boolean }>();
    postReactions.forEach(r => {
      const existing = emojiMap.get(r.emoji) || { count: 0, reacted: false };
      existing.count++;
      if (user && r.user_id === user.id) existing.reacted = true;
      emojiMap.set(r.emoji, existing);
    });
    return Array.from(emojiMap.entries()).map(([emoji, data]) => ({ emoji, ...data }));
  };

  const handleReact = async (postId: string, emoji: string) => {
    if (!user) return;
    const existing = allReactions.find(r => r.post_id === postId && r.user_id === user.id && r.emoji === emoji);
    if (existing) {
      await (supabase.from as any)('reactions').delete().eq('post_id', postId).eq('user_id', user.id).eq('emoji', emoji);
      setAllReactions(prev => prev.filter(r => !(r.post_id === postId && r.user_id === user.id && r.emoji === emoji)));
    } else {
      await (supabase.from as any)('reactions').insert({ post_id: postId, user_id: user.id, emoji });
      setAllReactions(prev => [...prev, { post_id: postId, user_id: user.id, emoji }]);
    }
  };

  return (
    <div className="page-container">
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

      <CreatePostDialog open={createOpen} onOpenChange={setCreateOpen} onCreated={fetchPosts} />

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
        <PullToRefresh onRefresh={async () => { await fetchPosts(); await fetchReactions(); }}>
          <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-4 max-w-2xl mx-auto">
            {sortedPosts.map(post => (
              <SwipeablePostCard
                key={post.id}
                post={post}
                reactions={getReactionsForPost(post.id)}
                onReact={handleReact}
                onRequireAuth={requireAuth}
                isAuthenticated={!!user}
                currentUserId={user?.id}
                isFollowingAuthor={isFollowing(post.user_id)}
                isFavouriteAuthor={isFavourite(post.user_id)}
                isFavouritePost={isFavourite(post.user_id)}
                onToggleFollow={toggleFollow}
                onToggleFavourite={toggleFavourite}
              />
            ))}
          </motion.div>
        </PullToRefresh>
      )}

      <AuthPromptDialog open={showAuthPrompt} onOpenChange={setShowAuthPrompt} message={authMessage} />
    </div>
  );
};

export default Feed;
