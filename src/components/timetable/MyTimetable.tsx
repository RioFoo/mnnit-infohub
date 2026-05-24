import { useEffect, useMemo, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, Clock, MapPin, Bell } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const CLASS_TYPES = ['Lecture', 'Lab', 'Tutorial', 'Workshop'];
const COLORS = [
  { name: 'blue', cls: 'bg-secondary/[0.08] text-secondary border-l-secondary' },
  { name: 'green', cls: 'bg-primary/[0.08] text-primary border-l-primary' },
  { name: 'amber', cls: 'bg-amber-400/[0.08] text-amber-400 border-l-amber-400' },
  { name: 'pink', cls: 'bg-accent/[0.08] text-accent border-l-accent' },
];

type Entry = {
  id: string;
  user_id: string;
  day: string;
  start_time: string;
  end_time: string;
  subject_name: string;
  class_type: string | null;
  venue: string | null;
  color: string | null;
  notify_minutes: number | null;
  is_active: boolean;
};

const emptyForm = {
  day: 'Monday',
  start_time: '09:00',
  end_time: '10:00',
  subject_name: '',
  class_type: 'Lecture',
  venue: '',
  color: 'blue',
  notify_minutes: 10,
};

const colorClass = (c?: string | null) =>
  COLORS.find(x => x.name === c)?.cls ?? COLORS[0].cls;

