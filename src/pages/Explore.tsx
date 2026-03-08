import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Loader2, Users, Radar, Satellite } from 'lucide-react';
import { motion } from 'framer-motion';

const CATEGORIES = ['All', 'Academics', 'Events', 'Tech', 'Sports', 'Cultural'];

const Explore = () => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      const { data } = await (supabase.from as any)('profiles').select('*').limit(20);
      if (data) setUsers(data);
      setLoading(false);
    };
    fetchUsers();
  }, []);

  const filtered = users.filter(u =>
    !search || (u.name || '').toLowerCase().includes(search.toLowerCase()) || (u.handle || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-container">
      {/* ═══ HEADER ═══ */}
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="relative mb-10">
        <div className="absolute -left-4 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-secondary/30 to-transparent" />
        
        <div className="flex items-center gap-4 mb-3">
          <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center border border-secondary/20 relative">
            <Radar className="w-6 h-6 text-secondary" />
            <div className="absolute inset-[-4px] rounded-lg border border-secondary/10 animate-ping opacity-20" />
          </div>
          <div>
            <span className="section-title mb-0">Scanner Active</span>
            <h1 className="text-3xl md:text-4xl font-display font-bold tracking-wider">
              <span className="text-foreground">DEEP</span>{' '}
              <span className="gradient-text">SCAN</span>
            </h1>
          </div>
        </div>
        <div className="cyber-line mt-4" />
      </motion.div>

      {/* ═══ SEARCH BAR ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="relative mb-8 max-w-xl"
      >
        <div className="absolute -inset-px rounded-lg bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 opacity-0 hover:opacity-100 transition-opacity duration-500 blur-sm" />
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Scan for users, tags, signals..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-11 h-12 rounded-lg bg-card/60 border-border/30 backdrop-blur-sm focus:border-primary/40 focus:shadow-[0_0_30px_hsl(var(--neon-cyan)/0.1)] transition-all font-mono text-sm"
          />
        </div>
      </motion.div>

      {/* ═══ CATEGORIES ═══ */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex gap-2 flex-wrap mb-8"
      >
        {CATEGORIES.map((c, i) => (
          <motion.button
            key={c}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 + i * 0.05 }}
            whileHover={{ scale: 1.08, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCategory(c)}
            className={`px-4 py-2 rounded-md text-[11px] font-display tracking-wider uppercase transition-all ${
              category === c
                ? 'bg-primary text-primary-foreground shadow-[0_0_20px_hsl(var(--neon-cyan)/0.3)] border border-primary/50'
                : 'bg-card/50 text-muted-foreground hover:text-foreground border border-border/30 hover:border-primary/20'
            }`}
          >
            {c}
          </motion.button>
        ))}
      </motion.div>

      {/* ═══ USERS GRID ═══ */}
      <div>
        <div className="flex items-center gap-2 mb-5">
          <Satellite className="w-4 h-4 text-muted-foreground" />
          <span className="section-title mb-0">Detected Signals</span>
          <span className="text-[10px] font-mono text-primary/50 ml-2">[{filtered.length}]</span>
        </div>
        {loading ? (
          <div className="flex flex-col items-center py-16 gap-3">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="w-12 h-12 rounded-full border-2 border-primary/20 border-t-primary" />
            <span className="text-xs font-display text-muted-foreground tracking-widest">Scanning...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((u, i) => (
              <motion.div
                key={u.id}
                initial={{ opacity: 0, y: 25, rotateY: -5 }}
                animate={{ opacity: 1, y: 0, rotateY: 0 }}
                transition={{ delay: i * 0.06, duration: 0.5 }}
                className="holo-card p-5 flex items-center gap-4 cursor-pointer group"
                style={{ perspective: '800px' }}
              >
                <div className="relative">
                  <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-lg border border-primary/15 overflow-hidden">
                    {u.avatar_url ? (
                      <img src={u.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-display">{(u.name || 'U')[0].toUpperCase()}</span>
                    )}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-primary/60 border-2 border-background"
                    style={{ boxShadow: '0 0 6px hsl(var(--neon-cyan) / 0.5)' }} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm truncate group-hover:text-primary transition-colors">{u.name || 'User'}</p>
                  <p className="text-[10px] text-muted-foreground truncate font-mono">@{u.handle}</p>
                  {u.branch && (
                    <Badge variant="secondary" className="text-[9px] mt-2 rounded-md bg-secondary/8 text-secondary/80 border-secondary/15 font-display tracking-wider">
                      {u.branch}
                    </Badge>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Explore;
