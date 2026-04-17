import {
  Home, Compass, GraduationCap, CalendarDays, Clock, Calculator,
  BookOpen, Bell, User
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarMenu, SidebarFooter, useSidebar
} from '@/components/ui/sidebar';
import { motion } from 'framer-motion';
import InfoHubLogo from '@/components/InfoHubLogo';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SidebarNavItem } from '@/components/sidebar/SidebarNavItem';
import { SidebarUserCard } from '@/components/sidebar/SidebarUserCard';
import { SidebarFooterActions } from '@/components/sidebar/SidebarFooterActions';

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

      {user && !collapsed && profile && (
        <SidebarUserCard
          name={profile.name}
          handle={profile.handle}
          avatarUrl={profile.avatar_url}
        />
      )}

      <div className="mx-3 divider-glow" />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-0.5 px-1.5">
              {navItems.map((item, index) => (
                <SidebarNavItem
                  key={item.title}
                  title={item.title}
                  url={item.url}
                  icon={item.icon}
                  collapsed={collapsed}
                  index={index}
                  badgeCount={item.title === 'Alerts' ? unreadCount : 0}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <div className="mx-3 divider-glow" />

      <SidebarFooter className="p-2.5 space-y-0.5">
        <SidebarFooterActions user={user} collapsed={collapsed} onSignOut={signOut} />
      </SidebarFooter>
    </Sidebar>
  );
}
