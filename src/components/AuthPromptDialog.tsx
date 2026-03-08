import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { LogIn, UserPlus, Zap } from 'lucide-react';

interface AuthPromptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  message?: string;
}

export const AuthPromptDialog = ({ open, onOpenChange, message }: AuthPromptDialogProps) => {
  const navigate = useNavigate();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-strong max-w-sm text-center">
        <DialogHeader className="items-center">
          <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-2">
            <Zap className="w-7 h-7 text-primary" />
          </div>
          <DialogTitle className="font-mono text-lg">Join MNNIT InfoHub</DialogTitle>
          <DialogDescription className="text-sm">
            {message || 'Sign in to like posts, comment, follow users, and more!'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 mt-2">
          <Button
            className="w-full gap-2"
            onClick={() => { onOpenChange(false); navigate('/auth'); }}
          >
            <LogIn className="w-4 h-4" /> Sign In
          </Button>
          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={() => { onOpenChange(false); navigate('/auth?tab=register'); }}
          >
            <UserPlus className="w-4 h-4" /> Create Account
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
