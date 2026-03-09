import { useState, useMemo } from 'react';
import { ACADEMIC_EVENTS, type AcademicEvent, type EventType } from '@/data/infohub-data';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Clock, CalendarDays } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageHeader } from '@/components/PageHeader';
import { cn } from '@/lib/utils';
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval, getDay,
  addMonths, subMonths, isSameDay, isToday, parseISO, differenceInCalendarDays
} from 'date-fns';

const typeColors: Record<EventType, { border: string; bg: string; text: string; dot: string; badge: string }> = {
  EXAM: {
    border: 'border-l-destructive',
    bg: 'bg-destructive/[0.06]',
    text: 'text-destructive',
    dot: 'bg-destructive shadow-[0_0_6px_hsl(0,72%,55%,0.6)]',
    badge: 'bg-destructive/15 text-destructive border-destructive/20',
  },
  HOLIDAY: {
    border: 'border-l-primary',
    bg: 'bg-primary/[0.06]',
    text: 'text-primary',
    dot: 'bg-primary shadow-[0_0_6px_hsl(var(--primary)/0.6)]',
    badge: 'bg-primary/15 text-primary border-primary/20',
  },
  ACADEMIC: {
    border: 'border-l-secondary',
    bg: 'bg-secondary/[0.06]',
    text: 'text-secondary',
    dot: 'bg-secondary shadow-[0_0_6px_hsl(var(--secondary)/0.6)]',
    badge: 'bg-secondary/15 text-secondary border-secondary/20',
  },
  EVENT: {
    border: 'border-l-accent',
    bg: 'bg-accent/[0.06]',
    text: 'text-accent',
    dot: 'bg-accent shadow-[0_0_6px_hsl(var(--accent)/0.6)]',
    badge: 'bg-accent/15 text-accent border-accent/20',
  },
  PRACTICAL: {
    border: 'border-l-amber-400',
    bg: 'bg-amber-400/[0.06]',
    text: 'text-amber-400',
    dot: 'bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.6)]',
    badge: 'bg-amber-400/15 text-amber-400 border-amber-400/20',
  },
};

const Calendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDay = getDay(monthStart);
  const today = useMemo(() => new Date(), []);

  const eventsMap = useMemo(() => {
    const map = new Map<string, AcademicEvent[]>();
    ACADEMIC_EVENTS.forEach(ev => {
      if (!map.has(ev.rawDate)) map.set(ev.rawDate, []);
      map.get(ev.rawDate)!.push(ev);
    });
    return map;
  }, []);

  const selectedEvents = selectedDay ? eventsMap.get(format(selectedDay, 'yyyy-MM-dd')) || [] : [];

  const upcomingEvents = useMemo(() => {
    return ACADEMIC_EVENTS.filter(e => parseISO(e.rawDate) >= today).slice(0, 10);
  }, [today]);

  const getDaysLeft = (rawDate: string) => {
    const diff = differenceInCalendarDays(parseISO(rawDate), today);
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Tomorrow';
    return `${diff} days left`;
  };

  return (
    <div className="page-container">
      <PageHeader title="CALENDAR" />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
        {/* Calendar grid */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="card-bio p-5 md:p-6"
          >
            {/* Month navigation */}
            <div className="flex items-center justify-between mb-6">
              <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="rounded-xl hover:bg-primary/[0.05]">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <h2 className="font-display font-bold text-base md:text-lg tracking-wide">{format(currentMonth, 'MMMM yyyy')}</h2>
              <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="rounded-xl hover:bg-primary/[0.05]">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-7 gap-0.5 sm:gap-1.5">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d, i) => (
                <div key={i} className="text-center text-[9px] sm:text-[10px] text-muted-foreground/40 font-mono font-medium py-1 sm:py-2">{d}</div>
              ))}
              {Array.from({ length: startDay }).map((_, i) => <div key={`e-${i}`} />)}
              {days.map(day => {
                const dateKey = format(day, 'yyyy-MM-dd');
                const dayEvents = eventsMap.get(dateKey) || [];
                const selected = selectedDay && isSameDay(day, selectedDay);
                const isToday_ = isToday(day);
                const hasEvents = dayEvents.length > 0;

                return (
                  <motion.button
                    key={dateKey}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedDay(day)}
                    className={cn(
                      'relative p-1 sm:p-2 min-h-[40px] sm:min-h-[56px] rounded-lg sm:rounded-xl text-sm transition-all duration-200 border',
                      selected
                        ? 'bg-primary/10 border-primary/30 shadow-[0_0_12px_hsl(var(--primary)/0.15)]'
                        : hasEvents
                          ? 'border-border/[0.08] hover:bg-muted/15 hover:border-border/[0.15]'
                          : 'border-transparent hover:bg-muted/10',
                      isToday_ && 'ring-1 ring-primary/30'
                    )}
                  >
                    <span className={cn(
                      'text-[10px] sm:text-xs font-mono block',
                      isToday_ ? 'text-primary font-bold' : hasEvents ? 'text-foreground/80 font-medium' : 'text-foreground/40'
                    )}>
                      {format(day, 'd')}
                    </span>
                    {/* Event dots */}
                    <div className="flex flex-wrap gap-[3px] mt-1.5 justify-center">
                      {dayEvents.slice(0, 3).map(ev => (
                        <div key={ev.id} className={cn('w-[6px] h-[6px] rounded-full', typeColors[ev.type].dot)} />
                      ))}
                    </div>
                    {dayEvents.length > 3 && (
                      <span className="text-[7px] font-mono text-muted-foreground/40 mt-0.5 block text-center">+{dayEvents.length - 3}</span>
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t border-border/[0.06]">
              {(Object.keys(typeColors) as EventType[]).map(type => (
                <div key={type} className="flex items-center gap-2">
                  <div className={cn('w-2.5 h-2.5 rounded-full', typeColors[type].dot)} />
                  <span className="text-[10px] text-muted-foreground/60 font-mono capitalize">{type.toLowerCase()}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Selected day events */}
          <AnimatePresence>
            {selectedDay && selectedEvents.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="mt-4 space-y-2.5"
              >
                <p className="text-xs font-mono text-muted-foreground">
                  {format(selectedDay, 'EEEE, MMM d, yyyy')}
                </p>
                {selectedEvents.map((ev, i) => {
                  const style = typeColors[ev.type];
                  const daysLeft = getDaysLeft(ev.rawDate);
                  return (
                    <motion.div
                      key={ev.id}
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                      className={cn('float-card p-4 border-l-[3px]', style.border, style.bg)}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-semibold">{ev.title}</span>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={cn('text-[9px] font-mono px-2 py-0.5 rounded-md border', style.badge)}>
                            {daysLeft}
                          </span>
                          <Badge className={cn('text-[9px] rounded-md font-mono border', style.badge)}>
                            {ev.type}
                          </Badge>
                        </div>
                      </div>
                      {ev.description && <p className="text-xs mt-2 text-muted-foreground/70">{ev.description}</p>}
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Upcoming sidebar */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-3"
        >
          <div className="flex items-center gap-2 mb-1">
            <CalendarDays className="w-4 h-4 text-primary" />
            <span className="section-title !mb-0">Upcoming Events</span>
          </div>

          {upcomingEvents.map((ev, i) => {
            const style = typeColors[ev.type];
            const daysLeft = getDaysLeft(ev.rawDate);
            const isImminent = differenceInCalendarDays(parseISO(ev.rawDate), today) <= 3;

            return (
              <motion.div
                key={ev.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 + i * 0.04, ease: [0.22, 1, 0.36, 1] }}
                className={cn(
                  'card-bio p-4 border-l-[3px] group cursor-pointer hover:shadow-[0_0_16px_hsl(var(--primary)/0.06)] transition-all',
                  style.border,
                  style.bg
                )}
                onClick={() => {
                  setCurrentMonth(parseISO(ev.rawDate));
                  setSelectedDay(parseISO(ev.rawDate));
                }}
              >
                {/* Date & countdown */}
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono text-muted-foreground/50">
                    {ev.date}{ev.endDate ? ` → ${ev.endDate}` : ''}
                  </span>
                  <span className={cn(
                    'text-[9px] font-mono font-medium px-2 py-0.5 rounded-md border flex items-center gap-1',
                    isImminent ? 'bg-destructive/10 text-destructive border-destructive/20' : style.badge
                  )}>
                    <Clock className="w-2.5 h-2.5" />
                    {daysLeft}
                  </span>
                </div>

                {/* Title */}
                <p className="text-sm font-semibold group-hover:text-primary transition-colors">{ev.title}</p>

                {/* Type badge */}
                <div className="mt-2">
                  <span className={cn('text-[8px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md border', style.badge)}>
                    {ev.type}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
};

export default Calendar;
