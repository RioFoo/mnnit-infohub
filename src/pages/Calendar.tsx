import { useState, useMemo } from 'react';
import { ACADEMIC_EVENTS, type AcademicEvent, type EventType } from '@/data/infohub-data';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, isSameDay, isToday, parseISO } from 'date-fns';

const typeColors: Record<EventType, string> = {
  EXAM: 'bg-destructive/15 text-destructive border-destructive/20',
  HOLIDAY: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  ACADEMIC: 'bg-sky-500/15 text-sky-400 border-sky-500/20',
  EVENT: 'bg-purple-500/15 text-purple-400 border-purple-500/20',
  PRACTICAL: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
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
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <CalendarDays className="w-4 h-4 text-primary" />
          <span className="section-title mb-0">Academic</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-mono font-bold">
          Your <span className="gradient-text">Calendar</span>
        </h1>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card-3d p-5">
            <div className="flex items-center justify-between mb-5">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="rounded-xl">
                  <ChevronLeft className="w-4 h-4" />
                </Button>
              </motion.div>
              <h2 className="font-mono font-bold text-lg">{format(currentMonth, 'MMMM yyyy')}</h2>
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="rounded-xl">
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </motion.div>
            </div>

            <div className="grid grid-cols-7 gap-1">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                <div key={i} className="text-center text-[10px] text-muted-foreground/60 font-mono py-2 font-bold uppercase">{d}</div>
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
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedDay(day)}
                    className={`relative p-1.5 min-h-[52px] rounded-xl text-sm transition-all ${
                      selected ? 'bg-primary/15 ring-1 ring-primary/50 shadow-[0_0_15px_hsl(var(--primary)/0.15)]' : 'hover:bg-muted/30'
                    } ${isToday_ ? 'ring-1 ring-primary/30' : ''}`}
                  >
                    <span className={`text-xs font-medium ${isToday_ ? 'text-primary font-bold' : ''}`}>{format(day, 'd')}</span>
                    <div className="flex flex-wrap gap-0.5 mt-1 justify-center">
                      {dayEvents.slice(0, 3).map(ev => (
                        <div key={ev.id} className={`w-1.5 h-1.5 rounded-full ${typeColors[ev.type].split(' ')[0]}`} />
                      ))}
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-3 mt-5 pt-4 border-t border-border/30">
              {(Object.keys(typeColors) as EventType[]).map(type => (
                <div key={type} className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${typeColors[type].split(' ')[0]}`} />
                  <span className="text-[10px] text-muted-foreground">{type}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Selected day events */}
          <AnimatePresence>
            {selectedDay && selectedEvents.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-4 space-y-2">
                <h3 className="font-mono font-semibold text-sm">{format(selectedDay, 'EEEE, MMM d, yyyy')}</h3>
                {selectedEvents.map(ev => (
                  <div key={ev.id} className={`card-3d p-4 border ${typeColors[ev.type]}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold">{ev.title}</span>
                      <Badge variant={typeBadgeColors[ev.type]} className="text-[10px] rounded-lg">{ev.type}</Badge>
                    </div>
                    {ev.description && <p className="text-xs mt-1.5 text-muted-foreground">{ev.description}</p>}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Upcoming */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
          <span className="section-title">Upcoming Events</span>
          <div className="space-y-3">
            {upcomingEvents.map((ev, i) => (
              <motion.div
                key={ev.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.04 }}
                className="card-3d p-4"
              >
                <p className="text-[10px] text-muted-foreground font-mono">{ev.date}{ev.endDate ? ` – ${ev.endDate}` : ''}</p>
                <p className="text-sm font-semibold mt-1">{ev.title}</p>
                <Badge variant={typeBadgeColors[ev.type]} className="text-[10px] mt-2 rounded-lg">{ev.type}</Badge>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Calendar;
