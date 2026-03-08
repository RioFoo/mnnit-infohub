import { useState } from 'react';
import { CONTACT_DIRECTORY, ACADEMIC_NOTIFICATIONS, QUICK_LINKS, CLUBS_AND_SOCIETIES } from '@/data/infohub-data';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExternalLink, Mail, Phone, Search, Users, Globe, Megaphone } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';

const NOTICE_CATS = ['ALL', 'RESULT', 'EXAM', 'ACADEMIC', 'FEE', 'ADMISSION'];
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
  const [noticeCat, setNoticeCat] = useState('ALL');
  const [clubCat, setClubCat] = useState('All');
  const [aiQuery, setAiQuery] = useState('');

  const filteredNotices = noticeCat === 'ALL' ? ACADEMIC_NOTIFICATIONS : ACADEMIC_NOTIFICATIONS.filter(n => n.category === noticeCat);
  const filteredClubs = clubCat === 'All' ? CLUBS_AND_SOCIETIES : CLUBS_AND_SOCIETIES.filter(c => c.category === clubCat);

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

      {/* Notices */}
      <section className="mb-12">
        <div className="flex items-center gap-2 mb-5">
          <Megaphone className="w-4 h-4 text-primary" />
          <span className="section-title mb-0">Notices</span>
        </div>
        <div className="flex gap-2 flex-wrap mb-4">
          {NOTICE_CATS.map(c => (
            <motion.button
              key={c}
              whileTap={{ scale: 0.95 }}
              onClick={() => setNoticeCat(c)}
              className={`px-3 py-1.5 rounded-full text-[10px] font-mono font-medium transition-all duration-200 ${
                noticeCat === c ? 'bg-primary text-primary-foreground shadow-[0_0_12px_hsl(var(--primary)/0.3)]' : 'bg-muted/15 text-muted-foreground hover:bg-muted/25 border border-border/[0.06]'
              }`}
            >{c}</motion.button>
          ))}
        </div>
        <div className="space-y-2">
          {filteredNotices.map((n, i) => (
            <motion.a
              key={n.id}
              href={n.link}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03, ease: [0.22, 1, 0.36, 1] }}
              className="float-card p-4 block group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold group-hover:text-primary transition-colors">{n.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{n.details}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="tag-pill text-[9px]">{n.category}</span>
                  <p className="text-[10px] font-mono text-muted-foreground/40 mt-1">{n.date}</p>
                </div>
              </div>
            </motion.a>
          ))}
        </div>
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
