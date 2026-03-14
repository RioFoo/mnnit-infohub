import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const url = new URL(window.location.href);
        const providerError = url.searchParams.get('error_description') || url.searchParams.get('error');

        if (providerError) {
          navigate(`/auth?error=${encodeURIComponent(providerError)}`, { replace: true });
          return;
        }

        const code = url.searchParams.get('code');
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            navigate(`/auth?error=${encodeURIComponent(error.message)}`, { replace: true });
            return;
          }
        }

        const { data: { session } } = await supabase.auth.getSession();
        
        // Block non-MNNIT emails from OAuth sign-in
        if (session?.user?.email && !session.user.email.endsWith('@mnnit.ac.in')) {
          await supabase.auth.signOut();
          navigate('/auth?error=Only%20%40mnnit.ac.in%20email%20addresses%20are%20allowed', { replace: true });
          return;
        }

        navigate(session?.user ? '/' : '/auth', { replace: true });
      } catch {
        navigate('/auth?error=auth_callback_failed', { replace: true });
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
        <p className="text-foreground font-mono">Completing sign in...</p>
        <p className="text-muted-foreground text-sm mt-1">Please wait</p>
      </div>
    </div>
  );
};

export default AuthCallback;
