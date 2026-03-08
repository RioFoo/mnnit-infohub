import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ACADEMIC_NOTIFICATIONS } from '@/data/infohub-data';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, CheckCheck, LogIn, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

interface Notification {
  id: string; type: string; message: string; read: boolean; link: string | null; created_at: string;
}

const Notifications = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const systemNotices = ACADEMIC_NOTIFICATIONS.slice(0, 3).map(n => ({
    id: `sys-${n.id}`, type: 'SYSTEM', message: n.title, read: false, link: n.link, created_at: new Date().toISOString(),
  }));

  useEffect(() => {
    const fetch = async () => {
      if (!user) return;
      const { data } = await (supabase.from as any)('notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      if (data) setNotifications(data as Notification[]);
      setLoading(false);
    };
    fetch();
  }, [user]);

  const markAllRead = async () => {
    if (!user) return;
    await (supabase.from as any)('notifications').update({ read: true }).eq('user_id', user.id);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const allNotifs = [...notifications, ...systemNotices];
  const typeIcon: Record<string, string> = { LIKE: '❤️', COMMENT: '💬', FOLLOW: '👤', SYSTEM: '📢' };

  if (!user) {
    return (
      <div className="page-container flex items-center justify-center min-h-[60vh]">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="card-3d holo-border p-10 text-center max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Bell className="w-7 h-7 text-primary" />
          </div>
          <h2 className="text-xl font-mono font-bold mb-2">Notifications</h2>
          <p className="text-muted-foreground text-sm mb-5">Sign in to see your notifications.</p>
          <Button onClick={() => navigate('/auth')} className="gap-2 rounded-xl btn-glow"><LogIn className="w-4 h-4" /> Sign In</Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="page-container max-w-2xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-4 h-4 text-primary" />
            <span className="section-title mb-0">Updates</span>
          </div>
          <h1 className="text-3xl font-mono font-bold">
            Your <span className="gradient-text">Alerts</span>
          </h1>
        </div>
        <Button variant="ghost" size="sm" onClick={markAllRead} className="text-xs rounded-xl">
          <CheckCheck className="w-4 h-4 mr-1" /> Mark all read
        </Button>
      </motion.div>

      {allNotifs.length === 0 ? (
        <p className="text-center py-16 text-muted-foreground">No notifications yet.</p>
      ) : (
        <div className="space-y-3">
          {allNotifs.map((n, i) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className={`card-3d p-4 flex items-start gap-4 ${!n.read ? 'holo-border' : 'opacity-60'}`}
            >
              <span className="text-xl mt-0.5">{typeIcon[n.type] || '🔔'}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm">{n.message}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary" className="text-[10px] rounded-lg">{n.type}</Badge>
                  <span className="text-[10px] text-muted-foreground">{formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}</span>
                </div>
              </div>
              {!n.read && <div className="w-2.5 h-2.5 rounded-full bg-primary mt-2 shrink-0 shadow-[0_0_8px_hsl(var(--primary)/0.5)]" />}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
