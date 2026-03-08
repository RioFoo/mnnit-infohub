import { useState, useMemo, useEffect, useCallback } from 'react';
import { TIMETABLE_DATA, type ClassSession } from '@/data/infohub-data';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Bell, BellOff, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { PageHeader } from '@/components/PageHeader';

const sectionIds = Object.keys(TIMETABLE_DATA);
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const DAY_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

const typeStyles: Record<string, { border: string; bg: string; text: string; dot: string }> = {
  LECTURE: { border: 'border-l-secondary', bg: 'bg-secondary/[0.06]', text: 'text-secondary', dot: 'bg-secondary' },
  LAB: { border: 'border-l-accent', bg: 'bg-accent/[0.06]', text: 'text-accent', dot: 'bg-accent' },
  TUTORIAL: { border: 'border-l-amber-400', bg: 'bg-amber-400/[0.06]', text: 'text-amber-400', dot: 'bg-amber-400' },
  WORKSHOP: { border: 'border-l-primary', bg: 'bg-primary/[0.06]', text: 'text-primary', dot: 'bg-primary' },
};

const Timetable = () => {
  const [section, setSection] = useState(sectionIds[0]);
  const [batch, setBatch] = useState<'ALL' | '1' | '2'>('ALL');
  const [selectedDay, setSelectedDay] = useState(() => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    return DAYS.includes(today) ? today : 'Monday';
  });
  const [remindersEnabled, setRemindersEnabled] = useState(() => {
    return localStorage.getItem('timetable-reminders') === 'true';
  });
  const [now, setNow] = useState(new Date());

  // Update current time every 30s
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(interval);
  }, []);

  const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' });
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  const sectionData = TIMETABLE_DATA[section];

  const isCurrentSession = (session: ClassSession, day: string) => {
    return day === currentDay && currentTime >= session.startTime && currentTime < session.endTime;
  };

  const isUpcoming = (session: ClassSession, day: string) => {
    if (day !== currentDay) return false;
    const [h, m] = session.startTime.split(':').map(Number);
    const sessionMin = h * 60 + m;
    const nowMin = now.getHours() * 60 + now.getMinutes();
    return sessionMin > nowMin && sessionMin - nowMin <= 15;
  };

  const filteredSchedule = useMemo(() => {
    if (!sectionData) return [];
    return sectionData.schedule.map(daySchedule => ({
      ...daySchedule,
      sessions: daySchedule.sessions
        .filter(s => batch === 'ALL' || s.batch === 'ALL' || s.batch === batch)
        .sort((a, b) => a.startTime.localeCompare(b.startTime)),
    }));
  }, [sectionData, batch]);

  const todaySessions = useMemo(() => {
    return filteredSchedule.find(d => d.day === selectedDay)?.sessions || [];
  }, [filteredSchedule, selectedDay]);

  // Reminder notification system
  const checkReminders = useCallback(() => {
    if (!remindersEnabled) return;
    if (!('Notification' in window)) return;

    const nowMin = now.getHours() * 60 + now.getMinutes();
    const todayData = filteredSchedule.find(d => d.day === currentDay);
    if (!todayData) return;

    todayData.sessions.forEach(session => {
      const [h, m] = session.startTime.split(':').map(Number);
      const sessionMin = h * 60 + m;
      const diff = sessionMin - nowMin;

      if (diff === 5) {
        const key = `reminder-${currentDay}-${session.startTime}-${session.subject}`;
        if (!sessionStorage.getItem(key)) {
          sessionStorage.setItem(key, 'true');
          toast(`📚 ${session.subject} starts in 5 min`, {
            description: `${session.startTime} – ${session.endTime} · ${session.room || 'TBA'}`,
            duration: 10000,
          });

          if (Notification.permission === 'granted') {
            new Notification(`📚 ${session.subject} in 5 minutes`, {
              body: `${session.startTime} – ${session.endTime} · ${session.room || 'TBA'}`,
              icon: '/favicon.ico',
            });
          }
        }
      }
    });
  }, [remindersEnabled, now, filteredSchedule, currentDay]);

  useEffect(() => {
    checkReminders();
  }, [checkReminders]);

  const toggleReminders = async () => {
    if (!remindersEnabled) {
      if ('Notification' in window && Notification.permission === 'default') {
        await Notification.requestPermission();
      }
      localStorage.setItem('timetable-reminders', 'true');
      setRemindersEnabled(true);
      toast.success('Class reminders enabled — you\'ll get notified 5 min before each class');
    } else {
      localStorage.setItem('timetable-reminders', 'false');
      setRemindersEnabled(false);
      toast('Reminders disabled');
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-3rem)] md:h-[calc(100vh-3rem)] overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-border/[0.06] shrink-0">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          <h1 className="font-display font-bold text-sm tracking-wider uppercase text-foreground">Timetable</h1>
        </div>

        <div className="flex items-center gap-2">
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={toggleReminders}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-mono transition-all',
              remindersEnabled
                ? 'bg-primary/10 text-primary border border-primary/20'
                : 'bg-muted/15 text-muted-foreground border border-border/[0.08]'
            )}
          >
            {remindersEnabled ? <Bell className="w-3 h-3" /> : <BellOff className="w-3 h-3" />}
            <span className="hidden sm:inline">{remindersEnabled ? 'On' : 'Off'}</span>
          </motion.button>

          <Select value={section} onValueChange={setSection}>
            <SelectTrigger className="w-36 h-8 rounded-lg bg-muted/15 border-border/[0.08] text-xs font-mono">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sectionIds.map(id => (
                <SelectItem key={id} value={id}>{TIMETABLE_DATA[id].name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Tabs value={batch} onValueChange={(v) => setBatch(v as 'ALL' | '1' | '2')}>
            <TabsList className="h-8 rounded-lg bg-muted/15 border border-border/[0.08]">
              {['ALL', '1', '2'].map(v => (
                <TabsTrigger key={v} value={v} className="h-6 rounded text-[10px] font-mono px-2.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                  {v === 'ALL' ? 'All' : `B${v}`}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Day tabs */}
      <div className="flex items-center gap-1 px-4 md:px-6 py-2 border-b border-border/[0.04] shrink-0 overflow-x-auto">
        {DAYS.map((day, i) => {
          const isToday = day === currentDay;
          const isSelected = day === selectedDay;
          const dayData = filteredSchedule.find(d => d.day === day);
          const count = dayData?.sessions.length || 0;

          return (
            <motion.button
              key={day}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedDay(day)}
              className={cn(
                'relative flex flex-col items-center gap-0.5 px-4 py-2 rounded-lg text-xs font-mono transition-all min-w-[60px]',
                isSelected ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted/10'
              )}
            >
              {isSelected && (
                <motion.div
                  layoutId="day-pill"
                  className="absolute inset-0 rounded-lg bg-primary/[0.08]"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10 font-medium">{DAY_SHORT[i]}</span>
              <span className={cn(
                'relative z-10 text-[8px]',
                isSelected ? 'text-primary/60' : 'text-muted-foreground/40'
              )}>
                {count} class{count !== 1 ? 'es' : ''}
              </span>
              {isToday && (
                <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_6px_hsl(var(--primary)/0.6)]" />
              )}
            </motion.button>
          );
        })}

        {/* Legend */}
        <div className="hidden md:flex items-center gap-3 ml-auto pl-4 border-l border-border/[0.06]">
          {Object.entries(typeStyles).map(([type, style]) => (
            <div key={type} className="flex items-center gap-1.5">
              <div className={cn('w-1.5 h-1.5 rounded-full', style.dot)} />
              <span className="text-[9px] text-muted-foreground/50 font-mono capitalize">{type.toLowerCase()}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Sessions list - line by line */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-3">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedDay}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-1.5"
          >
            {todaySessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-muted-foreground/30">
                <Clock className="w-8 h-8 mb-2" />
                <p className="text-sm font-mono">No classes scheduled</p>
              </div>
            ) : (
              todaySessions.map((session, i) => {
                const style = typeStyles[session.type] || typeStyles.LECTURE;
                const isCurrent = isCurrentSession(session, selectedDay);
                const upcoming = isUpcoming(session, selectedDay);
                const isPast = selectedDay === currentDay && currentTime > session.endTime;

                return (
                  <motion.div
                    key={`${session.startTime}-${session.subject}-${i}`}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className={cn(
                      'flex items-stretch rounded-xl border-l-[3px] transition-all',
                      style.border,
                      isCurrent ? 'ring-1 ring-primary/20 shadow-[0_0_20px_hsl(var(--primary)/0.08)]' : '',
                      isPast ? 'opacity-40' : ''
                    )}
                  >
                    {/* Time column */}
                    <div className={cn(
                      'flex flex-col items-center justify-center w-16 md:w-20 shrink-0 py-3 px-2',
                      style.bg,
                      'rounded-l-lg'
                    )}>
                      <span className={cn('text-xs font-mono font-medium', style.text)}>
                        {session.startTime}
                      </span>
                      <span className="text-[8px] font-mono text-muted-foreground/30 my-0.5">→</span>
                      <span className={cn('text-[10px] font-mono', style.text, 'opacity-60')}>
                        {session.endTime}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 flex items-center justify-between px-3 md:px-4 py-3 bg-card/30 rounded-r-xl min-w-0">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          {isCurrent && (
                            <motion.div
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                              className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-primary/10"
                            >
                              <Activity className="w-2.5 h-2.5 text-primary" />
                              <span className="text-[8px] font-mono font-bold text-primary uppercase">Live</span>
                            </motion.div>
                          )}
                          {upcoming && !isCurrent && (
                            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-400/10">
                              <Bell className="w-2.5 h-2.5 text-amber-400" />
                              <span className="text-[8px] font-mono font-bold text-amber-400 uppercase">Soon</span>
                            </div>
                          )}
                          <p className="text-sm font-medium truncate text-foreground">
                            {session.subject.split('(')[0].trim()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={cn('text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded', style.bg, style.text)}>
                            {session.type}
                          </span>
                          {session.room && (
                            <span className="text-[10px] font-mono text-muted-foreground/50">
                              {session.room}
                            </span>
                          )}
                          {session.batch !== 'ALL' && (
                            <span className="text-[10px] font-mono text-muted-foreground/40">
                              Batch {session.batch}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Duration */}
                      <div className="text-right shrink-0 ml-3 hidden sm:block">
                        <span className="text-[10px] font-mono text-muted-foreground/30">
                          {(() => {
                            const [sh, sm] = session.startTime.split(':').map(Number);
                            const [eh, em] = session.endTime.split(':').map(Number);
                            const dur = (eh * 60 + em) - (sh * 60 + sm);
                            return `${dur}min`;
                          })()}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Timetable;
