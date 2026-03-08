import { useState, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, Image, Video, Music, FileText, X, Upload, MessageSquare, Megaphone, HelpCircle, Lightbulb } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface CreatePostDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreated: () => void;
}

const ALLOWED_TYPES: Record<string, string[]> = {
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
  video: ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'],
  audio: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4', 'audio/aac'],
  document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'text/plain'],
};

const ALL_ALLOWED = Object.values(ALLOWED_TYPES).flat();

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_VIDEO_SIZE = 8 * 1024 * 1024;

const POST_FORMATS = [
  { id: 'general', label: 'General', icon: MessageSquare, description: 'Share thoughts, updates' },
  { id: 'announcement', label: 'Announcement', icon: Megaphone, description: 'Important notices' },
  { id: 'question', label: 'Question', icon: HelpCircle, description: 'Ask the community' },
  { id: 'idea', label: 'Idea', icon: Lightbulb, description: 'Share suggestions' },
];

const CreatePostDialog = ({ open, onOpenChange, onCreated }: CreatePostDialogProps) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);
  const [postFormat, setPostFormat] = useState('general');
  const [isDragging, setIsDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  const processFile = (f: File) => {
    if (!ALL_ALLOWED.includes(f.type)) {
      toast.error('Unsupported file type');
      return;
    }
    const isVideo = f.type.startsWith('video/');
    const limit = isVideo ? MAX_VIDEO_SIZE : MAX_FILE_SIZE;
    if (f.size > limit) {
      toast.error(`File too large (max ${isVideo ? '8MB' : '5MB'})`);
      return;
    }
    setFile(f);
    if (f.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(f);
    } else {
      setPreview(null);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) processFile(f);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) processFile(f);
  }, []);

  const clearFile = () => {
    setFile(null);
    setPreview(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const getMediaCategory = (type: string) => {
    if (type.startsWith('image/')) return 'image';
    if (type.startsWith('video/')) return 'video';
    if (type.startsWith('audio/')) return 'audio';
    return 'document';
  };

  const handleSubmit = async () => {
    if (!content.trim() || !user) return;
    setPosting(true);

    let imageUrl: string | null = null;
    let mediaType: string | null = null;

    if (file) {
      const ext = file.name.split('.').pop();
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage.from('post-media').upload(path, file);
      if (uploadErr) {
        toast.error('Upload failed: ' + uploadErr.message);
        setPosting(false);
        return;
      }
      const { data: urlData } = supabase.storage.from('post-media').getPublicUrl(path);
      imageUrl = urlData.publicUrl;
      mediaType = getMediaCategory(file.type);
    }

    const formatTag = postFormat !== 'general' ? postFormat : null;
    const parsedTags = tags.split(',').map(t => t.trim().replace(/^#/, '')).filter(Boolean);
    if (formatTag && !parsedTags.includes(formatTag)) parsedTags.unshift(formatTag);

    const { error } = await (supabase.from as any)('posts').insert({
      user_id: user.id,
      content,
      tags: parsedTags,
      image_url: imageUrl,
      media_type: mediaType,
    });

    if (error) toast.error(error.message);
    else {
      toast.success('Posted!');
      setContent('');
      setTags('');
      setPostFormat('general');
      clearFile();
      onOpenChange(false);
      onCreated();
    }
    setPosting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-card border border-border/10 rounded-2xl shadow-2xl" aria-describedby="create-post-desc">
        <DialogHeader>
          <DialogTitle className="text-lg font-display font-bold">Create Post</DialogTitle>
          <p id="create-post-desc" className="text-sm text-muted-foreground">Choose a format and share with the community</p>
        </DialogHeader>
        <div className="space-y-4 mt-1 max-h-[65vh] overflow-y-auto pr-1">
          {/* Post format selector */}
          <div className="grid grid-cols-2 gap-2">
            {POST_FORMATS.map(({ id, label, icon: Icon, description }) => (
              <motion.button
                key={id}
                whileTap={{ scale: 0.96 }}
                onClick={() => setPostFormat(id)}
                className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${
                  postFormat === id
                    ? 'border-primary/30 bg-primary/[0.06] text-foreground'
                    : 'border-border/[0.08] bg-muted/5 text-muted-foreground hover:border-border/20'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${postFormat === id ? 'text-primary' : ''}`} />
                <div className="min-w-0">
                  <p className="text-xs font-medium leading-tight">{label}</p>
                  <p className="text-[10px] font-mono opacity-60 leading-tight">{description}</p>
                </div>
              </motion.button>
            ))}
          </div>

          <Textarea
            placeholder={
              postFormat === 'question' ? 'Ask your question...' :
              postFormat === 'announcement' ? 'Write your announcement...' :
              postFormat === 'idea' ? 'Share your idea...' :
              "What's on your mind?"
            }
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={4}
            maxLength={2000}
            className="bg-muted/15 border-border/[0.08] rounded-xl resize-none text-sm"
          />

          {/* Drag & drop zone */}
          {!file && (
            <div
              ref={dropRef}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => {
                if (fileRef.current) {
                  fileRef.current.accept = ALL_ALLOWED.join(',');
                  fileRef.current.click();
                }
              }}
              className={`flex flex-col items-center justify-center gap-2 p-6 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
                isDragging
                  ? 'border-primary/40 bg-primary/[0.06]'
                  : 'border-border/[0.12] bg-muted/5 hover:border-border/25 hover:bg-muted/10'
              }`}
            >
              <Upload className={`w-6 h-6 ${isDragging ? 'text-primary' : 'text-muted-foreground/40'}`} />
              <div className="text-center">
                <p className="text-xs font-medium text-muted-foreground">
                  {isDragging ? 'Drop file here' : 'Drag & drop or click to upload'}
                </p>
                <p className="text-[10px] font-mono text-muted-foreground/50 mt-0.5">
                  Images, Videos, Audio, Documents
                </p>
              </div>
              <div className="flex gap-3 mt-1">
                <Image className="w-3.5 h-3.5 text-muted-foreground/30" />
                <Video className="w-3.5 h-3.5 text-muted-foreground/30" />
                <Music className="w-3.5 h-3.5 text-muted-foreground/30" />
                <FileText className="w-3.5 h-3.5 text-muted-foreground/30" />
              </div>
            </div>
          )}

          <input ref={fileRef} type="file" className="hidden" onChange={handleFileSelect} />

          {/* File preview */}
          {file && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/10 border border-border/[0.08]">
              {preview ? (
                <img src={preview} alt="" className="w-14 h-14 rounded-lg object-cover" />
              ) : (
                <div className="w-14 h-14 rounded-lg bg-accent/10 flex items-center justify-center">
                  {file.type.startsWith('video') ? <Video className="w-5 h-5 text-accent" /> :
                   file.type.startsWith('audio') ? <Music className="w-5 h-5 text-accent" /> :
                   <FileText className="w-5 h-5 text-accent" />}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-[10px] font-mono text-muted-foreground">{(file.size / 1024).toFixed(0)} KB</p>
              </div>
              <button onClick={clearFile} className="text-muted-foreground hover:text-destructive transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <Input
            placeholder="Tags (comma separated)"
            value={tags}
            onChange={e => setTags(e.target.value)}
            className="bg-muted/15 border-border/[0.08] rounded-xl font-mono text-sm"
          />

          <Button onClick={handleSubmit} disabled={posting || !content.trim()} className="w-full rounded-xl btn-bio">
            {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Publish'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePostDialog;
