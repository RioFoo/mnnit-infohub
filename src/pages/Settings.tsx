import { useState, useEffect } from 'react';
import { useTheme, THEMES } from '@/contexts/ThemeContext';
import { motion } from 'framer-motion';
import { PageHeader } from '@/components/PageHeader';
import { Palette, Info, Check, Eye, Users, GitBranch } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type Visibility = 'branch' | 'followers' | 'both';

const VISIBILITY_OPTIONS: { value: Visibility; label: string; icon: typeof Eye; desc: string }[] = [
  { value: 'branch', label: 'Branch', icon: GitBranch, desc: 'Same branch & semester' },
  { value: 'followers', label: 'Followers', icon: Users, desc: 'Your followers only' },
  { value: 'both', label: 'Both', icon: Eye, desc: 'Branch + followers' },
];

const Settings = () => {
  const { theme, setTheme } = useTheme();
  const { user, profile, refreshProfile } = useAuth();
  const [defaultVisibility, setDefaultVisibility] = useState<Visibility>('branch');

  useEffect(() => {
    if (profile && (profile as any).default_resource_visibility) {
      setDefaultVisibility((profile as any).default_resource_visibility as Visibility);
    }
  }, [profile]);

  const handleVisibilityChange = async (v: Visibility) => {
    setDefaultVisibility(v);
    if (!user) return;
    const { error } = await (supabase.from as any)('profiles').update({ default_resource_visibility: v }).eq('id', user.id);
    if (error) toast.error('Failed to save');
    else { toast.success('Default visibility updated'); await refreshProfile(); }
  };

  return (
    <div className="page-container max-w-2xl">
      <PageHeader title="SETTINGS" />

      {/* Themes */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="card-bio p-6 mb-6"
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-lg bg-primary/[0.06] flex items-center justify-center">
            <Palette className="w-4 h-4 text-primary" />
          </div>
          <span className="text-sm font-display font-bold">Theme</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {THEMES.map((t, i) => (
            <motion.button
              key={t.key}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 + i * 0.03 }}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setTheme(t.key)}
              className={`relative p-4 rounded-xl border transition-all text-left ${
                theme === t.key
                  ? 'border-primary/20 bg-primary/[0.04] glow-border'
                  : 'border-border/[0.06] hover:border-primary/10 hover:bg-muted/10'
              }`}
            >
              {theme === t.key && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                  className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center shadow-[0_0_8px_hsl(var(--primary)/0.5)]"
                >
                  <Check className="w-3 h-3 text-primary-foreground" />
                </motion.div>
              )}
              <div className="w-7 h-7 rounded-lg mb-3 border border-border/[0.06]" style={{ background: t.primaryColor }} />
              <p className="text-xs font-semibold">{t.name}</p>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Library Visibility */}
      {user && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="card-bio p-6 mb-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-primary/[0.06] flex items-center justify-center">
              <Eye className="w-4 h-4 text-primary" />
            </div>
            <div>
              <span className="text-sm font-display font-bold">Library Visibility</span>
              <p className="text-[10px] font-mono text-muted-foreground/50 mt-0.5">Default visibility for new uploads</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2.5 mt-4">
            {VISIBILITY_OPTIONS.map((opt, i) => (
              <motion.button
                key={opt.value}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleVisibilityChange(opt.value)}
                className={cn(
                  'relative flex flex-col items-center gap-2 p-4 rounded-xl border transition-all text-center',
                  defaultVisibility === opt.value
                    ? 'border-primary/20 bg-primary/[0.04] glow-border'
                    : 'border-border/[0.06] hover:border-primary/10 hover:bg-muted/10'
                )}
              >
                {defaultVisibility === opt.value && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400 }}
                    className="absolute top-2 right-2 w-4 h-4 rounded-full bg-primary flex items-center justify-center shadow-[0_0_8px_hsl(var(--primary)/0.5)]"
                  >
                    <Check className="w-2.5 h-2.5 text-primary-foreground" />
                  </motion.div>
                )}
                <opt.icon className="w-5 h-5 text-primary/60" />
                <div>
                  <p className="text-xs font-semibold">{opt.label}</p>
                  <p className="text-[9px] font-mono text-muted-foreground/40 mt-0.5">{opt.desc}</p>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* About */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card-bio p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-primary/[0.06] flex items-center justify-center">
            <Info className="w-4 h-4 text-primary" />
          </div>
          <span className="text-sm font-display font-bold">About</span>
        </div>
        <p className="text-sm font-mono text-muted-foreground">MNNIT InfoHub v3.0 — Bioluminescent Cinema</p>
        <div className="divider-glow mt-5 mb-4" />
        <div className="flex items-center gap-3 text-xs font-mono text-muted-foreground/40">
          <span>React</span>
          <span>·</span>
          <span>Supabase</span>
          <span>·</span>
          <span>Lovable</span>
        </div>
      </motion.div>
    </div>
  );
};

export default Settings;
