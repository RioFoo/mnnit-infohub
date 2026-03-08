import {
  Home, Compass, GraduationCap, CalendarDays, Clock, Calculator,
  BookOpen, Bell, User, Settings, LogOut, LogIn, Search, Zap, Radio } from
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
{ title: 'Profile', url: '/profile', icon: User }];


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
    <Sidebar collapsible="icon" className="border-r border-border/30 bg-sidebar/80 backdrop-blur-xl">
      {/* ═══ BRAND ═══ */}
      <div className="p-4 flex items-center gap-3">
        <motion.div
          whileHover={{ scale: 1.2 }}
          transition={{ type: 'spring', stiffness: 400 }}
          className="relative">
          
          <img src={infohubLogo} alt="InfoHub" className="w-9 h-9 shrink-0 relative z-10" />
          <div className="absolute inset-0 rounded-full bg-primary/30 blur-lg -z-0 animate-glow-pulse" />
          <div className="absolute inset-[-4px] energy-ring" />
        </motion.div>
        {!collapsed &&
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col">
          
            <span className="font-display font-bold text-base gradient-text-aurora tracking-widest">INFOHUB</span>
            
          </motion.div>
        }
      </div>

      {/* ═══ SEARCH ═══ */}
      {!collapsed &&
      <div className="px-3 mb-4">
          <motion.button
          whileHover={{ scale: 1.02, borderColor: 'hsl(var(--neon-cyan) / 0.3)' }}
          whileTap={{ scale: 0.98 }}
          onClick={onOpenCommand}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs text-muted-foreground bg-muted/20 hover:bg-muted/30 transition-all border border-border/30 hover:border-primary/20 group">
          
            <Search className="w-3.5 h-3.5 group-hover:text-primary transition-colors" />
            <span className="flex-1 text-left text-[11px] opacity-60">Search...</span>
            <kbd className="text-[9px] bg-background/40 px-1.5 py-0.5 rounded border border-border/30 font-mono">⌘K</kbd>
          </motion.button>
        </div>
      }

      <SidebarContent>
        <SidebarGroup>
          {!collapsed &&
          <div className="px-3 mb-2">
              <span className="section-title text-[8px]">Navigation</span>
            </div>
          }
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item, index) => {
                const isActive = item.url === '/' ?
                location.pathname === '/' :
                location.pathname.startsWith(item.url);

                return (
                  <SidebarMenuItem key={item.title}>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.04, duration: 0.3 }}
                      className="relative"
                      whileHover={{ x: 4 }}>
                      
                      <SidebarMenuButton asChild>
                        <RouterNavLink
                          to={item.url}
                          end={item.url === '/'}
                          className={() => cn(
                            'relative flex items-center gap-3.5 rounded-xl px-3.5 py-3 text-sm transition-all duration-300 group overflow-hidden',
                            isActive ?
                            'text-primary font-semibold' :
                            'text-muted-foreground hover:text-foreground'
                          )}>
                          
                          {/* Active glow bg */}
                          {isActive &&
                          <motion.div
                            layoutId="sidebar-active"
                            className="absolute inset-0 rounded-xl"
                            style={{
                              background: 'linear-gradient(135deg, hsl(var(--neon-cyan) / 0.12), hsl(var(--neon-purple) / 0.06))',
                              boxShadow: 'inset 0 0 20px hsl(var(--neon-cyan) / 0.06)'
                            }}
                            transition={{ type: 'spring', stiffness: 400, damping: 30 }} />

                          }

                          {/* Hover glow bg */}
                          {!isActive &&
                          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                          }

                          {/* Icon */}
                          <div className={cn(
                            'relative z-10 w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-300',
                            isActive ?
                            'bg-primary text-primary-foreground shadow-[0_0_20px_hsl(var(--neon-cyan)/0.5)]' :
                            'bg-muted/30 group-hover:bg-primary/15 group-hover:text-primary group-hover:shadow-[0_0_15px_hsl(var(--neon-cyan)/0.2)] group-hover:scale-110'
                          )}>
                            <item.icon className="h-4.5 w-4.5" />
                          </div>

                          {!collapsed &&
                          <span className="relative z-10 font-medium text-[13px] tracking-wide">{item.title}</span>
                          }

                          {item.title === 'Alerts' && !collapsed &&
                          <motion.div
                            animate={{ scale: [1, 1.15, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="ml-auto relative z-10">
                            
                              <Badge className="text-[9px] h-5 px-1.5 bg-destructive text-destructive-foreground border-none shadow-[0_0_12px_hsl(var(--destructive)/0.5)]">
                                3
                              </Badge>
                            </motion.div>
                          }

                          {/* Hover shimmer */}
                          <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                          style={{
                            background: 'linear-gradient(105deg, transparent 40%, hsl(var(--neon-cyan) / 0.06) 45%, hsl(var(--neon-cyan) / 0.12) 50%, hsl(var(--neon-cyan) / 0.06) 55%, transparent 60%)',
                            backgroundSize: '200% 100%',
                            animation: 'shimmer-slide 2s ease-in-out infinite'
                          }} />
                          
                        </RouterNavLink>
                      </SidebarMenuButton>

                      {/* Active neon line */}
                      {isActive &&
                      <motion.div
                        layoutId="sidebar-neon-edge"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-7 rounded-r-full bg-primary"
                        style={{ boxShadow: '0 0 15px hsl(var(--neon-cyan) / 0.8), 3px 0 10px hsl(var(--neon-cyan) / 0.4)' }}
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }} />

                      }
                    </motion.div>
                  </SidebarMenuItem>);

              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3 space-y-2">
        {/* ═══ USER CARD ═══ */}
        {user && !collapsed && profile &&
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="flex items-center gap-3 p-3 rounded-lg holo-card cursor-pointer"
          onClick={() => navigate('/profile')}>
          
            {profile.avatar_url ?
          <img src={profile.avatar_url} alt={profile.name || ''} className="w-9 h-9 rounded-md object-cover ring-1 ring-primary/30" /> :

          <div className="w-9 h-9 rounded-md bg-primary/15 flex items-center justify-center text-primary text-sm font-bold ring-1 ring-primary/30">
                {(profile.name || 'U')[0].toUpperCase()}
              </div>
          }
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{profile.name || 'User'}</p>
              <p className="text-[9px] text-muted-foreground truncate font-mono">{profile.branch} · {profile.section}</p>
            </div>
            <Radio className="w-3 h-3 text-primary/40" />
          </motion.div>
        }

        <div className="cyber-line my-2" />

        <SidebarMenu>
          {user &&
          <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <RouterNavLink
                to="/settings"
                className={({ isActive }) => cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-300',
                  isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted/20'
                )}>
                
                  <div className="w-8 h-8 rounded-md bg-muted/30 flex items-center justify-center">
                    <Settings className="h-4 w-4" />
                  </div>
                  {!collapsed && <span>Settings</span>}
                </RouterNavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          }
          <SidebarMenuItem>
            {user ?
            <SidebarMenuButton
              onClick={signOut}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-destructive/70 hover:text-destructive hover:bg-destructive/5 transition-all cursor-pointer">
              
                <div className="w-8 h-8 rounded-md bg-destructive/10 flex items-center justify-center">
                  <LogOut className="h-4 w-4" />
                </div>
                {!collapsed && <span>Sign Out</span>}
              </SidebarMenuButton> :

            <SidebarMenuButton
              onClick={() => navigate('/auth')}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-primary hover:bg-primary/5 transition-all cursor-pointer">
              
                <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
                  <LogIn className="h-4 w-4" />
                </div>
                {!collapsed && <span>Enter</span>}
              </SidebarMenuButton>
            }
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>);

}