import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { Home, Search, CalendarDays, Bell, User, LogIn } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useState, useEffect } from 'react';
import { CommandPalette } from '@/components/CommandPalette';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';

const mobileNavItems = [
  { title: 'Feed', url: '/', icon: Home },
  { title: 'Explore', url: '/explore', icon: Search },
  { title: 'Calendar', url: '/calendar', icon: CalendarDays },
  { title: 'Alerts', url: '/notifications', icon: Bell },
  { title: 'Profile', url: '/profile', icon: User },
];

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
      <div className="min-h-screen flex w-full">
        <div className="hidden md:block">
          <AppSidebar onOpenCommand={() => setCommandOpen(true)} />
        </div>

        <div className="flex-1 flex flex-col min-h-screen">
          <header className="h-12 flex items-center justify-between border-b border-border px-4 bg-background/80 backdrop-blur-sm sticky top-0 z-40">
            <div className="flex items-center">
              <SidebarTrigger className="mr-2 hidden md:flex" />
              <span className="font-mono font-bold text-primary md:hidden">InfoHub</span>
            </div>
            {!user && (
              <button
                onClick={() => navigate('/auth')}
                className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              >
                <LogIn className="w-4 h-4" />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}
          </header>

          <main className="flex-1 pb-16 md:pb-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </main>

          {/* Mobile bottom nav */}
          <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-lg border-t border-border">
            <div className="flex items-center justify-around h-14">
              {mobileNavItems.map(item => (
                <NavLink
                  key={item.url}
                  to={item.url}
                  end={item.url === '/'}
                  className="flex flex-col items-center gap-0.5 p-2 text-muted-foreground transition-colors"
                  activeClassName="text-primary"
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-[10px]">{item.title}</span>
                </NavLink>
              ))}
            </div>
          </nav>
        </div>
      </div>

      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
    </SidebarProvider>
  );
};

export default AppLayout;
