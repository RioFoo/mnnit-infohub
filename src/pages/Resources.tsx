import { useState, useEffect, useRef } from 'react';
import { Upload, Search, Download, FileText, X, Loader2, CloudUpload, Eye, Users, GitBranch } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

import { motion, AnimatePresence } from 'framer-motion';
import { PageHeader } from '@/components/PageHeader';
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
  id: string; title: string; file_url: string; file_type: string; file_size: number;
  branch: string; semester: string; user_id: string; uploader_name: string | null; created_at: string;
  visibility: string;
}

type Visibility = 'branch' | 'followers' | 'both';

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

const getFileExtension = (filename: string) => filename.split('.').pop()?.toUpperCase() || 'FILE';

const getFileColor = (type: string) => {
  const t = type.toLowerCase();
  if (['pdf'].includes(t)) return 'bg-red-500/10 text-red-400 border-red-500/15';
  if (['doc', 'docx'].includes(t)) return 'bg-blue-500/10 text-blue-400 border-blue-500/15';
  if (['ppt', 'pptx'].includes(t)) return 'bg-orange-500/10 text-orange-400 border-orange-500/15';
  if (['xls', 'xlsx', 'csv'].includes(t)) return 'bg-green-500/10 text-green-400 border-green-500/15';
  if (['zip', 'rar', '7z'].includes(t)) return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/15';
  if (['jpg', 'jpeg', 'png', 'gif', 'svg'].includes(t)) return 'bg-pink-500/10 text-pink-400 border-pink-500/15';
  return 'bg-primary/10 text-primary border-primary/15';
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
  const [uploadVisibility, setUploadVisibility] = useState<Visibility>('branch');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load default visibility from profile
  useEffect(() => {
    if (profile && (profile as any).default_resource_visibility) {
      setUploadVisibility((profile as any).default_resource_visibility as Visibility);
    }
  }, [profile]);

  const fetchResources = async () => {
    const { data, error } = await supabase.from('resources' as any).select('*').order('created_at', { ascending: false });
    if (!error && data) setResources(data as unknown as Resource[]);
    setLoading(false);
  };

  useEffect(() => { fetchResources(); }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) { toast.error('File size must be under 5 MB'); return; }
    setSelectedFile(file);
    if (!uploadTitle) setUploadTitle(file.name.replace(/\.[^/.]+$/, ''));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) { toast.error('File size must be under 5 MB'); return; }
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
      const { error: dbError } = await supabase.from('resources' as any).insert({
        title: uploadTitle.trim(), file_url: filePath, file_type: getFileExtension(selectedFile.name),
        file_size: selectedFile.size, branch: uploadBranch, semester: uploadSemester,
        user_id: user.id, uploader_name: profile?.name || user.email?.split('@')[0] || 'Anonymous',
        visibility: uploadVisibility,
      } as any);
      if (dbError) throw dbError;
      toast.success('Uploaded!');
      setUploadOpen(false); setSelectedFile(null); setUploadTitle(''); setUploadBranch('All'); setUploadSemester('1st'); setUploadVisibility((profile as any)?.default_resource_visibility || 'branch');
      fetchResources();
    } catch (err: any) { toast.error(err.message || 'Upload failed'); }
    finally { setUploading(false); }
  };

  const filtered = resources.filter(r =>
    r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.branch.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.file_type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="page-container max-w-4xl">
      <PageHeader title="LIBRARY">
        <Button
          onClick={() => requireAuth(() => setUploadOpen(true), 'Sign in to upload')}
          size="sm" className="gap-2 rounded-xl text-xs btn-bio"
        >
          <Upload className="w-3.5 h-3.5" /> Upload
        </Button>
      </PageHeader>

      {/* Search */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="relative mb-6">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
        <Input
          placeholder="Search resources..."
          value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
          className="pl-10 h-10 rounded-xl bg-muted/15 border-border/[0.08] text-sm font-mono"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </motion.div>

      {/* List */}
      <AnimatePresence mode="popLayout">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-6 h-6 text-primary/40 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-14 h-14 rounded-full bg-primary/[0.06] flex items-center justify-center mx-auto mb-4 breathe">
              <FileText className="w-6 h-6 text-primary/30" />
            </div>
            <p className="text-sm font-mono text-muted-foreground/50">{searchQuery ? 'No matches' : 'No resources yet'}</p>
          </div>
        ) : (
          <div className="grid gap-2.5">
            {filtered.map((r, i) => (
              <motion.div
                key={r.id} layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ delay: i * 0.03, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="group"
              >
                <div className="float-card p-3.5 md:p-4 flex items-center gap-3 md:gap-4">
                  <div className={cn('w-11 h-11 md:w-12 md:h-12 rounded-xl flex items-center justify-center text-[9px] md:text-[10px] font-mono font-bold border shrink-0', getFileColor(r.file_type))}>
                    {r.file_type}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors">{r.title}</p>
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                      <span className="tag-pill text-[8px] px-2 py-0">{r.branch}</span>
                      {r.visibility && r.visibility !== 'branch' && (
                        <span className="tag-pill text-[8px] px-2 py-0 bg-accent/10 text-accent-foreground/60">
                          {r.visibility === 'followers' ? '👥 Followers' : '🌐 Both'}
                        </span>
                      )}
                      <span className="text-[10px] font-mono text-muted-foreground/30">{formatFileSize(r.file_size)} · {getTimeAgo(r.created_at)}</span>
                    </div>
                  </div>
                  <button
                    onClick={async () => {
                      const { data } = await supabase.storage.from('resources').createSignedUrl(r.file_url, 60);
                      if (data?.signedUrl) window.open(data.signedUrl, '_blank', 'noopener,noreferrer');
                      else toast.error('Could not generate download link');
                    }}
                    className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-primary/[0.06] hover:bg-primary/10 flex items-center justify-center text-primary/50 hover:text-primary transition-all border border-primary/[0.08] hover:border-primary/20 hover:shadow-[0_0_12px_hsl(var(--primary)/0.15)] shrink-0"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Upload Dialog */}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-card border border-border/10 rounded-2xl shadow-2xl">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-primary/[0.06] flex items-center justify-center">
                <CloudUpload className="w-4.5 h-4.5 text-primary" />
              </div>
              <h2 className="text-base font-display font-bold">Upload Resource</h2>
            </div>
            <div className="space-y-4">
              <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileSelect} />
              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => !selectedFile && fileInputRef.current?.click()}
                className={cn(
                  'rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition-all duration-200',
                  dragOver ? 'border-primary/30 bg-primary/[0.04]' : selectedFile ? 'border-primary/15 bg-primary/[0.02]' : 'border-border/[0.08] hover:border-primary/15'
                )}
              >
                {selectedFile ? (
                  <div className="flex items-center gap-3">
                    <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center text-[9px] font-mono font-bold border shrink-0', getFileColor(getFileExtension(selectedFile.name)))}>
                      {getFileExtension(selectedFile.name)}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                      <p className="text-[10px] font-mono text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
                    </div>
                    <button onClick={e => { e.stopPropagation(); setSelectedFile(null); }} className="w-7 h-7 rounded-lg bg-destructive/[0.06] hover:bg-destructive/10 flex items-center justify-center text-destructive/60 hover:text-destructive transition-colors">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div>
                    <Upload className="w-6 h-6 text-muted-foreground/20 mx-auto mb-2" />
                    <p className="text-xs font-mono text-muted-foreground/30">Drop file or click · max 5 MB</p>
                  </div>
                )}
              </div>
              <div>
                <Label className="text-[10px] font-mono font-medium uppercase tracking-wider text-muted-foreground/50">Title</Label>
                <Input value={uploadTitle} onChange={e => setUploadTitle(e.target.value)} placeholder="Resource name" className="mt-1.5 h-9 rounded-xl bg-muted/10 border-border/[0.06] text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <Label className="text-[10px] font-mono font-medium uppercase tracking-wider text-muted-foreground/50">Branch</Label>
                  <Select value={uploadBranch} onValueChange={setUploadBranch}>
                    <SelectTrigger className="mt-1.5 h-9 rounded-xl bg-muted/10 border-border/[0.06] text-sm font-mono"><SelectValue /></SelectTrigger>
                    <SelectContent>{['All', 'CSE', 'ECE', 'EE', 'ME', 'CE', 'CHE', 'MNC', 'BT'].map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-[10px] font-mono font-medium uppercase tracking-wider text-muted-foreground/50">Semester</Label>
                  <Select value={uploadSemester} onValueChange={setUploadSemester}>
                    <SelectTrigger className="mt-1.5 h-9 rounded-xl bg-muted/10 border-border/[0.06] text-sm font-mono"><SelectValue /></SelectTrigger>
                    <SelectContent>{['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label className="text-[10px] font-mono font-medium uppercase tracking-wider text-muted-foreground/50">Who can see</Label>
                <div className="grid grid-cols-3 gap-1.5 mt-1.5">
                  {([
                    { value: 'branch' as Visibility, label: 'Branch', icon: GitBranch, desc: 'Same branch & sem' },
                    { value: 'followers' as Visibility, label: 'Followers', icon: Users, desc: 'Your followers' },
                    { value: 'both' as Visibility, label: 'Both', icon: Eye, desc: 'Branch + followers' },
                  ]).map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setUploadVisibility(opt.value)}
                      className={cn(
                        'flex flex-col items-center gap-1 p-2.5 rounded-xl border text-center transition-all',
                        uploadVisibility === opt.value
                          ? 'border-primary/20 bg-primary/[0.06] text-primary'
                          : 'border-border/[0.06] hover:border-primary/10 text-muted-foreground/50 hover:text-muted-foreground'
                      )}
                    >
                      <opt.icon className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-mono font-medium">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <Button onClick={handleUpload} disabled={uploading || !selectedFile || !uploadTitle.trim()} className="w-full rounded-xl btn-bio">
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Upload'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AuthPromptDialog open={showAuthPrompt} onOpenChange={setShowAuthPrompt} message={authMessage} />
    </div>
  );
};

export default Resources;
