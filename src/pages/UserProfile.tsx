import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Loader2, UserPlus, UserMinus, Heart, MessageCircle, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import MediaRenderer from '@/components/feed/MediaRenderer';

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
}

const UserProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState<UserProfileData | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  // Redirect to own profile if viewing self
  useEffect(() => {
    if (user && userId === user.id) {
      navigate('/profile', { replace: true });
    }
  }, [user, userId, navigate]);

  useEffect(() => {
    if (!userId) return;
    const load = async () => {
      setLoading(true);
      const [profileRes, postsRes, followersRes, followingRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).single(),
        (supabase.from as any)('posts').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
        (supabase.from as any)('followers').select('id', { count: 'exact', head: true }).eq('following_id', userId),
        (supabase.from as any)('followers').select('id', { count: 'exact', head: true }).eq('follower_id', userId),
      ]);
      if (profileRes.data) setProfileData(profileRes.data as unknown as UserProfileData);
      if (postsRes.data) setPosts(postsRes.data);
      setFollowerCount(followersRes.count || 0);
      setFollowingCount(followingRes.count || 0);
      setLoading(false);
    };
    load();
  }, [userId]);

  // Check follow status
  useEffect(() => {
    if (!user || !userId) return;
    const check = async () => {
      const { data } = await (supabase.from as any)('followers')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', userId)
        .maybeSingle();
      setIsFollowing(!!data);
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
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', userId);
      if (error) toast.error('Failed to unfollow');
      else {
        setIsFollowing(false);
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
      {/* Back button */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground/50 hover:text-foreground transition-colors mb-4">
        <ArrowLeft className="w-3.5 h-3.5" /> Back
      </button>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="card-bio p-0 mb-8 overflow-hidden"
      >
        {/* Banner */}
        <div className="h-32 relative overflow-hidden">
          {profileData.banner_url ? (
            <img src={profileData.banner_url} alt="Banner" className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <>
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
              <div className="absolute inset-0 surface-shimmer" />
            </>
          )}
        </div>

        <div className="px-6 sm:px-8 pb-8 -mt-14 relative">
          <div className="flex items-end justify-between">
            <div className="avatar-orbital avatar-orbital-lg inline-block">
              {profileData.avatar_url ? (
                <img src={profileData.avatar_url} alt={profileData.name || ''} className="w-24 h-24 rounded-full object-cover border-4 border-background" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary font-display font-bold text-3xl border-4 border-background">
                  {(profileData.name || 'U')[0].toUpperCase()}
                </div>
              )}
            </div>

            {/* Follow Button */}
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
              <Button
                onClick={handleFollow}
                disabled={followLoading}
                size="sm"
                variant={isFollowing ? 'outline' : 'default'}
                className={`rounded-xl gap-1.5 text-xs font-mono ${
                  isFollowing
                    ? 'border-border/[0.08] hover:border-destructive/30 hover:text-destructive hover:bg-destructive/[0.04]'
                    : 'btn-bio'
                }`}
              >
                {followLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : isFollowing ? (
                  <>
                    <UserMinus className="w-3.5 h-3.5" /> Unfollow
                  </>
                ) : (
                  <>
                    <UserPlus className="w-3.5 h-3.5" /> Follow
                  </>
                )}
              </Button>
            </motion.div>
          </div>

          <div className="mt-4">
            <h2 className="text-2xl font-display font-bold">{profileData.name || 'User'}</h2>
            <p className="text-sm font-mono text-muted-foreground mt-0.5">@{profileData.handle}</p>
            {profileData.bio && <p className="text-sm mt-3 text-foreground/70 max-w-md leading-relaxed">{profileData.bio}</p>}
          </div>

          <div className="flex items-center gap-2 mt-4 flex-wrap">
            <span className="tag-pill text-xs">{profileData.branch || 'Branch'}</span>
            <span className="tag-pill text-xs">{profileData.section ? `Section ${profileData.section}` : 'Section'}</span>
            {profileData.semester && <span className="tag-pill text-xs">Sem {profileData.semester}</span>}
            {profileData.batch && <span className="tag-pill text-xs">{profileData.batch}</span>}
            <span className="tag-pill text-xs">{profileData.role || 'Student'}</span>
          </div>

          <div className="flex gap-8 mt-6 pt-5 relative">
            <div className="divider-glow absolute left-0 right-0 top-0" />
            <div>
              <p className="text-3xl font-display font-bold gradient-text">{posts.length}</p>
              <p className="text-[10px] font-mono text-muted-foreground">Posts</p>
            </div>
            <div>
              <p className="text-3xl font-display font-bold gradient-text">{followerCount}</p>
              <p className="text-[10px] font-mono text-muted-foreground">Followers</p>
            </div>
            <div>
              <p className="text-3xl font-display font-bold gradient-text">{followingCount}</p>
              <p className="text-[10px] font-mono text-muted-foreground">Following</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Posts */}
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
