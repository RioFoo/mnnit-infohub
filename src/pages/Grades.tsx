import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, TrendingUp, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageHeader } from '@/components/PageHeader';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const GRADES: Record<string, number> = { 'A+': 10, A: 9, 'B+': 8, B: 7, C: 6, D: 5, E: 4, F: 0 };
const GRADE_OPTIONS = Object.keys(GRADES);
const CHART_COLORS = ['hsl(153, 100%, 50%)', 'hsl(187, 100%, 50%)', 'hsl(260, 100%, 59%)', 'hsl(37, 100%, 63%)', 'hsl(0, 72%, 55%)', 'hsl(120, 60%, 55%)'];

interface Subject { name: string; credits: number; grade: string; }
interface Semester { id: number; subjects: Subject[]; }

const Grades = () => {
  const [semesters, setSemesters] = useState<Semester[]>(() => {
    const saved = localStorage.getItem('infohub-grades');
    return saved ? JSON.parse(saved) : [{ id: 1, subjects: [{ name: '', credits: 4, grade: 'A' }] }];
  });
  const [targetCPI, setTargetCPI] = useState('');

  useEffect(() => { localStorage.setItem('infohub-grades', JSON.stringify(semesters)); }, [semesters]);

  const addSemester = () => setSemesters([...semesters, { id: semesters.length + 1, subjects: [{ name: '', credits: 4, grade: 'A' }] }]);
  const removeSemester = (semId: number) => setSemesters(semesters.filter(s => s.id !== semId));
  const addSubject = (semId: number) => setSemesters(semesters.map(s => s.id === semId ? { ...s, subjects: [...s.subjects, { name: '', credits: 4, grade: 'A' }] } : s));
  const removeSubject = (semId: number, idx: number) => setSemesters(semesters.map(s => s.id === semId ? { ...s, subjects: s.subjects.filter((_, i) => i !== idx) } : s));
  const updateSubject = (semId: number, idx: number, field: keyof Subject, value: string | number) => {
    setSemesters(semesters.map(s => s.id === semId ? { ...s, subjects: s.subjects.map((sub, i) => i === idx ? { ...sub, [field]: value } : sub) } : s));
  };

  const calcSPI = (subjects: Subject[]) => {
    const totalCredits = subjects.reduce((s, sub) => s + sub.credits, 0);
    if (totalCredits === 0) return 0;
    return subjects.reduce((s, sub) => s + sub.credits * (GRADES[sub.grade] || 0), 0) / totalCredits;
  };

  const spiData = semesters.map(s => ({ sem: `S${s.id}`, spi: parseFloat(calcSPI(s.subjects).toFixed(2)) }));

  const cpi = useMemo(() => {
    let tc = 0, tw = 0;
    semesters.forEach(s => s.subjects.forEach(sub => { tc += sub.credits; tw += sub.credits * (GRADES[sub.grade] || 0); }));
    return tc > 0 ? tw / tc : 0;
  }, [semesters]);

  const requiredGrade = useMemo(() => {
    if (!targetCPI) return null;
    const target = parseFloat(targetCPI);
    if (target <= cpi) return 'Already achieved!';
    if (target > 10) return 'Not possible (max 10)';
    const currentCredits = semesters.reduce((s, sem) => s + sem.subjects.reduce((a, sub) => a + sub.credits, 0), 0);
    const currentPoints = cpi * currentCredits;
    const nextCredits = 20;
    const neededGPA = (target * (currentCredits + nextCredits) - currentPoints) / nextCredits;
    if (neededGPA > 10) return 'Not achievable in one semester';
    const closest = GRADE_OPTIONS.find(g => GRADES[g] >= neededGPA) || 'A+';
    return `Need avg ${closest} (${neededGPA.toFixed(1)}) next sem`;
  }, [targetCPI, cpi, semesters]);

  const gradeDistribution = useMemo(() => {
    const dist: Record<string, number> = {};
    semesters.forEach(s => s.subjects.forEach(sub => { dist[sub.grade] = (dist[sub.grade] || 0) + 1; }));
    return Object.entries(dist).map(([name, value]) => ({ name, value }));
  }, [semesters]);

  return (
    <div className="page-container">
      <PageHeader title="GRADES">
        <div className="text-right">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono">CPI</p>
          <p className="text-4xl font-display font-bold gradient-text">{cpi.toFixed(2)}</p>
        </div>
      </PageHeader>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="card-bio p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-xs font-mono text-muted-foreground">SPI Trend</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={spiData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.06)" />
              <XAxis dataKey="sem" tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }} stroke="hsl(var(--muted-foreground) / 0.15)" />
              <YAxis domain={[0, 10]} tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }} stroke="hsl(var(--muted-foreground) / 0.15)" />
              <Tooltip contentStyle={{ background: '#071628', border: '1px solid hsl(var(--border) / 0.1)', borderRadius: '12px', fontSize: '12px', fontFamily: 'JetBrains Mono' }} />
              <Line type="monotone" dataKey="spi" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: 'hsl(var(--primary))', r: 4, strokeWidth: 0 }} activeDot={{ r: 6, fill: 'hsl(var(--primary))' }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="card-bio p-5">
          <span className="text-xs font-mono text-muted-foreground">Distribution</span>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={gradeDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name }) => name} strokeWidth={0}>
                {gradeDistribution.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#071628', border: '1px solid hsl(var(--border) / 0.1)', borderRadius: '12px', fontSize: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Target */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="card-bio p-5 mb-6">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="w-8 h-8 rounded-lg bg-primary/[0.06] flex items-center justify-center">
            <Target className="w-4 h-4 text-primary" />
          </div>
          <Input type="number" step="0.1" min="0" max="10" placeholder="Target CPI" value={targetCPI} onChange={e => setTargetCPI(e.target.value)} className="w-32 rounded-xl bg-muted/15 border-border/[0.08] font-mono text-sm" />
          {requiredGrade && <p className="text-sm font-mono text-muted-foreground">{requiredGrade}</p>}
        </div>
      </motion.div>

      {/* Semesters */}
      {semesters.map((sem, si) => (
        <motion.div
          key={sem.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 + si * 0.04 }}
          className="card-bio p-5 mb-4"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-display font-bold flex items-center gap-2">
              Semester {sem.id}
              <span className="tag-pill text-[10px]">SPI: {calcSPI(sem.subjects).toFixed(2)}</span>
            </h3>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => addSubject(sem.id)} className="rounded-lg text-xs font-mono">
                <Plus className="w-3 h-3 mr-1" /> Add
              </Button>
              {semesters.length > 1 && (
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive rounded-lg" onClick={() => removeSemester(sem.id)}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>
          <div className="space-y-2">
            {sem.subjects.map((sub, i) => (
              <div key={i} className="flex gap-1.5 md:gap-2 items-center flex-wrap sm:flex-nowrap">
                <Input placeholder="Subject" value={sub.name} onChange={e => updateSubject(sem.id, i, 'name', e.target.value)} className="flex-1 min-w-[100px] rounded-xl bg-muted/10 border-border/[0.06] text-sm" />
                <Input type="number" placeholder="Cr" value={sub.credits} onChange={e => updateSubject(sem.id, i, 'credits', parseInt(e.target.value) || 0)} className="w-14 md:w-16 rounded-xl bg-muted/10 border-border/[0.06] text-sm font-mono" />
                <Select value={sub.grade} onValueChange={v => updateSubject(sem.id, i, 'grade', v)}>
                  <SelectTrigger className="w-[68px] md:w-20 rounded-xl bg-muted/10 border-border/[0.06] text-sm font-mono"><SelectValue /></SelectTrigger>
                  <SelectContent>{GRADE_OPTIONS.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                </Select>
                {sem.subjects.length > 1 && (
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive shrink-0 rounded-lg" onClick={() => removeSubject(sem.id, i)}><Trash2 className="w-3 h-3" /></Button>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      ))}

      <Button variant="outline" onClick={addSemester} className="w-full rounded-xl border-border/[0.08] text-sm font-mono btn-bio">
        <Plus className="w-4 h-4 mr-2" /> Add Semester
      </Button>
    </div>
  );
};

export default Grades;
