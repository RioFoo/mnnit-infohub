import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSearchParams, Navigate, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Loader2, Mail, UserPlus, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const BRANCHES = ['CSE', 'ECE', 'EE', 'ME', 'CE', 'BioTech', 'Chem', 'Prod', 'GIS'];
const SECTIONS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q'];


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
  const { session, signIn, signUp, signInWithGoogle, resetPassword } = useAuth();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showIntro, setShowIntro] = useState(false);
  const [introStep, setIntroStep] = useState(0);
  const [userName, setUserName] = useState('');
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') === 'register' ? 'register' : 'login');
  const [error, setError] = useState<string | null>(null);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  

  // Signup state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [branch, setBranch] = useState('CSE');
  const [section, setSection] = useState('A');

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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await signIn(loginEmail, loginPassword);
    if (error) {
      setError(getErrorMessage(error.message));
      toast.error(getErrorMessage(error.message));
    } else {
      runIntro(loginEmail.split('@')[0]);
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
    const { error } = await signUp(email, password, { name, branch, section });
    if (error) {
      setError(getErrorMessage(error.message));
      toast.error(getErrorMessage(error.message));
    } else {
      toast.success('Account created! Check your email to confirm.');
      runIntro(name);
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError(null);
    const { error } = await signInWithGoogle();
    if (error) {
      setError(`Google Sign-In failed: ${error.message}`);
      toast.error(`Google Sign-In failed: ${error.message}`);
      setGoogleLoading(false);
    }
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
          {/* Glowing backdrop */}
          <div className="absolute inset-0 -m-8 rounded-3xl bg-primary/5 blur-3xl" />
          
          <motion.div
            initial={{ opacity: 0, y: 30, rotateX: -15 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: 1, type: 'spring' }}
          >
            <div className="relative inline-block mb-8">
              <Zap className="w-24 h-24 text-primary drop-shadow-[0_0_30px_hsl(var(--primary)/0.5)]" />
              <motion.div
                className="absolute inset-0 rounded-full"
                animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0, 0.3] }}
                transition={{ duration: 3, repeat: Infinity }}
                style={{ background: 'radial-gradient(circle, hsl(var(--primary) / 0.3), transparent 70%)' }}
              />
            </div>
            <h1 className="text-6xl font-mono font-bold text-primary glow-text mb-4 tracking-tight">
              MNNIT
              <br />
              <span className="text-5xl bg-clip-text text-transparent" style={{ backgroundImage: 'var(--gradient-primary)' }}>
                InfoHub
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-md mx-auto mt-4">
              Your campus. <span className="text-primary font-semibold">Supercharged.</span>
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
      <div className="w-full lg:w-1/2 flex items-start md:items-center justify-center p-4 sm:p-6 md:p-8 relative overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, x: 40, rotateY: -5 }}
          animate={{ opacity: 1, x: 0, rotateY: 0 }}
          transition={{ duration: 0.8, type: 'spring' }}
          className="w-full max-w-md"
          style={{ perspective: 1000 }}
        >
          <motion.div
            className="glass-strong rounded-2xl p-5 sm:p-8 shadow-2xl relative overflow-hidden my-6 w-full group"
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

            {/* Google Login — enhanced hover */}
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="outline"
                className="w-full mb-6 h-12 text-base gap-3 border-border/50 hover:bg-primary/5 hover:border-primary/40 transition-all duration-400 hover:shadow-[0_0_25px_hsl(var(--primary)/0.15)] group/google"
                onClick={handleGoogleLogin}
                disabled={loading || googleLoading}
              >
                {googleLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Redirecting to Google...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 group-hover/google:scale-110 transition-transform duration-300" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Continue with Google
                  </>
                )}
              </Button>
            </motion.div>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/30" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card/80 backdrop-blur-sm px-3 text-muted-foreground font-mono tracking-wider">or continue with email</span>
              </div>
            </div>

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
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="group/field">
                    <Label htmlFor="login-email" className="text-foreground/80 group-focus-within/field:text-primary transition-colors duration-300">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="you@mnnit.ac.in"
                      required
                      className="mt-1 bg-background/50 border-border/50 focus:border-primary/60 transition-all duration-300 focus:shadow-[0_0_20px_hsl(var(--primary)/0.15)] focus:bg-background/80 hover:border-border/80 hover:bg-background/60"
                    />
                  </motion.div>
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="group/field">
                    <Label htmlFor="login-password" className="text-foreground/80 group-focus-within/field:text-primary transition-colors duration-300">Password</Label>
                    <div className="relative mt-1">
                      <Input
                        id="login-password"
                        type={showPassword ? 'text' : 'password'}
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="pr-10 bg-background/50 border-border/50 focus:border-primary/60 transition-all duration-300 focus:shadow-[0_0_20px_hsl(var(--primary)/0.15)] focus:bg-background/80 hover:border-border/80 hover:bg-background/60"
                      />
                      <motion.button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </motion.button>
                    </div>
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
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      type="submit"
                      className="w-full h-11 text-base font-semibold transition-all duration-300 hover:shadow-[0_0_30px_hsl(var(--primary)/0.4)] relative overflow-hidden group/btn"
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
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="group/field">
                    <Label className="text-foreground/80 group-focus-within/field:text-primary transition-colors duration-300">Full Name</Label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Rahul Sharma" required className="mt-1 bg-background/50 border-border/50 focus:border-primary/60 focus:shadow-[0_0_20px_hsl(var(--primary)/0.15)] focus:bg-background/80 hover:border-border/80 hover:bg-background/60 transition-all duration-300" />
                  </motion.div>
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="group/field">
                    <Label className="text-foreground/80 group-focus-within/field:text-primary transition-colors duration-300">College Email</Label>
                    <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@mnnit.ac.in" required className="mt-1 bg-background/50 border-border/50 focus:border-primary/60 focus:shadow-[0_0_20px_hsl(var(--primary)/0.15)] focus:bg-background/80 hover:border-border/80 hover:bg-background/60 transition-all duration-300" />
                  </motion.div>
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="group/field">
                      <Label className="text-foreground/80 group-focus-within/field:text-primary transition-colors duration-300">Branch</Label>
                      <Select value={branch} onValueChange={setBranch}>
                        <SelectTrigger className="mt-1 bg-background/50 border-border/50 hover:border-border/80 hover:bg-background/60 transition-all duration-300"><SelectValue placeholder="Branch" /></SelectTrigger>
                        <SelectContent>
                          {BRANCHES.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="group/field">
                      <Label className="text-foreground/80 group-focus-within/field:text-primary transition-colors duration-300">Section</Label>
                      <Select value={section} onValueChange={setSection}>
                        <SelectTrigger className="mt-1 bg-background/50 border-border/50 hover:border-border/80 hover:bg-background/60 transition-all duration-300"><SelectValue placeholder="Section" /></SelectTrigger>
                        <SelectContent>
                          {SECTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </motion.div>
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="group/field">
                    <Label className="text-foreground/80 group-focus-within/field:text-primary transition-colors duration-300">Password</Label>
                    <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 6 characters" required minLength={6} className="mt-1 bg-background/50 border-border/50 focus:border-primary/60 focus:shadow-[0_0_20px_hsl(var(--primary)/0.15)] focus:bg-background/80 hover:border-border/80 hover:bg-background/60 transition-all duration-300" />
                  </motion.div>
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="group/field">
                    <Label className="text-foreground/80 group-focus-within/field:text-primary transition-colors duration-300">Confirm Password</Label>
                    <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter password" required minLength={6} className="mt-1 bg-background/50 border-border/50 focus:border-primary/60 focus:shadow-[0_0_20px_hsl(var(--primary)/0.15)] focus:bg-background/80 hover:border-border/80 hover:bg-background/60 transition-all duration-300" />
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button type="submit" className="w-full h-11 text-base font-semibold transition-all duration-300 hover:shadow-[0_0_30px_hsl(var(--primary)/0.4)] relative overflow-hidden group/btn" disabled={loading}>
                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 pointer-events-none" />
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Account →'}
                    </Button>
                  </motion.div>
                </form>
              </TabsContent>
            </Tabs>

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
  );
};

export default Auth;
