import { useTheme, THEMES } from '@/contexts/ThemeContext';
import { motion } from 'framer-motion';
import { Palette, Info, Check } from 'lucide-react';

const Settings = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="page-container max-w-2xl">
      <motion.div
        initial={{ opacity: 0, y: 20, rotateX: -5 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 200 }}
        className="mb-8"
        style={{ perspective: '800px' }}
      >
        <h1 className="text-3xl page-header-3d">SETTINGS</h1>
      </motion.div>

      {/* ═══ THEMES ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 15, rotateY: -3 }}
        animate={{ opacity: 1, y: 0, rotateY: 0 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 250 }}
        className="card-3d-pro p-6 mb-6"
        style={{ perspective: '800px' }}
      >
        <div className="flex items-center gap-3 mb-5">
          <motion.div whileHover={{ rotateZ: 20, scale: 1.1 }} className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/15">
            <Palette className="w-4 h-4 text-primary" />
          </motion.div>
          <span className="font-display font-bold text-xs tracking-widest uppercase nav-text-3d">Theme</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {THEMES.map((t, i) => (
            <motion.button
              key={t.key}
              initial={{ opacity: 0, scale: 0.9, rotateY: -10 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ delay: 0.15 + i * 0.05, type: 'spring', stiffness: 250 }}
              whileHover={{ y: -6, rotateY: 5, scale: 1.04 }}
              whileTap={{ scale: 0.95, y: 2 }}
              onClick={() => setTheme(t.key)}
              className={`relative p-4 rounded-xl border transition-all text-left overflow-hidden ${
                theme === t.key
                  ? 'border-primary shadow-[0_4px_0_hsl(var(--primary)/0.3),0_0_25px_hsl(var(--neon-cyan)/0.2)]'
                  : 'border-border/30 hover:border-primary/20'
              }`}
              style={{ perspective: '500px', transformStyle: 'preserve-3d' }}
            >
              {theme === t.key && (
                <motion.div
                  initial={{ scale: 0, rotateZ: -180 }}
                  animate={{ scale: 1, rotateZ: 0 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                  className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center"
                  style={{ boxShadow: '0 0 10px hsl(var(--neon-cyan) / 0.5)' }}
                >
                  <Check className="w-3 h-3 text-primary-foreground" />
                </motion.div>
              )}
              <div className="w-8 h-8 rounded-lg mb-3 border border-white/10" style={{ background: t.primaryColor }} />
              <p className="text-xs font-semibold font-display tracking-wider">{t.name}</p>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* ═══ ABOUT ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 15, rotateY: 3 }}
        animate={{ opacity: 1, y: 0, rotateY: 0 }}
        transition={{ delay: 0.15, type: 'spring', stiffness: 250 }}
        className="card-3d-pro p-6"
        style={{ perspective: '800px' }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/15">
            <Info className="w-4 h-4 text-primary" />
          </div>
          <span className="font-display font-bold text-xs tracking-widest uppercase nav-text-3d">About</span>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          MNNIT InfoHub v2.0
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
