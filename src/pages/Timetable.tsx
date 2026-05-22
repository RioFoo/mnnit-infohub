import { useState, useMemo, useEffect, useCallback, Component, ReactNode } from 'react';
import { TIMETABLE_DATA_BY_SEMESTER, type ClassSession } from '@/data/infohub-data';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Bell, BellOff, Clock, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { PageHeader } from '@/components/PageHeader';
import { MyTimetable, type PersonalEntry } from '@/components/timetable/MyTimetable';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';

const semesterIds = Object.keys(TIMETABLE_DATA_BY_SEMESTER);
const defaultSemester = semesterIds[0] ?? '2';
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

const semesterKeyFromProfile = (sem: string | null | undefined) => {
  if (!sem) return null;
  const digits = sem.replace(/\D/g, '');
  return semesterIds.includes(digits) ? digits : null;
};

const sectionKeyFromProfile = (branch: string | null | undefined, section: string | null | undefined, semKey: string) => {
  if (!branch || !section) return null;
  const candidate = `${branch}-${section}`.toUpperCase();
  const available = Object.keys(TIMETABLE_DATA_BY_SEMESTER[semKey] ?? {});
  return available.includes(candidate) ? candidate : null;
};

const TimetableInner = () => {
  const { profile } = useAuth();

  const initialSemester = semesterKeyFromProfile(profile?.semester) ?? defaultSemester;
  const initialSection =
    sectionKeyFromProfile(profile?.branch, profile?.section, initialSemester) ??
    Object.keys(TIMETABLE_DATA_BY_SEMESTER[initialSemester] ?? {})[0] ??
    '';

  const [semester, setSemester] = useState(initialSemester);
  const [section, setSection] = useState(initialSection);
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

  const profileHasSection = !!(profile?.branch && profile?.section);


  const semesterData = TIMETABLE_DATA_BY_SEMESTER[semester] ?? {};
  const sectionIds = useMemo(() => Object.keys(semesterData), [semesterData]);

  useEffect(() => {
    if (sectionIds.length === 0) {
      setSection('');
      return;
    }
    const fromProfile = sectionKeyFromProfile(profile?.branch, profile?.section, semester);
    if (fromProfile && fromProfile !== section) {
      setSection(fromProfile);
      return;
    }
    if (!sectionIds.includes(section)) {
      setSection(sectionIds[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionIds, profile?.branch, profile?.section, semester]);

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

  const todaySessions = useMemo(() => {
    return filteredSchedule.find(d => d.day === selectedDay)?.sessions || [];
  }, [filteredSchedule, selectedDay]);

  // Reminder notification system — covers both section + personal entries
  const checkReminders = useCallback(() => {
    if (!remindersEnabled) return;
    if (!('Notification' in window)) return;

    const nowMin = now.getHours() * 60 + now.getMinutes();

    const fire = (subject: string, startTime: string, endTime: string, venue: string | null, leadMin: number) => {
      const key = `reminder-${currentDay}-${startTime}-${subject}`;
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, 'true');
      const venueLabel = venue || 'TBA';
      const body = `${formatTo12Hour(startTime)} – ${formatTo12Hour(endTime)} · ${venueLabel}`;
      toast(`📚 ${subject} in ${leadMin} mins — ${venueLabel}`, {
        description: body,
        duration: 10000,
      });
      if (Notification.permission === 'granted') {
        new Notification(`📚 ${subject} in ${leadMin} mins — ${venueLabel}`, {
          body,
          icon: '/favicon.ico',
        });
      }
    };

    // Section sessions (5-min lead)
    const todaySection = filteredSchedule.find(d => d.day === currentDay);
    todaySection?.sessions.forEach(s => {
      const diff = parseTimeToMinutes(s.startTime) - nowMin;
      if (diff === 5) fire(s.subject, s.startTime, s.endTime, s.room ?? null, 5);
    });

    // Personal entries (per-entry notify_minutes, default 10)
    personalEntries
      .filter(e => e.is_active && e.day === currentDay)
      .forEach(e => {
        const diff = parseTimeToMinutes(e.start_time) - nowMin;
        const lead = e.notify_minutes ?? 10;
        if (diff === lead) fire(e.subject_name, e.start_time, e.end_time, e.venue, lead);
      });
  }, [remindersEnabled, now, filteredSchedule, currentDay, personalEntries]);

  useEffect(() => {
    checkReminders();
  }, [checkReminders]);

  const toggleReminders = async () => {
    if (remindersEnabled) {
      localStorage.setItem('timetable-reminders', 'false');
      setRemindersEnabled(false);
      toast('Reminders disabled');
      return;
    }
    if (!('Notification' in window)) {
      toast.error('This browser does not support notifications');
      return;
    }
    let permission = Notification.permission;
    if (permission === 'default') {
      permission = await Notification.requestPermission();
    }
    if (permission === 'denied') {
      toast.error('Please allow notifications in browser settings');
      return;
    }
    localStorage.setItem('timetable-reminders', 'true');
    setRemindersEnabled(true);
    toast.success("Class reminders enabled — you'll get notified before each class");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] md:h-[calc(100vh-3rem)] overflow-hidden">
      {/* Top bar with PageHeader typewriter */}
      <div className="px-3 md:px-6 pt-3 md:pt-4 pb-2 border-b border-border/[0.06] shrink-0">
        <PageHeader title="TIMETABLE" className="mb-3 md:mb-4">
          <div className="flex items-center gap-2 md:gap-3 flex-wrap">
            <Select value={semester} onValueChange={setSemester}>
              <SelectTrigger className="w-28 md:w-36 h-9 md:h-10 rounded-xl bg-muted/15 border-border/[0.08] text-xs font-mono">
                <SelectValue placeholder="Semester" />
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
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono transition-all',
                remindersEnabled
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'bg-muted/15 text-muted-foreground border border-border/[0.08]'
              )}
            >
              {remindersEnabled ? <Bell className="w-3.5 h-3.5" /> : <BellOff className="w-3.5 h-3.5" />}
              <span>{remindersEnabled ? 'Reminders On' : 'Reminders Off'}</span>
            </motion.button>
          </div>
        </PageHeader>

        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          <Tabs value={view} onValueChange={(v) => setView(v as 'section' | 'personal')}>
            <TabsList className="h-10 rounded-xl bg-muted/15 border border-border/[0.08]">
              <TabsTrigger value="section" className="h-8 rounded-lg text-xs font-mono px-4 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                Section
              </TabsTrigger>
              <TabsTrigger value="personal" className="h-8 rounded-lg text-xs font-mono px-4 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                My Schedule
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {view === 'section' && (
            <>
              <Select value={section} onValueChange={setSection}>
                <SelectTrigger className="w-32 md:w-44 h-9 md:h-10 rounded-xl bg-muted/15 border-border/[0.08] text-sm font-mono">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sectionIds.map(id => (
                    <SelectItem key={id} value={id}>{semesterData[id]?.name ?? id}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Tabs value={batch} onValueChange={(v) => setBatch(v as 'ALL' | '1' | '2')}>
                <TabsList className="h-10 rounded-xl bg-muted/15 border border-border/[0.08]">
                  {['ALL', '1', '2'].map(v => (
                    <TabsTrigger key={v} value={v} className="h-8 rounded-lg text-xs font-mono px-4 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                      {v === 'ALL' ? 'All Batches' : `Batch ${v}`}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>

              <div className="hidden md:flex items-center gap-4 ml-auto">
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
      <div className="flex items-center gap-1 md:gap-1.5 px-3 md:px-6 py-2 md:py-3 border-b border-border/[0.04] shrink-0 overflow-x-auto scrollbar-hide">
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
                'relative flex flex-col items-center gap-1 px-5 py-2.5 rounded-xl text-sm font-mono transition-all min-w-[72px]',
                isSelected ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted/10'
              )}
            >
              {isSelected && (
                <motion.div
                  layoutId="day-pill"
                  className="absolute inset-0 rounded-xl bg-primary/[0.08]"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10 font-medium">{DAY_SHORT[i]}</span>
              <span className={cn(
                'relative z-10 text-[9px]',
                isSelected ? 'text-primary/60' : 'text-muted-foreground/40'
              )}>
                {count} class{count !== 1 ? 'es' : ''}
              </span>
              {isToday && (
                <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-primary shadow-[0_0_6px_hsl(var(--primary)/0.6)]" />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Sessions list - line by line */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-3">
        {view === 'personal' ? (
          <MyTimetable selectedDay={selectedDay} onEntriesChange={setPersonalEntries} />
        ) : !profileHasSection ? (
          <div className="flex flex-col items-center justify-center h-56 gap-3 text-center px-6">
            <Clock className="w-10 h-10 text-muted-foreground/30" />
            <p className="text-sm font-mono text-muted-foreground">Select your branch and section</p>
            <p className="text-xs font-mono text-muted-foreground/50 max-w-sm">
              Set your branch and section in your profile to see your official class schedule here.
            </p>
            <Link
              to="/settings"
              className="mt-1 px-3 py-1.5 rounded-md border border-primary/30 bg-primary/10 text-primary text-xs font-mono hover:bg-primary/20"
            >
              Open Settings
            </Link>
          </div>
        ) : !sectionData ? (
          <div className="flex flex-col items-center justify-center h-56 gap-3 text-center px-6">
            <Clock className="w-10 h-10 text-muted-foreground/30" />
            <p className="text-sm font-mono text-muted-foreground">
              No timetable available for {profile?.branch}-{profile?.section} (sem {semester})
            </p>
            <p className="text-xs font-mono text-muted-foreground/50">Pick another section from the dropdown above.</p>
          </div>
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
                        {formatTo12Hour(session.startTime)}
                      </span>
                      <span className="text-[8px] font-mono text-muted-foreground/30 my-0.5">→</span>
                      <span className={cn('text-[10px] font-mono', style.text, 'opacity-60')}>
                        {formatTo12Hour(session.endTime)}
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
                          {session.combinedInfo && (
                            <span className="text-[9px] font-mono text-muted-foreground px-1.5 py-0.5 rounded bg-muted/30 border border-border/40">
                              {session.combinedInfo}
                            </span>
                          )}
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

// Local ErrorBoundary so a render error inside Timetable never leaves a blank screen
class TimetableErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  componentDidCatch(error: Error, info: unknown) {
    // eslint-disable-next-line no-console
    console.error('[Timetable] render error', error, info);
  }
  render() {
    if (this.state.error) {
      return (
        <div className="flex flex-col items-center justify-center h-[60vh] gap-3 px-6 text-center">
          <AlertTriangle className="w-10 h-10 text-destructive" />
          <p className="font-mono text-sm text-destructive">Timetable failed to render</p>
          <p className="font-mono text-xs text-destructive/70 max-w-md break-words">
            {this.state.error.message}
          </p>
          <button
            onClick={() => this.setState({ error: null })}
            className="mt-2 px-3 py-1.5 rounded-md border border-destructive/30 text-destructive text-xs font-mono hover:bg-destructive/10"
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const Timetable = () => (
  <TimetableErrorBoundary>
    <TimetableInner />
  </TimetableErrorBoundary>
);

export default Timetable;
