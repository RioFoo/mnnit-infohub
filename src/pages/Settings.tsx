import { useTheme, THEMES } from '@/contexts/ThemeContext';
import { motion } from 'framer-motion';
import { Palette, Info, Settings as SettingsIcon, Check } from 'lucide-react';

const Settings = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="page-container max-w-2xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <SettingsIcon className="w-4 h-4 text-primary" />
          <span className="section-title mb-0">Preferences</span>
        </div>
        <h1 className="text-3xl font-mono font-bold">
          Your <span className="gradient-text">Settings</span>
        </h1>
      </motion.div>

      {/* Themes */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card-3d p-6 mb-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Palette className="w-4 h-4 text-primary" />
          </div>
          <span className="font-mono font-semibold text-sm">Theme</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {THEMES.map(t => (
            <motion.button
              key={t.key}
              whileHover={{ y: -3, scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setTheme(t.key)}
              className={`relative p-4 rounded-xl border-2 transition-all text-left ${
                theme === t.key
                  ? 'border-primary shadow-[0_0_20px_hsl(var(--primary)/0.2)]'
                  : 'border-border/50 hover:border-primary/30'
              }`}
            >
              {theme === t.key && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center"
                >
                  <Check className="w-3 h-3 text-primary-foreground" />
                </motion.div>
              )}
              <div className="w-8 h-8 rounded-lg mb-3" style={{ background: t.primaryColor }} />
              <p className="text-sm font-semibold">{t.name}</p>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* About */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="card-3d p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Info className="w-4 h-4 text-primary" />
          </div>
          <span className="font-mono font-semibold text-sm">About InfoHub</span>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          MNNIT InfoHub v2.0 — Your next-generation campus operating system. Part social platform, part academic portal, designed for MNNIT Allahabad.
        </p>
        <div className="glow-line mt-4 mb-3" />
        <p className="text-[10px] text-muted-foreground/60 font-mono">Built with React + Supabase + Lovable AI</p>
      </motion.div>
    </div>
  );
};

export default Settings;
