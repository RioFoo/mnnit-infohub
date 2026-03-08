import { Outlet, useLocation, useNavigate, NavLink as RouterNavLink } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import BioBackground from '@/components/BioBackground';
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

const pageVariants = {
  initial: { opacity: 0, y: 24, scale: 0.98, filter: 'blur(6px)' },
  enter: {
    opacity: 1, y: 0, scale: 1, filter: 'blur(0px)',
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const }
  },
  exit: {
    opacity: 0, y: -16, scale: 1.01, filter: 'blur(4px)',
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] as const }
  }
};

const MobileNavItem = ({ item }: { item: (typeof mobileNavItems)[number] }) => {
  const location = useLocation();
  const isActive = item.url === '/' ? location.pathname === '/' : location.pathname.startsWith(item.url);

  return (
    <RouterNavLink
      to={item.url}
      end={item.url === '/'}
      className="relative flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl transition-all duration-300 min-w-[52px]"
    >
      {isActive && (
        <motion.div
          layoutId="mobile-pill"
          className="absolute inset-0 rounded-xl"
          style={{ background: 'hsl(var(--primary) / 0.08)' }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        />
      )}
      <item.icon className={cn(
        'w-5 h-5 transition-all duration-200 relative z-10',
        isActive ? 'text-primary drop-shadow-[0_0_8px_hsl(var(--primary)/0.5)]' : 'text-muted-foreground'
      )} />
      <span className={cn(
        'text-[9px] font-mono relative z-10 transition-colors duration-200',
        isActive ? 'text-primary' : 'text-muted-foreground/50'
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
        <BioBackground />

        <div className="hidden md:block relative z-20">
          <AppSidebar onOpenCommand={() => setCommandOpen(true)} />
        </div>

        <div className="flex-1 flex flex-col min-h-screen relative z-10">
          {/* Header */}
          <header className="h-12 flex items-center justify-between px-4 md:px-6 sticky top-0 z-40 glass-panel border-b border-border/[0.06]">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="hidden md:flex text-muted-foreground hover:text-primary transition-colors" />
              <div className="md:hidden flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center">
                  <span className="text-primary text-xs font-bold font-display">◈</span>
                </div>
                <span className="font-display font-bold text-sm tracking-tight">INFOHUB</span>
              </div>
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
                  <span className="hidden sm:inline">Sign In</span>
                </motion.button>
              )}
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 pb-20 md:pb-0 relative z-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                variants={pageVariants}
                initial="initial"
                animate="enter"
                exit="exit"
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </main>

          {/* Mobile Nav */}
          <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50">
            <div className="glass-panel border-t border-border/[0.06] px-2 py-1 pb-[max(0.375rem,env(safe-area-inset-bottom))]">
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
