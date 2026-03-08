import { useState, useMemo } from 'react';
import { ACADEMIC_EVENTS, type AcademicEvent, type EventType } from '@/data/infohub-data';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, isSameDay, isToday, parseISO } from 'date-fns';

const typeGlowColors: Record<EventType, string> = {
  EXAM: 'border-l-2 border-l-destructive bg-destructive/[0.04]',
  HOLIDAY: 'border-l-2 border-l-primary bg-primary/[0.04]',
  ACADEMIC: 'border-l-2 border-l-secondary bg-secondary/[0.04]',
  EVENT: 'border-l-2 border-l-accent bg-accent/[0.04]',
  PRACTICAL: 'border-l-2 border-l-amber-400 bg-amber-400/[0.04]',
};

const typeDotColors: Record<EventType, string> = {
  EXAM: 'bg-destructive shadow-[0_0_4px_hsl(0,72%,55%,0.6)]',
  HOLIDAY: 'bg-primary shadow-[0_0_4px_hsl(var(--primary)/0.6)]',
  ACADEMIC: 'bg-secondary shadow-[0_0_4px_hsl(var(--secondary)/0.6)]',
  EVENT: 'bg-accent shadow-[0_0_4px_hsl(var(--accent)/0.6)]',
  PRACTICAL: 'bg-amber-400 shadow-[0_0_4px_rgba(251,191,36,0.6)]',
};

const Calendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDay = getDay(monthStart);

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
    const today = new Date();
    return ACADEMIC_EVENTS.filter(e => parseISO(e.rawDate) >= today).slice(0, 8);
  }, []);

  return (
    <div className="page-container">
      <PageHeader title="CALENDAR" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="card-bio p-5"
          >
            <div className="flex items-center justify-between mb-5">
              <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="rounded-xl hover:bg-primary/[0.05]">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <h2 className="font-display font-bold text-sm tracking-wide">{format(currentMonth, 'MMMM yyyy')}</h2>
              <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="rounded-xl hover:bg-primary/[0.05]">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-7 gap-1">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d, i) => (
                <div key={i} className="text-center text-[10px] text-muted-foreground/40 font-mono font-medium py-2">{d}</div>
              ))}
              {Array.from({ length: startDay }).map((_, i) => <div key={`e-${i}`} />)}
              {days.map(day => {
                const dateKey = format(day, 'yyyy-MM-dd');
                const dayEvents = eventsMap.get(dateKey) || [];
                const selected = selectedDay && isSameDay(day, selectedDay);
                const isToday_ = isToday(day);

                return (
                  <motion.button
                    key={dateKey}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedDay(day)}
                    className={`relative p-1.5 min-h-[48px] rounded-xl text-sm transition-all duration-200 ${
                      selected ? 'bg-primary/10 border border-primary/20 glow-border' : 'hover:bg-muted/15 border border-transparent'
                    } ${isToday_ ? 'ring-1 ring-primary/20' : ''}`}
                  >
                    <span className={`text-[11px] font-mono ${isToday_ ? 'text-primary font-bold glow-text-subtle' : 'text-foreground/60'}`}>
                      {format(day, 'd')}
                    </span>
                    <div className="flex flex-wrap gap-0.5 mt-1 justify-center">
                      {dayEvents.slice(0, 3).map(ev => (
                        <div key={ev.id} className={`w-1.5 h-1.5 rounded-full ${typeDotColors[ev.type]}`} />
                      ))}
                    </div>
                  </motion.button>
                );
              })}
            </div>

            <div className="flex flex-wrap gap-3 mt-5 pt-4 divider-glow">
              {(Object.keys(typeDotColors) as EventType[]).map(type => (
                <div key={type} className="flex items-center gap-1.5 mt-3">
                  <div className={`w-2 h-2 rounded-full ${typeDotColors[type]}`} />
                  <span className="text-[10px] text-muted-foreground font-mono capitalize">{type.toLowerCase()}</span>
                </div>
              ))}
            </div>
          </motion.div>

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
                {selectedEvents.map((ev, i) => (
                  <motion.div
                    key={ev.id}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                    className={`float-card p-4 ${typeGlowColors[ev.type]}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold">{ev.title}</span>
                      <Badge className="text-[10px] rounded-md font-mono bg-muted/20 text-muted-foreground border-border/[0.08]">{ev.type}</Badge>
                    </div>
                    {ev.description && <p className="text-xs mt-1.5 text-muted-foreground">{ev.description}</p>}
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Upcoming */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <span className="section-title">Upcoming</span>
          <div className="space-y-2.5 mt-3">
            {upcomingEvents.map((ev, i) => (
              <motion.div
                key={ev.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 + i * 0.04, ease: [0.22, 1, 0.36, 1] }}
                className={`float-card p-4 group ${typeGlowColors[ev.type]}`}
              >
                <p className="text-[10px] font-mono text-muted-foreground/50">{ev.date}{ev.endDate ? ` → ${ev.endDate}` : ''}</p>
                <p className="text-sm font-semibold mt-1 group-hover:text-primary transition-colors">{ev.title}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Calendar;
