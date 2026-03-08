import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Search, Loader2, Users, Compass } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageHeader } from '@/components/PageHeader';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { AuthPromptDialog } from '@/components/AuthPromptDialog';
import PostCard, { type Post } from '@/components/feed/PostCard';

interface ReactionRow {
  post_id: string;
  emoji: string;
  user_id: string;
}

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05, delayChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } }
};

type ViewMode = 'discover' | 'my-posts';

const Explore = () => {
  const { user } = useAuth();
  const { showAuthPrompt, setShowAuthPrompt, authMessage, requireAuth } = useAuthGuard();
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [mode, setMode] = useState<ViewMode>('discover');
  const [posts, setPosts] = useState<Post[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [allReactions, setAllReactions] = useState<ReactionRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      const [postsRes, usersRes, reactionsRes] = await Promise.all([
        (supabase.from as any)('posts')
          .select('*, profiles(name, handle, avatar_url, branch)')
          .order('created_at', { ascending: false })
          .limit(100),
        (supabase.from as any)('profiles').select('*').limit(50),
        (supabase.from as any)('reactions').select('post_id, emoji, user_id'),
      ]);
      if (postsRes.data) setPosts(postsRes.data as Post[]);
      if (usersRes.data) setUsers(usersRes.data);
      if (reactionsRes.data) setAllReactions(reactionsRes.data);
      setLoading(false);
    };
    fetchAll();
  }, [user]);

  // Collect all tags from posts
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    posts.forEach(p => p.tags?.forEach(t => tagSet.add(t)));
    return Array.from(tagSet).sort();
  }, [posts]);

  // Filter posts
  const filteredPosts = useMemo(() => {
    let result = posts;

    if (mode === 'my-posts' && user) {
      result = result.filter(p => p.user_id === user.id);
    }

    if (selectedTag) {
      result = result.filter(p => p.tags?.includes(selectedTag));
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(p =>
        p.content.toLowerCase().includes(q) ||
        (p.profiles?.name || '').toLowerCase().includes(q) ||
        (p.profiles?.handle || '').toLowerCase().includes(q) ||
        p.tags?.some(t => t.toLowerCase().includes(q))
      );
    }

    return result;
  }, [posts, mode, user, selectedTag, search]);

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
      <PageHeader title="EXPLORE" />

      {/* Mode toggle */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex gap-2 mb-5"
      >
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setMode('discover')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-medium transition-all ${
            mode === 'discover'
              ? 'bg-primary text-primary-foreground shadow-[0_0_16px_hsl(var(--primary)/0.3)]'
              : 'bg-muted/15 text-muted-foreground hover:text-foreground border border-border/[0.08]'
          }`}
        >
          <Compass className="w-3.5 h-3.5" /> Discover
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => { if (user) setMode('my-posts'); else requireAuth(() => setMode('my-posts'), 'Sign in to see your posts'); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-medium transition-all ${
            mode === 'my-posts'
              ? 'bg-primary text-primary-foreground shadow-[0_0_16px_hsl(var(--primary)/0.3)]'
              : 'bg-muted/15 text-muted-foreground hover:text-foreground border border-border/[0.08]'
          }`}
        >
          <Users className="w-3.5 h-3.5" /> My Posts
        </motion.button>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="relative mb-5 max-w-xl"
      >
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
        <Input
          placeholder="Search posts, people, or tags..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-10 h-11 rounded-xl bg-muted/15 border-border/[0.08] text-sm font-mono"
        />
      </motion.div>

      {/* Tag pills */}
      {allTags.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide"
        >
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedTag(null)}
            className={`px-3 py-1.5 rounded-full text-[10px] font-mono font-medium transition-all whitespace-nowrap ${
              !selectedTag
                ? 'bg-primary text-primary-foreground shadow-[0_0_12px_hsl(var(--primary)/0.3)]'
                : 'bg-muted/15 text-muted-foreground hover:text-foreground border border-border/[0.08]'
            }`}
          >
            All
          </motion.button>
          {allTags.map(tag => (
            <motion.button
              key={tag}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
              className={`px-3 py-1.5 rounded-full text-[10px] font-mono font-medium transition-all whitespace-nowrap ${
                selectedTag === tag
                  ? 'bg-primary text-primary-foreground shadow-[0_0_12px_hsl(var(--primary)/0.3)]'
                  : 'bg-muted/15 text-muted-foreground hover:text-foreground border border-border/[0.08]'
              }`}
            >
              #{tag}
            </motion.button>
          ))}
        </motion.div>
      )}

      {/* Posts */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-primary/40 animate-spin" />
        </div>
      ) : filteredPosts.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
          <p className="text-sm font-mono text-muted-foreground">
            {mode === 'my-posts' ? 'You haven\'t posted yet.' : 'No posts found.'}
          </p>
        </motion.div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-4 max-w-2xl mx-auto"
        >
          {filteredPosts.map(post => (
            <PostCard
              key={post.id}
              post={post}
              reactions={getReactionsForPost(post.id)}
              onReact={handleReact}
              onRequireAuth={requireAuth}
              isAuthenticated={!!user}
            />
          ))}
        </motion.div>
      )}

      <AuthPromptDialog open={showAuthPrompt} onOpenChange={setShowAuthPrompt} message={authMessage} />
    </div>
  );
};

export default Explore;
