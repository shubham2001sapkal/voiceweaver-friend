
import { CodeSquare, Home, Info, LogIn } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "./ui/button";
import { Link, useLocation } from "react-router-dom";
import { useSupabase } from "@/context/SupabaseContext";

export function Header() {
  // Get the user from context, defaulting to null if context isn't ready yet
  const supabaseContext = useSupabase();
  const user = supabaseContext?.user || null;
  const location = useLocation();
  const isAboutPage = location.pathname === "/about";

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
        <div className="flex items-center gap-3">
          {!user && (
            <>
              <Button 
                variant="outline" 
                size="sm" 
                asChild
                className="flex items-center gap-1.5"
              >
                <Link to="/signin">
                  <LogIn className="h-4 w-4" />
                  Sign In
                </Link>
              </Button>
              <Button 
                size="sm" 
                asChild
                className="flex items-center gap-1.5"
              >
                <Link to="/signup">
                  Sign Up
                </Link>
              </Button>
            </>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            asChild
            className="flex items-center gap-1.5"
          >
            {isAboutPage ? (
              <Link to="/">
                <Home className="h-4 w-4" />
                Home
              </Link>
            ) : (
              <Link to="/about">
                <Info className="h-4 w-4" />
                About Us
              </Link>
            )}
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
