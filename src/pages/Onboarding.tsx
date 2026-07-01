import { useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, Sparkles, ArrowRight, User2, GraduationCap, Github } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import InfoHubLogo from '@/components/InfoHubLogo';
import { toast } from 'sonner';

const BRANCHES = ['CSE', 'ECE', 'EE', 'ME', 'CE', 'CHE', 'PIE', 'MME', 'BT', 'MCA'];
const SECTIONS = ['A', 'B', 'C', 'D', 'E'];
const SEMESTERS = ['1', '2', '3', '4', '5', '6', '7', '8'];

export const isProfileIncomplete = (p: { name?: string | null; branch?: string | null; section?: string | null; semester?: string | null; batch?: string | null; bio?: string | null }) => {
  if (!p) return true;
  return !p.name || !p.branch || !p.section || !p.semester || !p.batch;
};

const Onboarding = () => {
  const { user, profile, loading, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState('');
  const [branch, setBranch] = useState('');
  const [section, setSection] = useState('');
  const [semester, setSemester] = useState('');
  const [batch, setBatch] = useState('');
  const [bio, setBio] = useState('');
  const [github, setGithub] = useState('');

  useEffect(() => {
    if (profile) {
      setName(profile.name ?? '');
      setBranch(profile.branch ?? '');
      setSection(profile.section ?? '');
      setSemester(profile.semester ?? '');
      setBatch(profile.batch ?? '');
      setBio(profile.bio ?? '');
      setGithub(profile.github_url ?? '');
    }
  }, [profile]);

  const currentYear = new Date().getFullYear();
  const batchOptions = useMemo(
    () => Array.from({ length: 8 }, (_, i) => `${currentYear - 4 + i}`),
    [currentYear]
  );

  const stepsFilled = [name, branch, section, semester, batch].filter(Boolean).length;
  const progress = Math.round((stepsFilled / 5) * 100);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }
  if (!user) return <Navigate to="/auth" replace />;
  if (profile && !isProfileIncomplete(profile)) return <Navigate to="/" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !branch || !section || !semester || !batch) {
      toast.error('Please fill all required fields');
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        name: name.trim(),
        branch,
        section,
        semester,
        batch,
        bio: bio.trim() || 'MNNIT Student',
        github_url: github.trim() || null,
      })
      .eq('id', user.id);
    if (error) {
      toast.error(error.message);
    } else {
      await refreshProfile();
      toast.success('Profile ready — welcome to InfoHub!');
      navigate('/', { replace: true });
    }
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full opacity-25 blur-3xl" style={{ background: 'radial-gradient(circle, hsl(var(--primary) / 0.4), transparent 70%)' }} />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full opacity-20 blur-3xl" style={{ background: 'radial-gradient(circle, hsl(var(--primary) / 0.35), transparent 70%)' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
        className="relative w-full max-w-xl"
      >
        <div className="glass-strong rounded-3xl p-6 sm:p-8 shadow-2xl border border-primary/15">
          <div className="flex items-center gap-3 mb-6">
            <InfoHubLogo size={52} />
            <div>
              <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-primary/80">Step 1 of 1</p>
              <h1 className="font-display text-2xl sm:text-3xl font-black tracking-tight">Complete your profile</h1>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-1.5">
              <span>Profile completion</span>
              <span className="text-primary font-semibold">{progress}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-muted/30 overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: 'var(--gradient-primary)' }}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="font-semibold flex items-center gap-1.5"><User2 className="w-3.5 h-3.5" /> Full Name *</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Rahul Sharma" required className="mt-1.5 h-11" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="font-semibold flex items-center gap-1.5"><GraduationCap className="w-3.5 h-3.5" /> Branch *</Label>
                <Select value={branch} onValueChange={setBranch}>
                  <SelectTrigger className="mt-1.5 h-11"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{BRANCHES.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label className="font-semibold">Section *</Label>
                <Select value={section} onValueChange={setSection}>
                  <SelectTrigger className="mt-1.5 h-11"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{SECTIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="font-semibold">Semester *</Label>
                <Select value={semester} onValueChange={setSemester}>
                  <SelectTrigger className="mt-1.5 h-11"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{SEMESTERS.map(s => <SelectItem key={s} value={s}>Sem {s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label className="font-semibold">Batch (Grad Year) *</Label>
                <Select value={batch} onValueChange={setBatch}>
                  <SelectTrigger className="mt-1.5 h-11"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{batchOptions.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="font-semibold flex items-center justify-between">
                <span>Short Bio</span>
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/60">optional</span>
              </Label>
              <Textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="I love building things & exploring campus life…" maxLength={160} className="mt-1.5 min-h-[72px] resize-none" />
              <p className="mt-1 text-[11px] text-muted-foreground/70 text-right">{bio.length}/160</p>
            </div>

            <div>
              <Label className="font-semibold flex items-center gap-1.5"><Github className="w-3.5 h-3.5" /> GitHub URL <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/60 ml-auto">optional</span></Label>
              <Input value={github} onChange={(e) => setGithub(e.target.value)} placeholder="https://github.com/yourhandle" className="mt-1.5 h-11" />
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <Button type="submit" disabled={saving} className="flex-1 h-12 text-base font-bold tracking-wide gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Sparkles className="w-4 h-4" /> Enter InfoHub <ArrowRight className="w-4 h-4" /></>}
              </Button>
              <Button type="button" variant="ghost" onClick={() => navigate('/', { replace: true })} className="h-12 font-mono uppercase tracking-wider text-xs">
                Skip for now
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Onboarding;
