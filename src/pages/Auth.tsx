import { useState, useEffect, useRef } from 'react';
import InfoHubLogo from '@/components/InfoHubLogo';
import { useAuth } from '@/contexts/AuthContext';
import { useSearchParams, Navigate, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Loader2, Mail, UserPlus, Lock, LockOpen, ArrowLeft, CheckCircle2, PartyPopper } from 'lucide-react';
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
    const tick = window.setInterval(() => {
      setElapsed(performance.now() - startedAtRef.current);
    }, 80);
    return () => {
      window.clearTimeout(cap);
      window.clearInterval(tick);
    };
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
          <video
            ref={videoRef}
            src={authIntroVideo.url}
            autoPlay
            muted
            playsInline
            preload="auto"
            onEnded={dismiss}
            onError={dismiss}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-background/40 pointer-events-none" />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(circle at 50% 60%, hsl(var(--primary) / 0.12), transparent 65%)' }}
          />

          {/* Progress + elapsed indicator */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="absolute top-6 left-1/2 -translate-x-1/2 w-[min(420px,80vw)] flex flex-col items-center gap-2"
          >
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
              <motion.div
                className="h-full rounded-full"
                style={{ width: `${progress}%`, background: 'var(--gradient-primary)' }}
                transition={{ ease: 'linear' }}
              />
            </div>
          </motion.div>

          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.4 }}
            onClick={dismiss}
            className="absolute bottom-6 right-6 px-4 py-2 rounded-full bg-background/60 backdrop-blur-md border border-primary/30 text-xs font-mono uppercase tracking-[0.2em] text-foreground/80 hover:text-primary hover:border-primary/60 transition-colors"
          >
            Skip intro →
          </motion.button>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="absolute bottom-8 left-6 flex items-center gap-3"
          >
            <InfoHubLogo size={36} animate={false} />
            <span className="font-display text-sm font-bold tracking-[0.25em] text-foreground/90">MNNIT INFOHUB</span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};




// Floating 3D particle component
const FloatingParticles = () => {
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 1,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * 5,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-primary/20"
          style={{ width: p.size, height: p.size, left: `${p.x}%`, top: `${p.y}%` }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.random() * 20 - 10, 0],
            opacity: [0.2, 0.6, 0.2],
            scale: [1, 1.5, 1],
          }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
};

// Animated 3D cube
const FloatingCube = ({ delay = 0, size = 60, x = 0, y = 0 }: { delay?: number; size?: number; x?: number; y?: number }) => (
  <motion.div
    className="absolute"
    style={{ left: `${x}%`, top: `${y}%`, width: size, height: size, perspective: 200 }}
    animate={{ rotateX: [0, 360], rotateY: [0, 360], y: [0, -20, 0] }}
    transition={{ duration: 12, repeat: Infinity, delay, ease: 'linear' }}
  >
    <div
      className="w-full h-full relative"
      style={{ transformStyle: 'preserve-3d' }}
    >
      {/* Cube faces */}
      {[
        { transform: `translateZ(${size / 2}px)`, bg: 'hsl(var(--primary) / 0.15)' },
        { transform: `rotateY(180deg) translateZ(${size / 2}px)`, bg: 'hsl(var(--primary) / 0.1)' },
        { transform: `rotateY(90deg) translateZ(${size / 2}px)`, bg: 'hsl(var(--secondary) / 0.15)' },
        { transform: `rotateY(-90deg) translateZ(${size / 2}px)`, bg: 'hsl(var(--secondary) / 0.1)' },
        { transform: `rotateX(90deg) translateZ(${size / 2}px)`, bg: 'hsl(var(--primary) / 0.08)' },
        { transform: `rotateX(-90deg) translateZ(${size / 2}px)`, bg: 'hsl(var(--primary) / 0.12)' },
      ].map((face, i) => (
        <div
          key={i}
          className="absolute inset-0 border border-primary/20 rounded-sm"
          style={{ transform: face.transform, background: face.bg, backfaceVisibility: 'hidden' }}
        />
      ))}
    </div>
  </motion.div>
);

