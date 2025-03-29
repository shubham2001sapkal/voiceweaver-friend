
import { CodeSquare, Home, Info, UserPlus } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "./ui/button";
import { Link, useLocation } from "react-router-dom";
import { useSupabase } from "@/context/SupabaseContext";

export function Header() {
  // Get the user from context, defaulting to null if context isn't ready yet
  const supabaseContext = useSupabase();
  const user = supabaseContext?.user || null;
  const { signOut } = useSupabase();
  const location = useLocation();
  const isAboutPage = location.pathname === "/about";

  return (
    <header className="py-4 px-6 w-full border-b border-border/40 bg-secondary/30 backdrop-blur-sm">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center hover:opacity-80 transition-opacity">
            <CodeSquare className="h-6 w-6 text-voiceback-500" />
          </Link>
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            // Show user email and logout button when logged in
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground hidden sm:inline">
                {user.email}
              </span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => signOut()}
                className="text-destructive hover:text-destructive"
              >
                Log Out
              </Button>
            </div>
          ) : (
            // When not logged in, only show the signup button, removing the login button
            <div className="flex items-center gap-2">
              <Button 
                variant="default" 
                size="sm" 
                asChild
                className="flex items-center gap-1.5 bg-voiceback-500 hover:bg-voiceback-600"
              >
                <Link to="/signup">
                  <UserPlus className="h-4 w-4" />
                  Sign Up
                </Link>
              </Button>
            </div>
          )}
          
          <div className="flex items-center gap-2">
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
      </div>
    </header>
  );
}
