import { useState, useMemo } from 'react';
import { ACADEMIC_EVENTS, type AcademicEvent, type EventType } from '@/data/infohub-data';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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
      <motion.div
        initial={{ opacity: 0, y: 20, rotateX: -5 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 200 }}
        className="mb-8"
        style={{ perspective: '800px' }}
      >
        <h1 className="text-3xl md:text-4xl page-header-3d">CALENDAR</h1>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20, rotateY: -3 }}
            animate={{ opacity: 1, y: 0, rotateY: 0 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 250 }}
            className="card-3d-pro p-5"
            style={{ perspective: '1000px' }}
          >
            <div className="flex items-center justify-between mb-5">
              <motion.div whileHover={{ scale: 1.15, x: -3 }} whileTap={{ scale: 0.9 }}>
                <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="rounded-xl hover:bg-primary/10">
                  <ChevronLeft className="w-4 h-4" />
                </Button>
              </motion.div>
              <h2 className="font-display font-bold text-base tracking-widest uppercase nav-text-3d">{format(currentMonth, 'MMMM yyyy')}</h2>
              <motion.div whileHover={{ scale: 1.15, x: 3 }} whileTap={{ scale: 0.9 }}>
                <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="rounded-xl hover:bg-primary/10">
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
                    whileHover={{ scale: 1.12, y: -3, rotateX: 5 }}
                    whileTap={{ scale: 0.9, y: 1 }}
                    onClick={() => setSelectedDay(day)}
                    className={`relative p-1.5 min-h-[48px] rounded-xl text-sm transition-all ${
                      selected ? 'bg-primary/10 border border-primary/30 shadow-[0_4px_0_hsl(var(--primary)/0.15),0_0_15px_hsl(var(--neon-cyan)/0.15)]' : 'hover:bg-muted/20 border border-transparent'
                    } ${isToday_ ? 'border-primary/20' : ''}`}
                    style={{ perspective: '400px' }}
                  >
                    <span className={`text-[11px] font-mono ${isToday_ ? 'text-primary font-bold' : 'text-foreground/70'}`}>{format(day, 'd')}</span>
                    <div className="flex flex-wrap gap-0.5 mt-1 justify-center">
                      {dayEvents.slice(0, 3).map(ev => (
                        <div key={ev.id} className={`w-1.5 h-1.5 rounded-full ${typeColors[ev.type].split(' ')[0]}`} />
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
              <motion.div
                initial={{ opacity: 0, y: 15, rotateX: -5 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-4 space-y-3"
                style={{ perspective: '600px' }}
              >
                <h3 className="font-display font-semibold text-xs tracking-widest uppercase text-muted-foreground">
                  {format(selectedDay, 'EEEE, MMM d, yyyy')}
                </h3>
                {selectedEvents.map((ev, i) => (
                  <motion.div
                    key={ev.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`card-3d-pro p-4 border ${typeColors[ev.type]}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold">{ev.title}</span>
                      <Badge variant={typeBadgeColors[ev.type]} className="text-[9px] rounded-md font-display tracking-wider">{ev.type}</Badge>
                    </div>
                    {ev.description && <p className="text-xs mt-1.5 text-muted-foreground">{ev.description}</p>}
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ═══ UPCOMING ═══ */}
        <motion.div
          initial={{ opacity: 0, x: 20, rotateY: 5 }}
          animate={{ opacity: 1, x: 0, rotateY: 0 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          style={{ perspective: '600px' }}
        >
          <span className="section-title">Upcoming</span>
          <div className="space-y-3 mt-3">
            {upcomingEvents.map((ev, i) => (
              <motion.div
                key={ev.id}
                initial={{ opacity: 0, x: 20, rotateY: -5 }}
                animate={{ opacity: 1, x: 0, rotateY: 0 }}
                transition={{ delay: 0.25 + i * 0.04, type: 'spring', stiffness: 250 }}
                whileHover={{ x: -4, rotateY: 2 }}
                className="card-3d-pro p-4 group"
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
