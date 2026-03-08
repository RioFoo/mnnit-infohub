import { Outlet, useLocation, useNavigate, NavLink as RouterNavLink } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { Home, Compass, CalendarDays, Bell, User, LogIn, Menu } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { CommandPalette } from '@/components/CommandPalette';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

const mobileNavItems = [
{ title: 'Feed', url: '/', icon: Home },
{ title: 'Explore', url: '/explore', icon: Compass },
{ title: 'Calendar', url: '/calendar', icon: CalendarDays },
{ title: 'Alerts', url: '/notifications', icon: Bell },
{ title: 'Profile', url: '/profile', icon: User }];


const MobileNavItem = ({ item }: {item: (typeof mobileNavItems)[number];}) => {
  const location = useLocation();
  const isActive = item.url === '/' ? location.pathname === '/' : location.pathname.startsWith(item.url);

  return (
    <RouterNavLink
      to={item.url}
      end={item.url === '/'}
      className="relative flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg transition-all duration-300">
      
      {isActive &&
      <motion.div
        layoutId="mobile-active"
        className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-primary"
        style={{ boxShadow: '0 0 12px hsl(var(--neon-cyan) / 0.8), 0 0 30px hsl(var(--neon-cyan) / 0.3)' }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }} />

      }
      <motion.div
        whileTap={{ scale: 0.7, rotateY: 180 }}
        transition={{ type: 'spring', stiffness: 400 }}
        className="relative z-10">
        
        <item.icon className={cn(
          'w-5 h-5 transition-all duration-300',
          isActive ?
          'text-primary drop-shadow-[0_0_8px_hsl(var(--neon-cyan)/0.7)]' :
          'text-muted-foreground'
        )} />
      </motion.div>
      <span className={cn(
        'text-[8px] font-display uppercase tracking-wider relative z-10',
        isActive ? 'text-primary' : 'text-muted-foreground/60'
      )}>
        {item.title}
      </span>
      {isActive &&
      <motion.div
        layoutId="mobile-bg"
        className="absolute inset-0 rounded-lg bg-primary/5"
        transition={{ type: 'spring', stiffness: 400, damping: 30 }} />

      }
    </RouterNavLink>);

};

const AppLayout = () => {
  const [commandOpen, setCommandOpen] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 30 });
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
    const x = (e.clientX - rect.left) / rect.width * 100;
    const y = (e.clientY - rect.top) / rect.height * 100;
    setMousePos({ x, y });
  }, []);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full relative">
        {/* ═══ SPACE BACKGROUND LAYERS ═══ */}
        <div className="starfield" />
        <div className="aurora-bg" />
        <div className="floating-orbs">
          <div className="orb" />
          <div className="orb" />
          <div className="orb" />
        </div>
        <div className="fixed inset-0 grid-bg pointer-events-none z-0" />
        <div className="scanline-overlay" />
        <div className="noise-bg" />

        {/* ═══ CURSOR SPOTLIGHT ═══ */}
        <div
          className="fixed inset-0 pointer-events-none z-[1] transition-all duration-1000"
          style={{
            background: `radial-gradient(ellipse 600px 400px at ${mousePos.x}% ${mousePos.y}%, hsl(var(--neon-cyan) / 0.04), transparent)`
          }} />
        

        <div className="hidden md:block relative z-20">
          <AppSidebar onOpenCommand={() => setCommandOpen(true)} />
        </div>

        <div
          className="flex-1 flex flex-col min-h-screen relative z-10"
          onMouseMove={handleMouseMove}>
          
          {/* ═══ HEADER - HUD BAR ═══ */}
          <header className="h-14 flex items-center justify-between px-5 sticky top-0 z-40 glass-panel border-b border-border/30">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="hidden md:flex text-muted-foreground hover:text-primary transition-colors" />
              <div className="md:hidden flex items-center gap-2.5">
                <div className="relative">
                  <img src="/src/assets/infohub-logo.png" alt="InfoHub" className="w-7 h-7" />
                  <div className="absolute inset-0 rounded-full bg-primary/30 blur-md -z-10" />
                </div>
                <span className="font-display font-bold text-sm gradient-text tracking-wider">INFOHUB</span>
              </div>
            </div>

            {/* HUD Status */}
            <div className="hidden md:flex items-center gap-4 text-[9px] font-mono text-muted-foreground/50 uppercase tracking-widest">
              
              <span>v2.0</span>
            </div>

            <div className="flex items-center gap-3">
              {!user &&
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/auth')}
                className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold font-display tracking-wider uppercase bg-primary/10 text-primary hover:bg-primary/20 transition-all btn-neon border border-primary/20">
                
                  <LogIn className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Login</span>
                </motion.button>
              }
            </div>
          </header>

          {/* ═══ MAIN CONTENT ═══ */}
          <main className="flex-1 pb-24 md:pb-0 relative z-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 30, scale: 0.98, rotateX: -3 }}
                animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
                exit={{ opacity: 0, y: -20, scale: 0.97, filter: 'blur(4px)' }}
                transition={{ duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
                style={{ transformOrigin: 'top center', perspective: '1200px' }}>
                
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </main>

          {/* ═══ MOBILE NAV - FLOATING HUD ═══ */}
          <nav className="md:hidden fixed bottom-4 left-3 right-3 z-50">
            <motion.div
              initial={{ y: 120, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, type: 'spring', stiffness: 300, damping: 25 }}
              className="glass-panel rounded-2xl px-1 py-2 mx-auto max-w-sm border border-primary/10"
              style={{
                boxShadow: '0 -5px 40px hsl(var(--neon-cyan) / 0.08), 0 10px 40px hsl(0 0% 0% / 0.4)'
              }}>
              
              <div className="flex items-center justify-around">
                {mobileNavItems.map((item) =>
                <MobileNavItem key={item.url} item={item} />
                )}
              </div>
            </motion.div>
          </nav>
        </div>
      </div>

      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
    </SidebarProvider>);

};

export default AppLayout;