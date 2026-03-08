import { useState, useMemo } from 'react';
import { TIMETABLE_DATA, type ClassSession } from '@/data/infohub-data';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';

const sectionIds = Object.keys(TIMETABLE_DATA);
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const TIME_SLOTS = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

const typeStyles: Record<string, string> = {
  LECTURE: 'bg-[hsl(200_90%_50%/0.12)] text-[hsl(200_90%_60%)] border-[hsl(200_90%_50%/0.25)]',
  LAB: 'bg-[hsl(270_80%_55%/0.12)] text-[hsl(270_80%_65%)] border-[hsl(270_80%_55%/0.25)]',
  TUTORIAL: 'bg-[hsl(40_90%_50%/0.12)] text-[hsl(40_90%_60%)] border-[hsl(40_90%_50%/0.25)]',
  WORKSHOP: 'bg-[hsl(150_70%_45%/0.12)] text-[hsl(150_70%_55%)] border-[hsl(150_70%_45%/0.25)]',
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
      <motion.div
        initial={{ opacity: 0, y: 20, rotateX: -5 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 200 }}
        className="mb-8"
        style={{ perspective: '800px' }}
      >
        <h1 className="text-3xl md:text-4xl page-header-3d">TIMETABLE</h1>
      </motion.div>

      {/* ═══ CONTROLS ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap gap-3 items-center mb-6"
      >
        <Select value={section} onValueChange={setSection}>
          <SelectTrigger className="w-48 rounded-xl bg-card/60 border-border/30 backdrop-blur-sm font-mono text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sectionIds.map(id => (
              <SelectItem key={id} value={id}>{TIMETABLE_DATA[id].name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Tabs value={batch} onValueChange={(v) => setBatch(v as 'ALL' | '1' | '2')}>
          <TabsList className="rounded-xl bg-card/60 border border-border/30">
            {['ALL', '1', '2'].map(v => (
              <TabsTrigger key={v} value={v} className="rounded-lg font-display text-xs tracking-wider tab-3d data-[state=active]:tab-3d-active">
                {v === 'ALL' ? 'All' : `B${v}`}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="flex gap-4 ml-auto flex-wrap">
          {Object.entries(typeStyles).map(([type]) => (
            <div key={type} className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-sm ${typeStyles[type].split(' ')[0]}`} />
              <span className="text-[9px] text-muted-foreground font-display tracking-wider uppercase">{type}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ═══ GRID ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 20, rotateX: -3 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        className="overflow-x-auto card-3d-pro p-1"
        style={{ perspective: '1200px' }}
      >
        <div className="min-w-[800px]">
          <div className="grid grid-cols-6 gap-px rounded-xl overflow-hidden" style={{ background: 'hsl(var(--border) / 0.15)' }}>
            <div className="text-[9px] font-display tracking-widest text-muted-foreground p-3 bg-card/80 backdrop-blur-sm uppercase">Time</div>
            {DAYS.map(day => (
              <div
                key={day}
                className={`text-[10px] font-display tracking-wider p-3 text-center bg-card/80 backdrop-blur-sm uppercase ${
                  day === currentDay ? 'text-primary font-bold' : 'text-muted-foreground'
                }`}
              >
                {day.slice(0, 3)}
                {day === currentDay && (
                  <motion.div
                    className="h-0.5 bg-primary rounded-full mt-1.5 mx-auto w-6"
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    style={{ boxShadow: '0 0 8px hsl(var(--neon-cyan) / 0.5)' }}
                  />
                )}
              </div>
            ))}

            {TIME_SLOTS.map((time, ti) => (
              <>
                <div key={time} className="text-[9px] font-mono text-muted-foreground/50 p-2 bg-card/30 flex items-start">
                  {time}
                </div>
                {DAYS.map(day => {
                  const dayData = filteredSchedule.find(d => d.day === day);
                  const sessions = dayData?.sessions.filter(s => s.startTime === time) || [];
                  const isToday = day === currentDay;

                  return (
                    <div
                      key={`${day}-${time}`}
                      className={`min-h-[52px] p-1 bg-card/30 ${isToday ? 'bg-primary/[0.02]' : ''}`}
                    >
                      {sessions.map((s, i) => {
                        const isCurrent = isCurrentSession(s, day);
                        return (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.85 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: ti * 0.02 }}
                            whileHover={{ scale: 1.08, y: -2, zIndex: 20 }}
                            className={`rounded-lg p-2 text-[9px] border mb-1 cursor-default transition-all ${typeStyles[s.type] || ''} ${
                              isCurrent ? 'neon-border ring-1 ring-primary/50' : ''
                            }`}
                          >
                            {isCurrent && (
                              <div className="flex items-center gap-1 mb-0.5">
                                <Activity className="w-2.5 h-2.5 text-primary animate-pulse" />
                                <span className="text-primary text-[7px] font-display font-bold uppercase tracking-widest">Live</span>
                              </div>
                            )}
                            <p className="font-semibold truncate leading-tight">{s.subject.split('(')[0].trim()}</p>
                            <p className="opacity-50 mt-0.5 font-mono">{s.room} {s.batch !== 'ALL' ? `· B${s.batch}` : ''}</p>
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
