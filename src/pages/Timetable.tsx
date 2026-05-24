import { useState, useMemo, useEffect, useCallback } from 'react';
import { TIMETABLE_DATA_BY_SEMESTER, type ClassSession } from '@/data/infohub-data';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Bell, BellOff, Clock, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { PageHeader } from '@/components/PageHeader';
import { MyTimetable } from '@/components/timetable/MyTimetable';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const semesterIds = Object.keys(TIMETABLE_DATA_BY_SEMESTER);
const defaultSemester = '2';
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const DAY_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

const typeStyles: Record<string, { border: string; bg: string; text: string; dot: string }> = {
  LECTURE: { border: 'border-l-secondary', bg: 'bg-secondary/[0.06]', text: 'text-secondary', dot: 'bg-secondary' },
  LAB: { border: 'border-l-accent', bg: 'bg-accent/[0.06]', text: 'text-accent', dot: 'bg-accent' },
  TUTORIAL: { border: 'border-l-amber-400', bg: 'bg-amber-400/[0.06]', text: 'text-amber-400', dot: 'bg-amber-400' },
  WORKSHOP: { border: 'border-l-primary', bg: 'bg-primary/[0.06]', text: 'text-primary', dot: 'bg-primary' },
};

const parseTimeToMinutes = (time: string) => {
  const normalized = time.trim().toUpperCase();

  const twelveHourMatch = normalized.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);
  if (twelveHourMatch) {
    const [, rawHour, rawMinute, period] = twelveHourMatch;
    let hour = Number(rawHour) % 12;
    const minute = Number(rawMinute);
    if (period === 'PM') hour += 12;
    return hour * 60 + minute;
  }

  const twentyFourHourMatch = normalized.match(/^(\d{1,2}):(\d{2})$/);
  if (twentyFourHourMatch) {
    const [, rawHour, rawMinute] = twentyFourHourMatch;
    return Number(rawHour) * 60 + Number(rawMinute);
  }

  return Number.NaN;
};

const formatTo12Hour = (time: string) => {
  const minutes = parseTimeToMinutes(time);
  if (Number.isNaN(minutes)) return time;

  const hour24 = Math.floor(minutes / 60) % 24;
  const minute = minutes % 60;
  const period = hour24 >= 12 ? 'PM' : 'AM';
  const hour12 = hour24 % 12 || 12;

  return `${hour12.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ${period}`;
};

type PersonalEntry = {
  id: string;
  day: string;
  start_time: string;
  end_time: string;
  subject_name: string;
  class_type: string | null;
  venue: string | null;
  color: string | null;
  is_active: boolean;
};

type SessionView = ClassSession & {
  isPersonal?: boolean;
  personalId?: string;
};

