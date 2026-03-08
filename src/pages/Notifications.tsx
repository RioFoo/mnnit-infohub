import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ACADEMIC_NOTIFICATIONS } from '@/data/infohub-data';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, Check, CheckCheck, LogIn } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

interface Notification {
  id: string;
  type: string;
  message: string;
  read: boolean;
  link: string | null;
  created_at: string;
}

const Notifications = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const systemNotices = ACADEMIC_NOTIFICATIONS.slice(0, 3).map(n => ({
    id: `sys-${n.id}`,
    type: 'SYSTEM',
    message: n.title,
    read: false,
    link: n.link,
    created_at: new Date().toISOString(),
  }));

  useEffect(() => {
    const fetch = async () => {
      if (!user) return;
      const { data } = await (supabase.from as any)('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
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
      <div className="max-w-2xl mx-auto p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-xl p-8 text-center space-y-4">
          <Bell className="w-10 h-10 text-primary mx-auto" />
          <h2 className="text-xl font-mono font-bold">Notifications</h2>
          <p className="text-muted-foreground text-sm">Sign in to see your notifications and stay updated.</p>
          <Button onClick={() => navigate('/auth')} className="gap-2"><LogIn className="w-4 h-4" /> Sign In</Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-mono font-bold text-primary flex items-center gap-2">
          <Bell className="w-6 h-6" /> Notifications
        </h1>
        <Button variant="ghost" size="sm" onClick={markAllRead} className="text-xs">
          <CheckCheck className="w-4 h-4 mr-1" /> Mark all read
        </Button>
      </div>

      {allNotifs.length === 0 ? (
        <p className="text-center py-12 text-muted-foreground">No notifications yet.</p>
      ) : (
        allNotifs.map((n, i) => (
          <motion.div key={n.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
            className={`glass rounded-lg p-3 flex items-start gap-3 ${!n.read ? 'border-l-2 border-primary' : 'opacity-70'}`}>
            <span className="text-lg">{typeIcon[n.type] || '🔔'}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm">{n.message}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-[10px]">{n.type}</Badge>
                <span className="text-[10px] text-muted-foreground">{formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}</span>
              </div>
            </div>
            {!n.read && <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />}
          </motion.div>
        ))
      )}
    </div>
  );
};

export default Notifications;
