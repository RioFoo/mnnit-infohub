import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { Home, Compass, CalendarDays, Bell, User, LogIn, Menu } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useState, useEffect, useCallback } from 'react';
import { CommandPalette } from '@/components/CommandPalette';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';

const mobileNavItems = [
  { title: 'Feed', url: '/', icon: Home },
  { title: 'Explore', url: '/explore', icon: Compass },
  { title: 'Calendar', url: '/calendar', icon: CalendarDays },
  { title: 'Alerts', url: '/notifications', icon: Bell },
  { title: 'Profile', url: '/profile', icon: User },
];

const AppLayout = () => {
  const [commandOpen, setCommandOpen] = useState(false);
  const [mousePos, setMousePos] = useState({ x: '50%', y: '30%' });
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

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x: `${x}%`, y: `${y}%` });
  }, []);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full noise-bg">
        <div className="hidden md:block">
          <AppSidebar onOpenCommand={() => setCommandOpen(true)} />
        </div>

        <div
          className="flex-1 flex flex-col min-h-screen relative"
          onMouseMove={handleMouseMove}
        >
          {/* Spotlight follow cursor */}
          <div
            className="fixed inset-0 pointer-events-none z-0 transition-all duration-700"
            style={{
              background: `radial-gradient(ellipse 800px 500px at ${mousePos.x} ${mousePos.y}, hsl(var(--primary) / 0.04), transparent)`,
            }}
          />

          {/* Grid background */}
          <div className="fixed inset-0 grid-bg pointer-events-none z-0" />

          {/* Header */}
          <header className="h-14 flex items-center justify-between px-5 sticky top-0 z-40 glass-float border-b border-border/50">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="hidden md:flex text-muted-foreground hover:text-primary transition-colors" />
              <div className="md:hidden flex items-center gap-2">
                <img src="/src/assets/infohub-logo.png" alt="InfoHub" className="w-7 h-7" />
                <span className="font-mono font-bold text-sm gradient-text">InfoHub</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {!user && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/auth')}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-all btn-glow"
                >
                  <LogIn className="w-4 h-4" />
                  <span className="hidden sm:inline">Sign In</span>
                </motion.button>
              )}
            </div>
          </header>

          {/* Main content */}
          <main className="flex-1 pb-20 md:pb-0 relative z-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 20, rotateX: -2 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
                style={{ transformOrigin: 'top center' }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </main>

          {/* Mobile bottom nav — floating pill */}
          <nav className="md:hidden fixed bottom-4 left-4 right-4 z-50">
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 300, damping: 25 }}
              className="glass-float rounded-2xl px-2 py-2 mx-auto max-w-sm"
            >
              <div className="flex items-center justify-around">
                {mobileNavItems.map((item) => (
                  <MobileNavItem key={item.url} item={item} />
                ))}
              </div>
            </motion.div>
          </nav>
        </div>
      </div>

      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
    </SidebarProvider>
  );
};

export default AppLayout;