// Orbiting ring
const OrbitRing = ({ size = 200, duration = 8, delay = 0 }: { size?: number; duration?: number; delay?: number }) => (
  <motion.div
    className="absolute border border-primary/10 rounded-full"
    style={{
      width: size,
      height: size,
      left: '50%',
      top: '50%',
      marginLeft: -size / 2,
      marginTop: -size / 2,
    }}
    animate={{ rotateX: 75, rotateZ: [0, 360] }}
    transition={{ duration, repeat: Infinity, delay, ease: 'linear' }}
  />
);

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
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [showEntryIntro, setShowEntryIntro] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      return sessionStorage.getItem('infohub:auth-intro-played') !== '1';
    } catch {
      return true;
    }
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

  // Password strength (0-4)
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




  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePos({
          x: ((e.clientX - rect.left) / rect.width - 0.5) * 20,
          y: ((e.clientY - rect.top) / rect.height - 0.5) * 20,
        });
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

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
      case 'Invalid login credentials':
        return 'Wrong email or password. Please try again.';
      case 'Email not confirmed':
        return 'Please check your email and click the confirmation link first.';
      case 'User already registered':
        return 'This email is already registered. Try logging in instead.';
      default:
        return msg || 'Something went wrong. Please try again.';
    }
  };

  const resolveLoginEmail = async (input: string): Promise<string> => {
    const trimmed = input.trim();
    if (!trimmed) return trimmed;
    // If it's the primary college address, use as-is.
    if (trimmed.toLowerCase().endsWith('@mnnit.ac.in')) return trimmed;
    // Otherwise treat as a recovery email and look up the linked college email.
    try {
      const { data, error } = await supabase.rpc('email_for_recovery', { _recovery: trimmed });
      if (!error && typeof data === 'string' && data.length > 0) return data;
    } catch { /* ignore - fall through */ }
    return trimmed; // signIn will surface a clear error if no match
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const resolved = await resolveLoginEmail(loginEmail);
    const { error } = await signIn(resolved, loginPassword);
    if (error) {
      const msg = error.message === 'Invalid login credentials' && resolved !== loginEmail.trim()
        ? 'No account found for that recovery email, or the password is wrong.'
        : getErrorMessage(error.message);
      setError(msg);
      toast.error(msg);
    } else {
      runIntro((resolved || loginEmail).split('@')[0]);
    }
    setLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    setError(null);
    const meta: Record<string, string> = { name };
    const rec = recoveryEmail.trim();
    if (rec) meta.recovery_email = rec;
    const { error } = await signUp(email, password, meta);
    if (error) {
      setError(getErrorMessage(error.message));
      toast.error(getErrorMessage(error.message));
    } else {
      setShowWelcome(true);
    }
    setLoading(false);
  };




  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);
    setError(null);
    const { error } = await resetPassword(forgotEmail);
    if (error) {
      setError(getErrorMessage(error.message));
      toast.error(getErrorMessage(error.message));
    } else {
      toast.success('Password reset email sent! Check your inbox.');
      setShowForgot(false);
    }
    setForgotLoading(false);
  };

  if (showIntro) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background overflow-hidden relative">
        <FloatingParticles />
        <AnimatePresence mode="wait">
          {introStep === 0 && (
            <motion.div key="s0" initial={{ opacity: 0, scale: 0.8, rotateY: -90 }} animate={{ opacity: 1, scale: 1, rotateY: 0 }} exit={{ opacity: 0, scale: 0.8, rotateY: 90 }} transition={{ type: 'spring', damping: 15 }} className="text-center" style={{ perspective: 1000 }}>
              <Zap className="w-16 h-16 text-primary mx-auto mb-4 drop-shadow-[0_0_15px_hsl(var(--primary)/0.5)]" />
              <h1 className="text-3xl font-mono font-bold text-primary glow-text">Welcome back, {userName} 👋</h1>
            </motion.div>
          )}
          {introStep === 1 && (
            <motion.div key="s1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground font-mono">Syncing your campus data...</p>
            </motion.div>
          )}
          {introStep === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-center">
              <h2 className="text-2xl font-mono font-bold text-primary glow-text">Ready. Entering InfoHub... 🚀</h2>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <>
      {showEntryIntro && (
        <AuthIntroSplash
          onDone={() => {
            try { sessionStorage.setItem('infohub:auth-intro-played', '1'); } catch { /* ignore */ }
            setShowEntryIntro(false);
          }}
        />
      )}
    <div ref={containerRef} className="min-h-screen flex relative overflow-x-hidden bg-background">
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
        backgroundImage: `linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`,
        backgroundSize: '60px 60px',
      }} />

      {/* Radial glow following mouse */}
      <div
        className="absolute inset-0 pointer-events-none transition-all duration-700 ease-out"
        style={{
          background: `radial-gradient(600px circle at ${50 + mousePos.x * 2}% ${50 + mousePos.y * 2}%, hsl(var(--primary) / 0.06), transparent 60%)`,
        }}
      />

      {/* Left branding — 3D scene */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center relative overflow-hidden">
        <FloatingParticles />

        {/* Orbit rings */}
        <div className="absolute inset-0 flex items-center justify-center" style={{ perspective: 800 }}>
          <OrbitRing size={300} duration={20} />
          <OrbitRing size={220} duration={15} delay={2} />
          <OrbitRing size={380} duration={25} delay={4} />
        </div>

        {/* Floating cubes */}
        <FloatingCube delay={0} size={50} x={15} y={20} />
        <FloatingCube delay={3} size={35} x={75} y={15} />
        <FloatingCube delay={6} size={45} x={70} y={70} />
        <FloatingCube delay={2} size={30} x={20} y={75} />
        <FloatingCube delay={4} size={25} x={85} y={45} />

        {/* Main branding with 3D tilt */}
        <motion.div
          className="relative z-10 text-center p-12"
          style={{ perspective: 1000 }}
          animate={{
            rotateX: mousePos.y * 0.3,
            rotateY: mousePos.x * 0.3,
          }}
          transition={{ type: 'spring', stiffness: 100, damping: 30 }}
        >
          {/* Glowing backdrop with INFOHUB watermark */}
          <div className="absolute inset-0 -m-8 rounded-3xl bg-primary/5 blur-3xl" />
          <div className="absolute inset-0 -m-8 flex items-center justify-center pointer-events-none select-none overflow-hidden">
            <span className="text-[8rem] font-mono font-black tracking-widest text-primary/[0.04] blur-[2px] uppercase" style={{ textShadow: '0 0 60px hsl(var(--primary) / 0.08)' }}>
              INFOHUB
            </span>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 30, rotateX: -15 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: 1, type: 'spring' }}
          >
            <motion.div
              className="relative inline-block mb-8"
              animate={{ rotateY: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <InfoHubLogo size={96} animate={false} />
            </motion.div>
            <h1 className="text-6xl font-mono font-bold text-primary glow-text mb-4 tracking-tight">
              MNNIT
              <br />
              <span className="text-5xl bg-clip-text text-transparent" style={{ backgroundImage: 'var(--gradient-primary)' }}>
                InfoHub
              </span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-md mx-auto mt-4 leading-relaxed">
              One hub. Every update. <span className="text-primary font-semibold">Zero FOMO.</span>
            </p>
            <p className="text-sm text-muted-foreground/50 font-mono mt-2 tracking-wide">
              Stay ahead. Stay connected. Stay informed.
            </p>
          </motion.div>

          {/* Floating tags */}
          {['Timetable', 'Grades', 'Feed', 'Events'].map((tag, i) => (
            <motion.span
              key={tag}
              className="absolute glass rounded-full px-3 py-1 text-xs font-mono text-primary/80 border border-primary/20"
              style={{
                left: `${[10, 80, 5, 85][i]}%`,
                top: `${[15, 25, 80, 75][i]}%`,
              }}
              animate={{
                y: [0, -8, 0],
                opacity: [0.6, 1, 0.6],
              }}
              transition={{ duration: 3 + i, repeat: Infinity, delay: i * 0.5 }}
            >
              {tag}
            </motion.span>
          ))}
        </motion.div>
      </div>

      {/* Right form — Glass card with 3D effect */}
      <div className="w-full lg:w-1/2 flex items-start justify-center p-3 sm:p-6 md:p-8 relative overflow-y-auto min-h-screen">
        <motion.div
          initial={{ opacity: 0, x: 40, rotateY: -5 }}
          animate={{ opacity: 1, x: 0, rotateY: 0 }}
          transition={{ duration: 0.8, type: 'spring' }}
          className="w-full max-w-md"
          style={{ perspective: 1000 }}
        >
          <motion.div
            className="glass-strong rounded-2xl p-4 sm:p-8 shadow-2xl relative overflow-hidden my-4 sm:my-6 w-full group"
            style={{ transformStyle: 'preserve-3d' }}
            whileHover={{ scale: 1.01, boxShadow: '0 0 40px hsl(var(--primary) / 0.15)' }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            {/* Animated border glow — pulses on hover */}
            <motion.div
              className="absolute inset-0 rounded-2xl pointer-events-none"
              style={{
                background: 'var(--gradient-primary)',
                mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                maskComposite: 'xor',
                WebkitMaskComposite: 'xor',
                padding: '1.5px',
              }}
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />

            {/* Scanning line effect */}
            <motion.div
              className="absolute inset-x-0 h-px pointer-events-none"
              style={{ background: 'linear-gradient(90deg, transparent, hsl(var(--primary) / 0.4), transparent)' }}
              animate={{ top: ['0%', '100%', '0%'] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
            />

            {/* Corner accents with glow */}
            <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-primary/40 rounded-tl-2xl pointer-events-none group-hover:border-primary/70 transition-colors duration-500" />
            <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-primary/40 rounded-br-2xl pointer-events-none group-hover:border-primary/70 transition-colors duration-500" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-primary/20 rounded-tr-2xl pointer-events-none group-hover:border-primary/40 transition-colors duration-500" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-primary/20 rounded-bl-2xl pointer-events-none group-hover:border-primary/40 transition-colors duration-500" />

            {/* Back button */}
            <motion.button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-4 group/back"
              whileHover={{ x: -4 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft className="w-4 h-4 group-hover/back:drop-shadow-[0_0_6px_hsl(var(--primary)/0.6)]" />
              <span className="font-mono text-xs uppercase tracking-wider">Back to Feed</span>
            </motion.button>

            {/* Mobile logo */}
            <div className="lg:hidden text-center mb-8">
              <motion.div whileHover={{ rotate: 15, scale: 1.1 }} transition={{ type: 'spring' }}>
                <Zap className="w-12 h-12 text-primary mx-auto mb-2 drop-shadow-[0_0_15px_hsl(var(--primary)/0.5)]" />
              </motion.div>
              <h1 className="text-2xl font-mono font-bold text-primary glow-text">MNNIT InfoHub</h1>
            </div>

            {/* Error display */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0, scale: 0.95 }}
                  animate={{ opacity: 1, height: 'auto', scale: 1 }}
                  exit={{ opacity: 0, height: 0, scale: 0.95 }}
                  className="mb-4 p-3 rounded-md border border-destructive/50 bg-destructive/10 text-destructive text-sm backdrop-blur-sm"
                >
                  ⚠️ {error}
                </motion.div>
              )}
            </AnimatePresence>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-muted/30 backdrop-blur-sm p-1 rounded-xl">
                <TabsTrigger
                  value="login"
                  className="gap-1.5 rounded-lg transition-all duration-300 data-[state=active]:bg-primary/15 data-[state=active]:text-primary data-[state=active]:shadow-[0_0_15px_hsl(var(--primary)/0.25)] data-[state=active]:font-semibold hover:bg-muted/50"
                >
                  <Mail className="w-3.5 h-3.5" /> Login
                </TabsTrigger>
                <TabsTrigger
                  value="register"
                  className="gap-1.5 rounded-lg transition-all duration-300 data-[state=active]:bg-primary/15 data-[state=active]:text-primary data-[state=active]:shadow-[0_0_15px_hsl(var(--primary)/0.25)] data-[state=active]:font-semibold hover:bg-muted/50"
                >
                  <UserPlus className="w-3.5 h-3.5" /> Register
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4 mt-6">
                  <motion.div
                    initial={{ opacity: 0, y: 10, rotateX: -15 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                    transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                    className="group/field"
                    style={{ perspective: 800, transformStyle: 'preserve-3d' }}
                  >
                    <Label htmlFor="login-email" className="flex items-center justify-between text-foreground/80 group-focus-within/field:text-primary transition-colors duration-300">
                      <span>Email</span>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/60">college or recovery</span>
                    </Label>
                    <motion.div
                      className="relative mt-1"
                      whileFocus={{ scale: 1.02 }}
                      whileHover={{ translateZ: 10, rotateX: 2, rotateY: -1 }}
                      style={{ transformStyle: 'preserve-3d' }}
                    >
                      <Input
                        id="login-email"
                        type="email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="you@mnnit.ac.in  ·  or backup@gmail.com"
                        required
                        autoComplete="username"
                        className="bg-background/50 border-border/50 focus:border-primary/60 transition-all duration-300 focus:shadow-[0_0_25px_hsl(var(--primary)/0.2),0_8px_32px_-8px_hsl(var(--primary)/0.15)] focus:bg-background/80 hover:border-border/80 hover:bg-background/60 focus:translate-y-[-2px]"
                      />

                      <motion.div
                        className="absolute inset-0 rounded-md pointer-events-none border border-primary/0 group-focus-within/field:border-primary/30"
                        style={{ boxShadow: '0 4px 20px -4px hsl(var(--primary) / 0)' }}
                        animate={{}}
                      />
                    </motion.div>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 10, rotateX: -15 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                    className="group/field"
                    style={{ perspective: 800, transformStyle: 'preserve-3d' }}
                  >
                    <Label htmlFor="login-password" className="text-foreground/80 group-focus-within/field:text-primary transition-colors duration-300">Password</Label>
                    <motion.div
                      className="relative mt-1"
                      whileHover={{ scale: 1.01 }}
                    >
                      <Input
                        id="login-password"
                        type={showPassword ? 'text' : 'password'}
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="pr-10 bg-background/50 border-border/50 focus:border-primary/60 transition-all duration-300 focus:shadow-[0_0_25px_hsl(var(--primary)/0.2),0_8px_32px_-8px_hsl(var(--primary)/0.15)] focus:bg-background/80 hover:border-border/80 hover:bg-background/60 focus:translate-y-[-2px]"
                      />
                      <motion.button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors z-10"
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                      >
                        {showPassword ? <LockOpen className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                      </motion.button>
                    </motion.div>
                  </motion.div>
                  <div className="flex justify-end">
                    <motion.button
                      type="button"
                      onClick={() => setShowForgot(true)}
                      className="text-xs text-primary/70 hover:text-primary transition-colors relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-px after:bg-primary after:transition-all after:duration-300 hover:after:w-full"
                      whileHover={{ x: 2 }}
                    >
                      Forgot Password?
                    </motion.button>
                  </div>
                  <motion.div
                    initial={{ opacity: 0, y: 10, rotateX: -10 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                    transition={{ delay: 0.3, type: 'spring' }}
                    whileHover={{ scale: 1.02, translateZ: 15 }}
                    whileTap={{ scale: 0.98 }}
                    style={{ perspective: 600 }}
                  >
                    <Button
                      type="submit"
                      className="w-full h-11 text-base font-semibold transition-all duration-300 hover:shadow-[0_0_30px_hsl(var(--primary)/0.4),0_10px_40px_-10px_hsl(var(--primary)/0.3)] relative overflow-hidden group/btn"
                      disabled={loading}
                    >
                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 pointer-events-none" />
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sign In →'}
                    </Button>
                  </motion.div>
                </form>
              </TabsContent>

              <TabsContent value="register">
                <form onSubmit={handleSignup} className="space-y-4 mt-6">
                  <motion.div
                    initial={{ opacity: 0, y: 10, rotateX: -15 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                    transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                    className="group/field"
                    style={{ perspective: 800 }}
                  >
                    <Label className="text-foreground/80 group-focus-within/field:text-primary transition-colors duration-300">Full Name</Label>
                    <motion.div className="mt-1" whileHover={{ translateZ: 10, rotateX: 2, rotateY: -1 }} style={{ transformStyle: 'preserve-3d' }}>
                      <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Rahul Sharma" required className="bg-background/50 border-border/50 focus:border-primary/60 focus:shadow-[0_0_25px_hsl(var(--primary)/0.2),0_8px_32px_-8px_hsl(var(--primary)/0.15)] focus:bg-background/80 hover:border-border/80 hover:bg-background/60 transition-all duration-300 focus:translate-y-[-2px]" />
                    </motion.div>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 10, rotateX: -15 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                    transition={{ delay: 0.15, type: 'spring', stiffness: 200 }}
                    className="group/field"
                    style={{ perspective: 800 }}
                  >
                    <Label className="text-foreground/80 group-focus-within/field:text-primary transition-colors duration-300">College Email</Label>
                    <motion.div className="mt-1" whileHover={{ translateZ: 10, rotateX: 2, rotateY: 1 }} style={{ transformStyle: 'preserve-3d' }}>
                      <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@mnnit.ac.in" required className="bg-background/50 border-border/50 focus:border-primary/60 focus:shadow-[0_0_25px_hsl(var(--primary)/0.2),0_8px_32px_-8px_hsl(var(--primary)/0.15)] focus:bg-background/80 hover:border-border/80 hover:bg-background/60 transition-all duration-300 focus:translate-y-[-2px]" />
                    </motion.div>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 10, rotateX: -15 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                    className="group/field"
                    style={{ perspective: 800 }}
                  >
                    <Label className="text-foreground/80 group-focus-within/field:text-primary transition-colors duration-300">Password</Label>
                    <motion.div className="relative mt-1" whileHover={{ scale: 1.01 }}>
                      <Input type={showRegPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 6 characters" required minLength={6} className="pr-10 bg-background/50 border-border/50 focus:border-primary/60 focus:shadow-[0_0_25px_hsl(var(--primary)/0.2),0_8px_32px_-8px_hsl(var(--primary)/0.15)] focus:bg-background/80 hover:border-border/80 hover:bg-background/60 transition-all duration-300 focus:translate-y-[-2px]" />
                      <motion.button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors z-10"
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        {showRegPassword ? <LockOpen className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                      </motion.button>
                    </motion.div>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 10, rotateX: -15 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                    transition={{ delay: 0.25, type: 'spring', stiffness: 200 }}
                    className="group/field"
                    style={{ perspective: 800 }}
                  >
                    <Label className="text-foreground/80 group-focus-within/field:text-primary transition-colors duration-300">Confirm Password</Label>
                    <motion.div className="relative mt-1" whileHover={{ scale: 1.01 }}>
                      <Input type={showRegConfirmPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter password" required minLength={6} className="pr-10 bg-background/50 border-border/50 focus:border-primary/60 focus:shadow-[0_0_25px_hsl(var(--primary)/0.2),0_8px_32px_-8px_hsl(var(--primary)/0.15)] focus:bg-background/80 hover:border-border/80 hover:bg-background/60 transition-all duration-300 focus:translate-y-[-2px]" />
                      <motion.button
                        type="button"
                        onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors z-10"
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        {showRegConfirmPassword ? <LockOpen className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                      </motion.button>
                    </motion.div>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 10, rotateX: -10 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                    transition={{ delay: 0.3, type: 'spring' }}
                    whileHover={{ scale: 1.02, translateZ: 15 }}
                    whileTap={{ scale: 0.98 }}
                    style={{ perspective: 600 }}
                  >
                    <Button type="submit" className="w-full h-11 text-base font-semibold transition-all duration-300 hover:shadow-[0_0_30px_hsl(var(--primary)/0.4),0_10px_40px_-10px_hsl(var(--primary)/0.3)] relative overflow-hidden group/btn" disabled={loading}>
                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 pointer-events-none" />
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Account →'}
                    </Button>
                  </motion.div>
                </form>
              </TabsContent>
            </Tabs>

            {/* Welcome to InfoHub Community Overlay */}
            <AnimatePresence>
              {showWelcome && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-xl p-4"
                >
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0, rotateY: -30 }}
                    animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                    exit={{ scale: 0.8, opacity: 0, rotateY: 30 }}
                    transition={{ type: 'spring', damping: 15, stiffness: 200 }}
                    className="text-center space-y-6 max-w-sm"
                    style={{ perspective: 1000 }}
                  >
                    <motion.div
                      animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <PartyPopper className="w-20 h-20 text-primary mx-auto drop-shadow-[0_0_25px_hsl(var(--primary)/0.5)]" />
                    </motion.div>
                    <motion.h2
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="text-3xl font-mono font-bold text-primary glow-text"
                    >
                      Welcome to InfoHub Community! 🎉
                    </motion.h2>
                    <motion.p
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="text-muted-foreground"
                    >
                      Your account has been created. Please check your email to confirm, then log in.
                    </motion.p>
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.7 }}
                    >
                      <Button
                        onClick={() => {
                          setShowWelcome(false);
                          setActiveTab('login');
                          setLoginEmail(email);
                          setName('');
                          setEmail('');
                          setPassword('');
                          setConfirmPassword('');
                        }}
                        className="gap-2 h-11 px-8 text-base font-semibold hover:shadow-[0_0_30px_hsl(var(--primary)/0.4)]"
                      >
                        <CheckCircle2 className="w-5 h-5" /> Go to Login
                      </Button>
                    </motion.div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Trust badges replace third-party login */}
            <div className="mt-6 grid grid-cols-3 gap-2 text-[10px] font-mono uppercase tracking-wider text-muted-foreground/70">
              <div className="flex flex-col items-center gap-1 py-2 rounded-lg bg-muted/20 border border-border/30">
                <span className="text-primary">🔒</span>
                <span>Encrypted</span>
              </div>
              <div className="flex flex-col items-center gap-1 py-2 rounded-lg bg-muted/20 border border-border/30">
                <span className="text-primary">🎓</span>
                <span>MNNIT Only</span>
              </div>
              <div className="flex flex-col items-center gap-1 py-2 rounded-lg bg-muted/20 border border-border/30">
                <span className="text-primary">✉️</span>
                <span>Recovery</span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground/60 text-center mt-6 font-mono tracking-wide">By signing in, you agree to our Terms of Service</p>

          </motion.div>

          {/* Forgot Password Overlay */}
          <AnimatePresence>
            {showForgot && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md p-4"
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0, rotateX: -10 }}
                  animate={{ scale: 1, opacity: 1, rotateX: 0 }}
                  exit={{ scale: 0.9, opacity: 0, rotateX: 10 }}
                  className="w-full max-w-sm glass-strong rounded-2xl p-6 shadow-2xl relative overflow-hidden"
                  style={{ perspective: 1000 }}
                >
                  <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-primary/30 rounded-tl-2xl" />
                  <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-primary/30 rounded-br-2xl" />

                  <h2 className="text-lg font-mono font-bold text-foreground mb-1 glow-text">Reset Password</h2>
                  <p className="text-sm text-muted-foreground mb-4">Enter your email and we'll send a reset link.</p>
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <div>
                      <Label htmlFor="forgot-email">Email</Label>
                      <Input
                        id="forgot-email"
                        type="email"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="you@mnnit.ac.in"
                        required
                        className="mt-1 bg-background/50 border-border/50 focus:border-primary/50"
                      />
                    </div>
                    <Button type="submit" className="w-full hover:shadow-[0_0_25px_hsl(var(--primary)/0.3)]" disabled={forgotLoading}>
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
        </motion.div>
      </div>
    </div>
    </>
  );
};

export default Auth;
