import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Loader2, Mail, UserPlus } from 'lucide-react';
import { toast } from 'sonner';

const BRANCHES = ['CSE', 'ECE', 'EE', 'ME', 'CE', 'BioTech', 'Chem', 'Prod', 'GIS'];
const SECTIONS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q'];

const DEMO_ACCOUNTS = [
  { label: '👨‍💻 Student', email: 'demo.student@mnnit.ac.in', password: 'Demo@1234' },
  { label: '🎓 Senior', email: 'senior.dev@mnnit.ac.in', password: 'Demo@1234' },
  { label: '⚙️ Admin', email: 'admin.infohub@mnnit.ac.in', password: 'Demo@1234' },
];

const Auth = () => {
  const { session, signIn, signUp, signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showIntro, setShowIntro] = useState(false);
  const [introStep, setIntroStep] = useState(0);
  const [userName, setUserName] = useState('');

  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [branch, setBranch] = useState('');
  const [section, setSection] = useState('');

  if (session && !showIntro) return <Navigate to="/" replace />;

  const runIntro = (displayName: string) => {
    setUserName(displayName);
    setShowIntro(true);
    setIntroStep(0);
    setTimeout(() => setIntroStep(1), 1500);
    setTimeout(() => setIntroStep(2), 3000);
    setTimeout(() => setShowIntro(false), 4000);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(loginEmail, loginPassword);
    if (error) toast.error(error.message);
    else runIntro(loginEmail.split('@')[0]);
    setLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    const { error } = await signUp(email, password, { name, branch, section });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Account created! Check your email to confirm.');
      runIntro(name);
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    const { error } = await signInWithGoogle();
    if (error) toast.error(error.message);
  };

  const handleDemoLogin = async (demoEmail: string, demoPassword: string) => {
    setLoading(true);
    const { error } = await signIn(demoEmail, demoPassword);
    if (error) toast.error(error.message);
    else runIntro(demoEmail.split('@')[0]);
    setLoading(false);
  };

  if (showIntro) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <AnimatePresence mode="wait">
          {introStep === 0 && (
            <motion.div key="s0" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="text-center">
              <Zap className="w-16 h-16 text-primary mx-auto mb-4" />
              <h1 className="text-3xl font-mono font-bold text-primary">Welcome back, {userName} 👋</h1>
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
    <div className="min-h-screen flex">
      {/* Left branding */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center relative overflow-hidden bg-background">
        <div className="absolute inset-0 opacity-20" style={{ background: 'var(--gradient-primary)' }} />
        <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="relative z-10 text-center p-12">
          <Zap className="w-20 h-20 text-primary mx-auto mb-6" />
          <h1 className="text-5xl font-mono font-bold text-primary glow-text mb-4">MNNIT InfoHub</h1>
          <p className="text-xl text-muted-foreground max-w-md">Your campus. Supercharged.</p>
        </motion.div>
      </div>

      {/* Right form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <Zap className="w-12 h-12 text-primary mx-auto mb-2" />
            <h1 className="text-2xl font-mono font-bold text-primary">MNNIT InfoHub</h1>
          </div>

          {/* Google Login Button */}
          <Button
            variant="outline"
            className="w-full mb-6 h-12 text-base gap-3 border-border hover:bg-muted/50"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </Button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center text-xs"><span className="bg-background px-2 text-muted-foreground">or continue with email</span></div>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-muted">
              <TabsTrigger value="login" className="gap-1"><Mail className="w-3 h-3" /> Login</TabsTrigger>
              <TabsTrigger value="register" className="gap-1"><UserPlus className="w-3 h-3" /> Register</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4 mt-6">
                <div>
                  <Label htmlFor="login-email">Email</Label>
                  <Input id="login-email" type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder="you@mnnit.ac.in" required className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="login-password">Password</Label>
                  <Input id="login-password" type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} placeholder="••••••••" required className="mt-1" />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sign In'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleSignup} className="space-y-4 mt-6">
                <div>
                  <Label>Full Name</Label>
                  <Input value={name} onChange={e => setName(e.target.value)} placeholder="Rahul Sharma" required className="mt-1" />
                </div>
                <div>
                  <Label>College Email</Label>
                  <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@mnnit.ac.in" required className="mt-1" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Branch</Label>
                    <Select value={branch} onValueChange={setBranch}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder="Branch" /></SelectTrigger>
                      <SelectContent>
                        {BRANCHES.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Section</Label>
                    <Select value={section} onValueChange={setSection}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder="Section" /></SelectTrigger>
                      <SelectContent>
                        {SECTIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Password</Label>
                  <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 6 characters" required minLength={6} className="mt-1" />
                </div>
                <div>
                  <Label>Confirm Password</Label>
                  <Input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Re-enter password" required minLength={6} className="mt-1" />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Account'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          {/* Demo accounts */}
          <div className="mt-8">
            <div className="relative mb-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
              <div className="relative flex justify-center text-xs"><span className="bg-background px-2 text-muted-foreground">Or try a demo account</span></div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {DEMO_ACCOUNTS.map(demo => (
                <Button
                  key={demo.email}
                  variant="outline"
                  size="sm"
                  className="text-xs h-9"
                  disabled={loading}
                  onClick={() => handleDemoLogin(demo.email, demo.password)}
                >
                  {demo.label}
                </Button>
              ))}
            </div>
          </div>

          <p className="text-xs text-muted-foreground text-center mt-6">By signing in, you agree to our Terms of Service</p>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
