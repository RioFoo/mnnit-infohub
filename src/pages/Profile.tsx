import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Edit, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

const Profile = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [editOpen, setEditOpen] = useState(false);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [role, setRole] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setBio(profile.bio || '');
      setRole(profile.role || '');
    }
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
    else {
      toast.success('Profile updated!');
      await refreshProfile();
      setEditOpen(false);
    }
    setSaving(false);
  };

  if (!profile) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-xl p-6 text-center">
        {profile.avatar_url ? (
          <img src={profile.avatar_url} alt={profile.name || ''} className="w-20 h-20 rounded-full mx-auto mb-4 object-cover" />
        ) : (
          <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-3xl mx-auto mb-4">
            {(profile.name || 'U')[0].toUpperCase()}
          </div>
        )}
        <h2 className="text-xl font-mono font-bold">{profile.name || 'User'}</h2>
        <p className="text-sm text-muted-foreground">@{profile.handle}</p>
        {profile.bio && <p className="text-sm mt-2">{profile.bio}</p>}
        <div className="flex items-center justify-center gap-2 mt-2">
          <Badge variant="secondary">{profile.branch || 'Branch'}</Badge>
          <Badge variant="outline">{profile.section ? `Section ${profile.section}` : 'Section'}</Badge>
          <Badge variant="outline">{profile.role || 'Student'}</Badge>
        </div>

        <div className="flex justify-center gap-8 mt-4">
          <div className="text-center">
            <p className="text-lg font-mono font-bold">{posts.length}</p>
            <p className="text-xs text-muted-foreground">Posts</p>
          </div>
        </div>

        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="mt-4"><Edit className="w-3 h-3 mr-1" /> Edit Profile</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle className="font-mono">Edit Profile</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><label className="text-sm text-muted-foreground">Name</label><Input value={name} onChange={e => setName(e.target.value)} /></div>
              <div><label className="text-sm text-muted-foreground">Bio</label><Textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} /></div>
              <div><label className="text-sm text-muted-foreground">Role</label><Input value={role} onChange={e => setRole(e.target.value)} placeholder="e.g., CSE Student, 2nd Year" /></div>
              <Button onClick={handleSave} disabled={saving} className="w-full">{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      <div>
        <h3 className="font-mono font-semibold mb-3">Your Posts</h3>
        {posts.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No posts yet.</p>
        ) : (
          <div className="space-y-3">
            {posts.map((post, i) => (
              <motion.div key={post.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} className="glass rounded-lg p-3">
                <p className="text-sm">{post.content}</p>
                <p className="text-xs text-muted-foreground mt-1">{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
