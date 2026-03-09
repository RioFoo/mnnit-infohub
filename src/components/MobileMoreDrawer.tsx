import { CalendarDays, Calculator, BookOpen, User, Settings, LogOut, GraduationCap, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { cn } from '@/lib/utils';

const drawerItems = [
  { title: 'Calendar', url: '/calendar', icon: CalendarDays },
  { title: 'Timetable', url: '/timetable', icon: Clock },
  { title: 'Grades', url: '/grades', icon: Calculator },
  { title: 'Library', url: '/resources', icon: BookOpen },
  { title: 'Profile', url: '/profile', icon: User },
  { title: 'Settings', url: '/settings', icon: Settings },
];

interface MobileMoreDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileMoreDrawer({ open, onOpenChange }: MobileMoreDrawerProps) {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();

  const handleNav = (url: string) => {
    onOpenChange(false);
    navigate(url);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="glass-panel border-t border-border/[0.08] pb-safe">
        <DrawerHeader className="pb-2">
          <DrawerTitle className="text-sm font-display font-bold text-center">More</DrawerTitle>
        </DrawerHeader>
        <div className="px-4 pb-4">
          <div className="grid grid-cols-3 gap-3">
            {drawerItems.map((item) => (
              <button
                key={item.url}
                onClick={() => handleNav(item.url)}
                className={cn(
                  'flex flex-col items-center gap-2 p-4 rounded-xl transition-all',
                  'bg-muted/10 hover:bg-primary/[0.08] active:scale-95',
                  'border border-border/[0.06]'
                )}
              >
                <item.icon className="w-5 h-5 text-primary" />
                <span className="text-[11px] font-mono text-foreground/80">{item.title}</span>
              </button>
            ))}
          </div>

          {user && profile && (
            <div className="mt-4 pt-4 border-t border-border/[0.06]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                      {(profile.name || 'U')[0].toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold">{profile.name || 'User'}</p>
                    <p className="text-[10px] font-mono text-muted-foreground">@{profile.handle}</p>
                  </div>
                </div>
                <button
                  onClick={() => { onOpenChange(false); signOut(); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono text-destructive/70 hover:text-destructive hover:bg-destructive/[0.06] transition-all"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
