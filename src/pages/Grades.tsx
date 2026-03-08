import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Target, TrendingUp, BarChart3, Crosshair } from 'lucide-react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const GRADES: Record<string, number> = { 'A+': 10, A: 9, 'B+': 8, B: 7, C: 6, D: 5, E: 4, F: 0 };
const GRADE_OPTIONS = Object.keys(GRADES);
const CHART_COLORS = ['hsl(190, 100%, 50%)', 'hsl(270, 80%, 60%)', 'hsl(320, 80%, 55%)', 'hsl(45, 95%, 55%)', 'hsl(150, 70%, 50%)', 'hsl(220, 90%, 55%)'];

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
    return `Need avg ${closest} (${neededGPA.toFixed(1)} GPA) next sem`;
  }, [targetCPI, cpi, semesters]);

  const gradeDistribution = useMemo(() => {
    const dist: Record<string, number> = {};
    semesters.forEach(s => s.subjects.forEach(sub => { dist[sub.grade] = (dist[sub.grade] || 0) + 1; }));
    return Object.entries(dist).map(([name, value]) => ({ name, value }));
  }, [semesters]);

  return (
    <div className="page-container">
      {/* ═══ HEADER ═══ */}
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="relative mb-10">
        <div className="absolute -left-4 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[hsl(45,95%,55%,0.3)] to-transparent" />
        
        <div className="flex items-end justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
              <BarChart3 className="w-6 h-6 text-primary" />
            </div>
            <div>
              <span className="section-title mb-0">Performance Analytics</span>
              <h1 className="text-3xl md:text-4xl font-display font-bold tracking-wider">
                <span className="text-foreground">GRADE</span>{' '}
                <span className="gradient-text">ENGINE</span>
              </h1>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-display">Overall CPI</p>
            <p className="text-4xl font-display font-bold gradient-text-aurora">{cpi.toFixed(2)}</p>
          </div>
        </div>
        <div className="cyber-line mt-4" />
      </motion.div>

      {/* ═══ CHARTS ═══ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="holo-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-xs font-display tracking-wider uppercase">SPI Trajectory</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={spiData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.3)" />
              <XAxis dataKey="sem" tick={{ fontSize: 9, fontFamily: 'Orbitron' }} stroke="hsl(var(--muted-foreground) / 0.3)" />
              <YAxis domain={[0, 10]} tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground) / 0.3)" />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '11px', fontFamily: 'Rajdhani' }} />
              <Line type="monotone" dataKey="spi" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ fill: 'hsl(var(--primary))', r: 4, strokeWidth: 0 }} activeDot={{ r: 6, fill: 'hsl(var(--primary))', stroke: 'hsl(var(--primary) / 0.3)', strokeWidth: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="holo-card p-5">
          <span className="text-xs font-display tracking-wider uppercase">Distribution Map</span>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={gradeDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name }) => name} strokeWidth={0}>
                {gradeDistribution.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* ═══ TARGET ═══ */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="holo-card p-5 mb-6">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center border border-primary/15">
            <Crosshair className="w-4 h-4 text-primary" />
          </div>
          <Input type="number" step="0.1" min="0" max="10" placeholder="Target CPI" value={targetCPI} onChange={e => setTargetCPI(e.target.value)} className="w-32 rounded-lg bg-background/40 border-border/30 font-mono" />
          {requiredGrade && <p className="text-sm text-muted-foreground">{requiredGrade}</p>}
        </div>
      </motion.div>

      {/* ═══ SEMESTERS ═══ */}
      {semesters.map((sem, si) => (
        <motion.div key={sem.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + si * 0.05 }} className="holo-card p-5 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-display font-bold tracking-widest uppercase flex items-center gap-2">
              Semester {sem.id}
              <Badge className="rounded-md bg-primary/8 text-primary border-primary/15 text-[9px] font-display">SPI: {calcSPI(sem.subjects).toFixed(2)}</Badge>
            </h3>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => addSubject(sem.id)} className="rounded-md text-[10px] font-display tracking-wider uppercase">
                <Plus className="w-3 h-3 mr-1" /> Add
              </Button>
              {semesters.length > 1 && (
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive rounded-md" onClick={() => removeSemester(sem.id)}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>
          <div className="space-y-2">
            {sem.subjects.map((sub, i) => (
              <div key={i} className="flex gap-2 items-center">
                <Input placeholder="Subject" value={sub.name} onChange={e => updateSubject(sem.id, i, 'name', e.target.value)} className="flex-1 rounded-lg bg-background/30 border-border/20 text-sm" />
                <Input type="number" placeholder="Cr" value={sub.credits} onChange={e => updateSubject(sem.id, i, 'credits', parseInt(e.target.value) || 0)} className="w-16 rounded-lg bg-background/30 border-border/20 text-sm font-mono" />
                <Select value={sub.grade} onValueChange={v => updateSubject(sem.id, i, 'grade', v)}>
                  <SelectTrigger className="w-20 rounded-lg bg-background/30 border-border/20 text-sm font-mono"><SelectValue /></SelectTrigger>
                  <SelectContent>{GRADE_OPTIONS.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                </Select>
                {sem.subjects.length > 1 && (
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive shrink-0 rounded-md" onClick={() => removeSubject(sem.id, i)}><Trash2 className="w-3 h-3" /></Button>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      ))}

      <Button variant="outline" onClick={addSemester} className="w-full rounded-lg btn-neon border-border/30 font-display tracking-wider text-xs uppercase">
        <Plus className="w-4 h-4 mr-2" /> Add Semester
      </Button>
    </div>
  );
};

export default Grades;
