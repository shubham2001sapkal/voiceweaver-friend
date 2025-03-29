
import { CodeSquare, LogIn, UserPlus } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";

export function Header() {
  return (
    <header className="py-4 px-6 w-full border-b border-border/40 bg-secondary/30 backdrop-blur-sm">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <CodeSquare className="h-6 w-6 text-voiceback-500" />
            <span className="font-bold text-lg bg-gradient-to-r from-voiceback-500 to-voiceback-400 bg-clip-text text-transparent tracking-tight">
              Knoxed CreatiCode
            </span>
          </Link>
        </div>
        
        <div className="flex items-center gap-4">
          <Link to="/signin">
            <Button variant="outline" size="sm" className="gap-2">
              <LogIn className="h-4 w-4" />
              Sign In
            </Button>
          </Link>
          <Link to="/signup">
            <Button size="sm" className="gap-2">
              <UserPlus className="h-4 w-4" />
              Sign Up
            </Button>
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
