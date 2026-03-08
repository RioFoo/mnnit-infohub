import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ACADEMIC_NOTIFICATIONS } from '@/data/infohub-data';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCheck, LogIn, Activity, Wifi } from 'lucide-react';
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
  const typeIcon: Record<string, any> = {
    LIKE: '❤️', COMMENT: '💬', FOLLOW: '👤', SYSTEM: '📡'
  };

  if (!user) {
    return (
      <div className="page-container flex items-center justify-center min-h-[60vh]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, rotateY: -10 }}
          animate={{ opacity: 1, scale: 1, rotateY: 0 }}
          className="card-3d-pro p-12 text-center max-w-sm"
          style={{ perspective: '800px' }}
        >
          <div className="w-20 h-20 rounded-xl bg-primary/8 flex items-center justify-center mx-auto mb-5 neon-border">
            <Wifi className="w-9 h-9 text-primary/60" />
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
      <motion.div
        initial={{ opacity: 0, y: 20, rotateX: -5 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 200 }}
        className="flex items-center justify-between mb-8"
        style={{ perspective: '800px' }}
      >
        <h1 className="text-3xl page-header-3d">ALERTS</h1>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button variant="ghost" size="sm" onClick={markAllRead} className="text-[10px] rounded-xl font-display tracking-wider uppercase">
            <CheckCheck className="w-4 h-4 mr-1" /> Clear
          </Button>
        </motion.div>
      </motion.div>

      {allNotifs.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-xl bg-muted/20 flex items-center justify-center mx-auto mb-4">
            <Activity className="w-8 h-8 text-muted-foreground/30" />
          </div>
          <p className="text-muted-foreground font-display tracking-wider text-sm">No alerts</p>
        </div>
      ) : (
        <div className="space-y-3">
          {allNotifs.map((n, i) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: -25, rotateY: -5 }}
              animate={{ opacity: 1, x: 0, rotateY: 0 }}
              transition={{ delay: i * 0.04, type: 'spring', stiffness: 300 }}
              whileHover={{ x: 4, rotateY: 1 }}
              className={`card-3d-pro p-4 flex items-start gap-4 ${!n.read ? '' : 'opacity-50'}`}
              style={{ perspective: '600px' }}
            >
              <span className="text-lg mt-0.5">{typeIcon[n.type] || '🔔'}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm">{n.message}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary" className="text-[9px] rounded-md font-display tracking-wider">{n.type}</Badge>
                  <span className="text-[9px] text-muted-foreground font-mono">{formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}</span>
                </div>
              </div>
              {!n.read && <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0 pulse-glow" />}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
