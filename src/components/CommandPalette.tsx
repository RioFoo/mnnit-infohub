import { useNavigate } from 'react-router-dom';
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Home, Search, GraduationCap, CalendarDays, Clock, Calculator, BookOpen, Bell, User, ExternalLink, Plus, LogOut } from 'lucide-react';
import { QUICK_LINKS } from '@/data/infohub-data';
import { useAuth } from '@/contexts/AuthContext';

const navCommands = [
  { name: 'Feed', icon: Home, path: '/' },
  { name: 'Explore', icon: Search, path: '/explore' },
  { name: 'Campus Info', icon: GraduationCap, path: '/campus' },
  { name: 'Calendar', icon: CalendarDays, path: '/calendar' },
  { name: 'Timetable', icon: Clock, path: '/timetable' },
  { name: 'Grades', icon: Calculator, path: '/grades' },
  { name: 'Resources', icon: BookOpen, path: '/resources' },
  { name: 'Notifications', icon: Bell, path: '/notifications' },
  { name: 'Profile', icon: User, path: '/profile' },
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: Props) {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const go = (path: string) => {
    navigate(path);
    onOpenChange(false);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search pages, links, actions..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigation">
          {navCommands.map(c => (
            <CommandItem key={c.path} onSelect={() => go(c.path)}>
              <c.icon className="mr-2 h-4 w-4" />
              {c.name}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Actions">
          <CommandItem onSelect={() => go('/')}>
            <Plus className="mr-2 h-4 w-4" />
            Create Post
          </CommandItem>
          <CommandItem onSelect={() => { signOut(); onOpenChange(false); }}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </CommandItem>
        </CommandGroup>
        <CommandGroup heading="MNNIT Portals">
          {QUICK_LINKS.map(l => (
            <CommandItem key={l.url} onSelect={() => { window.open(l.url, '_blank'); onOpenChange(false); }}>
              <ExternalLink className="mr-2 h-4 w-4" />
              {l.title}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
