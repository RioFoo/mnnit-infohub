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
  LECTURE: 'bg-primary/8 text-primary border-primary/15',
  LAB: 'bg-secondary/8 text-secondary border-secondary/15',
  TUTORIAL: 'bg-amber-500/8 text-amber-500 border-amber-500/15',
  WORKSHOP: 'bg-emerald-500/8 text-emerald-500 border-emerald-500/15',
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
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <h1 className="text-2xl md:text-3xl page-header gradient-text">Timetable</h1>
      </motion.div>

      {/* Controls */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="flex flex-wrap gap-3 items-center mb-6"
      >
        <Select value={section} onValueChange={setSection}>
          <SelectTrigger className="w-48 rounded-xl bg-muted/20 border-border/20 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sectionIds.map(id => (
              <SelectItem key={id} value={id}>{TIMETABLE_DATA[id].name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Tabs value={batch} onValueChange={(v) => setBatch(v as 'ALL' | '1' | '2')}>
          <TabsList className="rounded-xl bg-muted/30 border border-border/20">
            {['ALL', '1', '2'].map(v => (
              <TabsTrigger key={v} value={v} className="rounded-lg text-xs font-medium data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                {v === 'ALL' ? 'All' : `B${v}`}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="flex gap-4 ml-auto flex-wrap">
          {Object.entries(typeStyles).map(([type]) => (
            <div key={type} className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-sm ${typeStyles[type].split(' ')[0]}`} />
              <span className="text-[10px] text-muted-foreground font-medium capitalize">{type.toLowerCase()}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Grid */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="overflow-x-auto float-card p-1"
      >
        <div className="min-w-[800px]">
          <div className="grid grid-cols-6 gap-px rounded-xl overflow-hidden" style={{ background: 'hsl(var(--border) / 0.1)' }}>
            <div className="text-[10px] font-medium text-muted-foreground p-3 bg-card/80 backdrop-blur-sm">Time</div>
            {DAYS.map(day => (
              <div
                key={day}
                className={`text-[11px] font-medium p-3 text-center bg-card/80 backdrop-blur-sm ${
                  day === currentDay ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {day.slice(0, 3)}
                {day === currentDay && (
                  <div className="h-0.5 bg-primary rounded-full mt-1.5 mx-auto w-6 opacity-60" />
                )}
              </div>
            ))}

            {TIME_SLOTS.map((time, ti) => (
              <>
                <div key={time} className="text-[10px] font-mono text-muted-foreground/40 p-2 bg-card/20 flex items-start">
                  {time}
                </div>
                {DAYS.map(day => {
                  const dayData = filteredSchedule.find(d => d.day === day);
                  const sessions = dayData?.sessions.filter(s => s.startTime === time) || [];
                  const isToday = day === currentDay;

                  return (
                    <div
                      key={`${day}-${time}`}
                      className={`min-h-[52px] p-1 bg-card/20 ${isToday ? 'bg-primary/[0.02]' : ''}`}
                    >
                      {sessions.map((s, i) => {
                        const isCurrent = isCurrentSession(s, day);
                        return (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: ti * 0.02 }}
                            className={`rounded-lg p-2 text-[9px] border mb-1 transition-all ${typeStyles[s.type] || ''} ${
                              isCurrent ? 'ring-1 ring-primary/30' : ''
                            }`}
                          >
                            {isCurrent && (
                              <div className="flex items-center gap-1 mb-0.5">
                                <Activity className="w-2.5 h-2.5 text-primary" />
                                <span className="text-primary text-[7px] font-semibold uppercase tracking-wider">Live</span>
                              </div>
                            )}
                            <p className="font-medium truncate leading-tight">{s.subject.split('(')[0].trim()}</p>
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
