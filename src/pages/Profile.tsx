import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Edit, Loader2, LogIn, Shield, Fingerprint } from 'lucide-react';
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
          initial={{ opacity: 0, scale: 0.9, rotateY: -10 }}
          animate={{ opacity: 1, scale: 1, rotateY: 0 }}
          className="card-3d-pro p-12 text-center max-w-sm"
          style={{ perspective: '800px' }}
        >
          <div className="w-20 h-20 rounded-xl bg-primary/8 flex items-center justify-center mx-auto mb-5 neon-border">
            <Fingerprint className="w-9 h-9 text-primary/60" />
          </div>
          <h2 className="text-lg font-display font-bold tracking-wider nav-text-3d">LOGIN REQUIRED</h2>
          <Button onClick={() => navigate('/auth')} className="gap-2 rounded-xl btn-3d font-display tracking-wider text-xs uppercase mt-6">
            <LogIn className="w-4 h-4" /> Login
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="page-container max-w-2xl">
      {/* ═══ PROFILE CARD ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 30, rotateX: -5 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ type: 'spring', stiffness: 200 }}
        className="card-3d-pro p-0 mb-8 overflow-hidden"
        style={{ perspective: '1000px' }}
      >
        {/* Banner */}
        <div className="h-24 relative overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-primary/20 via-secondary/10 to-accent/20"
            animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
            transition={{ duration: 8, repeat: Infinity }}
            style={{ backgroundSize: '200% 200%' }}
          />
          <div className="absolute inset-0 hex-grid opacity-30" />
        </div>

        <div className="px-6 sm:px-8 pb-8 -mt-10 relative">
          <motion.div whileHover={{ scale: 1.05, rotateZ: 3 }} whileTap={{ scale: 0.95 }} className="inline-block relative">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.name || ''} className="w-20 h-20 rounded-xl object-cover border-4 border-background ring-2 ring-primary/30" />
            ) : (
              <div className="w-20 h-20 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-3xl border-4 border-background ring-2 ring-primary/30 font-display">
                {(profile.name || 'U')[0].toUpperCase()}
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center border-2 border-background"
              style={{ boxShadow: '0 0 10px hsl(var(--neon-cyan) / 0.6)' }}>
              <Shield className="w-2.5 h-2.5 text-primary-foreground" />
            </div>
          </motion.div>

          <div className="mt-4">
            <h2 className="text-2xl font-display font-bold tracking-wider text-3d">{profile.name || 'User'}</h2>
            <p className="text-xs text-primary/60 font-mono mt-0.5">@{profile.handle}</p>
            {profile.bio && <p className="text-sm mt-3 text-muted-foreground max-w-md">{profile.bio}</p>}
          </div>

          <div className="flex items-center gap-2 mt-4 flex-wrap">
            <Badge className="rounded-lg bg-primary/8 text-primary border-primary/15 font-display tracking-wider text-[10px]">{profile.branch || 'Branch'}</Badge>
            <Badge variant="outline" className="rounded-lg font-display tracking-wider text-[10px]">{profile.section ? `Sec ${profile.section}` : 'Section'}</Badge>
            <Badge variant="outline" className="rounded-lg font-display tracking-wider text-[10px]">{profile.role || 'Student'}</Badge>
          </div>

          <div className="flex gap-10 mt-6 pt-5 border-t border-border/20">
            <div>
              <p className="text-2xl font-display font-bold gradient-text">{posts.length}</p>
              <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-display">Posts</p>
            </div>
          </div>

          <Dialog open={editOpen} onOpenChange={setEditOpen}>
            <DialogTrigger asChild>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="outline" size="sm" className="mt-5 rounded-xl gap-1.5 font-display tracking-wider text-[10px] uppercase border-border/30 btn-3d">
                  <Edit className="w-3 h-3" /> Edit
                </Button>
              </motion.div>
            </DialogTrigger>
            <DialogContent className="card-3d-pro border-border/30">
              <DialogHeader>
                <DialogTitle className="font-display tracking-wider text-sm uppercase flex items-center gap-2">
                  <Edit className="w-4 h-4 text-primary" /> Edit Profile
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-3 mt-2">
                <div>
                  <label className="text-[10px] text-muted-foreground font-display tracking-wider uppercase">Name</label>
                  <Input value={name} onChange={e => setName(e.target.value)} className="rounded-xl bg-background/40 border-border/30 mt-1" />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground font-display tracking-wider uppercase">Bio</label>
                  <Textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} className="rounded-xl bg-background/40 border-border/30 mt-1" />
                </div>
                <Button onClick={handleSave} disabled={saving} className="w-full rounded-xl btn-3d font-display tracking-wider text-xs uppercase">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      {/* ═══ POSTS ═══ */}
      <span className="section-title">Posts</span>
      {posts.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-16 font-mono">No posts yet</p>
      ) : (
        <div className="space-y-3 mt-3">
          {posts.map((post, i) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 15, rotateX: -3 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ delay: i * 0.05, type: 'spring', stiffness: 250 }}
              whileHover={{ y: -3 }}
              className="card-3d-pro p-4"
              style={{ perspective: '600px' }}
            >
              <p className="text-sm">{post.content}</p>
              <p className="text-[10px] text-muted-foreground mt-2 font-mono">{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Profile;
