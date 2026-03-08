import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';


import { Button } from '@/components/ui/button';
import { CheckCheck, LogIn, Bell, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageHeader } from '@/components/PageHeader';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { playNotificationAlert } from '@/lib/notificationAlert';

interface Notification {
  id: string; type: string; message: string; read: boolean; link: string | null; created_at: string;
}

const typeBorderColors: Record<string, string> = {
  LIKE: 'border-l-2 border-l-primary',
  COMMENT: 'border-l-2 border-l-secondary',
  FOLLOW: 'border-l-2 border-l-accent',
  FOLLOW_POST: 'border-l-2 border-l-primary/50',
  FAVOURITE_POST: 'border-l-2 border-l-yellow-500',
  SYSTEM: 'border-l-2 border-l-accent',
};

const typeIcon: Record<string, string> = {
  LIKE: '❤️', COMMENT: '💬', FOLLOW: '👤', FOLLOW_POST: '📝', FAVOURITE_POST: '⭐', SYSTEM: '📢',
};

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05, delayChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, x: -16 },
  show: { opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } }
};

// Only show post and library related notifications
const RELEVANT_TYPES = ['FOLLOW_POST', 'FAVOURITE_POST', 'LIKE', 'COMMENT', 'FOLLOW'];

const Notifications = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchNotifications = async () => {
      const { data } = await (supabase.from as any)('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (data) setNotifications(data as Notification[]);
      setLoading(false);
    };
    fetchNotifications();

    // Real-time subscription
    const channel = supabase
      .channel('notifications-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newNotif = payload.new as Notification;
          setNotifications(prev => [newNotif, ...prev]);
          playNotificationAlert();
          toast(typeIcon[newNotif.type] || '🔔', {
            description: newNotif.message,
            duration: 4000,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const markAllRead = async () => {
    if (!user) return;
    await (supabase.from as any)('notifications').update({ read: true }).eq('user_id', user.id);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Filter to relevant types and sort favourites on top
  const filtered = notifications
    .filter(n => RELEVANT_TYPES.includes(n.type))
    .sort((a, b) => {
      if (a.type === 'FAVOURITE_POST' && b.type !== 'FAVOURITE_POST') return -1;
      if (b.type === 'FAVOURITE_POST' && a.type !== 'FAVOURITE_POST') return 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  const unreadCount = filtered.filter(n => !n.read).length;

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
          <h2 className="text-lg font-display font-bold">Sign in to view notifications</h2>
          <Button onClick={() => navigate('/auth')} className="gap-2 rounded-xl btn-bio mt-6">
            <LogIn className="w-4 h-4" /> Sign In
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="page-container max-w-2xl">
      <PageHeader title="NOTIFICATIONS">
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={markAllRead} className="text-xs font-mono rounded-xl">
            <CheckCheck className="w-4 h-4 mr-1" /> Mark all read
          </Button>
        )}
      </PageHeader>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-14 h-14 rounded-full bg-primary/[0.06] flex items-center justify-center mx-auto mb-4 breathe">
            <Bell className="w-6 h-6 text-primary/30" />
          </div>
          <p className="text-sm font-display text-muted-foreground">All caught up</p>
          <p className="text-[10px] font-mono text-muted-foreground/40 mt-1">Post & library notifications will appear here</p>
        </div>
      ) : (
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-2">
          {filtered.map((n) => (
            <motion.div
              key={n.id}
              variants={itemVariants}
              onClick={() => n.link && navigate(n.link)}
              className={`float-card p-4 flex items-start gap-3.5 cursor-pointer hover:bg-muted/5 transition-colors ${typeBorderColors[n.type] || ''} ${!n.read ? 'bg-primary/[0.02]' : 'opacity-50'}`}
            >
              <span className="text-base mt-0.5">{typeIcon[n.type] || '🔔'}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm">{n.message}</p>
                  {n.type === 'FAVOURITE_POST' && (
                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500 shrink-0" />
                  )}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="tag-pill text-[9px]">
                    {n.type === 'FAVOURITE_POST' ? 'FAVOURITE' : n.type === 'FOLLOW_POST' ? 'POST' : n.type}
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground/40">
                    {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                  </span>
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
