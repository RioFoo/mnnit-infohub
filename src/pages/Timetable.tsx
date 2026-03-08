import { useState, useMemo } from 'react';
import { TIMETABLE_DATA, type ClassSession } from '@/data/infohub-data';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { PageHeader } from '@/components/PageHeader';
import { Activity } from 'lucide-react';

const sectionIds = Object.keys(TIMETABLE_DATA);
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const TIME_SLOTS = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

const typeGlow: Record<string, string> = {
  LECTURE: 'border-l-2 border-l-secondary bg-secondary/[0.06] text-secondary',
  LAB: 'border-l-2 border-l-accent bg-accent/[0.06] text-accent',
  TUTORIAL: 'border-l-2 border-l-amber-400 bg-amber-400/[0.06] text-amber-400',
  WORKSHOP: 'border-l-2 border-l-primary bg-primary/[0.06] text-primary',
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
      <PageHeader title="TIMETABLE" />

      {/* Controls */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="flex flex-wrap gap-3 items-center mb-6"
      >
        <Select value={section} onValueChange={setSection}>
          <SelectTrigger className="w-48 rounded-xl bg-muted/15 border-border/[0.08] text-sm font-mono">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sectionIds.map(id => (
              <SelectItem key={id} value={id}>{TIMETABLE_DATA[id].name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Tabs value={batch} onValueChange={(v) => setBatch(v as 'ALL' | '1' | '2')}>
          <TabsList className="rounded-xl bg-muted/15 border border-border/[0.08]">
            {['ALL', '1', '2'].map(v => (
              <TabsTrigger key={v} value={v} className="rounded-lg text-xs font-mono data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-[0_0_8px_hsl(var(--primary)/0.2)]">
                {v === 'ALL' ? 'All' : `B${v}`}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="flex gap-4 ml-auto flex-wrap">
          {Object.entries(typeGlow).map(([type, cls]) => (
            <div key={type} className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-sm ${cls.split(' ')[2]}`} />
              <span className="text-[10px] text-muted-foreground font-mono capitalize">{type.toLowerCase()}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Grid */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="overflow-x-auto card-bio p-1"
      >
        <div className="min-w-[800px]">
          <div className="grid grid-cols-6 gap-px rounded-xl overflow-hidden" style={{ background: 'hsl(var(--border) / 0.04)' }}>
            <div className="text-[10px] font-mono text-muted-foreground p-3 bg-card/60 backdrop-blur-sm">Time</div>
            {DAYS.map(day => (
              <div
                key={day}
                className={`text-[11px] font-mono font-medium p-3 text-center bg-card/60 backdrop-blur-sm ${
                  day === currentDay ? 'text-primary glow-text-subtle' : 'text-muted-foreground'
                }`}
              >
                {day.slice(0, 3)}
                {day === currentDay && (
                  <div className="h-0.5 bg-primary rounded-full mt-1.5 mx-auto w-6 shadow-[0_0_6px_hsl(var(--primary)/0.5)]" />
                )}
              </div>
            ))}

            {TIME_SLOTS.map((time, ti) => (
              <>
                <div key={time} className="text-[10px] font-mono text-muted-foreground/30 p-2 bg-card/20 flex items-start">
                  {time}
                </div>
                {DAYS.map(day => {
                  const dayData = filteredSchedule.find(d => d.day === day);
                  const sessions = dayData?.sessions.filter(s => s.startTime === time) || [];
                  const isToday = day === currentDay;

                  return (
                    <div
                      key={`${day}-${time}`}
                      className={`min-h-[52px] p-1 bg-card/10 ${isToday ? 'bg-primary/[0.015]' : ''}`}
                    >
                      {sessions.map((s, i) => {
                        const isCurrent = isCurrentSession(s, day);
                        return (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: ti * 0.02 }}
                            className={`rounded-lg p-2 text-[9px] mb-1 transition-all ${typeGlow[s.type] || ''} ${
                              isCurrent ? 'glow-border-bright' : ''
                            }`}
                          >
                            {isCurrent && (
                              <div className="flex items-center gap-1 mb-0.5">
                                <Activity className="w-2.5 h-2.5 animate-pulse" />
                                <span className="text-[7px] font-mono font-bold uppercase tracking-wider">LIVE</span>
                              </div>
                            )}
                            <p className="font-medium truncate leading-tight">{s.subject.split('(')[0].trim()}</p>
                            <p className="opacity-40 mt-0.5 font-mono">{s.room} {s.batch !== 'ALL' ? `· B${s.batch}` : ''}</p>
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