export const MyTimetable = ({ selectedDay }: { selectedDay: string }) => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Entry | null>(null);
  const [form, setForm] = useState(emptyForm);

  const fetchEntries = useCallback(async () => {
    if (!user) {
      setEntries([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from('timetable_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('start_time', { ascending: true });
    if (error) {
      toast.error('Failed to load your schedule');
    } else {
      setEntries((data ?? []) as Entry[]);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const dayEntries = useMemo(
    () =>
      entries
        .filter(e => e.day === selectedDay && e.is_active)
        .sort((a, b) => a.start_time.localeCompare(b.start_time)),
    [entries, selectedDay]
  );

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm, day: selectedDay });
    setOpen(true);
  };

  const openEdit = (e: Entry) => {
    setEditing(e);
    setForm({
      day: e.day,
      start_time: e.start_time,
      end_time: e.end_time,
      subject_name: e.subject_name,
      class_type: e.class_type ?? 'Lecture',
      venue: e.venue ?? '',
      color: e.color ?? 'blue',
      notify_minutes: e.notify_minutes ?? 10,
    });
    setOpen(true);
  };

  const save = async () => {
    if (!user) {
      toast.error('Sign in to save your schedule');
      return;
    }
    if (!form.subject_name.trim()) {
      toast.error('Subject name is required');
      return;
    }
    if (form.start_time >= form.end_time) {
      toast.error('End time must be after start time');
      return;
    }

    if (editing) {
      const { error } = await supabase
        .from('timetable_entries')
        .update(form)
        .eq('id', editing.id);
      if (error) return toast.error(error.message);
      toast.success('Class updated');
    } else {
      const { error } = await supabase
        .from('timetable_entries')
        .insert({ ...form, user_id: user.id });
      if (error) return toast.error(error.message);
      toast.success('Class added');
    }
    setOpen(false);
    fetchEntries();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from('timetable_entries').delete().eq('id', id);
    if (error) return toast.error(error.message);
    toast.success('Class removed');
    fetchEntries();
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-muted-foreground/40 font-mono text-sm">
        Sign in to create your personal schedule
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/50">
          {dayEntries.length} personal class{dayEntries.length !== 1 ? 'es' : ''} · {selectedDay}
        </span>
        <Button
          size="sm"
          onClick={openCreate}
          className="h-8 rounded-lg bg-primary/10 text-primary hover:bg-primary/15 border border-primary/20 font-mono text-xs"
        >
          <Plus className="w-3.5 h-3.5 mr-1" /> Add Class
        </Button>
      </div>

      {loading ? (
        <div className="text-center text-xs font-mono text-muted-foreground/40 py-8">Loading…</div>
      ) : dayEntries.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 text-muted-foreground/30">
          <Clock className="w-8 h-8 mb-2" />
          <p className="text-sm font-mono">No personal classes yet</p>
        </div>
      ) : (
        dayEntries.map((e, i) => (
          <motion.div
            key={e.id}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            className={cn(
              'flex items-stretch rounded-xl border-l-[3px] bg-card/30',
              colorClass(e.color).split(' ').filter(c => c.startsWith('border-l-')).join(' ')
            )}
          >
            <div className={cn('flex flex-col items-center justify-center w-16 md:w-20 shrink-0 py-3 px-2 rounded-l-lg', colorClass(e.color))}>
              <span className="text-xs font-mono font-medium">{e.start_time}</span>
              <span className="text-[8px] font-mono opacity-50 my-0.5">→</span>
              <span className="text-[10px] font-mono opacity-60">{e.end_time}</span>
            </div>
            <div className="flex-1 flex items-center justify-between px-3 md:px-4 py-3 rounded-r-xl min-w-0">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate text-foreground">{e.subject_name}</p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className={cn('text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded', colorClass(e.color))}>
                    {e.class_type}
                  </span>
                  {e.venue && (
                    <span className="text-[10px] font-mono text-muted-foreground/60 flex items-center gap-1">
                      <MapPin className="w-2.5 h-2.5" /> {e.venue}
                    </span>
                  )}
                  {e.notify_minutes ? (
                    <span className="text-[10px] font-mono text-muted-foreground/40 flex items-center gap-1">
                      <Bell className="w-2.5 h-2.5" /> {e.notify_minutes}m
                    </span>
                  ) : null}
                </div>
              </div>
              <div className="flex items-center gap-1 ml-2 shrink-0">
                <button
                  onClick={() => openEdit(e)}
                  className="p-1.5 rounded-md hover:bg-muted/30 text-muted-foreground hover:text-foreground transition"
                  aria-label="Edit"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => remove(e.id)}
                  className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition"
                  aria-label="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        ))
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-mono uppercase tracking-wider text-sm">
              {editing ? 'Edit Class' : 'New Class'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs font-mono">Subject</Label>
              <Input
                value={form.subject_name}
                onChange={(ev) => setForm({ ...form, subject_name: ev.target.value })}
                placeholder="e.g. Data Structures"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs font-mono">Day</Label>
                <Select value={form.day} onValueChange={(v) => setForm({ ...form, day: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {DAYS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs font-mono">Type</Label>
                <Select value={form.class_type} onValueChange={(v) => setForm({ ...form, class_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CLASS_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs font-mono">Start</Label>
                <Input type="time" value={form.start_time} onChange={(ev) => setForm({ ...form, start_time: ev.target.value })} />
              </div>
              <div>
                <Label className="text-xs font-mono">End</Label>
                <Input type="time" value={form.end_time} onChange={(ev) => setForm({ ...form, end_time: ev.target.value })} />
              </div>
            </div>
            <div>
              <Label className="text-xs font-mono">Venue</Label>
              <Input value={form.venue} onChange={(ev) => setForm({ ...form, venue: ev.target.value })} placeholder="e.g. CS-201" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs font-mono">Color</Label>
                <div className="flex gap-2 mt-2">
                  {COLORS.map(c => (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => setForm({ ...form, color: c.name })}
                      className={cn(
                        'w-7 h-7 rounded-full border-2 transition',
                        c.cls.split(' ').filter(x => x.startsWith('bg-')).join(' '),
                        form.color === c.name ? 'border-foreground scale-110' : 'border-transparent'
                      )}
                      aria-label={c.name}
                    />
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-xs font-mono">Notify (min)</Label>
                <Input
                  type="number"
                  min={0}
                  max={120}
                  value={form.notify_minutes}
                  onChange={(ev) => setForm({ ...form, notify_minutes: Number(ev.target.value) })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} className="bg-primary/15 text-primary hover:bg-primary/25 border border-primary/30">
              {editing ? 'Save Changes' : 'Add Class'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
