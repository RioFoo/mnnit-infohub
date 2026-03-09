import { useState, useEffect, useRef } from 'react';
import TypewriterText from '@/components/TypewriterText';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Edit, Loader2, LogIn, Heart, MessageCircle, Camera, ImagePlus, Trash2, Star, Users, UserPlus } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import MediaRenderer from '@/components/feed/MediaRenderer';
import FollowersDialog from '@/components/FollowersDialog';

const BRANCHES = ['CSE', 'ECE', 'EE', 'ME', 'CE', 'GIS'];
const SECTIONS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const SEMESTERS = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'];
const getBatches = (sec: string) => sec ? [`${sec}1`, `${sec}2`] : [];

const Profile = () => {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<any[]>([]);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [favouriteCount, setFavouriteCount] = useState(0);
  const [followDialogTab, setFollowDialogTab] = useState<'followers' | 'following' | 'favourites'>('followers');
  const [editOpen, setEditOpen] = useState(false);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [gender, setGender] = useState('');
  const [branch, setBranch] = useState('');
  const [section, setSection] = useState('');
  const [semester, setSemester] = useState('');
  const [batch, setBatch] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [followDialogOpen, setFollowDialogOpen] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const { scrollY } = useScroll();
  const bannerY = useTransform(scrollY, [0, 300], [0, 80]);
  const bannerScale = useTransform(scrollY, [0, 300], [1, 1.15]);
  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setBio(profile.bio || '');
      setGender(profile.gender || '');
      setBranch(profile.branch || '');
      setSection(profile.section || '');
      setSemester(profile.semester || '');
      setBatch(profile.batch || '');
    }
  }, [profile]);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const [postsRes, followersRes, followingRes, favCountRes] = await Promise.all([
        (supabase.from as any)('posts')
          .select('*, profiles(name, handle, avatar_url, branch)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        (supabase.from as any)('followers').select('id', { count: 'exact', head: true }).eq('following_id', user.id),
        (supabase.from as any)('followers').select('id', { count: 'exact', head: true }).eq('follower_id', user.id),
        (supabase.from as any)('followers').select('id', { count: 'exact', head: true }).eq('following_id', user.id).eq('favourite', true),
      ]);
      if (postsRes.data) setPosts(postsRes.data);
      setFollowerCount(followersRes.count || 0);
      setFollowingCount(followingRes.count || 0);
      setFavouriteCount(favCountRes.count || 0);
    };
    fetchData();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const updates: Record<string, string> = { name, bio, gender, branch, section, semester, batch };
    const { error } = await (supabase.from as any)('profiles').update(updates).eq('id', user.id);
    if (error) toast.error(error.message);
    else { toast.success('Profile updated!'); await refreshProfile(); setEditOpen(false); }
    setSaving(false);
  };

  const uploadFile = async (file: File, bucket: string, folder: string) => {
    const ext = file.name.split('.').pop();
    const path = `${folder}/${user!.id}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
    if (error) throw error;
    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path);
    return publicUrl;
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 2 * 1024 * 1024) { toast.error('Max 2MB'); return; }
    setUploadingAvatar(true);
    try {
      const url = await uploadFile(file, 'avatars', 'profiles');
      await (supabase.from as any)('profiles').update({ avatar_url: url }).eq('id', user.id);
      await refreshProfile();
      toast.success('Avatar updated!');
    } catch (err: any) { toast.error(err.message); }
    setUploadingAvatar(false);
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Max 5MB'); return; }
    setUploadingBanner(true);
    try {
      const url = await uploadFile(file, 'avatars', 'banners');
      await (supabase.from as any)('profiles').update({ banner_url: url }).eq('id', user.id);
      await refreshProfile();
      toast.success('Banner updated!');
    } catch (err: any) { toast.error(err.message); }
    setUploadingBanner(false);
  };

  const handleDeletePost = async (postId: string) => {
    if (!user) return;
    const { error } = await (supabase.from as any)('posts').delete().eq('id', postId).eq('user_id', user.id);
    if (error) toast.error('Failed to delete post');
    else {
      setPosts(prev => prev.filter(p => p.id !== postId));
      toast.success('Post deleted');
    }
  };

  if (!user || !profile) {
    return (
      <div className="page-container flex items-center justify-center min-h-[60vh]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, filter: 'blur(8px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="card-bio glow-border p-12 text-center max-w-sm"
        >
          <div className="w-16 h-16 rounded-full bg-primary/[0.06] flex items-center justify-center mx-auto mb-5 breathe">
            <LogIn className="w-7 h-7 text-primary/40" />
          </div>
          <h2 className="text-lg font-display font-bold">Sign in to view your profile</h2>
          <Button onClick={() => navigate('/auth')} className="gap-2 rounded-xl btn-bio mt-6">
            <LogIn className="w-4 h-4" /> Sign In
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="page-container max-w-2xl min-w-0">
      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="card-bio p-0 mb-8 overflow-hidden"
      >
        {/* Banner */}
        <div className="h-36 sm:h-44 relative overflow-hidden group cursor-pointer" onClick={() => bannerInputRef.current?.click()}>
          <motion.div style={{ y: bannerY, scale: bannerScale }} className="absolute inset-0">
            {profile.banner_url ? (
              <img src={profile.banner_url} alt="Banner" className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <>
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
                <div className="absolute inset-0 surface-shimmer" />
              </>
            )}
          </motion.div>
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
            {uploadingBanner ? (
              <Loader2 className="w-6 h-6 text-foreground animate-spin opacity-0 group-hover:opacity-100 transition-opacity" />
            ) : (
              <ImagePlus className="w-6 h-6 text-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
          </div>
          <input ref={bannerInputRef} type="file" accept="image/*" className="hidden" onChange={handleBannerUpload} />
        </div>

        <div className="px-3 sm:px-8 pb-6 sm:pb-8 -mt-12 sm:-mt-14 relative min-w-0 overflow-hidden">
          <div className="avatar-orbital avatar-orbital-lg inline-block relative group cursor-pointer" onClick={() => avatarInputRef.current?.click()}>
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.name || ''} className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-[3px] sm:border-4 border-background" />
            ) : (
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary font-display font-bold text-2xl sm:text-3xl border-[3px] sm:border-4 border-background">
                {(profile.name || 'U')[0].toUpperCase()}
              </div>
            )}
            <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center border-4 border-transparent">
              {uploadingAvatar ? (
                <Loader2 className="w-5 h-5 text-foreground animate-spin opacity-0 group-hover:opacity-100 transition-opacity" />
              ) : (
                <Camera className="w-5 h-5 text-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </div>
            <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
          </div>

          <div className="mt-4 min-w-0">
            <TypewriterText
              text={profile.name || 'User'}
              as="h2"
              speed={50}
              delay={400}
              className="text-2xl sm:text-4xl font-display font-black transform transition-all duration-300 hover:scale-105 hover:rotate-1 hover:drop-shadow-[0_4px_12px_hsl(var(--primary)/0.4)] cursor-pointer gradient-text break-words"
            />
            <p className="text-sm sm:text-base font-mono text-muted-foreground mt-1 font-bold transform transition-all duration-300 hover:scale-102 hover:text-primary truncate">@{profile.handle}</p>
            {profile.bio && <p className="text-sm sm:text-base mt-3 text-foreground/80 max-w-md leading-relaxed font-semibold transform transition-all duration-300 hover:scale-102 hover:text-foreground cursor-pointer break-words">{profile.bio}</p>}
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 mt-4 flex-wrap">
            <span className="tag-pill text-[10px] sm:text-sm font-bold cursor-pointer">{profile.branch || 'Branch'}</span>
            <span className="tag-pill text-[10px] sm:text-sm font-bold cursor-pointer">{profile.section ? `Section ${profile.section}` : 'Section'}</span>
            {profile.semester && <span className="tag-pill text-[10px] sm:text-sm font-bold cursor-pointer">Sem {profile.semester}</span>}
            {profile.batch && <span className="tag-pill text-[10px] sm:text-sm font-bold cursor-pointer">{profile.batch}</span>}
            <span className="tag-pill text-[10px] sm:text-sm font-bold cursor-pointer">{profile.role || 'Student'}</span>
            {profile.gender && <span className="tag-pill text-[10px] sm:text-sm font-bold cursor-pointer">{profile.gender}</span>}
          </div>

          <div className="flex flex-col gap-3 mt-6 pt-5 relative">
            <div className="divider-glow absolute left-0 right-0 top-0" />
            
            {/* Stats + actions row */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 w-full">
              <div className="text-center min-w-[36px] shrink-0">
                <p className="text-lg sm:text-3xl font-display font-black gradient-text">{posts.length}</p>
                <p className="text-[8px] sm:text-xs font-mono text-muted-foreground font-bold">Posts</p>
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

            {/* Find People button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/explore?tab=people')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-secondary/[0.06] border border-secondary/15 hover:bg-secondary/[0.1] hover:border-secondary/25 transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4 text-secondary" />
              <span className="text-[10px] sm:text-xs font-mono font-bold text-foreground">Find People</span>
            </motion.button>
          </div>

          <Dialog open={editOpen} onOpenChange={setEditOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="mt-5 rounded-xl gap-2 text-sm font-mono font-black border-border/[0.08] btn-bio transform transition-all duration-300 hover:scale-105 hover:rotate-1 hover:drop-shadow-[0_4px_12px_hsl(var(--primary)/0.4)]">
                <Edit className="w-4 h-4" /> Edit Profile
              </Button>
            </DialogTrigger>
             <DialogContent className="bg-card border border-border/10 rounded-2xl shadow-2xl" aria-describedby="edit-profile-desc">
              <DialogHeader>
                <DialogTitle className="text-2xl font-display font-black transform transition-all duration-300 hover:scale-105 gradient-text cursor-pointer">Edit Profile</DialogTitle>
                <p id="edit-profile-desc" className="text-base text-muted-foreground font-semibold">Update your profile information</p>
              </DialogHeader>
              <div className="space-y-3 mt-2 max-h-[60vh] overflow-y-auto pr-1">
                <div>
                  <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Name</label>
                  <Input value={name} onChange={e => setName(e.target.value)} maxLength={50} className="rounded-xl bg-muted/10 border-border/[0.06] mt-1" />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Bio</label>
                  <Textarea value={bio} onChange={e => setBio(e.target.value)} rows={2} maxLength={300} className="rounded-xl bg-muted/10 border-border/[0.06] mt-1 resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Branch</label>
                    <Select value={branch} onValueChange={setBranch}>
                      <SelectTrigger className="rounded-xl bg-muted/10 border-border/[0.06] mt-1">
                        <SelectValue placeholder="Branch" />
                      </SelectTrigger>
                      <SelectContent>
                        {BRANCHES.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Section</label>
                    <Select value={section} onValueChange={setSection}>
                      <SelectTrigger className="rounded-xl bg-muted/10 border-border/[0.06] mt-1">
                        <SelectValue placeholder="Section" />
                      </SelectTrigger>
                      <SelectContent>
                        {SECTIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Semester</label>
                    <Select value={semester} onValueChange={setSemester}>
                      <SelectTrigger className="rounded-xl bg-muted/10 border-border/[0.06] mt-1">
                        <SelectValue placeholder="Semester" />
                      </SelectTrigger>
                      <SelectContent>
                        {SEMESTERS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Batch</label>
                    <Select value={batch} onValueChange={setBatch}>
                      <SelectTrigger className="rounded-xl bg-muted/10 border-border/[0.06] mt-1">
                        <SelectValue placeholder="Batch" />
                      </SelectTrigger>
                      <SelectContent>
                        {getBatches(section).map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Gender</label>
                  <Select value={gender} onValueChange={setGender}>
                    <SelectTrigger className="rounded-xl bg-muted/10 border-border/[0.06] mt-1">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Non-binary">Non-binary</SelectItem>
                      <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleSave} disabled={saving} className="w-full rounded-xl btn-bio font-black text-base transform transition-all duration-300 hover:scale-102 hover:drop-shadow-[0_4px_12px_hsl(var(--primary)/0.4)]">
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Changes'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {user && <FollowersDialog open={followDialogOpen} onOpenChange={setFollowDialogOpen} userId={user.id} tab={followDialogTab} />}
        </div>
      </motion.div>

      {/* User's Posts */}
      <span className="section-title text-2xl font-black transform transition-all duration-300 hover:scale-105 hover:rotate-1 hover:drop-shadow-[0_4px_12px_hsl(var(--primary)/0.4)] cursor-pointer gradient-text">Your Posts</span>
      {posts.length === 0 ? (
        <p className="text-lg font-mono text-muted-foreground text-center py-16 font-bold transform transition-all duration-300 hover:scale-105 hover:text-foreground cursor-pointer">No posts yet</p>
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
              <p className="text-base leading-relaxed whitespace-pre-wrap text-foreground/90 font-medium transform transition-all duration-300 hover:scale-[1.02] hover:text-foreground cursor-pointer">{post.content}</p>

              {post.image_url && <MediaRenderer url={post.image_url} mediaType={post.media_type} />}

              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {post.tags.map((tag: string) => (
                    <span key={tag} className="tag-pill text-xs font-bold transform transition-all duration-300 hover:scale-110 hover:rotate-2 hover:drop-shadow-[0_2px_8px_hsl(var(--primary)/0.5)] cursor-pointer">#{tag}</span>
                  ))}
                </div>
              )}

              <div className="divider-glow my-3" />

              <div className="flex items-center gap-4 text-sm text-muted-foreground font-bold">
                <span className="flex items-center gap-2 transform transition-all duration-300 hover:scale-110 hover:text-red-400 cursor-pointer">
                  <Heart className="w-4 h-4" />
                  <span className="font-mono tabular-nums text-xs font-black">{post.likes_count}</span>
                </span>
                <span className="flex items-center gap-2 transform transition-all duration-300 hover:scale-110 hover:text-blue-400 cursor-pointer">
                  <MessageCircle className="w-4 h-4" />
                  <span className="font-mono tabular-nums text-xs font-black">{post.comments_count}</span>
                </span>
                <span className="text-xs font-mono text-muted-foreground/40 ml-auto font-bold transform transition-all duration-300 hover:text-muted-foreground hover:scale-105 cursor-pointer">
                  {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                </span>
                <button
                  onClick={() => handleDeletePost(post.id)}
                  className="ml-2 text-muted-foreground/30 hover:text-destructive transition-all transform hover:scale-125 hover:rotate-12 hover:drop-shadow-[0_2px_8px_hsl(var(--destructive)/0.5)]"
                  title="Delete post"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Profile;
