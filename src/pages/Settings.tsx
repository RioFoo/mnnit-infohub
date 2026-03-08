import { useTheme, THEMES, type ThemeKey } from '@/contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Palette, Info } from 'lucide-react';

const Settings = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-mono font-bold text-primary">Settings</h1>

      {/* Theme Selector */}
      <Card className="glass border-border">
        <CardHeader>
          <CardTitle className="text-sm font-mono flex items-center gap-2">
            <Palette className="w-4 h-4" /> Theme
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {THEMES.map(t => (
              <motion.button
                key={t.key}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setTheme(t.key)}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  theme === t.key ? 'border-primary glow' : 'border-border hover:border-primary/30'
                }`}
              >
                <div className="w-6 h-6 rounded-full mb-2" style={{ background: t.primaryColor }} />
                <p className="text-sm font-medium">{t.name}</p>
              </motion.button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* About */}
      <Card className="glass border-border">
        <CardHeader>
          <CardTitle className="text-sm font-mono flex items-center gap-2">
            <Info className="w-4 h-4" /> About InfoHub
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            MNNIT InfoHub v2.0 — Your next-generation college social platform built for MNNIT Allahabad students.
            Part Twitter, part Notion, part academic portal.
          </p>
          <p className="text-xs text-muted-foreground mt-2">Built with React + Supabase + Lovable AI</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
