import { useState } from 'react';
import { CONTACT_DIRECTORY, ACADEMIC_NOTIFICATIONS, QUICK_LINKS, CLUBS_AND_SOCIETIES } from '@/data/infohub-data';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExternalLink, Mail, Phone, Search, Users, GraduationCap, Globe, Megaphone } from 'lucide-react';
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
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <GraduationCap className="w-4 h-4 text-primary" />
          <span className="section-title mb-0">Hub</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-mono font-bold">
          Campus <span className="gradient-text">Info</span>
        </h1>
      </motion.div>

      {/* AI Search */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="relative mb-10 max-w-xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Ask anything about MNNIT..."
          value={aiQuery}
          onChange={e => setAiQuery(e.target.value)}
          className="pl-11 h-12 rounded-xl bg-muted/30 border-border/50 focus:border-primary/50 focus:shadow-[0_0_20px_hsl(var(--primary)/0.1)] transition-all"
        />
      </motion.div>

      {/* Quick Links */}
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="w-4 h-4 text-muted-foreground" />
          <span className="section-title mb-0">Quick Links</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {QUICK_LINKS.map((link, i) => (
            <motion.a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              whileHover={{ y: -4, scale: 1.02 }}
              className="card-3d p-4 group"
            >
              <ExternalLink className="w-5 h-5 text-primary mb-3 group-hover:scale-110 transition-transform" />
              <p className="text-sm font-semibold">{link.title}</p>
              <p className="text-[10px] text-muted-foreground mt-1">{link.category}</p>
            </motion.a>
          ))}
        </div>
      </section>

      {/* Contact Directory */}
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <Phone className="w-4 h-4 text-muted-foreground" />
          <span className="section-title mb-0">Contacts</span>
        </div>
        <Tabs defaultValue={CONTACT_DIRECTORY[0].category}>
          <TabsList className="flex-wrap h-auto rounded-xl bg-muted/30 p-1">
            {CONTACT_DIRECTORY.map(cat => (
              <TabsTrigger key={cat.category} value={cat.category} className="text-xs rounded-lg">{cat.category}</TabsTrigger>
            ))}
          </TabsList>
          {CONTACT_DIRECTORY.map(cat => (
            <TabsContent key={cat.category} value={cat.category}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                {cat.contacts.map((c, i) => (
                  <motion.div key={c.email} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }} className="card-3d p-4">
                    <p className="font-semibold text-sm">{c.role}</p>
                    <p className="text-xs text-muted-foreground">{c.name}</p>
                    <div className="flex items-center gap-2 mt-3">
                      <Mail className="w-3 h-3 text-primary" />
                      <a href={`mailto:${c.email}`} className="text-xs text-primary hover:underline">{c.email}</a>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Phone className="w-3 h-3 text-primary" />
                      <a href={`tel:${c.phone}`} className="text-xs text-primary hover:underline">{c.phone}</a>
                    </div>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </section>

      {/* Notices */}
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <Megaphone className="w-4 h-4 text-muted-foreground" />
          <span className="section-title mb-0">Notices</span>
        </div>
        <div className="flex gap-2 flex-wrap mb-4">
          {NOTICE_CATS.map(c => (
            <motion.button key={c} whileTap={{ scale: 0.95 }} onClick={() => setNoticeCat(c)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all ${
                noticeCat === c ? 'bg-primary text-primary-foreground shadow-[0_0_10px_hsl(var(--primary)/0.2)]' : 'bg-muted/40 text-muted-foreground border border-border/50'
              }`}
            >{c}</motion.button>
          ))}
        </div>
        <div className="space-y-2">
          {filteredNotices.map((n, i) => (
            <motion.a key={n.id} href={n.link} target="_blank" rel="noopener noreferrer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
              className="card-3d p-4 block group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold group-hover:text-primary transition-colors">{n.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{n.details}</p>
                </div>
                <div className="text-right shrink-0">
                  <Badge variant="secondary" className="text-[10px] rounded-lg">{n.category}</Badge>
                  <p className="text-[10px] text-muted-foreground mt-1">{n.date}</p>
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      </section>

      {/* Clubs */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-4 h-4 text-muted-foreground" />
          <span className="section-title mb-0">Clubs & Societies</span>
        </div>
        <div className="flex gap-2 flex-wrap mb-4">
          {CLUB_CATS.map(c => (
            <motion.button key={c} whileTap={{ scale: 0.95 }} onClick={() => setClubCat(c)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all ${
                clubCat === c ? 'bg-primary text-primary-foreground' : 'bg-muted/40 text-muted-foreground border border-border/50'
              }`}
            >{c}</motion.button>
          ))}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {filteredClubs.map((club, i) => (
            <motion.div key={club.name} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04 }}
              whileHover={{ y: -4 }}
              className="card-3d p-5 text-center"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <p className="text-sm font-semibold">{club.name}</p>
              <Badge variant="secondary" className="text-[10px] mt-2 rounded-lg">{club.category}</Badge>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default CampusInfo;
