import { useTheme, THEMES } from '@/contexts/ThemeContext';
import { motion } from 'framer-motion';
import { Palette, Info, Settings as SettingsIcon, Check, Monitor } from 'lucide-react';

const Settings = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="page-container max-w-2xl">
      {/* ═══ HEADER ═══ */}
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="relative mb-10">
        <div className="absolute -left-4 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-primary/30 to-transparent" />
        
        <div className="flex items-center gap-4 mb-3">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
            <Monitor className="w-6 h-6 text-primary" />
          </div>
          <div>
            <span className="section-title mb-0">System Config</span>
            <h1 className="text-3xl font-display font-bold tracking-wider">
              <span className="text-foreground">CONTROL</span>{' '}
              <span className="gradient-text">PANEL</span>
            </h1>
          </div>
        </div>
        <div className="cyber-line mt-4" />
      </motion.div>

      {/* ═══ THEMES ═══ */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="holo-card p-6 mb-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center border border-primary/15">
            <Palette className="w-4 h-4 text-primary" />
          </div>
          <span className="font-display font-bold text-xs tracking-widest uppercase">Color Matrix</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {THEMES.map((t, i) => (
            <motion.button
              key={t.key}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 + i * 0.05 }}
              whileHover={{ y: -4, scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setTheme(t.key)}
              className={`relative p-4 rounded-lg border transition-all text-left overflow-hidden ${
                theme === t.key
                  ? 'border-primary shadow-[0_0_25px_hsl(var(--neon-cyan)/0.2)]'
                  : 'border-border/30 hover:border-primary/20'
              }`}
            >
              {theme === t.key && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center"
                  style={{ boxShadow: '0 0 10px hsl(var(--neon-cyan) / 0.5)' }}
                >
                  <Check className="w-3 h-3 text-primary-foreground" />
                </motion.div>
              )}
              <div className="w-8 h-8 rounded-md mb-3 border border-white/10" style={{ background: t.primaryColor }} />
              <p className="text-xs font-semibold font-display tracking-wider">{t.name}</p>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* ═══ ABOUT ═══ */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="holo-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center border border-primary/15">
            <Info className="w-4 h-4 text-primary" />
          </div>
          <span className="font-display font-bold text-xs tracking-widest uppercase">System Info</span>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          MNNIT InfoHub v2.0 — Next-generation campus operating system. Built for the future of academic coordination.
        </p>
        <div className="cyber-line mt-5 mb-4" />
        <div className="flex items-center gap-4 text-[9px] text-muted-foreground/40 font-mono uppercase tracking-widest">
          <span>React</span>
          <span>·</span>
          <span>Supabase</span>
          <span>·</span>
          <span>Lovable AI</span>
        </div>
      </motion.div>
    </div>
  );
};

export default Settings;
