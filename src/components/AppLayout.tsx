import { Outlet, useLocation, useNavigate, NavLink as RouterNavLink } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { Home, Compass, CalendarDays, Bell, User, LogIn } from 'lucide-react';
import { useState, useEffect } from 'react';
import { CommandPalette } from '@/components/CommandPalette';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

const mobileNavItems = [
  { title: 'Feed', url: '/', icon: Home },
  { title: 'Explore', url: '/explore', icon: Compass },
  { title: 'Calendar', url: '/calendar', icon: CalendarDays },
  { title: 'Alerts', url: '/notifications', icon: Bell },
  { title: 'Profile', url: '/profile', icon: User },
];

const MobileNavItem = ({ item }: { item: (typeof mobileNavItems)[number] }) => {
  const location = useLocation();
  const isActive = item.url === '/' ? location.pathname === '/' : location.pathname.startsWith(item.url);

  return (
    <RouterNavLink
      to={item.url}
      end={item.url === '/'}
      className="relative flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-300 min-w-[56px]"
    >
      {isActive && (
        <motion.div
          layoutId="mobile-pill"
          className="absolute inset-0 rounded-xl bg-primary/10"
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        />
      )}
      <item.icon className={cn(
        'w-5 h-5 transition-all duration-200 relative z-10',
        isActive ? 'text-primary' : 'text-muted-foreground'
      )} />
      <span className={cn(
        'text-[10px] font-medium relative z-10 transition-colors duration-200',
        isActive ? 'text-primary' : 'text-muted-foreground/60'
      )}>
        {item.title}
      </span>
    </RouterNavLink>
  );
};

const AppLayout = () => {
  const [commandOpen, setCommandOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

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
        {/* Ambient background */}
        <div className="ambient-bg" />
        <div className="dot-grid" />
        <div className="noise-bg" />

        <div className="hidden md:block relative z-20">
          <AppSidebar onOpenCommand={() => setCommandOpen(true)} />
        </div>

        <div className="flex-1 flex flex-col min-h-screen relative z-10">
          {/* Header */}
          <header className="h-14 flex items-center justify-between px-4 md:px-6 sticky top-0 z-40 glass-panel border-b border-border/20">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="hidden md:flex text-muted-foreground hover:text-foreground transition-colors" />
              <div className="md:hidden flex items-center gap-2.5">
                <img src="/src/assets/infohub-logo.png" alt="InfoHub" className="w-7 h-7 rounded-lg" />
                <span className="font-semibold text-sm tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>InfoHub</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!user && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/auth')}
                  className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-all btn-premium"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sign In</span>
                </motion.button>
              )}
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 pb-24 md:pb-0 relative z-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </main>

          {/* Mobile Nav */}
          <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50">
            <div className="glass-panel border-t border-border/20 px-2 py-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))]">
              <div className="flex items-center justify-around max-w-sm mx-auto">
                {mobileNavItems.map((item) => (
                  <MobileNavItem key={item.url} item={item} />
                ))}
              </div>
            </div>
          </nav>
        </div>
      </div>

      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
    </SidebarProvider>
  );
};

export default AppLayout;
