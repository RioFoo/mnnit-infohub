import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ACADEMIC_NOTIFICATIONS } from '@/data/infohub-data';

import { Button } from '@/components/ui/button';
import { CheckCheck, LogIn, Bell } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

interface Notification {
  id: string; type: string; message: string; read: boolean; link: string | null; created_at: string;
}

const typeBorderColors: Record<string, string> = {
  LIKE: 'border-l-2 border-l-primary',
  COMMENT: 'border-l-2 border-l-secondary',
  FOLLOW: 'border-l-2 border-l-accent',
  SYSTEM: 'border-l-2 border-l-accent',
};

const typeIcon: Record<string, string> = { LIKE: '❤️', COMMENT: '💬', FOLLOW: '👤', SYSTEM: '📢' };

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05, delayChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, x: -16 },
  show: { opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } }
};

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

  if (!user) {
    return (
      <div className="page-container flex items-center justify-center min-h-[60vh]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, filter: 'blur(8px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="card-bio glow-border p-12 text-center max-w-sm"
        >
          <div className="w-16 h-16 rounded-full bg-primary/[0.06] flex items-center justify-center mx-auto mb-5 breathe">
            <Bell className="w-7 h-7 text-primary/40" />
          </div>
          <h2 className="text-lg font-display font-bold">Sign in to view alerts</h2>
          <Button onClick={() => navigate('/auth')} className="gap-2 rounded-xl btn-bio mt-6">
            <LogIn className="w-4 h-4" /> Sign In
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="page-container max-w-2xl">
      <PageHeader title="ALERTS">
        <Button variant="ghost" size="sm" onClick={markAllRead} className="text-xs font-mono rounded-xl">
          <CheckCheck className="w-4 h-4 mr-1" /> Mark all read
        </Button>
      </PageHeader>

      {allNotifs.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-14 h-14 rounded-full bg-primary/[0.06] flex items-center justify-center mx-auto mb-4 breathe">
            <Bell className="w-6 h-6 text-primary/30" />
          </div>
          <p className="text-sm font-display text-muted-foreground">All caught up</p>
        </div>
      ) : (
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-2">
          {allNotifs.map((n) => (
            <motion.div
              key={n.id}
              variants={itemVariants}
              className={`float-card p-4 flex items-start gap-3.5 ${typeBorderColors[n.type] || ''} ${!n.read ? 'bg-primary/[0.02]' : 'opacity-50'}`}
            >
              <span className="text-base mt-0.5">{typeIcon[n.type] || '🔔'}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm">{n.message}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="tag-pill text-[9px]">{n.type}</span>
                  <span className="text-[10px] font-mono text-muted-foreground/40">{formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}</span>
                </div>
              </div>
              {!n.read && <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0 shadow-[0_0_6px_hsl(var(--primary)/0.5)]" />}
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default Notifications;
