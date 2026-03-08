import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Loader2, Users, Sparkles } from 'lucide-react';
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
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="section-title mb-0">Discover</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-mono font-bold">
          Explore <span className="gradient-text">Campus</span>
        </h1>
      </motion.div>

      {/* Search bar with glow */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative mb-6 max-w-xl"
      >
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search users, posts, tags..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-11 h-12 rounded-xl bg-muted/30 border-border/50 focus:border-primary/50 focus:shadow-[0_0_20px_hsl(var(--primary)/0.1)] transition-all"
        />
      </motion.div>

      {/* Categories */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="flex gap-2 flex-wrap mb-8"
      >
        {CATEGORIES.map((c, i) => (
          <motion.button
            key={c}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCategory(c)}
            className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
              category === c
                ? 'bg-primary text-primary-foreground shadow-[0_0_15px_hsl(var(--primary)/0.3)]'
                : 'bg-muted/40 text-muted-foreground hover:bg-muted/60 border border-border/50'
            }`}
          >
            {c}
          </motion.button>
        ))}
      </motion.div>

      {/* Users grid */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-4 h-4 text-muted-foreground" />
          <span className="section-title mb-0">Students</span>
        </div>
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((u, i) => (
              <motion.div
                key={u.id}
                initial={{ opacity: 0, y: 20, rotateX: -5 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
                className="card-3d p-5 flex items-center gap-4 cursor-pointer"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center text-primary font-bold text-lg ring-2 ring-primary/10">
                  {u.avatar_url ? (
                    <img src={u.avatar_url} alt="" className="w-full h-full rounded-xl object-cover" />
                  ) : (
                    (u.name || 'U')[0].toUpperCase()
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm truncate">{u.name || 'User'}</p>
                  <p className="text-xs text-muted-foreground truncate">@{u.handle}</p>
                  {u.branch && (
                    <Badge variant="secondary" className="text-[10px] mt-1.5 rounded-lg bg-secondary/10 text-secondary border-secondary/20">
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
