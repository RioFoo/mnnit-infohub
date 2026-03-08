import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Target, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const GRADES: Record<string, number> = { 'A+': 10, A: 9, 'B+': 8, B: 7, C: 6, D: 5, E: 4, F: 0 };
const GRADE_OPTIONS = Object.keys(GRADES);
const CHART_COLORS = ['hsl(187, 92%, 53%)', 'hsl(270, 60%, 60%)', 'hsl(350, 96%, 73%)', 'hsl(48, 96%, 53%)', 'hsl(160, 64%, 65%)', 'hsl(217, 92%, 68%)'];

interface Subject { name: string; credits: number; grade: string; }
interface Semester { id: number; subjects: Subject[]; }

const Grades = () => {
  const [semesters, setSemesters] = useState<Semester[]>(() => {
    const saved = localStorage.getItem('infohub-grades');
    return saved ? JSON.parse(saved) : [{ id: 1, subjects: [{ name: '', credits: 4, grade: 'A' }] }];
  });
  const [targetCPI, setTargetCPI] = useState('');

  useEffect(() => {
    localStorage.setItem('infohub-grades', JSON.stringify(semesters));
  }, [semesters]);

  const addSemester = () => {
    setSemesters([...semesters, { id: semesters.length + 1, subjects: [{ name: '', credits: 4, grade: 'A' }] }]);
  };

  const removeSemester = (semId: number) => {
    setSemesters(semesters.filter(s => s.id !== semId));
  };

  const addSubject = (semId: number) => {
    setSemesters(semesters.map(s => s.id === semId ? { ...s, subjects: [...s.subjects, { name: '', credits: 4, grade: 'A' }] } : s));
  };

  const removeSubject = (semId: number, idx: number) => {
    setSemesters(semesters.map(s => s.id === semId ? { ...s, subjects: s.subjects.filter((_, i) => i !== idx) } : s));
  };

  const updateSubject = (semId: number, idx: number, field: keyof Subject, value: string | number) => {
    setSemesters(semesters.map(s => s.id === semId ? {
      ...s,
      subjects: s.subjects.map((sub, i) => i === idx ? { ...sub, [field]: value } : sub),
    } : s));
  };

  const calcSPI = (subjects: Subject[]) => {
    const totalCredits = subjects.reduce((s, sub) => s + sub.credits, 0);
    if (totalCredits === 0) return 0;
    const weighted = subjects.reduce((s, sub) => s + sub.credits * (GRADES[sub.grade] || 0), 0);
    return weighted / totalCredits;
  };

  const spiData = semesters.map(s => ({ sem: `Sem ${s.id}`, spi: parseFloat(calcSPI(s.subjects).toFixed(2)) }));

  const cpi = useMemo(() => {
    let totalCredits = 0, totalWeighted = 0;
    semesters.forEach(s => {
      s.subjects.forEach(sub => {
        totalCredits += sub.credits;
        totalWeighted += sub.credits * (GRADES[sub.grade] || 0);
      });
    });
    return totalCredits > 0 ? totalWeighted / totalCredits : 0;
  }, [semesters]);

  const requiredGrade = useMemo(() => {
    if (!targetCPI) return null;
    const target = parseFloat(targetCPI);
    if (target <= cpi) return 'Already achieved!';
    if (target > 10) return 'Not possible (max 10)';
    // Estimate: assume 5 subjects of 4 credits each in next semester
    const currentCredits = semesters.reduce((s, sem) => s + sem.subjects.reduce((a, sub) => a + sub.credits, 0), 0);
    const currentPoints = cpi * currentCredits;
    const nextCredits = 20;
    const neededPoints = target * (currentCredits + nextCredits) - currentPoints;
    const neededGPA = neededPoints / nextCredits;
    if (neededGPA > 10) return 'Not achievable in one semester';
    const closest = GRADE_OPTIONS.find(g => GRADES[g] >= neededGPA) || 'A+';
    return `Need avg ${closest} (${neededGPA.toFixed(1)} GPA) in next sem`;
  }, [targetCPI, cpi, semesters]);

  // Grade distribution for pie chart
  const gradeDistribution = useMemo(() => {
    const dist: Record<string, number> = {};
    semesters.forEach(s => s.subjects.forEach(sub => {
      dist[sub.grade] = (dist[sub.grade] || 0) + 1;
    }));
    return Object.entries(dist).map(([name, value]) => ({ name, value }));
  }, [semesters]);

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-mono font-bold text-primary">Grade Calculator</h1>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Overall CPI</p>
            <p className="text-2xl font-mono font-bold text-primary">{cpi.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="glass border-border">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-mono flex items-center gap-2"><TrendingUp className="w-4 h-4" /> SPI Trend</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={spiData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="sem" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis domain={[0, 10]} tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                <Line type="monotone" dataKey="spi" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: 'hsl(var(--primary))' }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass border-border">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-mono">Grade Distribution</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={gradeDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name }) => name}>
                  {gradeDistribution.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Target CPI */}
      <Card className="glass border-border">
        <CardContent className="pt-4">
          <div className="flex items-center gap-3">
            <Target className="w-5 h-5 text-primary" />
            <Input type="number" step="0.1" min="0" max="10" placeholder="Target CPI" value={targetCPI} onChange={e => setTargetCPI(e.target.value)} className="w-32" />
            {requiredGrade && <p className="text-sm text-muted-foreground">{requiredGrade}</p>}
          </div>
        </CardContent>
      </Card>

      {/* Semesters */}
      {semesters.map((sem, si) => (
        <motion.div key={sem.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: si * 0.1 }}>
          <Card className="glass border-border">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-mono">Semester {sem.id} — SPI: {calcSPI(sem.subjects).toFixed(2)}</CardTitle>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => addSubject(sem.id)}>
                    <Plus className="w-3 h-3 mr-1" /> Subject
                  </Button>
                  {semesters.length > 1 && (
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeSemester(sem.id)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {sem.subjects.map((sub, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <Input placeholder="Subject" value={sub.name} onChange={e => updateSubject(sem.id, i, 'name', e.target.value)} className="flex-1" />
                    <Input type="number" placeholder="Credits" value={sub.credits} onChange={e => updateSubject(sem.id, i, 'credits', parseInt(e.target.value) || 0)} className="w-20" />
                    <Select value={sub.grade} onValueChange={v => updateSubject(sem.id, i, 'grade', v)}>
                      <SelectTrigger className="w-20"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {GRADE_OPTIONS.map(g => <SelectItem key={g} value={g}>{g} ({GRADES[g]})</SelectItem>)}
                      </SelectContent>
                    </Select>
                    {sem.subjects.length > 1 && (
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive shrink-0" onClick={() => removeSubject(sem.id, i)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}

      <Button variant="outline" onClick={addSemester} className="w-full">
        <Plus className="w-4 h-4 mr-2" /> Add Semester
      </Button>
    </div>
  );
};

export default Grades;
