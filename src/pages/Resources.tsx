import { BookOpen, Upload, Search, Download, Database, HardDrive } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

const mockResources = [
  { title: 'Data Structures Notes', type: 'PDF', branch: 'CSE', semester: '2nd', uploader: 'Rahul', size: '2.4 MB' },
  { title: 'Engineering Chemistry Lab Manual', type: 'PDF', branch: 'All', semester: '1st', uploader: 'Priya', size: '1.8 MB' },
  { title: 'Maths-II Previous Papers', type: 'PDF', branch: 'All', semester: '2nd', uploader: 'Amit', size: '3.1 MB' },
  { title: 'Programming Paradigms Slides', type: 'PPTX', branch: 'CSE', semester: '2nd', uploader: 'Sneha', size: '5.2 MB' },
];

const Resources = () => {
  return (
    <div className="page-container">
      {/* ═══ HEADER ═══ */}
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="relative mb-10">
        <div className="absolute -left-4 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-secondary/30 to-transparent" />
        
        <div className="flex items-center gap-4 mb-3">
          <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center border border-secondary/20">
            <Database className="w-6 h-6 text-secondary" />
          </div>
          <div>
            <span className="section-title mb-0">Data Archive</span>
            <h1 className="text-3xl md:text-4xl font-display font-bold tracking-wider">
              <span className="text-foreground">RESOURCE</span>{' '}
              <span className="gradient-text">VAULT</span>
            </h1>
          </div>
        </div>
        <div className="cyber-line mt-4" />
      </motion.div>

      <Tabs defaultValue="drive">
        <TabsList className="rounded-lg bg-card/60 border border-border/30 p-1">
          <TabsTrigger value="drive" className="rounded-md font-display text-xs tracking-wider uppercase">
            <HardDrive className="w-3.5 h-3.5 mr-1.5" /> Drive
          </TabsTrigger>
          <TabsTrigger value="search" className="rounded-md font-display text-xs tracking-wider uppercase">
            <Search className="w-3.5 h-3.5 mr-1.5" /> Search
          </TabsTrigger>
        </TabsList>

        <TabsContent value="drive" className="space-y-4 mt-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search vault..." className="pl-11 h-11 rounded-lg bg-card/60 border-border/30 backdrop-blur-sm font-mono text-sm" />
            </div>
            <Button variant="outline" className="gap-1.5 rounded-lg border-border/30 font-display text-xs tracking-wider uppercase">
              <Upload className="w-4 h-4" /> Upload
            </Button>
          </div>

          <div className="space-y-3">
            {mockResources.map((r, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="holo-card p-5 flex items-center justify-between group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/8 flex items-center justify-center text-primary text-[10px] font-display font-bold tracking-wider border border-primary/15">
                    {r.type}
                  </div>
                  <div>
                    <p className="text-sm font-semibold group-hover:text-primary transition-colors">{r.title}</p>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <Badge variant="secondary" className="text-[9px] rounded-md bg-secondary/8 text-secondary/80 border-secondary/15 font-display tracking-wider">{r.branch}</Badge>
                      <Badge variant="outline" className="text-[9px] rounded-md font-display tracking-wider">{r.semester} Sem</Badge>
                      <span className="text-[9px] text-muted-foreground font-mono">by {r.uploader} · {r.size}</span>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="rounded-lg gap-1.5 text-primary font-display text-[10px] tracking-wider uppercase hover:bg-primary/5">
                  <Download className="w-3.5 h-3.5" /> Get
                </Button>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="search" className="mt-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="AI-powered resource search..." className="pl-11 h-11 rounded-lg bg-card/60 border-border/30 backdrop-blur-sm font-mono text-sm" />
          </div>
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-xl bg-primary/5 flex items-center justify-center mx-auto mb-5 neon-border">
              <Search className="w-9 h-9 text-primary/40" />
            </div>
            <h3 className="font-display text-sm tracking-wider text-foreground/60">NEURAL SEARCH</h3>
            <p className="text-sm text-muted-foreground mt-2 font-mono">Coming soon.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Resources;
