import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, UserPlus, UserMinus, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface FollowUser {
  id: string;
  name: string | null;
  handle: string | null;
  avatar_url: string | null;
  branch: string | null;
}

interface FollowEntry {
  user: FollowUser;
  isFollowedByMe: boolean;
  isFavourite: boolean;
}

interface FollowersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  tab: 'followers' | 'following';
}

const FollowersDialog = ({ open, onOpenChange, userId, tab }: FollowersDialogProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'followers' | 'following'>(tab);
  const [entries, setEntries] = useState<FollowEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    setActiveTab(tab);
  }, [tab]);

  useEffect(() => {
    if (!open) return;
    fetchList();
  }, [open, activeTab, userId]);

  const fetchList = async () => {
    setLoading(true);
    try {
      if (activeTab === 'followers') {
        const { data } = await (supabase.from as any)('followers')
          .select('follower_id, favourite')
          .eq('following_id', userId);
        if (!data) { setEntries([]); setLoading(false); return; }
        const ids = data.map((d: any) => d.follower_id);
        if (ids.length === 0) { setEntries([]); setLoading(false); return; }
        const { data: profiles } = await supabase.from('profiles')
          .select('id, name, handle, avatar_url, branch')
          .in('id', ids);
        
        // Check which ones current user follows
        let myFollows: Record<string, { favourite: boolean }> = {};
        if (user) {
          const { data: mf } = await (supabase.from as any)('followers')
            .select('following_id, favourite')
            .eq('follower_id', user.id)
            .in('following_id', ids);
          if (mf) mf.forEach((f: any) => { myFollows[f.following_id] = { favourite: f.favourite }; });
        }

        const list: FollowEntry[] = (profiles || []).map((p: any) => ({
          user: p,
          isFollowedByMe: !!myFollows[p.id],
          isFavourite: myFollows[p.id]?.favourite || false,
        }));
        setEntries(list);
      } else {
        const { data } = await (supabase.from as any)('followers')
          .select('following_id, favourite')
          .eq('follower_id', userId);
        if (!data) { setEntries([]); setLoading(false); return; }
        const ids = data.map((d: any) => d.following_id);
        if (ids.length === 0) { setEntries([]); setLoading(false); return; }
        const { data: profiles } = await supabase.from('profiles')
          .select('id, name, handle, avatar_url, branch')
          .in('id', ids);

        let myFollows: Record<string, { favourite: boolean }> = {};
        if (user) {
          const { data: mf } = await (supabase.from as any)('followers')
            .select('following_id, favourite')
            .eq('follower_id', user.id)
            .in('following_id', ids);
          if (mf) mf.forEach((f: any) => { myFollows[f.following_id] = { favourite: f.favourite }; });
        }

        const list: FollowEntry[] = (profiles || []).map((p: any) => ({
          user: p,
          isFollowedByMe: !!myFollows[p.id],
          isFavourite: myFollows[p.id]?.favourite || false,
        }));
        setEntries(list);
      }
    } catch { /* ignore */ }
    setLoading(false);
  };

  const handleFollow = async (targetId: string, currentlyFollowing: boolean) => {
    if (!user) { toast.error('Sign in to follow'); return; }
    setActionLoading(targetId);
    if (currentlyFollowing) {
      await (supabase.from as any)('followers').delete().eq('follower_id', user.id).eq('following_id', targetId);
      setEntries(prev => prev.map(e => e.user.id === targetId ? { ...e, isFollowedByMe: false, isFavourite: false } : e));
      toast.success('Unfollowed');
    } else {
      const { error } = await (supabase.from as any)('followers').insert({ follower_id: user.id, following_id: targetId });
      if (error) toast.error('Failed');
      else {
        setEntries(prev => prev.map(e => e.user.id === targetId ? { ...e, isFollowedByMe: true } : e));
        toast.success('Following!');
      }
    }
    setActionLoading(null);
  };

  const handleFavourite = async (targetId: string, currentFav: boolean) => {
    if (!user) return;
    setActionLoading(`fav-${targetId}`);
    const { error } = await (supabase.from as any)('followers')
      .update({ favourite: !currentFav })
      .eq('follower_id', user.id)
      .eq('following_id', targetId);
    if (!error) {
      setEntries(prev => prev.map(e => e.user.id === targetId ? { ...e, isFavourite: !currentFav } : e));
      toast.success(!currentFav ? 'Added to favourites' : 'Removed from favourites');
    }
    setActionLoading(null);
  };

  const goToProfile = (id: string) => {
    onOpenChange(false);
    if (user && id === user.id) navigate('/profile');
    else navigate(`/profile/${id}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border border-border/10 rounded-2xl shadow-2xl max-w-md" aria-describedby="followers-desc">
        <DialogHeader>
          <DialogTitle className="text-lg font-display font-bold">Connections</DialogTitle>
          <p id="followers-desc" className="text-sm text-muted-foreground">People who follow or are followed</p>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex border-b border-border/10 -mx-6 px-6">
          {(['followers', 'following'] as const).map(t => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={cn(
                'flex-1 py-2.5 text-xs font-mono uppercase tracking-wider transition-colors relative',
                activeTab === t ? 'text-foreground' : 'text-muted-foreground/50 hover:text-muted-foreground'
              )}
            >
              {t}
              {activeTab === t && (
                <span className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-primary rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="max-h-[50vh] overflow-y-auto -mx-2 px-2 space-y-1">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-5 h-5 text-primary/40 animate-spin" />
            </div>
          ) : entries.length === 0 ? (
            <p className="text-sm font-mono text-muted-foreground/50 text-center py-12">
              No {activeTab} yet
            </p>
          ) : (
            entries.map(({ user: u, isFollowedByMe, isFavourite }) => (
              <div key={u.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/5 transition-colors">
                <button onClick={() => goToProfile(u.id)} className="flex items-center gap-3 flex-1 min-w-0 text-left">
                  {u.avatar_url ? (
                    <img src={u.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover shrink-0" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-display font-bold text-sm shrink-0">
                      {(u.name || 'U')[0].toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{u.name || 'User'}</p>
                    <p className="text-[10px] font-mono text-muted-foreground truncate">@{u.handle} · {u.branch}</p>
                  </div>
                </button>

                {user && u.id !== user.id && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    {isFollowedByMe && (
                      <button
                        onClick={() => handleFavourite(u.id, isFavourite)}
                        disabled={actionLoading === `fav-${u.id}`}
                        className={cn(
                          'w-7 h-7 rounded-lg flex items-center justify-center border transition-all',
                          isFavourite
                            ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500'
                            : 'bg-muted/5 border-border/[0.06] text-muted-foreground/30 hover:text-yellow-500'
                        )}
                      >
                        {actionLoading === `fav-${u.id}` ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Star className={cn('w-3 h-3', isFavourite && 'fill-current')} />
                        )}
                      </button>
                    )}
                    <Button
                      size="sm"
                      variant={isFollowedByMe ? 'outline' : 'default'}
                      onClick={() => handleFollow(u.id, isFollowedByMe)}
                      disabled={actionLoading === u.id}
                      className={cn(
                        'h-7 rounded-lg text-[10px] font-mono px-2.5',
                        isFollowedByMe
                          ? 'border-border/[0.08] hover:border-destructive/30 hover:text-destructive'
                          : 'btn-bio'
                      )}
                    >
                      {actionLoading === u.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : isFollowedByMe ? (
                        <><UserMinus className="w-3 h-3 mr-1" />Unfollow</>
                      ) : (
                        <><UserPlus className="w-3 h-3 mr-1" />Follow</>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FollowersDialog;
