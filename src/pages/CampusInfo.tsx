import { useState } from 'react';
import { CONTACT_DIRECTORY, ACADEMIC_NOTIFICATIONS, QUICK_LINKS, CLUBS_AND_SOCIETIES } from '@/data/infohub-data';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExternalLink, Mail, Phone, Search, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';

const NOTICE_CATS = ['ALL', 'RESULT', 'EXAM', 'ACADEMIC', 'FEE', 'ADMISSION'];
const CLUB_CATS = ['All', 'Technical', 'Cultural', 'Sports', 'Arts'];

const CampusInfo = () => {
  const [noticeCat, setNoticeCat] = useState('ALL');
  const [clubCat, setClubCat] = useState('All');
  const [aiQuery, setAiQuery] = useState('');

  const filteredNotices = noticeCat === 'ALL'
    ? ACADEMIC_NOTIFICATIONS
    : ACADEMIC_NOTIFICATIONS.filter(n => n.category === noticeCat);

  const filteredClubs = clubCat === 'All'
    ? CLUBS_AND_SOCIETIES
    : CLUBS_AND_SOCIETIES.filter(c => c.category === clubCat);

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-8">
      <h1 className="text-2xl font-mono font-bold text-primary">Campus Info</h1>

      {/* AI Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Ask anything about MNNIT..."
          value={aiQuery}
          onChange={e => setAiQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Quick Links */}
      <section>
        <h2 className="text-lg font-mono font-semibold mb-3">Quick Links</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {QUICK_LINKS.map((link, i) => (
            <motion.a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass rounded-xl p-4 hover:border-primary/30 transition-all group"
            >
              <ExternalLink className="w-5 h-5 text-primary mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-sm font-medium">{link.title}</p>
              <p className="text-[10px] text-muted-foreground mt-1">{link.category}</p>
            </motion.a>
          ))}
        </div>
      </section>

      {/* Contact Directory */}
      <section>
        <h2 className="text-lg font-mono font-semibold mb-3">Contact Directory</h2>
        <Tabs defaultValue={CONTACT_DIRECTORY[0].category}>
          <TabsList className="flex-wrap h-auto">
            {CONTACT_DIRECTORY.map(cat => (
              <TabsTrigger key={cat.category} value={cat.category} className="text-xs">{cat.category}</TabsTrigger>
            ))}
          </TabsList>
          {CONTACT_DIRECTORY.map(cat => (
            <TabsContent key={cat.category} value={cat.category}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {cat.contacts.map((c, i) => (
                  <motion.div
                    key={c.email}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="glass rounded-xl p-4"
                  >
                    <p className="font-medium text-sm">{c.role}</p>
                    <p className="text-xs text-muted-foreground">{c.name}</p>
                    <div className="flex items-center gap-2 mt-2">
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

      {/* Academic Notices */}
      <section>
        <h2 className="text-lg font-mono font-semibold mb-3">Academic Notices</h2>
        <div className="flex gap-2 flex-wrap mb-3">
          {NOTICE_CATS.map(c => (
            <Badge key={c} variant={noticeCat === c ? 'default' : 'outline'} className="cursor-pointer text-xs" onClick={() => setNoticeCat(c)}>
              {c}
            </Badge>
          ))}
        </div>
        <div className="space-y-2">
          {filteredNotices.map((n, i) => (
            <motion.a
              key={n.id}
              href={n.link}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.03 }}
              className="glass rounded-lg p-3 block hover:border-primary/30 transition-all"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium">{n.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{n.details}</p>
                </div>
                <div className="text-right shrink-0">
                  <Badge variant="secondary" className="text-[10px]">{n.category}</Badge>
                  <p className="text-[10px] text-muted-foreground mt-1">{n.date}</p>
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      </section>

      {/* Clubs */}
      <section>
        <h2 className="text-lg font-mono font-semibold mb-3">Clubs & Societies</h2>
        <div className="flex gap-2 flex-wrap mb-3">
          {CLUB_CATS.map(c => (
            <Badge key={c} variant={clubCat === c ? 'default' : 'outline'} className="cursor-pointer text-xs" onClick={() => setClubCat(c)}>
              {c}
            </Badge>
          ))}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {filteredClubs.map((club, i) => (
            <motion.div
              key={club.name}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="glass rounded-xl p-4 text-center hover:border-primary/30 transition-all"
            >
              <Users className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-sm font-medium">{club.name}</p>
              <Badge variant="secondary" className="text-[10px] mt-1">{club.category}</Badge>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default CampusInfo;
