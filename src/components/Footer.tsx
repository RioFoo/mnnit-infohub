import InfoHubLogo from '@/components/InfoHubLogo';
import { Github, ExternalLink } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const Footer = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const handleGitHubClick = () => {
    if (profile?.github_url) {
      window.open(profile.github_url, '_blank', 'noopener,noreferrer');
    } else if (user) {
      toast.info('Link your GitHub in Profile → Edit Profile');
      navigate('/profile');
    } else {
      toast.info('Sign in to link your GitHub profile');
      navigate('/auth');
    }
  };

  return (
    <footer className="border-t border-border/10 bg-background/60 backdrop-blur-sm py-8 px-6">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2.5">
          <InfoHubLogo size={22} />
          <span className="font-display font-bold text-sm tracking-tight text-foreground/80">INFOHUB</span>
        </div>

        <nav className="flex items-center gap-5 text-xs text-muted-foreground">
          <a href="/explore" className="hover:text-foreground transition-colors">Explore</a>
          <a href="/campus" className="hover:text-foreground transition-colors">Campus</a>
          <a href="/resources" className="hover:text-foreground transition-colors">Resources</a>
          <button
            onClick={handleGitHubClick}
            className="hover:text-foreground transition-colors inline-flex items-center gap-1"
          >
            <Github className="w-3.5 h-3.5" />
            {profile?.github_url ? 'My GitHub' : 'Link GitHub'}
          </button>
        </nav>

        <p className="text-[11px] text-muted-foreground/60 font-mono">
          © {new Date().getFullYear()} MNNIT InfoHub
        </p>
      </div>
    </footer>
  );
};

export default Footer;
