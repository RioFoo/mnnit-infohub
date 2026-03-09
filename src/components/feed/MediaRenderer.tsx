import { useState } from 'react';
import { FileText, Download, Play, ImageOff } from 'lucide-react';

interface MediaRendererProps {
  url: string;
  mediaType: string | null;
}

const MediaRenderer = ({ url, mediaType }: MediaRendererProps) => {
  const [imgError, setImgError] = useState(false);

  if (!url) return null;

  const type = mediaType?.toLowerCase() || '';

  // Image
  if (type.startsWith('image') || (!type && /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url))) {
    if (imgError) {
      return (
        <div className="mt-3 rounded-xl overflow-hidden border border-border/[0.06] bg-muted/10 flex items-center justify-center h-40">
          <div className="text-center text-muted-foreground/40">
            <ImageOff className="w-8 h-8 mx-auto mb-2" />
            <p className="text-xs font-mono">Image unavailable</p>
          </div>
        </div>
      );
    }
    return (
      <div className="mt-3 rounded-xl overflow-hidden border border-border/[0.06]">
        <img
          src={url}
          alt=""
          className="max-h-80 object-cover w-full"
          loading="lazy"
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  // Video
  if (type.startsWith('video') || /\.(mp4|webm|mov|avi)$/i.test(url)) {
    return (
      <div className="mt-3 rounded-xl overflow-hidden border border-border/[0.06] bg-muted/10">
        <video controls className="w-full max-h-80" preload="metadata">
          <source src={url} type={type || 'video/mp4'} />
          Your browser does not support video.
        </video>
      </div>
    );
  }

  // Audio
  if (type.startsWith('audio') || /\.(mp3|wav|ogg|m4a|aac)$/i.test(url)) {
    return (
      <div className="mt-3 p-4 rounded-xl border border-border/[0.06] bg-muted/10 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <Play className="w-4 h-4 text-primary" />
        </div>
        <audio controls className="flex-1 h-10" preload="metadata">
          <source src={url} type={type || 'audio/mpeg'} />
        </audio>
      </div>
    );
  }

  // Document / other files
  const fileName = url.split('/').pop()?.split('?')[0] || 'Document';
  return (
    <div className="mt-3 p-4 rounded-xl border border-border/[0.06] bg-muted/10 flex items-center gap-3 group/doc cursor-pointer hover:border-primary/20 transition-colors">
      <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
        <FileText className="w-5 h-5 text-accent" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{fileName}</p>
        <p className="text-[10px] font-mono text-muted-foreground uppercase">{type || 'document'}</p>
      </div>
      <a href={url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}>
        <Download className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors" />
      </a>
    </div>
  );
};

export default MediaRenderer;
