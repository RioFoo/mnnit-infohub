import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const CATEGORIES = ['All', 'Academics', 'Events', 'Tech', 'Sports', 'Cultural'];

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05, delayChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } }
};

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
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="mb-8"
      >
        <h1 className="text-2xl md:text-3xl page-header-bio gradient-text">EXPLORE</h1>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="relative mb-6 max-w-xl"
      >
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
        <Input
          placeholder="Search people..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-10 h-11 rounded-xl bg-muted/15 border-border/[0.08] text-sm font-mono"
        />
      </motion.div>

      {/* Categories — scrollable pills */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-hide"
      >
        {CATEGORIES.map(c => (
          <motion.button
            key={c}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCategory(c)}
            className={`px-4 py-2 rounded-full text-xs font-mono font-medium transition-all duration-200 whitespace-nowrap ${
              category === c
                ? 'bg-primary text-primary-foreground shadow-[0_0_16px_hsl(var(--primary)/0.3)]'
                : 'bg-muted/15 text-muted-foreground hover:text-foreground hover:bg-muted/25 border border-border/[0.08]'
            }`}
          >
            {c}
          </motion.button>
        ))}
      </motion.div>

      {/* Users Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-primary/40 animate-spin" />
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
        >
          {filtered.map((u) => (
            <motion.div
              key={u.id}
              variants={itemVariants}
              className="card-bio p-4 flex items-center gap-3.5 cursor-pointer group"
            >
              <div className="avatar-orbital shrink-0">
                {u.avatar_url ? (
                  <img src={u.avatar_url} alt="" className="w-12 h-12 rounded-full object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-base">
                    {(u.name || 'U')[0].toUpperCase()}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-sm truncate group-hover:text-primary transition-colors">{u.name || 'User'}</p>
                <p className="text-[11px] font-mono text-muted-foreground truncate">@{u.handle}</p>
                {u.branch && (
                  <span className="tag-pill text-[9px] mt-1.5 inline-block">{u.branch}</span>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default Explore;
