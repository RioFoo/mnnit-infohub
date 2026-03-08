import {
  Home, Compass, GraduationCap, CalendarDays, Clock, Calculator,
  BookOpen, Bell, User, Settings, LogOut, LogIn, Search, ChevronRight } from
'lucide-react';
import infohubLogo from '@/assets/infohub-logo.png';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter, useSidebar } from
'@/components/ui/sidebar';
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
    <Sidebar collapsible="icon" className="border-r border-border/20 bg-sidebar/90 backdrop-blur-xl">
      {/* Brand */}
      <div className="p-4 flex items-center gap-3">
        <img src={infohubLogo} alt="InfoHub" className="w-8 h-8 shrink-0 rounded-lg" />
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            className="font-semibold text-base tracking-tight"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            InfoHub
          </motion.span>
        )}
      </div>

      {/* Search */}
      {!collapsed && (
        <div className="px-3 mb-3">
          <button
            onClick={onOpenCommand}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-muted-foreground bg-muted/30 hover:bg-muted/50 transition-all border border-border/20 group"
          >
            <Search className="w-3.5 h-3.5 group-hover:text-primary transition-colors" />
            <span className="flex-1 text-left text-[11px] opacity-50">Search...</span>
            <kbd className="text-[9px] bg-background/60 px-1.5 py-0.5 rounded border border-border/30 font-mono">⌘K</kbd>
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
                            ? 'bg-primary/8 text-primary font-medium'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                        )}
                      >
                        {/* Active indicator */}
                        {isActive && (
                          <motion.div
                            layoutId="sidebar-indicator"
                            className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-primary"
                            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                          />
                        )}

                        <item.icon className={cn(
                          'h-[18px] w-[18px] transition-colors duration-200 shrink-0',
                          isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                        )} />

                        {!collapsed && (
                          <span className="text-[13px]">{item.title}</span>
                        )}

                        {item.title === 'Alerts' && !collapsed && (
                          <Badge className="ml-auto text-[9px] h-5 px-1.5 bg-destructive/90 text-destructive-foreground border-none">
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

      <SidebarFooter className="p-3 space-y-2">
        {user && !collapsed && profile && (
          <button
            onClick={() => navigate('/profile')}
            className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/30 transition-colors w-full text-left group"
          >
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.name || ''} className="w-8 h-8 rounded-lg object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-sm font-semibold">
                {(profile.name || 'U')[0].toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{profile.name || 'User'}</p>
              <p className="text-[10px] text-muted-foreground truncate">{profile.branch} · {profile.section}</p>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
          </button>
        )}

        <div className="divider-gradient" />

        <SidebarMenu>
          {user && (
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <RouterNavLink
                  to="/settings"
                  className={({ isActive }) => cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-200',
                    isActive ? 'bg-primary/8 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
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
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-destructive/70 hover:text-destructive hover:bg-destructive/5 transition-all cursor-pointer"
              >
                <LogOut className="h-[18px] w-[18px]" />
                {!collapsed && <span className="text-[13px]">Sign Out</span>}
              </SidebarMenuButton>
            ) : (
              <SidebarMenuButton
                onClick={() => navigate('/auth')}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-primary hover:bg-primary/5 transition-all cursor-pointer"
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
