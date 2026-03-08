import { useState, useMemo } from 'react';
import { ACADEMIC_EVENTS, type AcademicEvent, type EventType } from '@/data/infohub-data';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, isSameDay, isSameMonth, isToday, parseISO } from 'date-fns';

const typeColors: Record<EventType, string> = {
  EXAM: 'bg-destructive/20 text-destructive border-destructive/30',
  HOLIDAY: 'bg-green-500/20 text-green-400 border-green-500/30',
  ACADEMIC: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  EVENT: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  PRACTICAL: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
};

const typeBadgeColors: Record<EventType, 'destructive' | 'default' | 'secondary' | 'outline'> = {
  EXAM: 'destructive',
  HOLIDAY: 'default',
  ACADEMIC: 'secondary',
  EVENT: 'outline',
  PRACTICAL: 'outline',
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
      const key = ev.rawDate;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(ev);
    });
    return map;
  }, []);

  const selectedEvents = selectedDay
    ? eventsMap.get(format(selectedDay, 'yyyy-MM-dd')) || []
    : [];

  const upcomingEvents = useMemo(() => {
    const today = new Date();
    return ACADEMIC_EVENTS
      .filter(e => parseISO(e.rawDate) >= today)
      .slice(0, 10);
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-mono font-bold text-primary mb-4">Academic Calendar</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <h2 className="font-mono font-semibold text-lg">{format(currentMonth, 'MMMM yyyy')}</h2>
            <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="text-center text-xs text-muted-foreground font-mono py-2">{d}</div>
            ))}
            {Array.from({ length: startDay }).map((_, i) => <div key={`e-${i}`} />)}
            {days.map(day => {
              const dateKey = format(day, 'yyyy-MM-dd');
              const dayEvents = eventsMap.get(dateKey) || [];
              const selected = selectedDay && isSameDay(day, selectedDay);
              const today_ = isToday(day);

              return (
                <button
                  key={dateKey}
                  onClick={() => setSelectedDay(day)}
                  className={`relative p-1 min-h-[60px] rounded-lg text-sm transition-all border ${
                    selected ? 'border-primary bg-primary/10' : 'border-transparent hover:border-border'
                  } ${today_ ? 'ring-1 ring-primary/50' : ''}`}
                >
                  <span className={`text-xs ${today_ ? 'text-primary font-bold' : ''}`}>{format(day, 'd')}</span>
                  <div className="flex flex-wrap gap-0.5 mt-0.5">
                    {dayEvents.slice(0, 3).map(ev => (
                      <div key={ev.id} className={`w-full h-1 rounded-full ${typeColors[ev.type].split(' ')[0]}`} />
                    ))}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected day events */}
          <AnimatePresence>
            {selectedDay && selectedEvents.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-4 space-y-2">
                <h3 className="font-mono font-semibold text-sm">{format(selectedDay, 'EEEE, MMM d, yyyy')}</h3>
                {selectedEvents.map(ev => (
                  <div key={ev.id} className={`rounded-lg p-3 border ${typeColors[ev.type]}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{ev.title}</span>
                      <Badge variant={typeBadgeColors[ev.type]} className="text-[10px]">{ev.type}</Badge>
                    </div>
                    {ev.description && <p className="text-xs mt-1 opacity-80">{ev.description}</p>}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Legend */}
          <div className="flex flex-wrap gap-3 mt-4">
            {(Object.keys(typeColors) as EventType[]).map(type => (
              <div key={type} className="flex items-center gap-1">
                <div className={`w-3 h-3 rounded-full ${typeColors[type].split(' ')[0]}`} />
                <span className="text-[10px] text-muted-foreground">{type}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Events Sidebar */}
        <div>
          <h2 className="font-mono font-semibold text-lg mb-3">Upcoming Events</h2>
          <div className="space-y-2">
            {upcomingEvents.map((ev, i) => (
              <motion.div
                key={ev.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`glass rounded-lg p-3 border-l-2 ${typeColors[ev.type].split(' ').slice(0, 1).join(' ').replace('/20', '/60')}`}
                style={{ borderLeftColor: `hsl(var(--${ev.type === 'EXAM' ? 'destructive' : ev.type === 'HOLIDAY' ? 'primary' : 'accent'}))` }}
              >
                <p className="text-xs text-muted-foreground font-mono">{ev.date}{ev.endDate ? ` – ${ev.endDate}` : ''}</p>
                <p className="text-sm font-medium mt-0.5">{ev.title}</p>
                <Badge variant={typeBadgeColors[ev.type]} className="text-[10px] mt-1">{ev.type}</Badge>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