const Timetable = () => {
  const { user } = useAuth();
  const [semester, setSemester] = useState(defaultSemester);
  const [section, setSection] = useState(() => {
    const firstSection = Object.keys(TIMETABLE_DATA_BY_SEMESTER[defaultSemester] ?? {})[0];
    return firstSection ?? '';
  });
  const [batch, setBatch] = useState<'ALL' | '1' | '2'>('ALL');
  const [selectedDay, setSelectedDay] = useState(() => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    return DAYS.includes(today) ? today : 'Monday';
  });
  const [remindersEnabled, setRemindersEnabled] = useState(() => {
    return localStorage.getItem('timetable-reminders') === 'true';
  });
  const [now, setNow] = useState(new Date());
  const [view, setView] = useState<'section' | 'personal'>('section');
  const [personalEntries, setPersonalEntries] = useState<PersonalEntry[]>([]);

  useEffect(() => {
    if (!user) {
      setPersonalEntries([]);
      return;
    }
    let cancelled = false;
    supabase
      .from('timetable_entries')
      .select('id,day,start_time,end_time,subject_name,class_type,venue,color,is_active')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .then(({ data }) => {
        if (!cancelled) setPersonalEntries((data ?? []) as PersonalEntry[]);
      });
    return () => { cancelled = true; };
  }, [user, view]);

  const semesterData = TIMETABLE_DATA_BY_SEMESTER[semester] ?? {};
  const sectionIds = useMemo(() => Object.keys(semesterData), [semesterData]);

  useEffect(() => {
    if (sectionIds.length === 0) {
      setSection('');
      return;
    }

    if (!sectionIds.includes(section)) {
      setSection(sectionIds[0]);
    }
  }, [section, sectionIds]);

  // Update current time every 30s
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(interval);
  }, []);

  const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' });
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  const sectionData = semesterData[section];

  const isCurrentSession = (session: ClassSession, day: string) => {
    if (day !== currentDay) return false;
    const start = parseTimeToMinutes(session.startTime);
    const end = parseTimeToMinutes(session.endTime);
    return nowMinutes >= start && nowMinutes < end;
  };

  const isUpcoming = (session: ClassSession, day: string) => {
    if (day !== currentDay) return false;
    const sessionMin = parseTimeToMinutes(session.startTime);
    const diff = sessionMin - nowMinutes;
    return diff > 0 && diff <= 15;
  };

  const filteredSchedule = useMemo(() => {
    if (!sectionData) return [];
    return sectionData.schedule.map(daySchedule => ({
      ...daySchedule,
      sessions: daySchedule.sessions
        .filter(s => batch === 'ALL' || s.batch === 'ALL' || s.batch === batch)
        .sort((a, b) => parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime)),
    }));
  }, [sectionData, batch]);

  const todaySessions = useMemo<SessionView[]>(() => {
    const base: SessionView[] = filteredSchedule.find(d => d.day === selectedDay)?.sessions || [];
    const mine: SessionView[] = personalEntries
      .filter(e => e.day === selectedDay)
      .map(e => ({
        startTime: e.start_time,
        endTime: e.end_time,
        subject: e.subject_name,
        room: e.venue ?? undefined,
        type: ((e.class_type || 'LECTURE').toUpperCase() as ClassSession['type']),
        batch: 'ALL',
        isPersonal: true,
        personalId: e.id,
      }));
    return [...base, ...mine].sort(
      (a, b) => parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime)
    );
  }, [filteredSchedule, selectedDay, personalEntries]);

  // Reminder notification system
  const checkReminders = useCallback(() => {
    if (!remindersEnabled) return;
    if (!('Notification' in window)) return;

    const nowMin = now.getHours() * 60 + now.getMinutes();
    const todayData = filteredSchedule.find(d => d.day === currentDay);
    if (!todayData) return;

    todayData.sessions.forEach(session => {
      const sessionMin = parseTimeToMinutes(session.startTime);
      const diff = sessionMin - nowMin;

      if (diff === 5) {
        const key = `reminder-${currentDay}-${session.startTime}-${session.subject}`;
        if (!sessionStorage.getItem(key)) {
          sessionStorage.setItem(key, 'true');
          toast(`📚 ${session.subject} starts in 5 min`, {
            description: `${formatTo12Hour(session.startTime)} – ${formatTo12Hour(session.endTime)} · ${session.room || 'TBA'}`,
            duration: 10000,
          });

          if (Notification.permission === 'granted') {
            new Notification(`📚 ${session.subject} in 5 minutes`, {
              body: `${formatTo12Hour(session.startTime)} – ${formatTo12Hour(session.endTime)} · ${session.room || 'TBA'}`,
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

  const personalForDay = (day: string) =>
    personalEntries.filter(e => e.day === day).length;

  return (
    <div className="flex flex-col h-[calc(100dvh-7rem)] md:h-[calc(100vh-3rem)] overflow-hidden">
      {/* Top bar with PageHeader typewriter */}
      <div className="px-3 md:px-6 pt-3 md:pt-4 pb-2 border-b border-border/[0.06] shrink-0">
        <PageHeader title="TIMETABLE" className="mb-2 md:mb-4">
          <div className="flex items-center gap-1.5 md:gap-3 flex-wrap">
            <Select value={semester} onValueChange={setSemester}>
              <SelectTrigger className="w-[110px] md:w-36 h-8 md:h-10 rounded-lg md:rounded-xl bg-muted/15 border-border/[0.08] text-[11px] md:text-xs font-mono">
                <SelectValue placeholder="Sem" />
              </SelectTrigger>
              <SelectContent>
                {semesterIds.map(sem => (
                  <SelectItem key={sem} value={sem}>Semester {sem}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={toggleReminders}
              aria-label={remindersEnabled ? 'Disable reminders' : 'Enable reminders'}
              className={cn(
                'flex items-center gap-1.5 px-2.5 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl text-[11px] md:text-xs font-mono transition-all',
                remindersEnabled
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'bg-muted/15 text-muted-foreground border border-border/[0.08]'
              )}
            >
              {remindersEnabled ? <Bell className="w-3.5 h-3.5" /> : <BellOff className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{remindersEnabled ? 'Reminders On' : 'Reminders Off'}</span>
            </motion.button>
          </div>
        </PageHeader>

        <div className="flex flex-wrap items-center gap-1.5 md:gap-3">
          <Tabs value={view} onValueChange={(v) => setView(v as 'section' | 'personal')}>
            <TabsList className="h-9 md:h-10 rounded-lg md:rounded-xl bg-muted/15 border border-border/[0.08] p-0.5">
              <TabsTrigger value="section" className="h-7 md:h-8 rounded-md md:rounded-lg text-[11px] md:text-xs font-mono px-2.5 md:px-4 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                Section
              </TabsTrigger>
              <TabsTrigger value="personal" className="h-7 md:h-8 rounded-md md:rounded-lg text-[11px] md:text-xs font-mono px-2.5 md:px-4 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                My Schedule
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {view === 'section' && (
            <>
              <Select value={section} onValueChange={setSection}>
                <SelectTrigger className="flex-1 min-w-[120px] md:flex-none md:w-44 h-9 md:h-10 rounded-lg md:rounded-xl bg-muted/15 border-border/[0.08] text-[11px] md:text-sm font-mono">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sectionIds.map(id => (
                    <SelectItem key={id} value={id}>{semesterData[id]?.name ?? id}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Tabs value={batch} onValueChange={(v) => setBatch(v as 'ALL' | '1' | '2')}>
                <TabsList className="h-9 md:h-10 rounded-lg md:rounded-xl bg-muted/15 border border-border/[0.08] p-0.5">
                  {['ALL', '1', '2'].map(v => (
                    <TabsTrigger key={v} value={v} className="h-7 md:h-8 rounded-md md:rounded-lg text-[11px] md:text-xs font-mono px-2 md:px-4 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                      {v === 'ALL' ? 'All' : `B${v}`}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>

              <div className="hidden lg:flex items-center gap-4 ml-auto">
                {Object.entries(typeStyles).map(([type, style]) => (
                  <div key={type} className="flex items-center gap-2">
                    <div className={cn('w-2 h-2 rounded-full', style.dot)} />
                    <span className="text-[10px] text-muted-foreground/50 font-mono capitalize">{type.toLowerCase()}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>


      {/* Day tabs */}
      <div className="flex items-center gap-1 px-2 md:px-6 py-2 md:py-3 border-b border-border/[0.04] shrink-0 overflow-x-auto scrollbar-hide snap-x">
        {DAYS.map((day, i) => {
          const isToday = day === currentDay;
          const isSelected = day === selectedDay;
          const dayData = filteredSchedule.find(d => d.day === day);
          const count = (dayData?.sessions.length || 0) + (view === 'section' ? personalForDay(day) : 0);

          return (
            <motion.button
              key={day}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedDay(day)}
              className={cn(
                'relative flex flex-col items-center gap-0.5 px-3 md:px-5 py-2 md:py-2.5 rounded-lg md:rounded-xl text-sm font-mono transition-all min-w-[60px] md:min-w-[72px] snap-start',
                isSelected ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted/10'
              )}
            >
              {isSelected && (
                <motion.div
                  layoutId="day-pill"
                  className="absolute inset-0 rounded-lg md:rounded-xl bg-primary/[0.08]"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10 font-medium text-[12px] md:text-sm">{DAY_SHORT[i]}</span>
              <span className={cn(
                'relative z-10 text-[9px]',
                isSelected ? 'text-primary/60' : 'text-muted-foreground/40'
              )}>
                {count}
              </span>
              {isToday && (
                <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-primary shadow-[0_0_6px_hsl(var(--primary)/0.6)]" />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Sessions list - line by line */}
      <div className="flex-1 overflow-y-auto px-2 md:px-6 py-3 pb-20 md:pb-3">
        {view === 'personal' ? (
          <MyTimetable selectedDay={selectedDay} />
        ) : (
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
                const isPast = selectedDay === currentDay && nowMinutes > parseTimeToMinutes(session.endTime);
                const isPersonal = session.isPersonal;

                return (
                  <motion.div
                    key={`${session.isPersonal ? 'me-' : ''}${session.startTime}-${session.subject}-${i}`}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className={cn(
                      'flex items-stretch rounded-xl border-l-[3px] transition-all',
                      isPersonal ? 'border-l-primary bg-primary/[0.04] ring-1 ring-primary/25 shadow-[0_0_24px_hsl(var(--primary)/0.10)]' : style.border,
                      isCurrent && !isPersonal ? 'ring-1 ring-primary/20 shadow-[0_0_20px_hsl(var(--primary)/0.08)]' : '',
                      isPast ? 'opacity-40' : ''
                    )}
                  >
                    {/* Time column */}
                    <div className={cn(
                      'flex flex-col items-center justify-center w-14 md:w-20 shrink-0 py-2.5 md:py-3 px-1.5 md:px-2 rounded-l-xl',
                      isPersonal ? 'bg-primary/[0.10]' : style.bg
                    )}>
                      <span className={cn('text-[11px] md:text-xs font-mono font-medium', isPersonal ? 'text-primary' : style.text)}>
                        {formatTo12Hour(session.startTime)}
                      </span>
                      <span className="text-[8px] font-mono text-muted-foreground/30 my-0.5">→</span>
                      <span className={cn('text-[9px] md:text-[10px] font-mono opacity-60', isPersonal ? 'text-primary' : style.text)}>
                        {formatTo12Hour(session.endTime)}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 flex items-center justify-between px-2.5 md:px-4 py-2.5 md:py-3 bg-card/30 rounded-r-xl min-w-0">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {isPersonal && (
                            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-primary/15 border border-primary/30">
                              <Sparkles className="w-2.5 h-2.5 text-primary" />
                              <span className="text-[8px] font-mono font-bold text-primary uppercase tracking-wider">Mine</span>
                            </div>
                          )}
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
                          <p className="text-[13px] md:text-sm font-medium truncate text-foreground">
                            {session.subject.split('(')[0].trim()}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          <span className={cn(
                            'text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded',
                            isPersonal ? 'bg-primary/10 text-primary' : cn(style.bg, style.text)
                          )}>
                            {session.type}
                          </span>
                          {session.combinedInfo && (
                            <span className="text-[9px] font-mono text-muted-foreground px-1.5 py-0.5 rounded bg-muted/30 border border-border/40">
                              {session.combinedInfo}
                            </span>
                          )}
                          {session.room && (
                            <span className="text-[10px] font-mono text-muted-foreground/60 truncate max-w-[140px]">
                              {session.room}
                            </span>
                          )}
                          {session.batch !== 'ALL' && !isPersonal && (
                            <span className="text-[10px] font-mono text-muted-foreground/40">
                              B{session.batch}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Duration */}
                      <div className="text-right shrink-0 ml-2 hidden sm:block">
                        <span className="text-[10px] font-mono text-muted-foreground/30">
                          {(() => {
                            const start = parseTimeToMinutes(session.startTime);
                            const end = parseTimeToMinutes(session.endTime);
                            const dur = end - start;
                            return Number.isFinite(dur) && dur > 0 ? `${dur}min` : '--';
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
        )}
      </div>

    </div>
  );
};

export default Timetable;
