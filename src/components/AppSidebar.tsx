import {
  Home, Compass, GraduationCap, CalendarDays, Clock, Calculator,
  BookOpen, Bell, User, Settings, LogOut, LogIn, Search, Sparkles
} from 'lucide-react';
import infohubLogo from '@/assets/infohub-logo.png';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter, useSidebar,
} from '@/components/ui/sidebar';
import { motion } from 'framer-motion';
import { NavLink as RouterNavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';

const navItems = [
  { title: 'Feed', url: '/', icon: Home },
  { title: 'Explore', url: '/explore', icon: Compass },
  { title: 'Campus', url: '/campus', icon: GraduationCap },
  { title: 'Calendar', url: '/calendar', icon: CalendarDays },
  { title: 'Timetable', url: '/timetable', icon: Clock },
  { title: 'Grades', url: '/grades', icon: Calculator },
  { title: 'Resources', url: '/resources', icon: BookOpen },
  { title: 'Alerts', url: '/notifications', icon: Bell },
  { title: 'Profile', url: '/profile', icon: User },
];

interface AppSidebarProps {
  onOpenCommand?: () => void;
}

export function AppSidebar({ onOpenCommand }: AppSidebarProps) {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, profile, user } = useAuth();

  return (
    <Sidebar collapsible="icon" className="border-r border-border/50">
      {/* Brand */}
      <div className="p-4 flex items-center gap-3">
        <motion.div
          whileHover={{ rotate: 15, scale: 1.2 }}
          transition={{ type: 'spring', stiffness: 400 }}
          className="relative"
        >
          <img src={infohubLogo} alt="InfoHub" className="w-9 h-9 shrink-0" />
          <div className="absolute inset-0 rounded-full bg-primary/20 blur-lg -z-10" />
        </motion.div>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col"
          >
            <span className="font-mono font-bold text-lg gradient-text leading-tight">InfoHub</span>
            <span className="text-[9px] text-muted-foreground font-medium tracking-widest uppercase">Campus OS</span>
          </motion.div>
        )}
      </div>

      {/* Search trigger */}
      {!collapsed && (
        <div className="px-3 mb-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onOpenCommand}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-muted-foreground bg-muted/40 hover:bg-muted/60 transition-all border border-border/50 hover:border-primary/30"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="flex-1 text-left text-xs">Quick search...</span>
            <kbd className="text-[10px] bg-background/60 px-1.5 py-0.5 rounded-md border border-border/50 font-mono">⌘K</kbd>
          </motion.button>
        </div>
      )}

      <SidebarContent>
        <SidebarGroup>
          <div className="px-3 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-muted-foreground/60">Navigation</span>
          </div>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item, index) => {
                const isActive = item.url === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(item.url);

                return (
                  <SidebarMenuItem key={item.title}>
                    <motion.div
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03, duration: 0.3 }}
                      className="relative"
                    >
                      <SidebarMenuButton asChild>
                        <RouterNavLink
                          to={item.url}
                          end={item.url === '/'}
                          className={() => cn(
                            'relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-300 group overflow-hidden',
                            isActive
                              ? 'text-primary font-semibold'
                              : 'text-muted-foreground hover:text-foreground'
                          )}
                        >
                          {/* Active background */}
                          {isActive && (
                            <motion.div
                              layoutId="sidebar-active-bg"
                              className="absolute inset-0 rounded-xl"
                              style={{
                                background: 'linear-gradient(135deg, hsl(var(--primary) / 0.12), hsl(var(--primary) / 0.04))',
                                boxShadow: 'inset 0 1px 0 hsl(var(--primary) / 0.15)',
                              }}
                              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                            />
                          )}

                          {/* Icon container */}
                          <div className={cn(
                            'relative z-10 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300',
                            isActive
                              ? 'bg-primary text-primary-foreground shadow-[0_0_15px_hsl(var(--primary)/0.4)]'
                              : 'bg-muted/40 group-hover:bg-primary/15 group-hover:text-primary'
                          )}>
                            <item.icon className="h-4 w-4" />
                          </div>

                          {!collapsed && (
                            <span className="relative z-10">{item.title}</span>
                          )}

                          {item.title === 'Alerts' && !collapsed && (
                            <motion.div
                              animate={{ scale: [1, 1.1, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                              className="ml-auto relative z-10"
                            >
                              <Badge className="text-[10px] h-5 px-1.5 bg-destructive text-destructive-foreground border-none shadow-[0_0_10px_hsl(var(--destructive)/0.4)]">
                                3
                              </Badge>
                            </motion.div>
                          )}

                          {/* Hover shimmer */}
                          <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 shimmer pointer-events-none" />
                        </RouterNavLink>
                      </SidebarMenuButton>

                      {/* Active edge indicator */}
                      {isActive && (
                        <motion.div
                          layoutId="sidebar-edge"
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-primary"
                          style={{ boxShadow: '0 0 12px hsl(var(--primary) / 0.6), 2px 0 8px hsl(var(--primary) / 0.3)' }}
                          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        />
                      )}
                    </motion.div>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3 space-y-2">
        {/* User card */}
        {user && !collapsed && profile && (
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="flex items-center gap-3 p-3 rounded-xl card-3d cursor-pointer"
            onClick={() => navigate('/profile')}
          >
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.name || ''} className="w-9 h-9 rounded-lg object-cover ring-2 ring-primary/20" />
            ) : (
              <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center text-primary text-sm font-bold ring-2 ring-primary/30">
                {(profile.name || 'U')[0].toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{profile.name || 'User'}</p>
              <p className="text-[10px] text-muted-foreground truncate">{profile.branch} · {profile.section}</p>
            </div>
            <Sparkles className="w-3.5 h-3.5 text-primary/40" />
          </motion.div>
        )}

        <SidebarMenu>
          {user && (
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <RouterNavLink
                  to="/settings"
                  className={({ isActive }) => cn(
                    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-300',
                    isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                  )}
                >
                  <div className="w-8 h-8 rounded-lg bg-muted/40 flex items-center justify-center">
                    <Settings className="h-4 w-4" />
                  </div>
                  {!collapsed && <span>Settings</span>}
                </RouterNavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          <SidebarMenuItem>
            {user ? (
              <SidebarMenuButton
                onClick={signOut}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-destructive/80 hover:text-destructive hover:bg-destructive/10 transition-all cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center">
                  <LogOut className="h-4 w-4" />
                </div>
                {!collapsed && <span>Sign Out</span>}
              </SidebarMenuButton>
            ) : (
              <SidebarMenuButton
                onClick={() => navigate('/auth')}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-primary hover:bg-primary/10 transition-all cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <LogIn className="h-4 w-4" />
                </div>
                {!collapsed && <span>Sign In</span>}
              </SidebarMenuButton>
            )}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
