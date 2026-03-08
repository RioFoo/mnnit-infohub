import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Auth callback error:', error);
        navigate('/auth?error=auth_failed');
        return;
      }

      if (session?.user) {
        // Profile auto-creation is handled by the DB trigger + AuthContext
        navigate('/');
      } else {
        navigate('/auth');
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
