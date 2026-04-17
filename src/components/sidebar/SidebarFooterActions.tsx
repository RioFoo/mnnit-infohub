import { LogOut, LogIn, Settings } from 'lucide-react';
import { NavLink as RouterNavLink, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { prefetchRoute } from '@/lib/routePrefetch';

interface SidebarFooterActionsProps {
  user: unknown;
  collapsed: boolean;
  onSignOut: () => void;
}

export const SidebarFooterActions = ({ user, collapsed, onSignOut }: SidebarFooterActionsProps) => {
  const navigate = useNavigate();

  return (
    <SidebarMenu>
      {user && (
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <RouterNavLink
              to="/settings"
              onMouseEnter={() => prefetchRoute('/settings')}
              onFocus={() => prefetchRoute('/settings')}
              onTouchStart={() => prefetchRoute('/settings')}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-all duration-200',
                  isActive
                    ? 'bg-primary/[0.06] text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/10'
                )
              }
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
            onClick={onSignOut}
            className="flex items-center gap-3 rounded-lg px-2.5 py-2 text-[13px] font-medium text-destructive/70 hover:text-destructive hover:bg-destructive/[0.06] transition-all cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && <span>Sign Out</span>}
          </SidebarMenuButton>
        ) : (
          <SidebarMenuButton
            onClick={() => navigate('/auth')}
            onMouseEnter={() => prefetchRoute('/auth')}
            onFocus={() => prefetchRoute('/auth')}
            className="flex items-center gap-3 rounded-lg px-2.5 py-2 text-[13px] font-medium text-primary hover:bg-primary/[0.06] transition-all cursor-pointer"
          >
            <LogIn className="h-4 w-4" />
            {!collapsed && <span>Sign In</span>}
          </SidebarMenuButton>
        )}
      </SidebarMenuItem>
    </SidebarMenu>
  );
};
