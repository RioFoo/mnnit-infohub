import { useState, useEffect, useRef } from 'react';
import { Upload, Search, Download, Database, FileText, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { AuthPromptDialog } from '@/components/AuthPromptDialog';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Resource {
  id: string;
  title: string;
  file_url: string;
  file_type: string;
  file_size: number;
  branch: string;
  semester: string;
  user_id: string;
  uploader_name: string | null;
  created_at: string;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

const getFileExtension = (filename: string) => {
  return filename.split('.').pop()?.toUpperCase() || 'FILE';
};

const Resources = () => {
  const { user, profile } = useAuth();
  const { showAuthPrompt, setShowAuthPrompt, authMessage, requireAuth } = useAuthGuard();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadBranch, setUploadBranch] = useState('All');
  const [uploadSemester, setUploadSemester] = useState('1st');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchResources = async () => {
    const { data, error } = await supabase
      .from('resources' as any)
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setResources(data as unknown as Resource[]);
    setLoading(false);
  };

  useEffect(() => { fetchResources(); }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      toast.error('File size must be under 5 MB');
      return;
    }
    setSelectedFile(file);
    if (!uploadTitle) setUploadTitle(file.name.replace(/\.[^/.]+$/, ''));
  };

  const handleUpload = async () => {
    if (!selectedFile || !uploadTitle.trim() || !user) return;
    setUploading(true);

    try {
      const fileExt = selectedFile.name.split('.').pop();
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: storageError } = await supabase.storage
        .from('resources')
        .upload(filePath, selectedFile);

      if (storageError) throw storageError;

      const { data: { publicUrl } } = supabase.storage
        .from('resources')
        .getPublicUrl(filePath);

      const { error: dbError } = await supabase
        .from('resources' as any)
        .insert({
          title: uploadTitle.trim(),
          file_url: publicUrl,
          file_type: getFileExtension(selectedFile.name),
          file_size: selectedFile.size,
          branch: uploadBranch,
          semester: uploadSemester,
          user_id: user.id,
          uploader_name: profile?.name || user.email?.split('@')[0] || 'Anonymous',
        } as any);

      if (dbError) throw dbError;

      toast.success('Resource uploaded successfully!');
      setUploadOpen(false);
      setSelectedFile(null);
      setUploadTitle('');
      setUploadBranch('All');
      setUploadSemester('1st');
      fetchResources();
    } catch (err: any) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const filtered = resources.filter(r =>
    r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.branch.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.file_type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="page-container">
      {/* HEADER */}
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

      {/* SEARCH + UPLOAD */}
      <div className="flex gap-2 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search vault..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-11 h-11 rounded-lg bg-card/60 border-border/30 backdrop-blur-sm font-mono text-sm"
          />
        </div>
        <Button
          onClick={() => requireAuth(() => setUploadOpen(true), 'Sign in to upload resources')}
          className="gap-1.5 rounded-lg font-display text-xs tracking-wider uppercase"
        >
          <Upload className="w-4 h-4" /> Upload
        </Button>
      </div>

      {/* RESOURCE LIST */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-primary/40" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-xl bg-primary/5 flex items-center justify-center mx-auto mb-5 border border-primary/10">
              <FileText className="w-9 h-9 text-primary/40" />
            </div>
            <h3 className="font-display text-sm tracking-wider text-foreground/60">NO RESOURCES FOUND</h3>
            <p className="text-sm text-muted-foreground mt-2 font-mono">
              {searchQuery ? 'Try a different search.' : 'Be the first to upload!'}
            </p>
          </div>
        ) : (
          filtered.map((r, i) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="holo-card p-5 flex items-center justify-between group"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-12 h-12 rounded-lg bg-primary/8 flex items-center justify-center text-primary text-[10px] font-display font-bold tracking-wider border border-primary/15 shrink-0">
                  {r.file_type}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold group-hover:text-primary transition-colors truncate">{r.title}</p>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <Badge variant="secondary" className="text-[9px] rounded-md bg-secondary/8 text-secondary/80 border-secondary/15 font-display tracking-wider">{r.branch}</Badge>
                    <Badge variant="outline" className="text-[9px] rounded-md font-display tracking-wider">{r.semester} Sem</Badge>
                    <span className="text-[9px] text-muted-foreground font-mono">
                      by {r.uploader_name || 'Anonymous'} · {formatFileSize(r.file_size)}
                    </span>
                  </div>
                </div>
              </div>
              <a href={r.file_url} target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="sm" className="rounded-lg gap-1.5 text-primary font-display text-[10px] tracking-wider uppercase hover:bg-primary/5">
                  <Download className="w-3.5 h-3.5" /> Get
                </Button>
              </a>
            </motion.div>
          ))
        )}
      </div>

      {/* UPLOAD DIALOG */}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display tracking-wider">Upload Resource</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            {/* File picker */}
            <div>
              <Label className="text-xs font-display tracking-wider uppercase text-muted-foreground">File (max 5 MB)</Label>
              <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileSelect} />
              {selectedFile ? (
                <div className="mt-2 flex items-center gap-2 p-3 rounded-lg bg-muted/30 border border-border/30">
                  <FileText className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-sm truncate flex-1">{selectedFile.name}</span>
                  <span className="text-xs text-muted-foreground">{formatFileSize(selectedFile.size)}</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setSelectedFile(null)}>
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ) : (
                <Button variant="outline" className="w-full mt-2 gap-2" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="w-4 h-4" /> Choose File
                </Button>
              )}
            </div>

            <div>
              <Label className="text-xs font-display tracking-wider uppercase text-muted-foreground">Title</Label>
              <Input value={uploadTitle} onChange={e => setUploadTitle(e.target.value)} placeholder="e.g. Data Structures Notes" className="mt-1" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-display tracking-wider uppercase text-muted-foreground">Branch</Label>
                <Select value={uploadBranch} onValueChange={setUploadBranch}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['All', 'CSE', 'ECE', 'EE', 'ME', 'CE', 'CHE', 'MNC', 'BT'].map(b => (
                      <SelectItem key={b} value={b}>{b}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs font-display tracking-wider uppercase text-muted-foreground">Semester</Label>
                <Select value={uploadSemester} onValueChange={setUploadSemester}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'].map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              onClick={handleUpload}
              disabled={!selectedFile || !uploadTitle.trim() || uploading}
              className="w-full gap-2"
            >
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {uploading ? 'Uploading...' : 'Upload'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AuthPromptDialog open={showAuthPrompt} onOpenChange={setShowAuthPrompt} message={authMessage} />
    </div>
  );
};

export default Resources;
