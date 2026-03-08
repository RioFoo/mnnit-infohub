import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

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
    <div className="page-container max-w-2xl">
      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="card-bio p-0 mb-8 overflow-hidden"
      >
        {/* Banner */}
        <div className="h-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
          <div className="absolute inset-0 surface-shimmer" />
        </div>

        <div className="px-6 sm:px-8 pb-8 -mt-14 relative">
          <div className="avatar-orbital avatar-orbital-lg inline-block">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.name || ''} className="w-24 h-24 rounded-full object-cover border-4 border-background" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary font-display font-bold text-3xl border-4 border-background">
                {(profile.name || 'U')[0].toUpperCase()}
              </div>
            )}
          </div>

          <div className="mt-4">
            <h2 className="text-2xl font-display font-bold">{profile.name || 'User'}</h2>
            <p className="text-sm font-mono text-muted-foreground mt-0.5">@{profile.handle}</p>
            {profile.bio && <p className="text-sm mt-3 text-foreground/70 max-w-md leading-relaxed">{profile.bio}</p>}
          </div>

          <div className="flex items-center gap-2 mt-4 flex-wrap">
            <span className="tag-pill text-xs">{profile.branch || 'Branch'}</span>
            <span className="tag-pill text-xs">{profile.section ? `Section ${profile.section}` : 'Section'}</span>
            <span className="tag-pill text-xs">{profile.role || 'Student'}</span>
          </div>

          <div className="flex gap-8 mt-6 pt-5">
            <div className="divider-glow absolute left-6 right-6" style={{ top: 'calc(100% - 60px)' }} />
            <div>
              <p className="text-3xl font-display font-bold gradient-text">{posts.length}</p>
              <p className="text-[10px] font-mono text-muted-foreground">Posts</p>
            </div>
          </div>

          <Dialog open={editOpen} onOpenChange={setEditOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="mt-5 rounded-xl gap-1.5 text-xs font-mono border-border/[0.08] btn-bio">
                <Edit className="w-3 h-3" /> Edit Profile
              </Button>
            </DialogTrigger>
            <DialogContent className="card-bio glow-border border-border/[0.06]">
              <DialogHeader>
                <DialogTitle className="text-lg font-display font-bold">Edit Profile</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 mt-2">
                <div>
                  <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Name</label>
                  <Input value={name} onChange={e => setName(e.target.value)} className="rounded-xl bg-muted/10 border-border/[0.06] mt-1" />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Bio</label>
                  <Textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} className="rounded-xl bg-muted/10 border-border/[0.06] mt-1 resize-none" />
                </div>
                <Button onClick={handleSave} disabled={saving} className="w-full rounded-xl btn-bio">
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
        <p className="text-sm font-mono text-muted-foreground text-center py-16">No posts yet</p>
      ) : (
        <div className="space-y-2.5 mt-3">
          {posts.map((post, i) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
              className="float-card p-4"
            >
              <p className="text-sm leading-relaxed">{post.content}</p>
              <p className="text-[10px] font-mono text-muted-foreground/40 mt-2">{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Profile;
