import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Loader2 } from 'lucide-react';
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
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <h1 className="text-2xl md:text-3xl page-header gradient-text">Explore</h1>
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
          className="pl-10 h-11 rounded-xl bg-muted/20 border-border/20 focus:border-primary/30 focus:ring-1 focus:ring-primary/10 transition-all text-sm"
        />
      </motion.div>

      {/* Categories */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex gap-2 flex-wrap mb-8"
      >
        {CATEGORIES.map(c => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`px-4 py-2 rounded-xl text-xs font-medium transition-all duration-200 ${
              category === c
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-muted/30 text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-border/20'
            }`}
          >
            {c}
          </button>
        ))}
      </motion.div>

      {/* Users Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-primary/40 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((u, i) => (
            <motion.div
              key={u.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03, duration: 0.3 }}
              className="float-card p-4 flex items-center gap-3.5 cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/8 flex items-center justify-center text-primary font-semibold text-base border border-border/10 overflow-hidden shrink-0">
                {u.avatar_url ? (
                  <img src={u.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span>{(u.name || 'U')[0].toUpperCase()}</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">{u.name || 'User'}</p>
                <p className="text-xs text-muted-foreground truncate">@{u.handle}</p>
                {u.branch && (
                  <Badge variant="secondary" className="text-[10px] mt-1.5 rounded-md bg-muted/40 text-muted-foreground border-border/20 font-medium">
                    {u.branch}
                  </Badge>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Explore;
