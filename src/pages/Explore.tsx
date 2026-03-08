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
      const { data } = await supabase.from('profiles').select('*').limit(20);
      if (data) setUsers(data);
      setLoading(false);
    };
    fetchUsers();
  }, []);

  const filtered = users.filter(u =>
    !search || (u.name || '').toLowerCase().includes(search.toLowerCase()) || (u.handle || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-mono font-bold text-primary">Explore</h1>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search users, posts, tags..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map(c => (
          <Badge
            key={c}
            variant={category === c ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setCategory(c)}
          >
            {c}
          </Badge>
        ))}
      </div>

      <div>
        <h2 className="text-lg font-mono font-semibold mb-3">Discover Students</h2>
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map((u, i) => (
              <motion.div
                key={u.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass rounded-xl p-4 flex items-center gap-3 hover:border-primary/30 transition-all"
              >
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                  {(u.name || 'U')[0].toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">{u.name || 'User'}</p>
                  <p className="text-xs text-muted-foreground">@{u.handle} · {u.branch}</p>
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
