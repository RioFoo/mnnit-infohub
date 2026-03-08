import { useState, useMemo } from 'react';
import { ACADEMIC_EVENTS, type AcademicEvent, type EventType } from '@/data/infohub-data';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, isSameDay, isToday, parseISO } from 'date-fns';

const typeColors: Record<EventType, string> = {
  EXAM: 'bg-destructive/10 text-destructive border-destructive/15',
  HOLIDAY: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/15',
  ACADEMIC: 'bg-primary/10 text-primary border-primary/15',
  EVENT: 'bg-secondary/10 text-secondary border-secondary/15',
  PRACTICAL: 'bg-amber-500/10 text-amber-500 border-amber-500/15',
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
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <h1 className="text-2xl md:text-3xl page-header gradient-text">Calendar</h1>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="float-card p-5"
          >
            <div className="flex items-center justify-between mb-5">
              <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="rounded-xl hover:bg-muted/30">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <h2 className="font-semibold text-sm tracking-wide" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{format(currentMonth, 'MMMM yyyy')}</h2>
              <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="rounded-xl hover:bg-muted/30">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-7 gap-1">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d, i) => (
                <div key={i} className="text-center text-[10px] text-muted-foreground/50 font-medium py-2">{d}</div>
              ))}
              {Array.from({ length: startDay }).map((_, i) => <div key={`e-${i}`} />)}
              {days.map(day => {
                const dateKey = format(day, 'yyyy-MM-dd');
                const dayEvents = eventsMap.get(dateKey) || [];
                const selected = selectedDay && isSameDay(day, selectedDay);
                const isToday_ = isToday(day);

                return (
                  <button
                    key={dateKey}
                    onClick={() => setSelectedDay(day)}
                    className={`relative p-1.5 min-h-[48px] rounded-xl text-sm transition-all duration-200 ${
                      selected ? 'bg-primary/10 border border-primary/20' : 'hover:bg-muted/20 border border-transparent'
                    } ${isToday_ ? 'ring-1 ring-primary/20' : ''}`}
                  >
                    <span className={`text-[11px] font-medium ${isToday_ ? 'text-primary font-semibold' : 'text-foreground/70'}`}>{format(day, 'd')}</span>
                    <div className="flex flex-wrap gap-0.5 mt-1 justify-center">
                      {dayEvents.slice(0, 3).map(ev => (
                        <div key={ev.id} className={`w-1.5 h-1.5 rounded-full ${typeColors[ev.type].split(' ')[0]}`} />
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap gap-3 mt-5 pt-4 border-t border-border/10">
              {(Object.keys(typeColors) as EventType[]).map(type => (
                <div key={type} className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${typeColors[type].split(' ')[0]}`} />
                  <span className="text-[10px] text-muted-foreground font-medium capitalize">{type.toLowerCase()}</span>
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
                <p className="text-xs font-medium text-muted-foreground">
                  {format(selectedDay, 'EEEE, MMM d, yyyy')}
                </p>
                {selectedEvents.map((ev, i) => (
                  <motion.div
                    key={ev.id}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`float-card p-4 border ${typeColors[ev.type]}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{ev.title}</span>
                      <Badge variant={typeBadgeColors[ev.type]} className="text-[10px] rounded-md font-medium">{ev.type}</Badge>
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
                transition={{ delay: 0.12 + i * 0.03 }}
                className="float-card p-4 group"
              >
                <p className="text-[10px] text-muted-foreground/60">{ev.date}{ev.endDate ? ` → ${ev.endDate}` : ''}</p>
                <p className="text-sm font-medium mt-1 group-hover:text-primary transition-colors">{ev.title}</p>
                <Badge variant={typeBadgeColors[ev.type]} className="text-[10px] mt-2 rounded-md font-medium">{ev.type}</Badge>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Calendar;
