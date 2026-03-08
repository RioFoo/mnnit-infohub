import { useState } from 'react';
import { CONTACT_DIRECTORY, ACADEMIC_NOTIFICATIONS, QUICK_LINKS, CLUBS_AND_SOCIETIES } from '@/data/infohub-data';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExternalLink, Mail, Phone, Search, Users, Globe, Megaphone } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';

const NOTICE_CATS = ['ALL', 'RESULT', 'EXAM', 'ACADEMIC', 'FEE', 'ADMISSION'];
const CLUB_CATS = ['All', 'Technical', 'Cultural', 'Sports', 'Arts'];

const CampusInfo = () => {
  const [noticeCat, setNoticeCat] = useState('ALL');
  const [clubCat, setClubCat] = useState('All');
  const [aiQuery, setAiQuery] = useState('');

  const filteredNotices = noticeCat === 'ALL' ? ACADEMIC_NOTIFICATIONS : ACADEMIC_NOTIFICATIONS.filter(n => n.category === noticeCat);
  const filteredClubs = clubCat === 'All' ? CLUBS_AND_SOCIETIES : CLUBS_AND_SOCIETIES.filter(c => c.category === clubCat);

  return (
    <div className="page-container">
      <motion.div
        initial={{ opacity: 0, y: 20, rotateX: -5 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 200 }}
        className="mb-8"
        style={{ perspective: '800px' }}
      >
        <h1 className="text-3xl md:text-4xl page-header-3d">CAMPUS</h1>
      </motion.div>

      {/* ═══ SEARCH ═══ */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="relative mb-10 max-w-xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search campus..."
          value={aiQuery}
          onChange={e => setAiQuery(e.target.value)}
          className="pl-11 h-12 rounded-xl bg-card/60 border-border/30 backdrop-blur-sm focus:border-primary/40 focus:shadow-[0_0_30px_hsl(var(--neon-cyan)/0.1)] transition-all font-mono text-sm"
        />
      </motion.div>

      {/* ═══ QUICK LINKS ═══ */}
      <section className="mb-12">
        <div className="flex items-center gap-2 mb-5">
          <Globe className="w-4 h-4 text-muted-foreground" />
          <span className="section-title mb-0">Quick Access</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {QUICK_LINKS.map((link, i) => (
            <motion.a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20, rotateY: -5 }}
              animate={{ opacity: 1, y: 0, rotateY: 0 }}
              transition={{ delay: i * 0.04, type: 'spring', stiffness: 250 }}
              whileHover={{ y: -8, rotateY: 3, scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="card-3d-pro p-4 group"
              style={{ perspective: '600px' }}
            >
              <ExternalLink className="w-4 h-4 text-primary mb-3 group-hover:scale-110 transition-transform" />
              <p className="text-sm font-semibold group-hover:text-primary transition-colors">{link.title}</p>
              <p className="text-[9px] text-muted-foreground mt-1 font-display tracking-wider uppercase">{link.category}</p>
            </motion.a>
          ))}
        </div>
      </section>

      {/* ═══ CONTACTS ═══ */}
      <section className="mb-12">
        <div className="flex items-center gap-2 mb-5">
          <Phone className="w-4 h-4 text-muted-foreground" />
          <span className="section-title mb-0">Directory</span>
        </div>
        <Tabs defaultValue={CONTACT_DIRECTORY[0].category}>
          <TabsList className="flex-wrap h-auto rounded-xl bg-card/60 border border-border/30 p-1">
            {CONTACT_DIRECTORY.map(cat => (
              <TabsTrigger key={cat.category} value={cat.category} className="text-[10px] rounded-lg font-display tracking-wider uppercase tab-3d data-[state=active]:tab-3d-active">{cat.category}</TabsTrigger>
            ))}
          </TabsList>
          {CONTACT_DIRECTORY.map(cat => (
            <TabsContent key={cat.category} value={cat.category}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                {cat.contacts.map((c, i) => (
                  <motion.div
                    key={c.email}
                    initial={{ opacity: 0, y: 10, rotateX: -3 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                    transition={{ delay: i * 0.04, type: 'spring', stiffness: 300 }}
                    whileHover={{ y: -4 }}
                    className="card-3d-pro p-4"
                    style={{ perspective: '500px' }}
                  >
                    <p className="font-semibold text-sm">{c.role}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{c.name}</p>
                    <div className="flex items-center gap-2 mt-3">
                      <Mail className="w-3 h-3 text-primary" />
                      <a href={`mailto:${c.email}`} className="text-xs text-primary hover:underline font-mono">{c.email}</a>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Phone className="w-3 h-3 text-primary" />
                      <a href={`tel:${c.phone}`} className="text-xs text-primary hover:underline font-mono">{c.phone}</a>
                    </div>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </section>

      {/* ═══ NOTICES ═══ */}
      <section className="mb-12">
        <div className="flex items-center gap-2 mb-5">
          <Megaphone className="w-4 h-4 text-muted-foreground" />
          <span className="section-title mb-0">Bulletins</span>
        </div>
        <div className="flex gap-2 flex-wrap mb-4">
          {NOTICE_CATS.map(c => (
            <motion.button
              key={c}
              whileHover={{ y: -2, scale: 1.05 }}
              whileTap={{ scale: 0.92, y: 1 }}
              onClick={() => setNoticeCat(c)}
              className={`px-3 py-1.5 rounded-xl text-[9px] font-display tracking-widest uppercase transition-all ${
                noticeCat === c ? 'bg-primary text-primary-foreground shadow-[0_3px_0_hsl(var(--primary)/0.3),0_0_15px_hsl(var(--neon-cyan)/0.2)]' : 'bg-card/50 text-muted-foreground border border-border/30'
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
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03, type: 'spring', stiffness: 300 }}
              whileHover={{ x: 4 }}
              className="card-3d-pro p-4 block group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold group-hover:text-primary transition-colors">{n.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{n.details}</p>
                </div>
                <div className="text-right shrink-0">
                  <Badge variant="secondary" className="text-[9px] rounded-md font-display tracking-wider">{n.category}</Badge>
                  <p className="text-[9px] text-muted-foreground mt-1 font-mono">{n.date}</p>
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      </section>

      {/* ═══ CLUBS ═══ */}
      <section>
        <div className="flex items-center gap-2 mb-5">
          <Users className="w-4 h-4 text-muted-foreground" />
          <span className="section-title mb-0">Organizations</span>
        </div>
        <div className="flex gap-2 flex-wrap mb-4">
          {CLUB_CATS.map(c => (
            <motion.button
              key={c}
              whileHover={{ y: -2, scale: 1.05 }}
              whileTap={{ scale: 0.92, y: 1 }}
              onClick={() => setClubCat(c)}
              className={`px-3 py-1.5 rounded-xl text-[9px] font-display tracking-widest uppercase transition-all ${
                clubCat === c ? 'bg-primary text-primary-foreground shadow-[0_3px_0_hsl(var(--primary)/0.3)]' : 'bg-card/50 text-muted-foreground border border-border/30'
              }`}
            >{c}</motion.button>
          ))}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {filteredClubs.map((club, i) => (
            <motion.div
              key={club.name}
              initial={{ opacity: 0, scale: 0.9, rotateY: -8 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ delay: i * 0.04, type: 'spring', stiffness: 250 }}
              whileHover={{ y: -8, rotateY: 5, scale: 1.02 }}
              className="card-3d-pro p-5 text-center group"
              style={{ perspective: '500px' }}
            >
              <motion.div
                whileHover={{ rotateZ: 10, scale: 1.15 }}
                className="w-10 h-10 rounded-lg bg-primary/8 flex items-center justify-center mx-auto mb-3 border border-primary/15 group-hover:shadow-[0_0_15px_hsl(var(--neon-cyan)/0.2)] transition-shadow"
              >
                <Users className="w-5 h-5 text-primary" />
              </motion.div>
              <p className="text-sm font-semibold group-hover:text-primary transition-colors">{club.name}</p>
              <Badge variant="secondary" className="text-[9px] mt-2 rounded-md font-display tracking-wider">{club.category}</Badge>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default CampusInfo;
