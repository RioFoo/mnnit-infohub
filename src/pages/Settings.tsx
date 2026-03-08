import { useTheme, THEMES } from '@/contexts/ThemeContext';
import { motion } from 'framer-motion';
import { Palette, Info, Check } from 'lucide-react';

const Settings = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="page-container max-w-2xl">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <h1 className="text-2xl page-header gradient-text">Settings</h1>
      </motion.div>

      {/* Themes */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="float-card p-6 mb-6"
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-lg bg-primary/8 flex items-center justify-center">
            <Palette className="w-4 h-4 text-primary" />
          </div>
          <span className="text-sm font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Theme</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {THEMES.map((t, i) => (
            <motion.button
              key={t.key}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 + i * 0.03 }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setTheme(t.key)}
              className={`relative p-4 rounded-xl border transition-all text-left ${
                theme === t.key
                  ? 'border-primary/30 bg-primary/5 shadow-sm'
                  : 'border-border/20 hover:border-primary/15 hover:bg-muted/20'
              }`}
            >
              {theme === t.key && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                  className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center"
                >
                  <Check className="w-3 h-3 text-primary-foreground" />
                </motion.div>
              )}
              <div className="w-7 h-7 rounded-lg mb-3 border border-border/10" style={{ background: t.primaryColor }} />
              <p className="text-xs font-medium">{t.name}</p>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* About */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="float-card p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-primary/8 flex items-center justify-center">
            <Info className="w-4 h-4 text-primary" />
          </div>
          <span className="text-sm font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>About</span>
        </div>
        <p className="text-sm text-muted-foreground">MNNIT InfoHub v2.0</p>
        <div className="divider-gradient mt-5 mb-4" />
        <div className="flex items-center gap-3 text-xs text-muted-foreground/50">
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
