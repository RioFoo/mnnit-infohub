import {
  Home, Compass, GraduationCap, CalendarDays, Clock, Calculator,
  BookOpen, Bell, User, Settings, LogOut, LogIn, Search, ChevronRight
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

  return (
    <Sidebar collapsible="icon" className="border-r border-border/[0.06] bg-sidebar/80 backdrop-blur-2xl">
      {/* Brand */}
      <div className="p-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <span className="text-primary text-sm font-bold font-display">◈</span>
        </div>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            className="font-display font-bold text-sm tracking-tight"
          >
            INFOHUB
          </motion.span>
        )}
      </div>

      {/* Divider */}
      <div className="mx-3 divider-glow" />

      {/* User Card */}
      {user && !collapsed && profile && (
        <div className="px-3 py-3">
          <div className="flex items-center gap-3">
            <div className="avatar-orbital">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">
                  {(profile.name || 'U')[0].toUpperCase()}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold truncate">{profile.name || 'User'}</p>
              <p className="text-[10px] font-mono text-muted-foreground truncate">@{profile.handle}</p>
              <span className="tag-pill text-[8px] mt-1 inline-block">{profile.branch} · {profile.section}</span>
            </div>
          </div>
        </div>
      )}

      <div className="mx-3 divider-glow" />

      {/* Search */}
      {!collapsed && (
        <div className="px-3 py-2">
          <button
            onClick={onOpenCommand}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-muted-foreground bg-muted/20 hover:bg-muted/30 transition-all border border-border/[0.06] group"
          >
            <Search className="w-3.5 h-3.5 group-hover:text-primary transition-colors" />
            <span className="flex-1 text-left text-[10px] opacity-40 font-mono">Search...</span>
            <kbd className="text-[8px] bg-background/40 px-1.5 py-0.5 rounded border border-border/[0.06] font-mono">⌘K</kbd>
          </button>
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
                    <SidebarMenuButton asChild>
                      <RouterNavLink
                        to={item.url}
                        end={item.url === '/'}
                        className={() => cn(
                          'relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-200 group',
                          isActive
                            ? 'bg-primary/[0.05] text-primary'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/15'
                        )}
                      >
                        {/* Active indicator */}
                        {isActive && (
                          <motion.div
                            layoutId="sidebar-indicator"
                            className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-5 rounded-r-full bg-primary"
                            style={{ boxShadow: '0 0 8px hsl(var(--primary) / 0.5)' }}
                            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                          />
                        )}

                        <item.icon className={cn(
                          'h-[18px] w-[18px] transition-all duration-200 shrink-0',
                          isActive ? 'text-primary drop-shadow-[0_0_6px_hsl(var(--primary)/0.4)]' : 'text-muted-foreground group-hover:text-foreground'
                        )} />

                        {!collapsed && (
                          <span className={cn(
                            'text-[13px]',
                            isActive && 'glow-text-subtle font-medium'
                          )}>{item.title}</span>
                        )}

                        {item.title === 'Alerts' && !collapsed && (
                          <Badge className="ml-auto text-[8px] h-4 px-1.5 bg-destructive/80 text-destructive-foreground border-none font-mono">
                            3
                          </Badge>
                        )}
                      </RouterNavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Nexus Button */}
      {!collapsed && (
        <div className="px-3 py-2">
          <button
            onClick={onOpenCommand}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-mono font-medium text-primary bg-gradient-to-r from-primary/[0.06] to-secondary/[0.06] border border-primary/[0.12] hover:border-primary/25 transition-all glow-border pulse-glow"
          >
            ⌘ Nexus
          </button>
        </div>
      )}

      <div className="mx-3 divider-glow" />

      <SidebarFooter className="p-3 space-y-1">
        <SidebarMenu>
          {user && (
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <RouterNavLink
                  to="/settings"
                  className={({ isActive }) => cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-200',
                    isActive ? 'bg-primary/[0.05] text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted/15'
                  )}
                >
                  <Settings className="h-[18px] w-[18px]" />
                  {!collapsed && <span className="text-[13px]">Settings</span>}
                </RouterNavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          <SidebarMenuItem>
            {user ? (
              <SidebarMenuButton
                onClick={signOut}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-destructive/70 hover:text-destructive hover:bg-destructive/[0.05] transition-all cursor-pointer"
              >
                <LogOut className="h-[18px] w-[18px]" />
                {!collapsed && <span className="text-[13px]">Sign Out</span>}
              </SidebarMenuButton>
            ) : (
              <SidebarMenuButton
                onClick={() => navigate('/auth')}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-primary hover:bg-primary/[0.05] transition-all cursor-pointer"
              >
                <LogIn className="h-[18px] w-[18px]" />
                {!collapsed && <span className="text-[13px]">Sign In</span>}
              </SidebarMenuButton>
            )}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
