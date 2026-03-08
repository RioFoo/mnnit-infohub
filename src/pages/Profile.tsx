import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Edit, Loader2, LogIn } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<any[]>([]);
  const [editOpen, setEditOpen] = useState(false);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) { setName(profile.name || ''); setBio(profile.bio || ''); }
  }, [profile]);

  useEffect(() => {
    const fetchPosts = async () => {
      if (!user) return;
      const { data } = await (supabase.from as any)('posts').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      if (data) setPosts(data);
    };
    fetchPosts();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await (supabase.from as any)('profiles').update({ name, bio }).eq('id', user.id);
    if (error) toast.error(error.message);
    else { toast.success('Profile updated!'); await refreshProfile(); setEditOpen(false); }
    setSaving(false);
  };

  if (!user || !profile) {
    return (
      <div className="page-container flex items-center justify-center min-h-[60vh]">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="float-card p-12 text-center max-w-sm"
        >
          <div className="w-16 h-16 rounded-2xl bg-primary/6 flex items-center justify-center mx-auto mb-5">
            <LogIn className="w-7 h-7 text-primary/40" />
          </div>
          <h2 className="text-lg font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Sign in to view your profile</h2>
          <Button onClick={() => navigate('/auth')} className="gap-2 rounded-xl btn-premium mt-6">
            <LogIn className="w-4 h-4" /> Sign In
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="page-container max-w-2xl">
      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="float-card p-0 mb-8 overflow-hidden"
      >
        {/* Banner */}
        <div className="h-28 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-secondary/10 to-accent/10" />
        </div>

        <div className="px-6 sm:px-8 pb-8 -mt-12 relative">
          <div className="inline-block relative">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.name || ''} className="w-20 h-20 rounded-2xl object-cover border-4 border-background ring-1 ring-border/20" />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-primary/8 flex items-center justify-center text-primary font-bold text-3xl border-4 border-background ring-1 ring-border/20" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {(profile.name || 'U')[0].toUpperCase()}
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-background" />
          </div>

          <div className="mt-4">
            <h2 className="text-2xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{profile.name || 'User'}</h2>
            <p className="text-sm text-muted-foreground mt-0.5">@{profile.handle}</p>
            {profile.bio && <p className="text-sm mt-3 text-muted-foreground/80 max-w-md leading-relaxed">{profile.bio}</p>}
          </div>

          <div className="flex items-center gap-2 mt-4 flex-wrap">
            <Badge className="rounded-lg bg-primary/8 text-primary border-primary/10 font-medium text-xs">{profile.branch || 'Branch'}</Badge>
            <Badge variant="outline" className="rounded-lg font-medium text-xs border-border/20">{profile.section ? `Section ${profile.section}` : 'Section'}</Badge>
            <Badge variant="outline" className="rounded-lg font-medium text-xs border-border/20">{profile.role || 'Student'}</Badge>
          </div>

          <div className="flex gap-8 mt-6 pt-5 border-t border-border/10">
            <div>
              <p className="text-2xl font-bold gradient-text" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{posts.length}</p>
              <p className="text-xs text-muted-foreground">Posts</p>
            </div>
          </div>

          <Dialog open={editOpen} onOpenChange={setEditOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="mt-5 rounded-xl gap-1.5 text-xs border-border/20 btn-premium">
                <Edit className="w-3 h-3" /> Edit Profile
              </Button>
            </DialogTrigger>
            <DialogContent className="float-card border-border/15">
              <DialogHeader>
                <DialogTitle className="text-lg font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Edit Profile
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-3 mt-2">
                <div>
                  <label className="text-xs text-muted-foreground font-medium">Name</label>
                  <Input value={name} onChange={e => setName(e.target.value)} className="rounded-xl bg-muted/15 border-border/20 mt-1" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground font-medium">Bio</label>
                  <Textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} className="rounded-xl bg-muted/15 border-border/20 mt-1 resize-none" />
                </div>
                <Button onClick={handleSave} disabled={saving} className="w-full rounded-xl btn-premium">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      {/* Posts */}
      <span className="section-title">Posts</span>
      {posts.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-16">No posts yet</p>
      ) : (
        <div className="space-y-2.5 mt-3">
          {posts.map((post, i) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="float-card p-4"
            >
              <p className="text-sm leading-relaxed">{post.content}</p>
              <p className="text-xs text-muted-foreground mt-2">{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Profile;
