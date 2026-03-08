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
import infohubIcon from '@/assets/infohub-icon.png';

const BrandLogo = ({ collapsed }: { collapsed: boolean }) => {
  return (
    <div className="p-4 flex items-center gap-3">
      <motion.div
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 brand-logo-3d"
        whileHover={{ rotateY: 20, rotateX: -10, scale: 1.1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        style={{ transformStyle: 'preserve-3d', perspective: 600 }}
      >
        <img src={infohubIcon} alt="InfoHub" className="w-9 h-9 object-contain brand-icon-3d" />
      </motion.div>
      {!collapsed && (
        <motion.span
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          className="font-display font-bold text-base tracking-tight brand-text-3d block"
        >
          INFOHUB
        </motion.span>
      )}
    </div>
  );
};

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
      <BrandLogo collapsed={collapsed} />

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

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1.5 px-1">
              {navItems.map((item, index) => {
                const isActive = item.url === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(item.url);

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <motion.div
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.04, type: 'spring', stiffness: 300, damping: 24 }}
                      >
                        <RouterNavLink
                          to={item.url}
                          end={item.url === '/'}
                          className={() => cn(
                            'nav-item-3d relative flex items-center gap-3.5 rounded-lg px-3 py-3 text-sm group',
                            isActive
                              ? 'bg-primary/[0.07] text-primary'
                              : 'text-muted-foreground'
                          )}
                        >
                          {/* Active indicator */}
                          {isActive && (
                            <motion.div
                              layoutId="sidebar-indicator"
                              className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full bg-primary"
                              style={{ boxShadow: '0 0 12px hsl(var(--primary) / 0.6), 0 0 24px hsl(var(--primary) / 0.2)' }}
                              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                            />
                          )}

                          <item.icon className={cn(
                            'nav-icon-3d h-[18px] w-[18px] shrink-0',
                            isActive ? 'text-primary drop-shadow-[0_0_8px_hsl(var(--primary)/0.5)]' : 'text-muted-foreground'
                          )} />

                          {!collapsed && (
                            <span className={cn(
                              'sidebar-nav-text text-[13px]',
                              isActive && 'sidebar-nav-text-active'
                            )}>{item.title}</span>
                          )}

                          {item.title === 'Alerts' && !collapsed && (
                            <Badge className="ml-auto text-[8px] h-4 px-1.5 bg-destructive/80 text-destructive-foreground border-none font-mono">
                              3
                            </Badge>
                          )}
                        </RouterNavLink>
                      </motion.div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <div className="mx-3 divider-glow" />

      <SidebarFooter className="p-3 space-y-1">
        <SidebarMenu>
          {user && (
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <RouterNavLink
                  to="/settings"
                  className={({ isActive }) => cn(
                    'flex items-center gap-3.5 rounded-lg px-3 py-3 text-sm transition-all duration-200',
                    isActive ? 'bg-primary/[0.05] text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted/15'
                  )}
                >
                  <Settings className="h-[18px] w-[18px]" />
                  {!collapsed && <span className="sidebar-nav-text text-[13px]">Settings</span>}
                </RouterNavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          <SidebarMenuItem>
            {user ? (
              <SidebarMenuButton
                onClick={signOut}
                className="flex items-center gap-3.5 rounded-lg px-3 py-3 text-sm text-destructive/70 hover:text-destructive hover:bg-destructive/[0.05] transition-all cursor-pointer"
              >
                <LogOut className="h-[18px] w-[18px]" />
                {!collapsed && <span className="sidebar-nav-text text-[13px]">Sign Out</span>}
              </SidebarMenuButton>
            ) : (
              <SidebarMenuButton
                onClick={() => navigate('/auth')}
                className="flex items-center gap-3.5 rounded-lg px-3 py-3 text-sm text-primary hover:bg-primary/[0.05] transition-all cursor-pointer"
              >
                <LogIn className="h-[18px] w-[18px]" />
                {!collapsed && <span className="sidebar-nav-text text-[13px]">Sign In</span>}
              </SidebarMenuButton>
            )}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
