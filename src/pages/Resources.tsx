import { BookOpen, Upload, Search, Download } from 'lucide-react';
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
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <BookOpen className="w-4 h-4 text-primary" />
          <span className="section-title mb-0">Library</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-mono font-bold">
          Study <span className="gradient-text">Resources</span>
        </h1>
      </motion.div>

      <Tabs defaultValue="drive">
        <TabsList className="rounded-xl bg-muted/30 p-1">
          <TabsTrigger value="drive" className="rounded-lg">MNNIT Drive</TabsTrigger>
          <TabsTrigger value="search" className="rounded-lg">Web Search</TabsTrigger>
        </TabsList>

        <TabsContent value="drive" className="space-y-4 mt-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search resources..." className="pl-11 h-11 rounded-xl bg-muted/30 border-border/50" />
            </div>
            <Button variant="outline" className="gap-1.5 rounded-xl border-border/50"><Upload className="w-4 h-4" /> Upload</Button>
          </div>

          <div className="space-y-3">
            {mockResources.map((r, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -2 }}
                className="card-3d p-5 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-xs font-mono font-bold">
                    {r.type}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{r.title}</p>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <Badge variant="secondary" className="text-[10px] rounded-lg bg-secondary/10 text-secondary border-secondary/20">{r.branch}</Badge>
                      <Badge variant="outline" className="text-[10px] rounded-lg">{r.semester} Sem</Badge>
                      <span className="text-[10px] text-muted-foreground">by {r.uploader} · {r.size}</span>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="rounded-xl gap-1.5 text-primary">
                  <Download className="w-3.5 h-3.5" /> Get
                </Button>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="search" className="mt-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search for academic resources online..." className="pl-11 h-11 rounded-xl bg-muted/30 border-border/50" />
          </div>
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Search className="w-7 h-7 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">AI-powered resource search coming soon.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Resources;
