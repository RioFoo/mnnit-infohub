import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface FollowRecord {
  following_id: string;
  favourite: boolean;
}

export const useFollowState = () => {
  const { user } = useAuth();
  const [myFollows, setMyFollows] = useState<Map<string, boolean>>(new Map());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) { setMyFollows(new Map()); return; }
    const fetch = async () => {
      const { data } = await (supabase.from as any)('followers')
        .select('following_id, favourite')
        .eq('follower_id', user.id);
      if (data) {
        const map = new Map<string, boolean>();
        (data as FollowRecord[]).forEach(r => map.set(r.following_id, r.favourite));
        setMyFollows(map);
      }
    };
    fetch();
  }, [user]);

  const isFollowing = useCallback((userId: string) => myFollows.has(userId), [myFollows]);
  const isFavourite = useCallback((userId: string) => myFollows.get(userId) === true, [myFollows]);

  const toggleFollow = useCallback(async (targetId: string) => {
    if (!user) return;
    setLoading(true);
    if (myFollows.has(targetId)) {
      await (supabase.from as any)('followers').delete().eq('follower_id', user.id).eq('following_id', targetId);
      setMyFollows(prev => { const n = new Map(prev); n.delete(targetId); return n; });
      toast.success('Unfollowed');
    } else {
      const { error } = await (supabase.from as any)('followers').insert({ follower_id: user.id, following_id: targetId });
      if (error) toast.error('Failed to follow');
      else {
        setMyFollows(prev => { const n = new Map(prev); n.set(targetId, false); return n; });
        toast.success('Following!');
      }
    }
    setLoading(false);
  }, [user, myFollows]);

  const toggleFavourite = useCallback(async (targetId: string) => {
    if (!user || !myFollows.has(targetId)) return;
    const newVal = !myFollows.get(targetId);
    const { error } = await (supabase.from as any)('followers')
      .update({ favourite: newVal })
      .eq('follower_id', user.id)
      .eq('following_id', targetId);
    if (!error) {
      setMyFollows(prev => { const n = new Map(prev); n.set(targetId, newVal); return n; });
      toast.success(newVal ? 'Added to favourites' : 'Removed from favourites');
    }
  }, [user, myFollows]);

  const followedIds = Array.from(myFollows.keys());
  const favouriteIds = Array.from(myFollows.entries()).filter(([, fav]) => fav).map(([id]) => id);

  return { isFollowing, isFavourite, toggleFollow, toggleFavourite, followedIds, favouriteIds, loading };
};
