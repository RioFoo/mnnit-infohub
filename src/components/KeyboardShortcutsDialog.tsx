import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { SHORTCUTS } from '@/hooks/useKeyboardShortcuts';
import { Keyboard } from 'lucide-react';

interface KeyboardShortcutsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const Kbd = ({ children }: { children: React.ReactNode }) => (
  <kbd className="inline-flex items-center justify-center min-w-[1.5rem] h-6 px-1.5 rounded-md border border-border/40 bg-muted/30 font-mono text-[10px] font-semibold text-foreground/80 shadow-[inset_0_-1px_0_hsl(var(--border)/0.5)]">
    {children}
  </kbd>
);

const renderCombo = (combo: string) => {
  const parts = combo.split(' ');
  return (
    <span className="inline-flex items-center gap-1">
      {parts.map((p, i) => (
        <span key={i} className="inline-flex items-center gap-1">
          <Kbd>{p.toUpperCase()}</Kbd>
          {i < parts.length - 1 && <span className="text-[10px] text-muted-foreground/50 font-mono">then</span>}
        </span>
      ))}
    </span>
  );
};

export const KeyboardShortcutsDialog = ({ open, onOpenChange }: KeyboardShortcutsDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Keyboard className="w-4 h-4 text-primary" />
            <DialogTitle className="font-display tracking-tight">Keyboard Shortcuts</DialogTitle>
          </div>
          <DialogDescription className="text-xs">
            Press <Kbd>G</Kbd> then a letter to navigate. Press <Kbd>?</Kbd> anytime to open this list.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 space-y-3">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-mono mb-2">Global</p>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-foreground/80">Open command palette</span>
                <span className="inline-flex items-center gap-1">
                  <Kbd>⌘</Kbd><Kbd>K</Kbd>
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-foreground/80">Show shortcuts</span>
                <Kbd>?</Kbd>
              </div>
            </div>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-mono mb-2">Navigation</p>
            <div className="space-y-1.5">
              {SHORTCUTS.map((s) => (
                <div key={s.combo} className="flex items-center justify-between text-xs">
                  <span className="text-foreground/80">{s.label}</span>
                  {renderCombo(s.combo)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
