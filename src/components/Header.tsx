
import { CodeSquare, LogOut, LogIn, UserPlus } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { useSupabase } from "@/context/SupabaseContext";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";

export function Header() {
  const { signOut, user } = useSupabase();
  const navigate = useNavigate();
  
  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };
  
  const navigateToLogin = () => {
    navigate("/login");
  };
  
  return (
    <header className="py-4 px-6 w-full border-b border-border/40 bg-secondary/30 backdrop-blur-sm">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div 
            className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer"
            onClick={() => navigate("/")}
          >
            <CodeSquare className="h-6 w-6 text-voiceback-500" />
            <span className="font-bold text-lg bg-gradient-to-r from-voiceback-500 to-voiceback-400 bg-clip-text text-transparent tracking-tight">
              Knoxed CreatiCode
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground hidden md:inline-block">
                {user.email}
              </span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleSignOut}
                className="text-muted-foreground"
              >
                <LogOut className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={navigateToLogin}
                className="flex items-center gap-1"
              >
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline">Log In</span>
              </Button>
              <Button 
                variant="default" 
                size="sm" 
                onClick={() => navigate("/login")}
                className="flex items-center gap-1 bg-voiceback-500 hover:bg-voiceback-600"
              >
                <UserPlus className="h-4 w-4" />
                <span className="hidden sm:inline">Sign Up</span>
              </Button>
            </div>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
