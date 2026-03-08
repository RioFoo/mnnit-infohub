import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ACADEMIC_NOTIFICATIONS } from '@/data/infohub-data';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, CheckCheck, LogIn, Activity, AlertTriangle, Wifi } from 'lucide-react';
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
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="holo-card holo-border p-12 text-center max-w-sm">
          <div className="w-20 h-20 rounded-xl bg-primary/8 flex items-center justify-center mx-auto mb-5 neon-border">
            <Wifi className="w-9 h-9 text-primary/60" />
          </div>
          <h2 className="text-lg font-display font-bold tracking-wider">CONNECT FIRST</h2>
          <p className="text-muted-foreground text-sm mt-2 mb-6">Authenticate to receive signals.</p>
          <Button onClick={() => navigate('/auth')} className="gap-2 rounded-lg btn-neon font-display tracking-wider text-xs uppercase">
            <LogIn className="w-4 h-4" /> Authenticate
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="page-container max-w-2xl">
      {/* ═══ HEADER ═══ */}
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="relative mb-10">
        <div className="absolute -left-4 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-destructive/30 to-transparent" />
        
        <div className="flex items-end justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-destructive/10 flex items-center justify-center border border-destructive/20 relative">
              <AlertTriangle className="w-6 h-6 text-destructive" />
              <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-destructive border-2 border-background animate-pulse"
                style={{ boxShadow: '0 0 8px hsl(var(--destructive) / 0.6)' }} />
            </div>
            <div>
              <span className="section-title mb-0">Signal Intercept</span>
              <h1 className="text-3xl font-display font-bold tracking-wider">
                <span className="text-foreground">ALERT</span>{' '}
                <span className="gradient-text">CENTER</span>
              </h1>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={markAllRead} className="text-[10px] rounded-lg font-display tracking-wider uppercase">
            <CheckCheck className="w-4 h-4 mr-1" /> Clear All
          </Button>
        </div>
        <div className="cyber-line mt-4" />
      </motion.div>

      {/* ═══ NOTIFICATIONS ═══ */}
      {allNotifs.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-xl bg-muted/20 flex items-center justify-center mx-auto mb-4">
            <Activity className="w-8 h-8 text-muted-foreground/30" />
          </div>
          <p className="text-muted-foreground font-display tracking-wider">No signals detected.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {allNotifs.map((n, i) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04, duration: 0.4 }}
              className={`holo-card p-4 flex items-start gap-4 ${!n.read ? '' : 'opacity-50'}`}
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
