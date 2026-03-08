import { useState, useMemo } from 'react';
import { TIMETABLE_DATA, type ClassSession } from '@/data/infohub-data';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { Clock, Zap } from 'lucide-react';

const sectionIds = Object.keys(TIMETABLE_DATA);
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const TIME_SLOTS = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

const typeStyles: Record<string, string> = {
  LECTURE: 'bg-sky-500/15 text-sky-300 border-sky-500/30 shadow-[inset_0_1px_0_hsl(200_90%_60%/0.1)]',
  LAB: 'bg-purple-500/15 text-purple-300 border-purple-500/30 shadow-[inset_0_1px_0_hsl(270_70%_60%/0.1)]',
  TUTORIAL: 'bg-amber-500/15 text-amber-300 border-amber-500/30 shadow-[inset_0_1px_0_hsl(40_90%_55%/0.1)]',
  WORKSHOP: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 shadow-[inset_0_1px_0_hsl(150_70%_55%/0.1)]',
};

const Timetable = () => {
  const [section, setSection] = useState(sectionIds[0]);
  const [batch, setBatch] = useState<'ALL' | '1' | '2'>('ALL');

  const currentDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const currentTime = `${new Date().getHours().toString().padStart(2, '0')}:${new Date().getMinutes().toString().padStart(2, '0')}`;

  const sectionData = TIMETABLE_DATA[section];

  const isCurrentSession = (session: ClassSession, day: string) => {
    return day === currentDay && currentTime >= session.startTime && currentTime < session.endTime;
  };

  const filteredSchedule = useMemo(() => {
    if (!sectionData) return [];
    return sectionData.schedule.map(daySchedule => ({
      ...daySchedule,
      sessions: daySchedule.sessions.filter(s => batch === 'ALL' || s.batch === 'ALL' || s.batch === batch),
    }));
  }, [sectionData, batch]);

  return (
    <div className="page-container">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Clock className="w-4 h-4 text-primary" />
          <span className="section-title mb-0">Schedule</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-mono font-bold">
          Your <span className="gradient-text">Timetable</span>
        </h1>
      </motion.div>

      {/* Controls */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap gap-3 items-center mb-6"
      >
        <Select value={section} onValueChange={setSection}>
          <SelectTrigger className="w-48 rounded-xl bg-muted/30 border-border/50">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sectionIds.map(id => (
              <SelectItem key={id} value={id}>{TIMETABLE_DATA[id].name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Tabs value={batch} onValueChange={(v) => setBatch(v as 'ALL' | '1' | '2')}>
          <TabsList className="rounded-xl bg-muted/30">
            <TabsTrigger value="ALL" className="rounded-lg">All</TabsTrigger>
            <TabsTrigger value="1" className="rounded-lg">Batch 1</TabsTrigger>
            <TabsTrigger value="2" className="rounded-lg">Batch 2</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex gap-3 ml-auto flex-wrap">
          {Object.entries(typeStyles).map(([type, cls]) => (
            <div key={type} className="flex items-center gap-1.5">
              <div className={`w-2.5 h-2.5 rounded-md ${cls.split(' ')[0]}`} />
              <span className="text-[10px] text-muted-foreground font-medium">{type}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="overflow-x-auto card-3d p-1"
      >
        <div className="min-w-[800px]">
          <div className="grid grid-cols-6 gap-px bg-border/20 rounded-xl overflow-hidden">
            {/* Header */}
            <div className="text-[10px] font-mono text-muted-foreground p-3 bg-card/80 backdrop-blur-sm">Time</div>
            {DAYS.map(day => (
              <div
                key={day}
                className={`text-xs font-mono p-3 text-center bg-card/80 backdrop-blur-sm ${
                  day === currentDay ? 'text-primary font-bold' : 'text-muted-foreground'
                }`}
              >
                <span className="hidden sm:inline">{day.slice(0, 3)}</span>
                <span className="sm:hidden">{day[0]}</span>
                {day === currentDay && (
                  <motion.div
                    className="h-0.5 bg-primary rounded-full mt-1 mx-auto w-4"
                    layoutId="today-indicator"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </div>
            ))}

            {/* Rows */}
            {TIME_SLOTS.map((time, ti) => (
              <>
                <div key={time} className="text-[10px] font-mono text-muted-foreground/70 p-2 bg-card/40 flex items-start">
                  {time}
                </div>
                {DAYS.map(day => {
                  const dayData = filteredSchedule.find(d => d.day === day);
                  const sessions = dayData?.sessions.filter(s => s.startTime === time) || [];
                  const isToday = day === currentDay;

                  return (
                    <div
                      key={`${day}-${time}`}
                      className={`min-h-[56px] p-1 bg-card/40 ${isToday ? 'bg-primary/[0.03]' : ''}`}
                    >
                      {sessions.map((s, i) => {
                        const isCurrent = isCurrentSession(s, day);
                        return (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: ti * 0.02 }}
                            whileHover={{ scale: 1.03, zIndex: 10 }}
                            className={`rounded-lg p-2 text-[10px] border mb-1 cursor-default transition-all ${typeStyles[s.type] || ''} ${
                              isCurrent ? 'pulse-glow ring-1 ring-primary' : ''
                            }`}
                          >
                            {isCurrent && (
                              <div className="flex items-center gap-1 mb-0.5">
                                <Zap className="w-2.5 h-2.5 text-primary animate-pulse" />
                                <span className="text-primary text-[8px] font-bold uppercase tracking-wider">Live</span>
                              </div>
                            )}
                            <p className="font-semibold truncate leading-tight">{s.subject.split('(')[0].trim()}</p>
                            <p className="opacity-60 mt-0.5">{s.room} {s.batch !== 'ALL' ? `· B${s.batch}` : ''}</p>
                          </motion.div>
                        );
                      })}
                    </div>
                  );
                })}
              </>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Timetable;
