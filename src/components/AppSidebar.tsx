import {
  Home, Search, GraduationCap, CalendarDays, Clock, Calculator,
  BookOpen, Bell, User, Settings, LogOut, LogIn, Command
} from 'lucide-react';
import infohubLogo from '@/assets/infohub-logo.png';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter, useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { NavLink as RouterNavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';

const navItems = [
  { title: 'Feed', url: '/', icon: Home },
  { title: 'Explore', url: '/explore', icon: Search },
  { title: 'Campus Info', url: '/campus', icon: GraduationCap },
  { title: 'Calendar', url: '/calendar', icon: CalendarDays },
  { title: 'Timetable', url: '/timetable', icon: Clock },
  { title: 'Grades', url: '/grades', icon: Calculator },
  { title: 'Resources', url: '/resources', icon: BookOpen },
  { title: 'Notifications', url: '/notifications', icon: Bell },
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
    <Sidebar collapsible="icon" className="border-r border-border">
      <div className="p-4 flex items-center gap-2">
        <motion.div whileHover={{ rotate: 10, scale: 1.15 }} transition={{ type: 'spring', stiffness: 300 }}>
          <img src={infohubLogo} alt="InfoHub" className="w-8 h-8 shrink-0 drop-shadow-[0_0_8px_hsl(var(--primary)/0.5)]" />
        </motion.div>
        {!collapsed && (
          <motion.span
            className="font-mono font-bold text-lg relative cursor-default select-none"
            style={{
              background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)), hsl(var(--primary)))',
              backgroundSize: '200% 200%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 0 8px hsl(var(--primary) / 0.4))',
            }}
            animate={{
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            whileHover={{
              scale: 1.08,
              filter: 'drop-shadow(0 0 16px hsl(var(--primary) / 0.6))',
              transition: { duration: 0.2 },
            }}
          >
            InfoHub
          </motion.span>
        )}
      </div>

      {!collapsed && (
        <div className="px-3 mb-2">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              variant="outline"
              className="w-full justify-start gap-2 text-muted-foreground text-sm h-9 transition-all duration-300 hover:border-primary/50 hover:shadow-[0_0_12px_hsl(var(--primary)/0.15)]"
              onClick={onOpenCommand}
            >
              <Command className="w-4 h-4" />
              <span>Search...</span>
              <kbd className="ml-auto text-xs bg-muted px-1.5 py-0.5 rounded">⌘K</kbd>
            </Button>
          </motion.div>
        </div>
      )}

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item, index) => {
                const isActive = item.url === '/' 
                  ? location.pathname === '/' 
                  : location.pathname.startsWith(item.url);

                return (
                  <SidebarMenuItem key={item.title}>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.04, duration: 0.3 }}
                      whileHover={{ 
                        x: 4,
                        transition: { duration: 0.2 }
                      }}
                      whileTap={{ scale: 0.97 }}
                      className="relative"
                    >
                      {/* 3D glow behind active item */}
                      {isActive && (
                        <motion.div
                          layoutId="sidebar-active-glow"
                          className="absolute inset-0 rounded-md"
                          style={{
                            background: 'linear-gradient(135deg, hsl(var(--primary) / 0.15), hsl(var(--primary) / 0.05))',
                            boxShadow: '0 0 20px hsl(var(--primary) / 0.2), inset 0 1px 0 hsl(var(--primary) / 0.1)',
                          }}
                          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                        />
                      )}

                      <SidebarMenuButton asChild>
                        <RouterNavLink
                          to={item.url}
                          end={item.url === '/'}
                          className={({ isActive: active }) => cn(
                            'relative z-10 flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-all duration-300 group',
                            active 
                              ? 'text-primary font-semibold' 
                              : 'text-muted-foreground hover:text-foreground'
                          )}
                        >
                          <motion.div
                            className={cn(
                              'p-1.5 rounded-lg transition-all duration-300',
                              isActive 
                                ? 'bg-primary/20 shadow-[0_0_10px_hsl(var(--primary)/0.3)]' 
                                : 'bg-muted/30 group-hover:bg-primary/10 group-hover:shadow-[0_0_8px_hsl(var(--primary)/0.15)]'
                            )}
                            whileHover={{ rotate: [0, -8, 8, 0] }}
                            transition={{ duration: 0.4 }}
                          >
                            <item.icon className="h-4 w-4 shrink-0" />
                          </motion.div>
                          {!collapsed && <span>{item.title}</span>}
                          {item.title === 'Notifications' && !collapsed && (
                            <motion.div
                              animate={{ scale: [1, 1.15, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            >
                              <Badge variant="destructive" className="ml-auto text-[10px] h-5 px-1.5 shadow-[0_0_8px_hsl(var(--destructive)/0.4)]">3</Badge>
                            </motion.div>
                          )}

                          {/* Hover shimmer effect */}
                          <motion.div
                            className="absolute inset-0 rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300"
                            style={{
                              background: 'linear-gradient(90deg, transparent, hsl(var(--primary) / 0.06), transparent)',
                            }}
                          />
                        </RouterNavLink>
                      </SidebarMenuButton>

                      {/* Active indicator bar */}
                      {isActive && (
                        <motion.div
                          layoutId="sidebar-active-bar"
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-full bg-primary"
                          style={{ boxShadow: '0 0 8px hsl(var(--primary) / 0.5)' }}
                          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
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
        {user && !collapsed && profile && (
          <motion.div
            whileHover={{ scale: 1.02, y: -1 }}
            className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 transition-all duration-300 hover:bg-muted/70 hover:shadow-[0_4px_15px_hsl(var(--primary)/0.1)] cursor-pointer"
          >
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.name || ''} className="w-8 h-8 rounded-full object-cover ring-2 ring-primary/20" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-bold ring-2 ring-primary/30">
                {(profile.name || 'U')[0].toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{profile.name || 'User'}</p>
              <p className="text-xs text-muted-foreground truncate">{profile.branch} - {profile.section}</p>
            </div>
          </motion.div>
        )}
        <SidebarMenu>
          {user && (
            <SidebarMenuItem>
              <motion.div whileHover={{ x: 4 }} whileTap={{ scale: 0.97 }}>
                <SidebarMenuButton asChild>
                  <RouterNavLink
                    to="/settings"
                    className={({ isActive }) => cn(
                      'flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-all duration-300',
                      isActive ? 'bg-primary/10 text-primary' : 'hover:bg-muted/50'
                    )}
                  >
                    <motion.div
                      whileHover={{ rotate: 90 }}
                      transition={{ duration: 0.3 }}
                      className="p-1.5 rounded-lg bg-muted/30"
                    >
                      <Settings className="h-4 w-4" />
                    </motion.div>
                    {!collapsed && <span>Settings</span>}
                  </RouterNavLink>
                </SidebarMenuButton>
              </motion.div>
            </SidebarMenuItem>
          )}
          {user ? (
            <SidebarMenuItem>
              <motion.div whileHover={{ x: 4 }} whileTap={{ scale: 0.97 }}>
                <SidebarMenuButton
                  onClick={signOut}
                  className="hover:bg-destructive/10 text-destructive cursor-pointer transition-all duration-300 hover:shadow-[0_0_12px_hsl(var(--destructive)/0.15)]"
                >
                  <motion.div className="p-1.5 rounded-lg bg-destructive/10">
                    <LogOut className="h-4 w-4" />
                  </motion.div>
                  {!collapsed && <span>Sign Out</span>}
                </SidebarMenuButton>
              </motion.div>
            </SidebarMenuItem>
          ) : (
            <SidebarMenuItem>
              <motion.div whileHover={{ x: 4 }} whileTap={{ scale: 0.97 }}>
                <SidebarMenuButton
                  onClick={() => navigate('/auth')}
                  className="hover:bg-primary/10 text-primary cursor-pointer transition-all duration-300 hover:shadow-[0_0_12px_hsl(var(--primary)/0.15)]"
                >
                  <motion.div className="p-1.5 rounded-lg bg-primary/10">
                    <LogIn className="h-4 w-4" />
                  </motion.div>
                  {!collapsed && <span>Sign In</span>}
                </SidebarMenuButton>
              </motion.div>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
