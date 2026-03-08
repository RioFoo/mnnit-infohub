import { useState, useMemo } from 'react';
import { ACADEMIC_EVENTS, type AcademicEvent, type EventType } from '@/data/infohub-data';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Orbit, CalendarDays } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, isSameDay, isToday, parseISO } from 'date-fns';

const typeColors: Record<EventType, string> = {
  EXAM: 'bg-destructive/12 text-destructive border-destructive/20',
  HOLIDAY: 'bg-[hsl(150_70%_45%/0.12)] text-[hsl(150_70%_55%)] border-[hsl(150_70%_45%/0.2)]',
  ACADEMIC: 'bg-[hsl(200_90%_50%/0.12)] text-[hsl(200_90%_60%)] border-[hsl(200_90%_50%/0.2)]',
  EVENT: 'bg-secondary/12 text-secondary border-secondary/20',
  PRACTICAL: 'bg-[hsl(40_90%_50%/0.12)] text-[hsl(40_90%_60%)] border-[hsl(40_90%_50%/0.2)]',
};

const typeBadgeColors: Record<EventType, 'destructive' | 'default' | 'secondary' | 'outline'> = {
  EXAM: 'destructive', HOLIDAY: 'default', ACADEMIC: 'secondary', EVENT: 'outline', PRACTICAL: 'outline',
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
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="relative mb-10">
        <div className="absolute -left-4 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-accent/30 to-transparent" />
        
        <div className="flex items-center gap-4 mb-3">
          <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center border border-accent/20 relative">
            <Orbit className="w-6 h-6 text-accent" />
          </div>
          <div>
            <span className="section-title mb-0">Orbital Calendar</span>
            <h1 className="text-3xl md:text-4xl font-display font-bold tracking-wider">
              <span className="text-foreground">EVENT</span>{' '}
              <span className="gradient-text-aurora">HORIZON</span>
            </h1>
          </div>
        </div>
        <div className="cyber-line mt-4" />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="holo-card p-5">
            <div className="flex items-center justify-between mb-5">
              <motion.div whileHover={{ scale: 1.15, x: -3 }} whileTap={{ scale: 0.9 }}>
                <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="rounded-md hover:bg-primary/10">
                  <ChevronLeft className="w-4 h-4" />
                </Button>
              </motion.div>
              <h2 className="font-display font-bold text-base tracking-widest uppercase">{format(currentMonth, 'MMMM yyyy')}</h2>
              <motion.div whileHover={{ scale: 1.15, x: 3 }} whileTap={{ scale: 0.9 }}>
                <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="rounded-md hover:bg-primary/10">
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </motion.div>
            </div>

            <div className="grid grid-cols-7 gap-1">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                <div key={i} className="text-center text-[9px] text-muted-foreground/40 font-display py-2 tracking-widest uppercase">{d}</div>
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
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSelectedDay(day)}
                    className={`relative p-1.5 min-h-[48px] rounded-md text-sm transition-all ${
                      selected ? 'bg-primary/10 border border-primary/30 shadow-[0_0_15px_hsl(var(--neon-cyan)/0.15)]' : 'hover:bg-muted/20 border border-transparent'
                    } ${isToday_ ? 'border-primary/20' : ''}`}
                  >
                    <span className={`text-[11px] font-mono ${isToday_ ? 'text-primary font-bold' : 'text-foreground/70'}`}>{format(day, 'd')}</span>
                    <div className="flex flex-wrap gap-0.5 mt-1 justify-center">
                      {dayEvents.slice(0, 3).map(ev => (
                        <div key={ev.id} className={`w-1.5 h-1.5 rounded-full ${typeColors[ev.type].split(' ')[0]}`}
                          style={{ boxShadow: dayEvents.length > 0 ? '0 0 4px currentColor' : 'none' }} />
                      ))}
                    </div>
                  </motion.button>
                );
              })}
            </div>

            <div className="flex flex-wrap gap-3 mt-5 pt-4 border-t border-border/20">
              {(Object.keys(typeColors) as EventType[]).map(type => (
                <div key={type} className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${typeColors[type].split(' ')[0]}`} />
                  <span className="text-[9px] text-muted-foreground font-display tracking-wider uppercase">{type}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <AnimatePresence>
            {selectedDay && selectedEvents.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-4 space-y-3">
                <h3 className="font-display font-semibold text-xs tracking-widest uppercase text-muted-foreground">
                  {format(selectedDay, 'EEEE, MMM d, yyyy')}
                </h3>
                {selectedEvents.map(ev => (
                  <div key={ev.id} className={`holo-card p-4 border ${typeColors[ev.type]}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold">{ev.title}</span>
                      <Badge variant={typeBadgeColors[ev.type]} className="text-[9px] rounded-md font-display tracking-wider">{ev.type}</Badge>
                    </div>
                    {ev.description && <p className="text-xs mt-1.5 text-muted-foreground">{ev.description}</p>}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ═══ UPCOMING ═══ */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
          <span className="section-title">Incoming Events</span>
          <div className="space-y-3 mt-3">
            {upcomingEvents.map((ev, i) => (
              <motion.div
                key={ev.id}
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 + i * 0.05 }}
                className="holo-card p-4 group"
              >
                <p className="text-[9px] text-muted-foreground/50 font-mono">{ev.date}{ev.endDate ? ` → ${ev.endDate}` : ''}</p>
                <p className="text-sm font-semibold mt-1.5 group-hover:text-primary transition-colors">{ev.title}</p>
                <Badge variant={typeBadgeColors[ev.type]} className="text-[9px] mt-2 rounded-md font-display tracking-wider">{ev.type}</Badge>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Calendar;
