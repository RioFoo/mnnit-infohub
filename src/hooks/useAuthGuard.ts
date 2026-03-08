import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export const useAuthGuard = () => {
  const { user } = useAuth();
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [authMessage, setAuthMessage] = useState<string | undefined>();

  const requireAuth = useCallback((action: () => void, message?: string) => {
    if (user) {
      action();
    } else {
      setAuthMessage(message);
      setShowAuthPrompt(true);
    }
  }, [user]);

  return { showAuthPrompt, setShowAuthPrompt, authMessage, requireAuth, isAuthenticated: !!user };
};
