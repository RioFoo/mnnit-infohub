import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Search, Loader2, Users, Compass, UserPlus, UserCheck, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PageHeader } from '@/components/PageHeader';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useFollowState } from '@/hooks/useFollowState';
import { AuthPromptDialog } from '@/components/AuthPromptDialog';
import PostCard, { type Post } from '@/components/feed/PostCard';
import { cn } from '@/lib/utils';

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

type ViewMode = 'discover' | 'people' | 'my-posts';

const Explore = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showAuthPrompt, setShowAuthPrompt, authMessage, requireAuth } = useAuthGuard();
  const { isFollowing, isFavourite, toggleFollow, toggleFavourite } = useFollowState();
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'people' ? 'people' : 'discover';
  const [mode, setMode] = useState<ViewMode>(initialTab);
  const [posts, setPosts] = useState<Post[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [allReactions, setAllReactions] = useState<ReactionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [followerCounts, setFollowerCounts] = useState<Record<string, number>>({});

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

      // Fetch follower counts for user cards
      if (usersRes.data) {
        const ids = usersRes.data.map((u: any) => u.id);
        const { data: followers } = await (supabase.from as any)('followers')
          .select('following_id')
          .in('following_id', ids);
        if (followers) {
          const counts: Record<string, number> = {};
          followers.forEach((f: any) => { counts[f.following_id] = (counts[f.following_id] || 0) + 1; });
          setFollowerCounts(counts);
        }
      }
      setLoading(false);
    };
    fetchAll();
  }, [user]);

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    posts.forEach(p => p.tags?.forEach(t => tagSet.add(t)));
    return Array.from(tagSet).sort();
  }, [posts]);

  const filteredPosts = useMemo(() => {
    let result = posts;
    if (mode === 'my-posts' && user) result = result.filter(p => p.user_id === user.id);
    if (selectedTag) result = result.filter(p => p.tags?.includes(selectedTag));
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

  const filteredUsers = useMemo(() => {
    if (!search.trim()) return users.filter(u => u.id !== user?.id);
    const q = search.toLowerCase();
    return users.filter(u =>
      u.id !== user?.id && (
        (u.name || '').toLowerCase().includes(q) ||
        (u.handle || '').toLowerCase().includes(q) ||
        (u.branch || '').toLowerCase().includes(q)
      )
    );
  }, [users, search, user]);

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
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2 mb-5">
        {[
          { key: 'discover' as ViewMode, icon: Compass, label: 'Discover' },
          { key: 'people' as ViewMode, icon: Users, label: 'People' },
          { key: 'my-posts' as ViewMode, icon: Users, label: 'My Posts' },
        ].map(({ key, icon: Icon, label }) => (
          <motion.button
            key={key}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (key === 'my-posts' && !user) requireAuth(() => setMode(key), 'Sign in to see your posts');
              else setMode(key);
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-medium transition-all ${
              mode === key
                ? 'bg-primary text-primary-foreground shadow-[0_0_16px_hsl(var(--primary)/0.3)]'
                : 'bg-muted/15 text-muted-foreground hover:text-foreground border border-border/[0.08]'
            }`}
          >
            <Icon className="w-3.5 h-3.5" /> {label}
          </motion.button>
        ))}
      </motion.div>

      {/* Search */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="relative mb-5 max-w-xl">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
        <Input
          placeholder={mode === 'people' ? 'Search people...' : 'Search posts, people, or tags...'}
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-10 h-11 rounded-xl bg-muted/15 border-border/[0.08] text-sm font-mono"
        />
      </motion.div>

      {/* People mode */}
      {mode === 'people' ? (
        loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-primary/40 animate-spin" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <p className="text-sm font-mono text-muted-foreground">No people found.</p>
          </motion.div>
        ) : (
          <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid gap-3 max-w-2xl mx-auto sm:grid-cols-2">
            {filteredUsers.map((u) => {
              const following = isFollowing(u.id);
              const favourite = isFavourite(u.id);
              return (
                <motion.div
                  key={u.id}
                  variants={itemVariants}
                  className="card-bio p-4 flex items-center gap-3.5"
                >
                  <button onClick={() => navigate(`/profile/${u.id}`)} className="shrink-0">
                    {u.avatar_url ? (
                      <img src={u.avatar_url} alt="" className="w-11 h-11 rounded-full object-cover" />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center text-primary font-display font-bold text-base">
                        {(u.name || 'U')[0].toUpperCase()}
                      </div>
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <button onClick={() => navigate(`/profile/${u.id}`)} className="font-semibold text-sm hover:text-primary transition-colors truncate block">
                      {u.name || 'User'}
                    </button>
                    <p className="text-[10px] font-mono text-muted-foreground truncate">@{u.handle} · {u.branch} {u.section}</p>
                    <p className="text-[10px] font-mono text-muted-foreground/40 mt-0.5">{followerCounts[u.id] || 0} followers</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <motion.button
                      whileTap={{ scale: 0.85 }}
                      onClick={() => requireAuth(() => toggleFollow(u.id), 'Sign in to follow')}
                      className={cn(
                        'flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-mono transition-all border',
                        following
                          ? 'bg-primary/[0.06] text-primary border-primary/20'
                          : 'bg-muted/10 text-muted-foreground hover:text-primary border-border/[0.08]'
                      )}
                    >
                      {following ? <UserCheck className="w-3 h-3" /> : <UserPlus className="w-3 h-3" />}
                      {following ? 'Following' : 'Follow'}
                    </motion.button>
                    <AnimatePresence>
                      {following && (
                        <motion.button
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0 }}
                          whileTap={{ scale: 0.8 }}
                          onClick={() => toggleFavourite(u.id)}
                          className={cn(
                            'w-7 h-7 rounded-lg flex items-center justify-center transition-all',
                            favourite
                              ? 'text-yellow-500 bg-yellow-500/10 shadow-[0_0_8px_hsl(45,100%,50%,0.25)]'
                              : 'text-muted-foreground/30 hover:text-yellow-500'
                          )}
                        >
                          <Star className={cn('w-3.5 h-3.5', favourite && 'fill-current')} />
                        </motion.button>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )
      ) : (
        <>
          {/* Tag pills */}
          {allTags.length > 0 && mode === 'discover' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
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
            <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-4 max-w-2xl mx-auto">
              {filteredPosts.map(post => (
                <PostCard
                  key={post.id}
                  post={post}
                  reactions={getReactionsForPost(post.id)}
                  onReact={handleReact}
                  onRequireAuth={requireAuth}
                  isAuthenticated={!!user}
                  currentUserId={user?.id}
                  isFollowingAuthor={isFollowing(post.user_id)}
                  isFavouriteAuthor={isFavourite(post.user_id)}
                  isFavouritePost={false}
                  onToggleFollow={toggleFollow}
                  onToggleFavourite={toggleFavourite}
                />
              ))}
            </motion.div>
          )}
        </>
      )}

      <AuthPromptDialog open={showAuthPrompt} onOpenChange={setShowAuthPrompt} message={authMessage} />
    </div>
  );
};

export default Explore;
