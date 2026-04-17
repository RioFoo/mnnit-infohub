import { Outlet, useLocation, useNavigate, NavLink as RouterNavLink } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import BioBackground from '@/components/BioBackground';
import { Home, Compass, CalendarDays, Bell, LogIn, MoreHorizontal, GraduationCap } from 'lucide-react';
import InfoHubLogo from '@/components/InfoHubLogo';
import { useState, useEffect } from 'react';
import { CommandPalette } from '@/components/CommandPalette';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { MobileMoreDrawer } from '@/components/MobileMoreDrawer';
import CreatePostDialog from '@/components/feed/CreatePostDialog';
import Footer from '@/components/Footer';
import RouteProgressBar from '@/components/RouteProgressBar';
import { KeyboardShortcutsDialog } from '@/components/KeyboardShortcutsDialog';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { prefetchRoute } from '@/lib/routePrefetch';

const mobileNavItems = [
  { title: 'Feed', url: '/', icon: Home },
  { title: 'Explore', url: '/explore', icon: Compass },
  { title: 'Schedule', url: '/timetable', icon: CalendarDays },
  { title: 'Campus', url: '/campus', icon: GraduationCap },
];

// No page transition animation — instant navigation

const MobileNavItem = ({ item }: { item: (typeof mobileNavItems)[number] }) => {
  const location = useLocation();
  const isActive = item.url === '/' ? location.pathname === '/' : location.pathname.startsWith(item.url);

  return (
    <RouterNavLink
      to={item.url}
      end={item.url === '/'}
      onTouchStart={() => prefetchRoute(item.url)}
      onMouseEnter={() => prefetchRoute(item.url)}
      className={cn(
        'relative flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all duration-200 group min-w-[48px] min-h-[44px] justify-center',
        isActive
          ? 'text-primary'
          : 'text-muted-foreground/60 hover:text-foreground active:scale-95'
      )}
    >
      {isActive && (
        <motion.div
          layoutId="mobile-pill"
          className="absolute inset-0 rounded-xl bg-primary/[0.08] border border-primary/15"
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        />
      )}
      <item.icon className={cn(
        'w-5 h-5 shrink-0 relative z-10 transition-all duration-200',
        isActive && 'drop-shadow-[0_0_8px_hsl(var(--primary)/0.5)]'
      )} />
      <span className={cn(
        'text-[9px] font-mono relative z-10 transition-colors duration-200 leading-none',
        isActive ? 'font-semibold' : 'group-hover:text-foreground/70'
      )}>
        {item.title}
      </span>
    </RouterNavLink>
  );
};

const AppLayout = () => {
  const [commandOpen, setCommandOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  useKeyboardShortcuts(() => setShortcutsOpen(true));

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['unread-notifications-count-mobile', user?.id],
    queryFn: async () => {
      if (!user) return 0;
      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('read', false);
      return count || 0;
    },
    enabled: !!user,
    refetchInterval: 30000,
  });

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full relative">
        <RouteProgressBar />
        <BioBackground />

        {/* Desktop/Tablet sidebar - hidden on mobile */}
        <div className="hidden md:block relative z-20">
          <AppSidebar onOpenCommand={() => setCommandOpen(true)} />
        </div>

        <div className="flex-1 flex flex-col min-h-screen relative z-10">
          {/* Mobile Top Bar - only on mobile */}
          <header className="md:hidden h-12 flex items-center justify-between px-3 sticky top-0 z-40 glass-panel border-b border-border/[0.06]">
            <div className="flex items-center gap-2.5">
              <InfoHubLogo size={26} />
              <span className="font-display font-bold text-sm tracking-tight brand-text-3d">INFOHUB</span>
            </div>
            <div className="flex items-center gap-1.5">
              {!user && (
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={() => navigate('/auth')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-all btn-bio"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Sign In
                </motion.button>
              )}
              {user && (
                <>
                  <button
                    onClick={() => navigate('/notifications')}
                    onTouchStart={() => prefetchRoute('/notifications')}
                    onMouseEnter={() => prefetchRoute('/notifications')}
                    className="relative p-2 rounded-lg hover:bg-muted/10 transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center"
                  >
                    <Bell className="w-5 h-5 text-muted-foreground" />
                    {unreadCount > 0 && (
                      <Badge className="absolute -top-0.5 -right-0.5 text-[8px] h-4 min-w-[16px] px-1 bg-destructive/80 text-destructive-foreground border-none font-mono justify-center shadow-[0_0_8px_hsl(var(--destructive)/0.3)]">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </Badge>
                    )}
                  </button>
                  <button
                    onClick={() => navigate('/profile')}
                    onTouchStart={() => prefetchRoute('/profile')}
                    onMouseEnter={() => prefetchRoute('/profile')}
                    className="p-1 rounded-full hover:ring-2 hover:ring-primary/20 transition-all min-w-[36px] min-h-[36px] flex items-center justify-center"
                  >
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="" className="w-7 h-7 rounded-full object-cover" />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-bold">
                        {(profile?.name || 'U')[0].toUpperCase()}
                      </div>
                    )}
                  </button>
                </>
              )}
            </div>
          </header>

          {/* Desktop Header */}
          <header className="hidden md:flex h-12 items-center justify-between px-4 md:px-6 sticky top-0 z-40 glass-panel border-b border-border/[0.06]">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="text-muted-foreground hover:text-primary transition-colors" />
            </div>
            <div className="flex items-center gap-2">
              {!user && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => navigate('/auth')}
                  className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-all btn-bio"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </motion.button>
              )}
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 pb-24 md:pb-0 relative z-10">
            <Outlet />
          </main>

          <div className="hidden md:block">
            <Footer />
          </div>

          {/* Mobile FAB - Create Post */}
          {user && (
            <motion.button
              onClick={() => setCreateOpen(true)}
              className="md:hidden fixed right-4 bottom-20 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-[0_0_20px_hsl(var(--primary)/0.4),0_4px_16px_rgba(0,0,0,0.3)] active:scale-95 transition-transform"
              whileTap={{ scale: 0.9 }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </motion.button>
          )}

          {/* Mobile Bottom Nav */}
          <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50">
            <div className="glass-panel border-t border-border/[0.06] px-1 py-1 pb-[max(0.375rem,env(safe-area-inset-bottom))]">
              <div className="flex items-center justify-around max-w-md mx-auto">
                {mobileNavItems.map((item) => (
                  <MobileNavItem key={item.url} item={item} />
                ))}
                {/* More button */}
                <button
                  onClick={() => setMoreOpen(true)}
                  className={cn(
                    'relative flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all duration-200 min-w-[48px] min-h-[44px] justify-center',
                    moreOpen ? 'text-primary' : 'text-muted-foreground/60 active:scale-95'
                  )}
                >
                  <MoreHorizontal className="w-5 h-5 shrink-0" />
                  <span className="text-[9px] font-mono leading-none">More</span>
                </button>
              </div>
            </div>
          </nav>
        </div>
      </div>

      <MobileMoreDrawer open={moreOpen} onOpenChange={setMoreOpen} />
      <CreatePostDialog open={createOpen} onOpenChange={setCreateOpen} onCreated={() => {}} />
      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
      <KeyboardShortcutsDialog open={shortcutsOpen} onOpenChange={setShortcutsOpen} />
    </SidebarProvider>
  );
};

export default AppLayout;
