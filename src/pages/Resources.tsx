import { useState, useEffect, useRef } from 'react';
import { Upload, Search, Download, FileText, X, Loader2, CloudUpload, Archive, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { AuthPromptDialog } from '@/components/AuthPromptDialog';
import { toast } from 'sonner';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

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

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

const getFileExtension = (filename: string) => {
  return filename.split('.').pop()?.toUpperCase() || 'FILE';
};

const getFileColor = (type: string) => {
  const t = type.toLowerCase();
  if (['pdf'].includes(t)) return 'from-red-500/20 to-red-600/5 text-red-400 border-red-500/20';
  if (['doc', 'docx'].includes(t)) return 'from-blue-500/20 to-blue-600/5 text-blue-400 border-blue-500/20';
  if (['ppt', 'pptx'].includes(t)) return 'from-orange-500/20 to-orange-600/5 text-orange-400 border-orange-500/20';
  if (['xls', 'xlsx', 'csv'].includes(t)) return 'from-green-500/20 to-green-600/5 text-green-400 border-green-500/20';
  if (['zip', 'rar', '7z'].includes(t)) return 'from-yellow-500/20 to-yellow-600/5 text-yellow-400 border-yellow-500/20';
  if (['jpg', 'jpeg', 'png', 'gif', 'svg'].includes(t)) return 'from-pink-500/20 to-pink-600/5 text-pink-400 border-pink-500/20';
  return 'from-primary/20 to-primary/5 text-primary border-primary/20';
};

const getTimeAgo = (date: string) => {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d`;
  return `${Math.floor(seconds / 604800)}w`;
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
  const [dragOver, setDragOver] = useState(false);
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

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
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
      const { error: storageError } = await supabase.storage.from('resources').upload(filePath, selectedFile);
      if (storageError) throw storageError;
      const { data: { publicUrl } } = supabase.storage.from('resources').getPublicUrl(filePath);
      const { error: dbError } = await supabase.from('resources' as any).insert({
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
      toast.success('Uploaded!');
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
    <div className="px-4 md:px-8 py-6 max-w-4xl mx-auto">
      {/* COMPACT HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -20, rotateX: -5 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ duration: 0.5, type: 'spring', stiffness: 200 }}
        className="flex items-center justify-between mb-6"
        style={{ perspective: '800px' }}
      >
        <h1 className="text-xl md:text-2xl page-header-3d">RESOURCES</h1>
        <motion.div
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.92, y: 1 }}
        >
          <Button
            onClick={() => requireAuth(() => setUploadOpen(true), 'Sign in to upload')}
            size="sm"
            className="gap-2 rounded-xl font-display text-[10px] tracking-widest uppercase btn-3d"
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Upload</span>
          </Button>
        </motion.div>
      </motion.div>

      {/* SEARCH BAR */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="relative mb-6"
      >
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
        <Input
          placeholder="Search..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="pl-10 h-10 rounded-xl bg-card/50 border-border/30 backdrop-blur-md font-mono text-sm focus:border-primary/40 focus:shadow-[0_0_20px_hsl(var(--neon-cyan)/0.1)] transition-all duration-300"
        />
        {searchQuery && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </motion.button>
        )}
      </motion.div>

      {/* RESOURCE LIST */}
      <AnimatePresence mode="popLayout">
        {loading ? (
          <motion.div
            key="loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center py-24"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <Loader2 className="w-6 h-6 text-primary/50" />
            </motion.div>
          </motion.div>
        ) : filtered.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center py-20"
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/5 flex items-center justify-center mx-auto mb-4 border border-primary/10"
            >
              <FileText className="w-7 h-7 text-primary/30" />
            </motion.div>
            <p className="text-sm text-muted-foreground/60 font-mono">
              {searchQuery ? 'No matches' : 'No resources yet'}
            </p>
          </motion.div>
        ) : (
          <div className="grid gap-2.5">
            {filtered.map((r, i) => (
              <motion.div
                key={r.id}
                layout
                initial={{ opacity: 0, x: -30, rotateY: -5 }}
                animate={{ opacity: 1, x: 0, rotateY: 0 }}
                exit={{ opacity: 0, x: 30, rotateY: 5 }}
                transition={{ delay: i * 0.04, duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                whileHover={{ y: -3, scale: 1.01 }}
                className="group relative"
                style={{ perspective: '800px' }}
              >
                <div className="holo-card p-3.5 md:p-4 flex items-center gap-3 md:gap-4">
                  {/* File type icon */}
                  <motion.div
                    whileHover={{ rotateZ: 5, scale: 1.1 }}
                    transition={{ type: 'spring', stiffness: 400 }}
                    className={cn(
                      'w-11 h-11 md:w-12 md:h-12 rounded-xl bg-gradient-to-br flex items-center justify-center text-[9px] md:text-[10px] font-display font-bold tracking-wider border shrink-0',
                      getFileColor(r.file_type)
                    )}
                  >
                    {r.file_type}
                  </motion.div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors duration-300">
                      {r.title}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                      <Badge variant="secondary" className="text-[8px] md:text-[9px] rounded-md px-1.5 py-0 h-4 bg-secondary/8 text-secondary/70 border-secondary/15 font-display tracking-wider">
                        {r.branch}
                      </Badge>
                      <span className="text-[9px] text-muted-foreground/50 font-mono">
                        {formatFileSize(r.file_size)} · {getTimeAgo(r.created_at)}
                      </span>
                    </div>
                  </div>

                  {/* Download */}
                  <motion.a
                    href={r.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.85 }}
                    className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-primary/8 hover:bg-primary/15 flex items-center justify-center text-primary/60 hover:text-primary transition-all duration-300 border border-primary/10 hover:border-primary/30 hover:shadow-[0_0_20px_hsl(var(--neon-cyan)/0.2)] shrink-0"
                  >
                    <Download className="w-4 h-4" />
                  </motion.a>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* UPLOAD DIALOG */}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden border-primary/10 bg-card/95 backdrop-blur-xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="p-6"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                <CloudUpload className="w-4.5 h-4.5 text-primary" />
              </div>
              <h2 className="font-display text-base tracking-wider font-bold">Upload</h2>
            </div>

            <div className="space-y-4">
              {/* Drop zone */}
              <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileSelect} />
              <motion.div
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => !selectedFile && fileInputRef.current?.click()}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className={cn(
                  'relative rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition-all duration-300',
                  dragOver
                    ? 'border-primary/60 bg-primary/8 shadow-[0_0_30px_hsl(var(--neon-cyan)/0.15)]'
                    : selectedFile
                    ? 'border-primary/30 bg-primary/5'
                    : 'border-border/40 hover:border-primary/30 hover:bg-primary/3'
                )}
              >
                {selectedFile ? (
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center text-[9px] font-display font-bold border shrink-0',
                      getFileColor(getFileExtension(selectedFile.name))
                    )}>
                      {getFileExtension(selectedFile.name)}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                      <p className="text-[10px] text-muted-foreground font-mono">{formatFileSize(selectedFile.size)}</p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.2, rotate: 90 }}
                      whileTap={{ scale: 0.8 }}
                      onClick={e => { e.stopPropagation(); setSelectedFile(null); }}
                      className="w-7 h-7 rounded-lg bg-destructive/10 hover:bg-destructive/20 flex items-center justify-center text-destructive/60 hover:text-destructive transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </motion.button>
                  </div>
                ) : (
                  <div>
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Upload className="w-6 h-6 text-muted-foreground/40 mx-auto mb-2" />
                    </motion.div>
                    <p className="text-xs text-muted-foreground/50 font-mono">
                      Drop file or tap · max 5 MB
                    </p>
                  </div>
                )}
              </motion.div>

              {/* Title */}
              <div>
                <Label className="text-[10px] font-display tracking-widest uppercase text-muted-foreground/60">Title</Label>
                <Input
                  value={uploadTitle}
                  onChange={e => setUploadTitle(e.target.value)}
                  placeholder="Resource name"
                  className="mt-1.5 h-9 rounded-xl bg-muted/20 border-border/30 text-sm"
                />
              </div>

              {/* Branch & Semester */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <Label className="text-[10px] font-display tracking-widest uppercase text-muted-foreground/60">Branch</Label>
                  <Select value={uploadBranch} onValueChange={setUploadBranch}>
                    <SelectTrigger className="mt-1.5 h-9 rounded-xl bg-muted/20 border-border/30 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {['All', 'CSE', 'ECE', 'EE', 'ME', 'CE', 'CHE', 'MNC', 'BT'].map(b => (
                        <SelectItem key={b} value={b}>{b}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-[10px] font-display tracking-widest uppercase text-muted-foreground/60">Semester</Label>
                  <Select value={uploadSemester} onValueChange={setUploadSemester}>
                    <SelectTrigger className="mt-1.5 h-9 rounded-xl bg-muted/20 border-border/30 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'].map(s => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Upload button */}
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                <Button
                  onClick={handleUpload}
                  disabled={!selectedFile || !uploadTitle.trim() || uploading}
                  className="w-full gap-2 rounded-xl h-10 font-display tracking-wider text-xs uppercase relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-foreground/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin relative z-10" /> : <Upload className="w-4 h-4 relative z-10" />}
                  <span className="relative z-10">{uploading ? 'Uploading...' : 'Upload'}</span>
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </DialogContent>
      </Dialog>

      <AuthPromptDialog open={showAuthPrompt} onOpenChange={setShowAuthPrompt} message={authMessage} />
    </div>
  );
};

export default Resources;
