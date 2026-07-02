import { useState } from 'react';
import { CONTACT_DIRECTORY, QUICK_LINKS, CLUBS_AND_SOCIETIES } from '@/data/infohub-data';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExternalLink, Mail, Phone, Search, Users, Globe, Megaphone, BellRing, RefreshCw, ExternalLink as LinkIcon, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { PageHeader } from '@/components/PageHeader';
import { useAcademicsNotices, requestNoticePermission } from '@/hooks/useAcademicsNotices';
import { toast } from 'sonner';

const SOURCE_URL = 'https://academics.mnnit.ac.in/new/';
const CLUB_CATS = ['All', 'Technical', 'Cultural', 'Sports', 'Arts'];

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04, delayChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 12, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } }
};

const CampusInfo = () => {
  const [clubCat, setClubCat] = useState('All');
  const [aiQuery, setAiQuery] = useState('');
  const [noticeQuery, setNoticeQuery] = useState('');
  const { notices, loading: noticesLoading, error: noticesError, fetchedAt, newIds, refresh } = useAcademicsNotices();

  const filteredNotices = noticeQuery.trim()
    ? notices.filter(n => (n.title + ' ' + n.body).toLowerCase().includes(noticeQuery.trim().toLowerCase()))
    : notices;
  const filteredClubs = clubCat === 'All' ? CLUBS_AND_SOCIETIES : CLUBS_AND_SOCIETIES.filter(c => c.category === clubCat);

  const enableAlerts = async () => {
    const perm = await requestNoticePermission();
    if (perm === 'granted') toast.success('Notice alerts enabled', { description: "You'll be pinged when Dean Academic posts a new notice." });
    else if (perm === 'denied') toast.error('Notifications blocked', { description: 'Enable them in browser settings to receive alerts.' });
  };

  return (
    <div className="page-container">
      <PageHeader title="CAMPUS" />

      {/* Search */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="relative mb-10 max-w-xl">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
        <Input
          placeholder="Search campus..."
          value={aiQuery}
          onChange={e => setAiQuery(e.target.value)}
          className="pl-10 h-11 rounded-xl bg-muted/15 border-border/[0.08] text-sm font-mono"
        />
      </motion.div>

      {/* Quick Links */}
      <section className="mb-12">
        <div className="flex items-center gap-2 mb-5">
          <Globe className="w-4 h-4 text-primary" />
          <span className="section-title mb-0">Quick Access</span>
        </div>
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {QUICK_LINKS.map((link) => (
            <motion.a
              key={link.url}
              variants={itemVariants}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="card-bio p-4 group"
            >
              <ExternalLink className="w-4 h-4 text-primary mb-3 group-hover:drop-shadow-[0_0_6px_hsl(var(--primary)/0.5)] transition-all" />
              <p className="text-sm font-semibold group-hover:text-primary transition-colors">{link.title}</p>
              <p className="text-[10px] font-mono text-muted-foreground mt-1 capitalize">{link.category}</p>
            </motion.a>
          ))}
        </motion.div>
      </section>

      {/* Contacts */}
      <section className="mb-12">
        <div className="flex items-center gap-2 mb-5">
          <Phone className="w-4 h-4 text-primary" />
          <span className="section-title mb-0">Directory</span>
        </div>
        <Tabs defaultValue={CONTACT_DIRECTORY[0].category}>
          <TabsList className="flex-wrap h-auto rounded-xl bg-muted/15 border border-border/[0.06] p-1">
            {CONTACT_DIRECTORY.map(cat => (
              <TabsTrigger key={cat.category} value={cat.category} className="text-[11px] rounded-lg font-mono data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-[0_0_8px_hsl(var(--primary)/0.15)]">{cat.category}</TabsTrigger>
            ))}
          </TabsList>
          {CONTACT_DIRECTORY.map(cat => (
            <TabsContent key={cat.category} value={cat.category}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                {cat.contacts.map((c, i) => (
                  <motion.div
                    key={c.email}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="float-card p-4"
                  >
                    <p className="font-semibold text-sm">{c.role}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{c.name}</p>
                    <div className="flex items-center gap-2 mt-3">
                      <Mail className="w-3 h-3 text-primary" />
                      <a href={`mailto:${c.email}`} className="text-xs font-mono text-primary hover:glow-text-subtle transition-all">{c.email}</a>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Phone className="w-3 h-3 text-primary" />
                      <a href={`tel:${c.phone}`} className="text-xs font-mono text-primary hover:glow-text-subtle transition-all">{c.phone}</a>
                    </div>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </section>

      {/* Academics Notifications — live from Dean Academic portal */}
      <section className="mb-12">
        <div className="flex items-center justify-between gap-3 mb-2 flex-wrap">
          <div className="flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-primary" />
            <span className="section-title mb-0">Academics Notifications</span>
            {newIds.size > 0 && (
              <motion.span
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="ml-1 inline-flex items-center gap-1 text-[9px] font-mono font-bold text-primary-foreground bg-primary px-2 py-0.5 rounded-full shadow-[0_0_10px_hsl(var(--primary)/0.6)]"
              >
                <Sparkles className="w-2.5 h-2.5" /> {newIds.size} NEW
              </motion.span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={enableAlerts}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-mono bg-primary/[0.08] text-primary border border-primary/20 hover:bg-primary/[0.15] transition-all"
            >
              <BellRing className="w-3 h-3" /> Alerts
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9, rotate: -180 }}
              onClick={refresh}
              className="p-1.5 rounded-lg bg-muted/15 border border-border/[0.06] text-muted-foreground hover:text-primary hover:bg-primary/[0.08] transition-all"
              aria-label="Refresh"
            >
              <RefreshCw className={`w-3 h-3 ${noticesLoading ? 'animate-spin' : ''}`} />
            </motion.button>
          </div>
        </div>
        <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground/50 mb-4">
          <a href={SOURCE_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-primary transition-colors">
            <LinkIcon className="w-3 h-3" /> academics.mnnit.ac.in/new
          </a>
          <span>{fetchedAt ? `synced ${new Date(fetchedAt).toLocaleTimeString()}` : '—'}</span>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/40" />
          <Input
            placeholder="Filter notices…"
            value={noticeQuery}
            onChange={e => setNoticeQuery(e.target.value)}
            className="pl-9 h-10 rounded-xl bg-muted/15 border-border/[0.08] text-xs font-mono"
          />
        </div>

        {noticesError && (
          <div className="float-card p-4 text-xs text-destructive/80 font-mono mb-3">
            Failed to load: {noticesError}
          </div>
        )}

        {noticesLoading && notices.length === 0 ? (
          <div className="space-y-2">
            {[0,1,2,3].map(i => (
              <div key={i} className="float-card p-4 animate-pulse">
                <div className="h-3 w-2/3 bg-muted/20 rounded mb-2" />
                <div className="h-2 w-1/3 bg-muted/10 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence initial={false}>
              {filteredNotices.map((n, i) => {
                const isNew = newIds.has(n.id);
                return (
                  <motion.a
                    key={n.id}
                    href={n.link ?? SOURCE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    layout
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: Math.min(i * 0.02, 0.3), ease: [0.22, 1, 0.36, 1] }}
                    className={`float-card p-4 block group relative overflow-hidden ${isNew ? 'border-l-2 border-l-primary bg-primary/[0.03] shadow-[0_0_16px_hsl(var(--primary)/0.08)]' : ''}`}
                  >
                    {isNew && (
                      <motion.span
                        initial={{ x: '-100%' }}
                        animate={{ x: '100%' }}
                        transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
                        className="absolute top-0 left-0 h-px w-1/3 bg-gradient-to-r from-transparent via-primary to-transparent"
                      />
                    )}
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold group-hover:text-primary transition-colors">{n.title}</p>
                          {isNew && <span className="tag-pill text-[8px] bg-primary/15 text-primary border-primary/30">NEW</span>}
                        </div>
                        {n.body && n.body.length > 6 && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{n.body}</p>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[10px] font-mono text-muted-foreground/50">{n.date}</p>
                        {n.link && <LinkIcon className="w-3 h-3 text-primary/50 ml-auto mt-2" />}
                      </div>
                    </div>
                  </motion.a>
                );
              })}
            </AnimatePresence>
            {!noticesLoading && filteredNotices.length === 0 && (
              <div className="text-center py-8 text-xs font-mono text-muted-foreground/50">No notices match.</div>
            )}
          </div>
        )}
      </section>

      {/* Clubs */}
      <section>
        <div className="flex items-center gap-2 mb-5">
          <Users className="w-4 h-4 text-primary" />
          <span className="section-title mb-0">Organizations</span>
        </div>
        <div className="flex gap-2 flex-wrap mb-4">
          {CLUB_CATS.map(c => (
            <motion.button
              key={c}
              whileTap={{ scale: 0.95 }}
              onClick={() => setClubCat(c)}
              className={`px-3 py-1.5 rounded-full text-[10px] font-mono font-medium transition-all duration-200 ${
                clubCat === c ? 'bg-primary text-primary-foreground shadow-[0_0_12px_hsl(var(--primary)/0.3)]' : 'bg-muted/15 text-muted-foreground hover:bg-muted/25 border border-border/[0.06]'
              }`}
            >{c}</motion.button>
          ))}
        </div>
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {filteredClubs.map((club) => (
            <motion.div
              key={club.name}
              variants={itemVariants}
              className="card-bio p-5 text-center group"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/[0.06] flex items-center justify-center mx-auto mb-3 group-hover:bg-primary/10 group-hover:shadow-[0_0_16px_hsl(var(--primary)/0.15)] transition-all">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <p className="text-sm font-semibold group-hover:text-primary transition-colors">{club.name}</p>
              <span className="tag-pill text-[9px] mt-2 inline-block">{club.category}</span>
            </motion.div>
          ))}
        </motion.div>
      </section>
    </div>
  );
};

export default CampusInfo;
