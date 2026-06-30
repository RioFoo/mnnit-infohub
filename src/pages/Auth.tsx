import { useState, useEffect, useRef } from 'react';
import InfoHubLogo from '@/components/InfoHubLogo';
import { useAuth } from '@/contexts/AuthContext';
import { useSearchParams, Navigate, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Mail, UserPlus, Lock, LockOpen, ArrowLeft, CheckCircle2, PartyPopper, ShieldCheck, GraduationCap, KeyRound } from 'lucide-react';
import { toast } from 'sonner';
import authIntroVideo from '@/assets/auth-intro.mp4.asset.json';
import { supabase } from '@/integrations/supabase/client';

const INTRO_DURATION_MS = 6500;

const AuthIntroSplash = ({ onDone }: { onDone: () => void }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [visible, setVisible] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const startedAtRef = useRef<number>(performance.now());

  const dismiss = () => {
    setVisible((v) => {
      if (!v) return v;
      setTimeout(onDone, 450);
      return false;
    });
  };

  useEffect(() => {
    const cap = window.setTimeout(dismiss, INTRO_DURATION_MS);
    const tick = window.setInterval(() => setElapsed(performance.now() - startedAtRef.current), 80);
    return () => { window.clearTimeout(cap); window.clearInterval(tick); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const progress = Math.min(100, (elapsed / INTRO_DURATION_MS) * 100);
  const seconds = (elapsed / 1000).toFixed(1);
  const remaining = Math.max(0, (INTRO_DURATION_MS - elapsed) / 1000).toFixed(1);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="auth-intro"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04, filter: 'blur(8px)' }}
          transition={{ duration: 0.45, ease: 'easeInOut' }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background overflow-hidden"
        >
          <video ref={videoRef} src={authIntroVideo.url} autoPlay muted playsInline preload="auto" onEnded={dismiss} onError={dismiss} className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-background/40 pointer-events-none" />

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }} className="absolute top-6 left-1/2 -translate-x-1/2 w-[min(420px,80vw)] flex flex-col items-center gap-2">
            <div className="flex w-full items-center justify-between text-[10px] font-mono uppercase tracking-[0.25em] text-foreground/70">
              <span className="flex items-center gap-1.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
                </span>
                Booting · {seconds}s
              </span>
              <span className="text-primary/80">{remaining}s left</span>
            </div>
            <div className="w-full h-1 rounded-full bg-foreground/10 overflow-hidden backdrop-blur-sm">
              <motion.div className="h-full rounded-full" style={{ width: `${progress}%`, background: 'var(--gradient-primary)' }} transition={{ ease: 'linear' }} />
            </div>
          </motion.div>

          <motion.button initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 0.4 }} onClick={dismiss} className="absolute bottom-6 right-6 px-4 py-2 rounded-full bg-background/60 backdrop-blur-md border border-primary/30 text-xs font-mono uppercase tracking-[0.2em] text-foreground/80 hover:text-primary hover:border-primary/60 transition-colors">
            Skip intro →
          </motion.button>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.6 }} className="absolute bottom-8 left-6 flex items-center gap-3">
            <InfoHubLogo size={36} animate={false} />
            <span className="font-display text-sm font-bold tracking-[0.25em] text-foreground/90">MNNIT INFOHUB</span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { session, signIn, signUp, resetPassword } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showIntro, setShowIntro] = useState(false);
  const [introStep, setIntroStep] = useState(0);
  const [userName, setUserName] = useState('');
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') === 'register' ? 'register' : 'login');
  const [error, setError] = useState<string | null>(null);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [showEntryIntro, setShowEntryIntro] = useState(() => {
    if (typeof window === 'undefined') return false;
    try { return sessionStorage.getItem('infohub:auth-intro-played') !== '1'; } catch { return true; }
  });

  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);

  // Signup state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const passwordStrength = (() => {
    let s = 0;
    if (password.length >= 6) s++;
    if (password.length >= 10) s++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) s++;
    if (/\d/.test(password) && /[^A-Za-z0-9]/.test(password)) s++;
    return s;
  })();
  const strengthLabels = ['Too short', 'Weak', 'Okay', 'Strong', 'Excellent'];
  const strengthColors = ['bg-destructive', 'bg-destructive', 'bg-yellow-500', 'bg-primary', 'bg-primary'];

  useEffect(() => {
    const providerError = searchParams.get('error');
    if (providerError) {
      const decoded = decodeURIComponent(providerError.replace(/\+/g, ' '));
      setError(`Sign-in failed: ${decoded}`);
      toast.error(`Sign-in failed: ${decoded}`);
    }
  }, [searchParams]);

  if (session && !showIntro) return <Navigate to="/" replace />;

  const runIntro = (displayName: string) => {
    setUserName(displayName);
    setShowIntro(true);
    setIntroStep(0);
    setTimeout(() => setIntroStep(1), 1500);
    setTimeout(() => setIntroStep(2), 3000);
    setTimeout(() => setShowIntro(false), 4000);
  };

  const getErrorMessage = (msg: string) => {
    switch (msg) {
      case 'Invalid login credentials': return 'Wrong email or password. Please try again.';
      case 'Email not confirmed': return 'Please check your email and click the confirmation link first.';
      case 'User already registered': return 'This email is already registered. Try logging in instead.';
      default: return msg || 'Something went wrong. Please try again.';
    }
  };

  const resolveLoginEmail = async (input: string): Promise<string> => {
    const trimmed = input.trim();
    if (!trimmed) return trimmed;
    if (trimmed.toLowerCase().endsWith('@mnnit.ac.in')) return trimmed;
    try {
      const { data, error } = await supabase.rpc('email_for_recovery', { _recovery: trimmed });
      if (!error && typeof data === 'string' && data.length > 0) return data;
    } catch { /* ignore */ }
    return trimmed;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null);
    const resolved = await resolveLoginEmail(loginEmail);
    const { error } = await signIn(resolved, loginPassword);
    if (error) {
      const msg = error.message === 'Invalid login credentials' && resolved !== loginEmail.trim()
        ? 'No account found for that recovery email, or the password is wrong.'
        : getErrorMessage(error.message);
      setError(msg); toast.error(msg);
    } else {
      runIntro((resolved || loginEmail).split('@')[0]);
    }
    setLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) { toast.error('Passwords do not match'); return; }
    setLoading(true); setError(null);
    const meta: Record<string, string> = { name };
    const rec = recoveryEmail.trim();
    if (rec) meta.recovery_email = rec;
    const { error } = await signUp(email, password, meta);
    if (error) { setError(getErrorMessage(error.message)); toast.error(getErrorMessage(error.message)); }
    else { setShowWelcome(true); }
    setLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true); setError(null);
    const { error } = await resetPassword(forgotEmail);
    if (error) { setError(getErrorMessage(error.message)); toast.error(getErrorMessage(error.message)); }
    else { toast.success('Password reset email sent! Check your inbox.'); setShowForgot(false); }
    setForgotLoading(false);
  };

  if (showIntro) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background overflow-hidden relative">
        <AnimatePresence mode="wait">
          {introStep === 0 && (
            <motion.div key="s0" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ type: 'spring', damping: 15 }} className="text-center">
              <div className="mx-auto mb-6"><InfoHubLogo size={96} /></div>
              <h1 className="text-4xl font-display font-black text-primary glow-text tracking-tight">Welcome, {userName}</h1>
            </motion.div>
          )}
          {introStep === 1 && (
            <motion.div key="s1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center">
              <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground font-mono uppercase tracking-widest text-sm">Syncing campus data</p>
            </motion.div>
          )}
          {introStep === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-center">
              <h2 className="text-3xl font-display font-black text-primary glow-text tracking-tight">Entering InfoHub →</h2>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <>
      {showEntryIntro && (
        <AuthIntroSplash onDone={() => {
          try { sessionStorage.setItem('infohub:auth-intro-played', '1'); } catch { /* ignore */ }
          setShowEntryIntro(false);
        }} />
      )}

      <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden p-4 sm:p-6">
        {/* Soft ambient backdrop */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -left-32 w-[420px] h-[420px] rounded-full opacity-30 blur-3xl" style={{ background: 'radial-gradient(circle, hsl(var(--primary) / 0.35), transparent 70%)' }} />
          <div className="absolute -bottom-32 -right-32 w-[480px] h-[480px] rounded-full opacity-25 blur-3xl" style={{ background: 'radial-gradient(circle, hsl(var(--primary) / 0.3), transparent 70%)' }} />
          <div className="absolute inset-0 opacity-[0.04]" style={{
            backgroundImage: `linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`,
            backgroundSize: '56px 56px',
          }} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
          className="relative w-full max-w-md"
        >
          <div className="glass-strong rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden border border-primary/15">
            {/* subtle scanning line */}
            <motion.div
              className="absolute inset-x-0 h-px pointer-events-none"
              style={{ background: 'linear-gradient(90deg, transparent, hsl(var(--primary) / 0.5), transparent)' }}
              animate={{ top: ['0%', '100%', '0%'] }}
              transition={{ duration: 7, repeat: Infinity, ease: 'linear' }}
            />

            {/* Back button */}
            <button onClick={() => navigate('/')} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors font-mono uppercase tracking-[0.2em]">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Feed
            </button>

            {/* Logo + headline */}
            <div className="text-center mt-6 mb-7">
              <motion.div
                initial={{ scale: 0.7, opacity: 0, rotate: -8 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 180, damping: 14, delay: 0.1 }}
                className="inline-block mb-4"
              >
                <InfoHubLogo size={104} />
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.4 }}
                className="font-display text-3xl sm:text-4xl font-black tracking-tight text-foreground"
              >
                MNNIT <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'var(--gradient-primary)' }}>InfoHub</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.4 }}
                className="text-sm text-muted-foreground/80 font-mono uppercase tracking-[0.18em] mt-2"
              >
                Mindset · Connect · Inspire
              </motion.p>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 p-3 rounded-lg border border-destructive/50 bg-destructive/10 text-destructive text-sm"
                >
                  ⚠ {error}
                </motion.div>
              )}
            </AnimatePresence>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-muted/30 backdrop-blur-sm p-1 rounded-xl h-11">
                <TabsTrigger value="login" className="gap-2 rounded-lg font-semibold data-[state=active]:bg-primary/15 data-[state=active]:text-primary data-[state=active]:shadow-[0_0_20px_hsl(var(--primary)/0.25)]">
                  <Mail className="w-4 h-4" /> Login
                </TabsTrigger>
                <TabsTrigger value="register" className="gap-2 rounded-lg font-semibold data-[state=active]:bg-primary/15 data-[state=active]:text-primary data-[state=active]:shadow-[0_0_20px_hsl(var(--primary)/0.25)]">
                  <UserPlus className="w-4 h-4" /> Register
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4 mt-6">
                  <div>
                    <Label htmlFor="login-email" className="flex items-center justify-between font-semibold">
                      <span>Email</span>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/60">college · or recovery</span>
                    </Label>
                    <Input id="login-email" type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder="you@mnnit.ac.in" required autoComplete="username" className="mt-1.5 h-11 bg-background/50 border-border/50 focus:border-primary/60 focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.15)] transition-all" />
                  </div>

                  <div>
                    <Label htmlFor="login-password" className="font-semibold">Password</Label>
                    <div className="relative mt-1.5">
                      <Input
                        id="login-password"
                        type={showPassword ? 'text' : 'password'}
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        onKeyUp={(e) => setCapsLockOn(e.getModifierState && e.getModifierState('CapsLock'))}
                        onKeyDown={(e) => setCapsLockOn(e.getModifierState && e.getModifierState('CapsLock'))}
                        placeholder="••••••••"
                        required
                        autoComplete="current-password"
                        className="pr-10 h-11 bg-background/50 border-border/50 focus:border-primary/60 focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.15)] transition-all"
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors">
                        {showPassword ? <LockOpen className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                      </button>
                    </div>
                    <AnimatePresence>
                      {capsLockOn && (
                        <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="mt-1.5 text-[11px] font-mono text-yellow-500/90">
                          ⚠ Caps Lock is on
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="flex justify-end">
                    <button type="button" onClick={() => setShowForgot(true)} className="text-xs font-semibold text-primary/80 hover:text-primary transition-colors">
                      Forgot password?
                    </button>
                  </div>

                  <Button type="submit" className="w-full h-12 text-base font-bold tracking-wide transition-all hover:shadow-[0_0_30px_hsl(var(--primary)/0.45)] relative overflow-hidden group" disabled={loading}>
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sign In →'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register">
                <form onSubmit={handleSignup} className="space-y-4 mt-6">
                  <div>
                    <Label className="font-semibold">Full Name</Label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Rahul Sharma" required className="mt-1.5 h-11 bg-background/50 border-border/50 focus:border-primary/60 focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.15)] transition-all" />
                  </div>
                  <div>
                    <Label className="font-semibold">College Email</Label>
                    <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@mnnit.ac.in" required className="mt-1.5 h-11 bg-background/50 border-border/50 focus:border-primary/60 focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.15)] transition-all" />
                  </div>
                  <div>
                    <Label className="flex items-center justify-between font-semibold">
                      <span>Recovery Email</span>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/60">optional</span>
                    </Label>
                    <Input type="email" value={recoveryEmail} onChange={(e) => setRecoveryEmail(e.target.value)} placeholder="backup@gmail.com" className="mt-1.5 h-11 bg-background/50 border-border/50 focus:border-primary/60 focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.15)] transition-all" />
                    <p className="mt-1 text-[11px] text-muted-foreground/70">Sign in with this if you lose access to your college mail.</p>
                  </div>
                  <div>
                    <Label className="font-semibold">Password</Label>
                    <div className="relative mt-1.5">
                      <Input type={showRegPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 6 characters" required minLength={6} autoComplete="new-password" className="pr-10 h-11 bg-background/50 border-border/50 focus:border-primary/60 focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.15)] transition-all" />
                      <button type="button" onClick={() => setShowRegPassword(!showRegPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors">
                        {showRegPassword ? <LockOpen className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                      </button>
                    </div>
                    {password.length > 0 && (
                      <div className="mt-2">
                        <div className="flex gap-1">
                          {[0, 1, 2, 3].map((i) => (
                            <motion.div key={i} initial={{ scaleX: 0 }} animate={{ scaleX: i < passwordStrength ? 1 : 0.15 }} transition={{ duration: 0.3 }} className={`h-1 flex-1 rounded-full origin-left ${i < passwordStrength ? strengthColors[passwordStrength] : 'bg-muted'}`} />
                          ))}
                        </div>
                        <p className="mt-1 text-[11px] font-mono text-muted-foreground/80">
                          Strength: <span className="text-primary font-semibold">{strengthLabels[passwordStrength]}</span>
                        </p>
                      </div>
                    )}
                  </div>
                  <div>
                    <Label className="font-semibold">Confirm Password</Label>
                    <div className="relative mt-1.5">
                      <Input type={showRegConfirmPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter password" required minLength={6} className="pr-10 h-11 bg-background/50 border-border/50 focus:border-primary/60 focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.15)] transition-all" />
                      <button type="button" onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors">
                        {showRegConfirmPassword ? <LockOpen className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full h-12 text-base font-bold tracking-wide transition-all hover:shadow-[0_0_30px_hsl(var(--primary)/0.45)] relative overflow-hidden group" disabled={loading}>
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Account →'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            {/* Trust badges */}
            <div className="mt-6 grid grid-cols-3 gap-2">
              {[
                { Icon: ShieldCheck, label: 'Encrypted' },
                { Icon: GraduationCap, label: 'MNNIT Only' },
                { Icon: KeyRound, label: 'Recovery' },
              ].map(({ Icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-1.5 py-2.5 rounded-xl bg-muted/15 border border-border/30">
                  <Icon className="w-4 h-4 text-primary" />
                  <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/80">{label}</span>
                </div>
              ))}
            </div>

            <p className="text-[11px] text-muted-foreground/60 text-center mt-5 font-mono tracking-wide">By signing in, you agree to our Terms of Service</p>
          </div>

          {/* Forgot Password Overlay */}
          <AnimatePresence>
            {showForgot && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md p-4">
                <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }} className="w-full max-w-sm glass-strong rounded-2xl p-6 shadow-2xl border border-primary/15">
                  <div className="text-center mb-5">
                    <InfoHubLogo size={56} animate={false} />
                  </div>
                  <h2 className="text-xl font-display font-black text-foreground mb-1 text-center">Reset Password</h2>
                  <p className="text-sm text-muted-foreground mb-5 text-center">We'll email you a secure reset link.</p>
                  <form onSubmit={handleForgotPassword} className="space-y-3">
                    <div>
                      <Label htmlFor="forgot-email" className="font-semibold">Email</Label>
                      <Input id="forgot-email" type="email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} placeholder="you@mnnit.ac.in" required className="mt-1.5 h-11" />
                    </div>
                    <Button type="submit" className="w-full h-11 font-bold" disabled={forgotLoading}>
                      {forgotLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Reset Link'}
                    </Button>
                    <Button variant="ghost" type="button" onClick={() => setShowForgot(false)} className="w-full gap-2">
                      <ArrowLeft className="w-4 h-4" /> Back to Login
                    </Button>
                  </form>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Welcome Overlay */}
          <AnimatePresence>
            {showWelcome && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-xl p-4">
                <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} transition={{ type: 'spring', damping: 15 }} className="text-center space-y-5 max-w-sm">
                  <motion.div animate={{ scale: [1, 1.15, 1], rotate: [0, 8, -8, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                    <PartyPopper className="w-16 h-16 text-primary mx-auto drop-shadow-[0_0_25px_hsl(var(--primary)/0.5)]" />
                  </motion.div>
                  <h2 className="text-2xl font-display font-black text-primary glow-text">Welcome aboard! 🎉</h2>
                  <p className="text-muted-foreground">Account created. Check your email to confirm, then sign in.</p>
                  <Button onClick={() => {
                    setShowWelcome(false); setActiveTab('login'); setLoginEmail(email);
                    setName(''); setEmail(''); setPassword(''); setConfirmPassword('');
                  }} className="gap-2 h-11 px-8 font-bold">
                    <CheckCircle2 className="w-5 h-5" /> Go to Login
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </>
  );
};

export default Auth;
