import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Edit, Loader2, LogIn, User, Sparkles } from 'lucide-react';
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
  const [role, setRole] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) { setName(profile.name || ''); setBio(profile.bio || ''); setRole(profile.role || ''); }
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
    const { error } = await (supabase.from as any)('profiles').update({ name, bio, role }).eq('id', user.id);
    if (error) toast.error(error.message);
    else { toast.success('Profile updated!'); await refreshProfile(); setEditOpen(false); }
    setSaving(false);
  };

  if (!user || !profile) {
    return (
      <div className="page-container flex items-center justify-center min-h-[60vh]">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="card-3d holo-border p-10 text-center max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <User className="w-7 h-7 text-primary" />
          </div>
          <h2 className="text-xl font-mono font-bold mb-2">Your Profile</h2>
          <p className="text-muted-foreground text-sm mb-5">Sign in to view and manage your profile.</p>
          <Button onClick={() => navigate('/auth')} className="gap-2 rounded-xl btn-glow"><LogIn className="w-4 h-4" /> Sign In</Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="page-container max-w-2xl">
      {/* Profile card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-3d holo-border p-8 text-center mb-8">
        {/* Avatar */}
        <motion.div whileHover={{ scale: 1.1, rotate: 5 }} className="inline-block mb-4">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt={profile.name || ''} className="w-24 h-24 rounded-2xl object-cover ring-4 ring-primary/20" />
          ) : (
            <div className="w-24 h-24 rounded-2xl bg-primary/15 flex items-center justify-center text-primary font-bold text-4xl ring-4 ring-primary/20">
              {(profile.name || 'U')[0].toUpperCase()}
            </div>
          )}
        </motion.div>

        <h2 className="text-2xl font-mono font-bold">{profile.name || 'User'}</h2>
        <p className="text-sm text-muted-foreground mt-1">@{profile.handle}</p>
        {profile.bio && <p className="text-sm mt-3 max-w-xs mx-auto text-muted-foreground">{profile.bio}</p>}

        <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
          <Badge className="rounded-lg bg-primary/10 text-primary border-primary/20">{profile.branch || 'Branch'}</Badge>
          <Badge variant="outline" className="rounded-lg">{profile.section ? `Section ${profile.section}` : 'Section'}</Badge>
          <Badge variant="outline" className="rounded-lg">{profile.role || 'Student'}</Badge>
        </div>

        <div className="flex justify-center gap-10 mt-6 pt-5 border-t border-border/30">
          <div className="text-center">
            <p className="text-2xl font-mono font-bold gradient-text">{posts.length}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Posts</p>
          </div>
        </div>

        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="mt-5 rounded-xl gap-1.5"><Edit className="w-3 h-3" /> Edit Profile</Button>
          </DialogTrigger>
          <DialogContent className="card-3d border-border/50">
            <DialogHeader>
              <DialogTitle className="font-mono flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary" /> Edit Profile</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div><label className="text-xs text-muted-foreground font-medium">Name</label><Input value={name} onChange={e => setName(e.target.value)} className="rounded-xl bg-muted/30 mt-1" /></div>
              <div><label className="text-xs text-muted-foreground font-medium">Bio</label><Textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} className="rounded-xl bg-muted/30 mt-1" /></div>
              <div><label className="text-xs text-muted-foreground font-medium">Role</label><Input value={role} onChange={e => setRole(e.target.value)} placeholder="e.g., CSE Student, 2nd Year" className="rounded-xl bg-muted/30 mt-1" /></div>
              <Button onClick={handleSave} disabled={saving} className="w-full rounded-xl btn-glow">{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Posts */}
      <span className="section-title">Your Posts</span>
      {posts.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-12">No posts yet.</p>
      ) : (
        <div className="space-y-3">
          {posts.map((post, i) => (
            <motion.div key={post.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="card-3d p-4">
              <p className="text-sm">{post.content}</p>
              <p className="text-[10px] text-muted-foreground mt-2">{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Profile;
