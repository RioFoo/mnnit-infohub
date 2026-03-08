import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, Image, Video, Music, FileText, X } from 'lucide-react';
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

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB for non-video
const MAX_VIDEO_SIZE = 8 * 1024 * 1024; // 8MB for video

const CreatePostDialog = ({ open, onOpenChange, onCreated }: CreatePostDialogProps) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;

    if (!ALL_ALLOWED.includes(f.type)) {
      toast.error('Unsupported file type');
      return;
    }
    if (f.size > MAX_FILE_SIZE) {
      toast.error('File too large (max 5MB)');
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

    const parsedTags = tags.split(',').map(t => t.trim().replace(/^#/, '')).filter(Boolean);
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
      clearFile();
      onOpenChange(false);
      onCreated();
    }
    setPosting(false);
  };

  const mediaButtons = [
    { icon: Image, label: 'Image', accept: ALLOWED_TYPES.image.join(',') },
    { icon: Video, label: 'Video', accept: ALLOWED_TYPES.video.join(',') },
    { icon: Music, label: 'Audio', accept: ALLOWED_TYPES.audio.join(',') },
    { icon: FileText, label: 'Doc', accept: ALLOWED_TYPES.document.join(',') },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-card border border-border/10 rounded-2xl shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-display font-bold">Create Post</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <Textarea
            placeholder="What's on your mind?"
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={4}
            maxLength={2000}
            className="bg-muted/15 border-border/[0.08] rounded-xl resize-none text-sm"
          />

          {/* Media buttons */}
          <div className="flex items-center gap-2">
            {mediaButtons.map(({ icon: Icon, label, accept }) => (
              <motion.button
                key={label}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  if (fileRef.current) {
                    fileRef.current.accept = accept;
                    fileRef.current.click();
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-muted/10 border border-border/[0.08] text-xs font-mono text-muted-foreground hover:text-foreground hover:border-primary/20 transition-all"
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </motion.button>
            ))}
          </div>

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
