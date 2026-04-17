import { LucideIcon } from 'lucide-react';
import { NavLink as RouterNavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { prefetchRoute } from '@/lib/routePrefetch';

interface SidebarNavItemProps {
  title: string;
  url: string;
  icon: LucideIcon;
  collapsed: boolean;
  index: number;
  badgeCount?: number;
}

export const SidebarNavItem = ({
  title,
  url,
  icon: Icon,
  collapsed,
  index,
  badgeCount = 0,
}: SidebarNavItemProps) => {
  const location = useLocation();
  const isActive = url === '/' ? location.pathname === '/' : location.pathname.startsWith(url);

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03, type: 'spring', stiffness: 320, damping: 26 }}
    >
      <SidebarMenuItem>
        <SidebarMenuButton asChild className="h-auto p-0">
          <RouterNavLink
            to={url}
            end={url === '/'}
            onMouseEnter={() => prefetchRoute(url)}
            onFocus={() => prefetchRoute(url)}
            onTouchStart={() => prefetchRoute(url)}
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
                  boxShadow:
                    '0 0 10px hsl(var(--primary) / 0.6), 0 0 20px hsl(var(--primary) / 0.3), 0 0 30px hsl(var(--primary) / 0.1)',
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              />
            )}

            <Icon
              className={cn(
                'h-4 w-4 shrink-0 transition-all duration-200',
                isActive
                  ? 'text-primary drop-shadow-[0_0_8px_hsl(var(--primary)/0.5)] transform scale-105'
                  : 'text-foreground/60 group-hover:text-foreground group-hover:drop-shadow-[0_0_4px_hsl(var(--foreground)/0.2)]'
              )}
            />

            {!collapsed && (
              <span
                className={cn(
                  'truncate transition-all duration-200',
                  isActive
                    ? 'text-primary drop-shadow-[0_0_4px_hsl(var(--primary)/0.3)] font-semibold'
                    : 'group-hover:text-foreground'
                )}
              >
                {title}
              </span>
            )}

            {badgeCount > 0 && (
              <Badge
                className={cn(
                  'text-[8px] h-4 min-w-[18px] px-1 bg-destructive/80 text-destructive-foreground border-none font-mono justify-center shadow-[0_0_8px_hsl(var(--destructive)/0.3)]',
                  collapsed ? 'absolute -top-1 -right-1' : 'ml-auto'
                )}
              >
                {badgeCount > 99 ? '99+' : badgeCount}
              </Badge>
            )}
          </RouterNavLink>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </motion.div>
  );
};
