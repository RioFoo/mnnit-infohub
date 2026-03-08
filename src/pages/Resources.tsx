import { BookOpen, Upload, Search, Loader2 } from 'lucide-react';
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
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-mono font-bold text-primary flex items-center gap-2">
        <BookOpen className="w-6 h-6" /> Resources
      </h1>

      <Tabs defaultValue="drive">
        <TabsList>
          <TabsTrigger value="drive">MNNIT Drive</TabsTrigger>
          <TabsTrigger value="search">Web Search</TabsTrigger>
        </TabsList>

        <TabsContent value="drive" className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search resources..." className="pl-10" />
            </div>
            <Button variant="outline" className="gap-1"><Upload className="w-4 h-4" /> Upload</Button>
          </div>

          <div className="space-y-2">
            {mockResources.map((r, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass rounded-lg p-4 flex items-center justify-between hover:border-primary/30 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary text-xs font-mono font-bold">
                    {r.type}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{r.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-[10px]">{r.branch}</Badge>
                      <Badge variant="outline" className="text-[10px]">{r.semester} Sem</Badge>
                      <span className="text-[10px] text-muted-foreground">by {r.uploader} · {r.size}</span>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm">Download</Button>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="search" className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search for academic resources online..." className="pl-10" />
          </div>
          <p className="text-sm text-muted-foreground text-center py-8">AI-powered resource search coming soon.</p>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Resources;
