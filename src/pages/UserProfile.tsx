import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Loader2, UserPlus, UserMinus, Heart, MessageCircle, ArrowLeft, Star, Users, Github } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import MediaRenderer from '@/components/feed/MediaRenderer';
import { cn } from '@/lib/utils';
import FollowersDialog from '@/components/FollowersDialog';
import SkillBadge from '@/components/SkillBadge';

interface UserProfileData {
  id: string;
  name: string | null;
  handle: string | null;
  avatar_url: string | null;
  banner_url: string | null;
  bio: string | null;
  role: string | null;
  branch: string | null;
  section: string | null;
  semester: string | null;
  batch: string | null;
  gender: string | null;
  github_url: string | null;
  skills: string[] | null;
}

const UserProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState<UserProfileData | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFavourite, setIsFavourite] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [favouriteLoading, setFavouriteLoading] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [favouriteCount, setFavouriteCount] = useState(0);
  const [followsMe, setFollowsMe] = useState(false);
  const [followDialogOpen, setFollowDialogOpen] = useState(false);
  const [followDialogTab, setFollowDialogTab] = useState<'followers' | 'following' | 'favourites'>('followers');
  const { scrollY } = useScroll();
  const bannerY = useTransform(scrollY, [0, 300], [0, 80]);
  const bannerScale = useTransform(scrollY, [0, 300], [1, 1.15]);

  useEffect(() => {
    if (user && userId === user.id) {
      navigate('/profile', { replace: true });
    }
  }, [user, userId, navigate]);

  useEffect(() => {
    if (!userId) return;
    const load = async () => {
      setLoading(true);
      const [profileRes, postsRes, followersRes, followingRes, favCountRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).single(),
        (supabase.from as any)('posts').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
        (supabase.from as any)('followers').select('id', { count: 'exact', head: true }).eq('following_id', userId),
        (supabase.from as any)('followers').select('id', { count: 'exact', head: true }).eq('follower_id', userId),
        (supabase.from as any)('followers').select('id', { count: 'exact', head: true }).eq('following_id', userId).eq('favourite', true),
      ]);
      if (profileRes.data) setProfileData(profileRes.data as unknown as UserProfileData);
      if (postsRes.data) setPosts(postsRes.data);
      setFollowerCount(followersRes.count || 0);
      setFollowingCount(followingRes.count || 0);
      setFavouriteCount(favCountRes.count || 0);
      setLoading(false);
    };
    load();
  }, [userId]);

  // Check follow + favourite + mutual status
  useEffect(() => {
    if (!user || !userId) return;
    const check = async () => {
      const [myFollowRes, theirFollowRes] = await Promise.all([
        (supabase.from as any)('followers')
          .select('id, favourite')
          .eq('follower_id', user.id)
          .eq('following_id', userId)
          .maybeSingle(),
        (supabase.from as any)('followers')
          .select('id')
          .eq('follower_id', userId)
          .eq('following_id', user.id)
          .maybeSingle(),
      ]);
      setIsFollowing(!!myFollowRes.data);
      setIsFavourite(myFollowRes.data?.favourite || false);
      setFollowsMe(!!theirFollowRes.data);
    };
    check();
  }, [user, userId]);

  const handleFollow = async () => {
    if (!user || !userId) {
      toast.error('Sign in to follow users');
      return;
    }
    setFollowLoading(true);
    if (isFollowing) {
      const { error } = await (supabase.from as any)('followers')
        .delete().eq('follower_id', user.id).eq('following_id', userId);
      if (error) toast.error('Failed to unfollow');
      else {
        setIsFollowing(false);
        setIsFavourite(false);
        setFollowerCount(c => c - 1);
        toast.success('Unfollowed');
      }
    } else {
      const { error } = await (supabase.from as any)('followers')
        .insert({ follower_id: user.id, following_id: userId });
      if (error) toast.error(error.message?.includes('duplicate') ? 'Already following' : 'Failed to follow');
      else {
        setIsFollowing(true);
        setFollowerCount(c => c + 1);
        toast.success('Following!');
      }
    }
    setFollowLoading(false);
  };

  const handleFavourite = async () => {
    if (!user || !userId || !isFollowing) return;
    setFavouriteLoading(true);
    const newVal = !isFavourite;
    const { error } = await (supabase.from as any)('followers')
      .update({ favourite: newVal })
      .eq('follower_id', user.id)
      .eq('following_id', userId);
    if (error) toast.error('Failed to update');
    else {
      setIsFavourite(newVal);
      setFavouriteCount(c => newVal ? c + 1 : c - 1);
      toast.success(newVal ? 'Added to favourites' : 'Removed from favourites');
    }
    setFavouriteLoading(false);
  };

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 text-primary/40 animate-spin" />
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="page-container text-center py-20">
        <p className="text-sm font-mono text-muted-foreground/50">User not found</p>
        <Button variant="outline" size="sm" onClick={() => navigate(-1)} className="mt-4 rounded-xl btn-bio">
          <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Go back
        </Button>
      </div>
    );
  }

  return (
    <div className="page-container max-w-2xl">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground/50 hover:text-foreground transition-colors mb-4">
        <ArrowLeft className="w-3.5 h-3.5" /> Back
      </button>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="card-bio p-0 mb-8 overflow-hidden"
      >
        <div className="h-36 sm:h-44 relative overflow-hidden">
          <motion.div style={{ y: bannerY, scale: bannerScale }} className="absolute inset-0">
            {profileData.banner_url ? (
              <img src={profileData.banner_url} alt="Banner" className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <>
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
                <div className="absolute inset-0 surface-shimmer" />
              </>
            )}
          </motion.div>
        </div>

        <div className="px-4 sm:px-8 pb-6 sm:pb-8 -mt-12 sm:-mt-14 relative">
          <div className="flex items-end justify-between">
            <div className="avatar-orbital avatar-orbital-lg inline-block">
              {profileData.avatar_url ? (
                <img src={profileData.avatar_url} alt={profileData.name || ''} className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-[3px] sm:border-4 border-background" />
              ) : (
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary font-display font-bold text-2xl sm:text-3xl border-[3px] sm:border-4 border-background">
                  {(profileData.name || 'U')[0].toUpperCase()}
                </div>
              )}
            </div>

            {/* Follow + Favourite Buttons */}
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="flex items-center gap-2">
              {/* Favourite (only visible when following) */}
              <AnimatePresence>
                {isFollowing && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    transition={{ type: 'spring', stiffness: 400 }}
                    onClick={handleFavourite}
                    disabled={favouriteLoading}
                    className={cn(
                      'w-9 h-9 rounded-xl flex items-center justify-center border transition-all',
                      isFavourite
                        ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500 shadow-[0_0_12px_hsl(45,100%,50%,0.2)]'
                        : 'bg-muted/10 border-border/[0.08] text-muted-foreground/40 hover:text-yellow-500 hover:border-yellow-500/20'
                    )}
                    title={isFavourite ? 'Remove from favourites' : 'Add to favourites'}
                  >
                    {favouriteLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Star className={cn('w-4 h-4', isFavourite && 'fill-current')} />
                    )}
                  </motion.button>
                )}
              </AnimatePresence>

              {/* Follow/Unfollow */}
              <motion.div whileTap={{ scale: 0.9 }}>
                <Button
                  onClick={handleFollow}
                  disabled={followLoading}
                  size="sm"
                  variant={isFollowing ? 'outline' : 'default'}
                  className={cn(
                    'rounded-xl gap-1.5 text-xs font-mono',
                    isFollowing
                      ? 'border-border/[0.08] hover:border-destructive/30 hover:text-destructive hover:bg-destructive/[0.04]'
                      : 'btn-bio'
                  )}
                >
                  {followLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : isFollowing ? (
                    <><UserMinus className="w-3.5 h-3.5" /> Unfollow</>
                  ) : (
                    <><UserPlus className="w-3.5 h-3.5" /> Follow</>
                  )}
                </Button>
              </motion.div>
            </motion.div>
          </div>

          <div className="mt-4">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-2xl font-display font-bold">{profileData.name || 'User'}</h2>
              {/* Mutual follow badge */}
              {followsMe && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="tag-pill text-[9px] bg-primary/[0.08] text-primary border-primary/20"
                >
                  Follows you
                </motion.span>
              )}
            </div>
            <p className="text-sm font-mono text-muted-foreground mt-0.5">@{profileData.handle}</p>
            {profileData.bio && <p className="text-sm mt-3 text-foreground/70 max-w-md leading-relaxed">{profileData.bio}</p>}

            {/* GitHub Link */}
            {profileData.github_url && (
              <a href={profileData.github_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 mt-2 text-xs font-mono text-muted-foreground hover:text-primary transition-colors">
                <Github className="w-3.5 h-3.5" />
                {profileData.github_url.replace('https://github.com/', '')}
              </a>
            )}
          </div>

          {/* Skills */}
          {profileData.skills && profileData.skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {profileData.skills.map(skill => (
                <SkillBadge key={skill} skill={skill} />
              ))}
            </div>
          )}

          <div className="flex items-center gap-2 mt-4 flex-wrap">
            <span className="tag-pill text-xs">{profileData.branch || 'Branch'}</span>
            <span className="tag-pill text-xs">{profileData.section ? `Section ${profileData.section}` : 'Section'}</span>
            {profileData.semester && <span className="tag-pill text-xs">Sem {profileData.semester}</span>}
            {profileData.batch && <span className="tag-pill text-xs">{profileData.batch}</span>}
            <span className="tag-pill text-xs">{profileData.role || 'Student'}</span>
          </div>

          <div className="flex flex-col gap-3 mt-6 pt-5 relative">
            <div className="divider-glow absolute left-0 right-0 top-0" />
            
            <div className="grid grid-cols-[auto_1fr_auto] sm:flex sm:flex-row items-center gap-2 sm:gap-4 w-full overflow-hidden">
              <div className="text-center min-w-[40px] shrink-0">
                <p className="text-xl sm:text-2xl font-display font-bold gradient-text">{posts.length}</p>
                <p className="text-[9px] sm:text-[10px] font-mono text-muted-foreground">Posts</p>
              </div>

              {/* Follow button */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => { setFollowDialogTab('followers'); setFollowDialogOpen(true); }}
                className="flex items-center justify-center gap-3 sm:gap-4 px-3.5 sm:px-5 py-2.5 rounded-xl bg-primary/[0.06] border border-primary/15 hover:bg-primary/[0.1] hover:border-primary/25 transition-all cursor-pointer min-w-0 overflow-hidden"
              >
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-primary shrink-0" />
                  <div className="flex flex-col items-start leading-none">
                    <span className="text-sm sm:text-base font-display font-bold text-foreground">{followerCount}</span>
                    <span className="text-[8px] sm:text-[9px] font-mono text-muted-foreground/60">Followers</span>
                  </div>
                </div>
                <div className="w-px h-5 bg-border/20" />
                <div className="flex flex-col items-start leading-none">
                  <span className="text-sm sm:text-base font-display font-bold text-foreground">{followingCount}</span>
                  <span className="text-[8px] sm:text-[9px] font-mono text-muted-foreground/60">Following</span>
                </div>
              </motion.button>

              {/* Favorites button */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => { setFollowDialogTab('favourites'); setFollowDialogOpen(true); }}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl bg-yellow-500/[0.06] border border-yellow-500/15 hover:bg-yellow-500/[0.1] hover:border-yellow-500/25 transition-all cursor-pointer shrink-0"
              >
                <div className="relative">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="absolute -top-1 -right-1.5 min-w-[14px] h-3.5 px-0.5 rounded-full bg-yellow-500 text-yellow-950 text-[7px] font-mono font-bold flex items-center justify-center">
                    {favouriteCount}
                  </span>
                </div>
                <span className="text-[10px] sm:text-xs font-mono font-bold text-foreground hidden sm:inline">Favorites</span>
              </motion.button>
            </div>
          </div>

          {userId && <FollowersDialog open={followDialogOpen} onOpenChange={setFollowDialogOpen} userId={userId} tab={followDialogTab} />}
        </div>
      </motion.div>

      <span className="section-title">Posts</span>
      {posts.length === 0 ? (
        <p className="text-sm font-mono text-muted-foreground text-center py-16">No posts yet</p>
      ) : (
        <div className="space-y-4 mt-3">
          {posts.map((post, i) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
              className="card-bio p-5"
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/85">{post.content}</p>
              {post.image_url && <MediaRenderer url={post.image_url} mediaType={post.media_type} />}
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {post.tags.map((tag: string) => (
                    <span key={tag} className="tag-pill text-[10px]">#{tag}</span>
                  ))}
                </div>
              )}
              <div className="divider-glow my-3" />
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5" />
                  <span className="font-mono tabular-nums text-[11px]">{post.likes_count}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span className="font-mono tabular-nums text-[11px]">{post.comments_count}</span>
                </span>
                <span className="text-[10px] font-mono text-muted-foreground/30 ml-auto">
                  {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserProfile;
