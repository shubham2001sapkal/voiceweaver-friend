
import { Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

export const Footer = () => {
  const isMobile = useIsMobile();
  
  return (
    <footer className="w-full border-t border-border bg-background py-6">
      <div className="container flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link to="/" className="flex items-center gap-2">
            <span className="font-semibold text-voiceback dark:text-primary">VoiceBack</span>
          </Link>
          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} VoiceBack. All rights reserved.
          </div>
        </div>
        
        <nav className={`flex ${isMobile ? 'flex-col items-center' : ''} gap-4 sm:gap-6`}>
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
            Home
          </Link>
          <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground">
            About
          </Link>
          <Link to="/signin" className="text-sm text-muted-foreground hover:text-foreground">
            Sign In
          </Link>
        </nav>
      </div>
    </footer>
  );
};
