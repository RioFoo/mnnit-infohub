import { useState, useMemo } from 'react';
import { TIMETABLE_DATA, type ClassSession } from '@/data/infohub-data';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';

const sectionIds = Object.keys(TIMETABLE_DATA);
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const TIME_SLOTS = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

const typeColors: Record<string, string> = {
  LECTURE: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
  LAB: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  TUTORIAL: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  WORKSHOP: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
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
    <div className="max-w-6xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-mono font-bold text-primary">Timetable</h1>

      <div className="flex flex-wrap gap-3 items-center">
        <Select value={section} onValueChange={setSection}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sectionIds.map(id => (
              <SelectItem key={id} value={id}>{TIMETABLE_DATA[id].name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Tabs value={batch} onValueChange={(v) => setBatch(v as 'ALL' | '1' | '2')}>
          <TabsList>
            <TabsTrigger value="ALL">All</TabsTrigger>
            <TabsTrigger value="1">Batch 1</TabsTrigger>
            <TabsTrigger value="2">Batch 2</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex gap-3 ml-auto">
          {Object.entries(typeColors).map(([type, cls]) => (
            <div key={type} className="flex items-center gap-1">
              <div className={`w-3 h-3 rounded ${cls.split(' ')[0]}`} />
              <span className="text-[10px] text-muted-foreground">{type}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          <div className="grid grid-cols-6 gap-1">
            {/* Header */}
            <div className="text-xs font-mono text-muted-foreground p-2">Time</div>
            {DAYS.map(day => (
              <div
                key={day}
                className={`text-xs font-mono p-2 text-center rounded-t-lg ${
                  day === currentDay ? 'bg-primary/10 text-primary font-bold' : 'text-muted-foreground'
                }`}
              >
                {day.slice(0, 3)}
              </div>
            ))}

            {/* Time rows */}
            {TIME_SLOTS.map(time => (
              <>
                <div key={time} className="text-[10px] font-mono text-muted-foreground p-1 border-t border-border">
                  {time}
                </div>
                {DAYS.map(day => {
                  const dayData = filteredSchedule.find(d => d.day === day);
                  const sessions = dayData?.sessions.filter(s => s.startTime === time) || [];

                  return (
                    <div key={`${day}-${time}`} className={`min-h-[50px] border-t border-border p-0.5 ${day === currentDay ? 'bg-primary/5' : ''}`}>
                      {sessions.map((s, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className={`rounded-md p-1.5 text-[10px] border mb-0.5 ${typeColors[s.type] || ''} ${
                            isCurrentSession(s, day) ? 'pulse-glow ring-1 ring-primary' : ''
                          }`}
                        >
                          <p className="font-medium truncate">{s.subject.split('(')[0].trim()}</p>
                          <p className="opacity-70">{s.room} {s.batch !== 'ALL' ? `· B${s.batch}` : ''}</p>
                          <p className="opacity-50">{s.startTime}-{s.endTime}</p>
                        </motion.div>
                      ))}
                    </div>
                  );
                })}
              </>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Timetable;
