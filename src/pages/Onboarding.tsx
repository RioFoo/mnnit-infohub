import { useEffect, useMemo, useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Sparkles, ArrowRight, User2, GraduationCap, Github, Check, CloudUpload, CloudOff } from 'lucide-react';
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
const REQUIRED_FIELDS = ['name', 'branch', 'section', 'semester', 'batch'] as const;

type DraftShape = {
  name: string; branch: string; section: string; semester: string;
  batch: string; bio: string; github: string;
  completed: string[]; updatedAt: number;
};

const DRAFT_KEY = (uid: string) => `infohub:onboarding:draft:${uid}`;

export const isProfileIncomplete = (p: { name?: string | null; branch?: string | null; section?: string | null; semester?: string | null; batch?: string | null; bio?: string | null }) => {
  if (!p) return true;
  return !p.name || !p.branch || !p.section || !p.semester || !p.batch;
};

const Onboarding = () => {
  const { user, profile, loading, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [autosaveState, setAutosaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [name, setName] = useState('');
  const [branch, setBranch] = useState('');
  const [section, setSection] = useState('');
  const [semester, setSemester] = useState('');
  const [batch, setBatch] = useState('');
  const [bio, setBio] = useState('');
  const [github, setGithub] = useState('');
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const hydrated = useRef(false);

  // Hydrate: prefer local draft (newer edits) then profile
  useEffect(() => {
    if (!user || hydrated.current) return;
    let draft: DraftShape | null = null;
    try {
      const raw = localStorage.getItem(DRAFT_KEY(user.id));
      if (raw) draft = JSON.parse(raw);
    } catch { /* ignore */ }

    const src = {
      name: draft?.name ?? profile?.name ?? '',
      branch: draft?.branch ?? profile?.branch ?? '',
      section: draft?.section ?? profile?.section ?? '',
      semester: draft?.semester ?? profile?.semester ?? '',
      batch: draft?.batch ?? profile?.batch ?? '',
      bio: draft?.bio ?? profile?.bio ?? '',
      github: draft?.github ?? profile?.github_url ?? '',
    };
    setName(src.name); setBranch(src.branch); setSection(src.section);
    setSemester(src.semester); setBatch(src.batch); setBio(src.bio); setGithub(src.github);
    setCompleted(new Set(draft?.completed ?? REQUIRED_FIELDS.filter(f => (src as any)[f])));

    if (draft) {
      toast.success('Restored your onboarding progress', { duration: 2200 });
    }
    hydrated.current = true;
  }, [user, profile]);

  // Autosave to localStorage (debounced)
  useEffect(() => {
    if (!user || !hydrated.current) return;
    setAutosaveState('saving');
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(() => {
      try {
        const nextCompleted = REQUIRED_FIELDS.filter(f => {
          const v = { name, branch, section, semester, batch }[f];
          return !!v;
        });
        setCompleted(new Set(nextCompleted));
        const draft: DraftShape = {
          name, branch, section, semester, batch, bio, github,
          completed: nextCompleted, updatedAt: Date.now(),
        };
        localStorage.setItem(DRAFT_KEY(user.id), JSON.stringify(draft));
        setAutosaveState('saved');
      } catch {
        setAutosaveState('error');
      }
    }, 500);
    return () => { if (autosaveTimer.current) clearTimeout(autosaveTimer.current); };
  }, [user, name, branch, section, semester, batch, bio, github]);

  const currentYear = new Date().getFullYear();
  const batchOptions = useMemo(
    () => Array.from({ length: 8 }, (_, i) => `${currentYear - 4 + i}`),
    [currentYear]
  );

  const progress = Math.round((completed.size / REQUIRED_FIELDS.length) * 100);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }
  if (!user) return <Navigate to="/auth" replace />;
  if (profile && !isProfileIncomplete(profile) && !finishing) return <Navigate to="/" replace />;

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
      setSaving(false);
      return;
    }
    await refreshProfile();
    try { localStorage.removeItem(DRAFT_KEY(user.id)); } catch { /* ignore */ }
    setSaving(false);
    setFinishing(true);
    // let cinematic exit play
    setTimeout(() => navigate('/', { replace: true }), 1400);
  };

  const AutosaveBadge = () => {
    const label = autosaveState === 'saving' ? 'Saving…'
      : autosaveState === 'saved' ? 'Saved locally'
      : autosaveState === 'error' ? 'Offline draft failed'
      : 'Autosave on';
    const Icon = autosaveState === 'error' ? CloudOff : autosaveState === 'saved' ? Check : CloudUpload;
    return (
      <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground/80">
        <Icon className={`w-3 h-3 ${autosaveState === 'saving' ? 'animate-pulse text-primary' : autosaveState === 'saved' ? 'text-primary' : ''}`} />
        <span>{label}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full opacity-25 blur-3xl" style={{ background: 'radial-gradient(circle, hsl(var(--primary) / 0.4), transparent 70%)' }} />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full opacity-20 blur-3xl" style={{ background: 'radial-gradient(circle, hsl(var(--primary) / 0.35), transparent 70%)' }} />
      </div>

      <AnimatePresence mode="wait">
        {!finishing ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.96, filter: 'blur(8px)' }}
            transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
            className="relative w-full max-w-xl"
          >
            <div className="glass-strong rounded-3xl p-6 sm:p-8 shadow-2xl border border-primary/15">
              <div className="flex items-center gap-3 mb-6">
                <InfoHubLogo size={52} />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-primary/80">Step 1 of 1</p>
                    <AutosaveBadge />
                  </div>
                  <h1 className="font-display text-2xl sm:text-3xl font-black tracking-tight">Complete your profile</h1>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-1.5">
                  <span>Profile completion · {completed.size}/{REQUIRED_FIELDS.length} steps</span>
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
                <div className="flex gap-1.5 mt-2">
                  {REQUIRED_FIELDS.map(f => (
                    <div key={f} className={`flex-1 h-1 rounded-full transition-colors ${completed.has(f) ? 'bg-primary' : 'bg-muted/40'}`} />
                  ))}
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
        ) : (
          <motion.div
            key="finishing"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
            className="relative flex flex-col items-center gap-6 text-center px-6"
          >
            <motion.div
              initial={{ rotate: -180, scale: 0.5 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
            >
              <InfoHubLogo size={96} />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.4 }}
              className="space-y-2"
            >
              <h2 className="font-display text-3xl sm:text-4xl font-black tracking-tight">
                Welcome, {name.split(' ')[0] || 'Explorer'}
              </h2>
              <p className="text-sm font-mono uppercase tracking-[0.25em] text-primary/80">Booting your feed…</p>
            </motion.div>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: 240 }}
              transition={{ delay: 0.3, duration: 1.0 }}
              className="h-1 rounded-full overflow-hidden bg-muted/30"
            >
              <motion.div
                className="h-full rounded-full"
                style={{ background: 'var(--gradient-primary)' }}
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ delay: 0.3, duration: 1.0 }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Onboarding;
