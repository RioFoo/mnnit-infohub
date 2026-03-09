import {
  Home, Compass, GraduationCap, CalendarDays, Clock, Calculator,
  BookOpen, Bell, User, Settings, LogOut, LogIn
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter, useSidebar
} from '@/components/ui/sidebar';
import { motion } from 'framer-motion';
import { NavLink as RouterNavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import InfoHubLogo from '@/components/InfoHubLogo';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const navItems = [
  { title: 'For You', url: '/', icon: Home },
  { title: 'Explore', url: '/explore', icon: Compass },
  { title: 'Campus', url: '/campus', icon: GraduationCap },
  { title: 'Calendar', url: '/calendar', icon: CalendarDays },
  { title: 'Timetable', url: '/timetable', icon: Clock },
  { title: 'Grades', url: '/grades', icon: Calculator },
  { title: 'Library', url: '/resources', icon: BookOpen },
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

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['unread-notifications-count', user?.id],
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

  return (
    <Sidebar collapsible="icon" className="border-r border-border/[0.06] bg-sidebar/80 backdrop-blur-2xl">
      {/* Brand */}
      <div className="p-3.5 flex items-center gap-3">
        <InfoHubLogo size={36} />
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            className="font-display font-bold text-base tracking-tight brand-text-3d leading-none"
          >
            INFOHUB
          </motion.span>
        )}
      </div>

      <div className="mx-3 divider-glow" />

      {/* User Card */}
      {user && !collapsed && profile && (
        <div className="px-3 py-2.5">
          <div className="flex items-center gap-2.5">
            <div className="avatar-orbital shrink-0">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                  {(profile.name || 'U')[0].toUpperCase()}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold truncate leading-tight">{profile.name || 'User'}</p>
              <p className="text-[9px] font-mono text-muted-foreground/60 truncate">@{profile.handle}</p>
            </div>
          </div>
        </div>
      )}

      <div className="mx-3 divider-glow" />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-0.5 px-1.5">
              {navItems.map((item, index) => {
                const isActive = item.url === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(item.url);

                return (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03, type: 'spring', stiffness: 320, damping: 26 }}
                  >
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild className="h-auto p-0">
                        <RouterNavLink
                          to={item.url}
                          end={item.url === '/'}
                          className={cn(
                            'relative flex items-center gap-3 w-full rounded-lg px-3 py-2.5 text-[13px] font-medium transition-all duration-200 cursor-pointer group',
                            isActive
                              ? 'text-primary bg-primary/[0.08] shadow-[inset_0_1px_0_hsl(var(--primary)/0.1),0_2px_8px_hsl(var(--primary)/0.15)] font-semibold'
                              : 'text-foreground/70 hover:text-foreground hover:bg-muted/10 hover:shadow-[inset_0_1px_0_hsl(var(--foreground)/0.05)]'
                          )}
                        >
                          {isActive && (
                            <motion.div
                              layoutId="sidebar-indicator"
                              className="absolute left-0 top-1/2 -translate-y-1/2 w-[2.5px] h-5 rounded-r-full bg-primary"
                              style={{ 
                                boxShadow: '0 0 10px hsl(var(--primary) / 0.6), 0 0 20px hsl(var(--primary) / 0.3), 0 0 30px hsl(var(--primary) / 0.1)' 
                              }}
                              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                            />
                          )}

                          <item.icon className={cn(
                            'h-4 w-4 shrink-0 transition-all duration-200',
                            isActive
                              ? 'text-primary drop-shadow-[0_0_8px_hsl(var(--primary)/0.5)] transform scale-105'
                              : 'text-foreground/60 group-hover:text-foreground group-hover:drop-shadow-[0_0_4px_hsl(var(--foreground)/0.2)]'
                          )} />

                          {!collapsed && (
                            <span className={cn(
                              'truncate transition-all duration-200',
                              isActive 
                                ? 'text-primary drop-shadow-[0_0_4px_hsl(var(--primary)/0.3)] font-semibold' 
                                : 'group-hover:text-foreground'
                            )}>
                              {item.title}
                            </span>
                          )}

                          {item.title === 'Alerts' && !collapsed && (
                            <Badge className="ml-auto text-[8px] h-4 min-w-[18px] px-1 bg-destructive/80 text-destructive-foreground border-none font-mono justify-center shadow-[0_0_8px_hsl(var(--destructive)/0.3)]">
                              3
                            </Badge>
                          )}
                        </RouterNavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </motion.div>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <div className="mx-3 divider-glow" />

      <SidebarFooter className="p-2.5 space-y-0.5">
        <SidebarMenu>
          {user && (
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <RouterNavLink
                  to="/settings"
                  className={({ isActive }) => cn(
                    'flex items-center gap-3 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-all duration-200',
                    isActive
                      ? 'bg-primary/[0.06] text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/10'
                  )}
                >
                  <Settings className="h-4 w-4" />
                  {!collapsed && <span>Settings</span>}
                </RouterNavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          <SidebarMenuItem>
            {user ? (
              <SidebarMenuButton
                onClick={signOut}
                className="flex items-center gap-3 rounded-lg px-2.5 py-2 text-[13px] font-medium text-destructive/70 hover:text-destructive hover:bg-destructive/[0.06] transition-all cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                {!collapsed && <span>Sign Out</span>}
              </SidebarMenuButton>
            ) : (
              <SidebarMenuButton
                onClick={() => navigate('/auth')}
                className="flex items-center gap-3 rounded-lg px-2.5 py-2 text-[13px] font-medium text-primary hover:bg-primary/[0.06] transition-all cursor-pointer"
              >
                <LogIn className="h-4 w-4" />
                {!collapsed && <span>Sign In</span>}
              </SidebarMenuButton>
            )}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
