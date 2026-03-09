import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
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
          console.error('OAuth code exchange failed:', error);
          navigate(`/auth?error=${encodeURIComponent(error.message)}`, { replace: true });
          return;
        }
      }

      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Auth callback error:', error);
        navigate('/auth?error=auth_failed', { replace: true });
        return;
      }

      navigate(session?.user ? '/' : '/auth', { replace: true });
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
