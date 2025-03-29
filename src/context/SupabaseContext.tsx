
import { createContext, useContext, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import { Session, User } from "@supabase/supabase-js";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { createUser, signInUser, ensureUserProfile } from "@/lib/database";

type SupabaseContextType = {
  supabase: typeof supabase;
  user: User | null;
  session: Session | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName?: string) => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
  checkConnection: () => Promise<boolean>;
};

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined);

export function SupabaseProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      // When a user signs in or signs up, ensure their profile exists
      if (event === 'SIGNED_IN' && session?.user) {
        try {
          const userData = session.user.user_metadata;
          await ensureUserProfile(session.user.id, { 
            full_name: userData.full_name || 'User' 
          });
        } catch (error) {
          console.error("Error ensuring user profile:", error);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { session } = await signInUser({ email, password });
      
      toast({
        title: "Welcome back!",
        description: "You've successfully signed in.",
      });
      
      return session;
    } catch (error: any) {
      toast({
        title: "Sign in failed",
        description: error.message || "Invalid email or password",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      setLoading(true);
      
      await createUser({ 
        email, 
        password,
        full_name: fullName
      });
      
      toast({
        title: "Account created",
        description: "Please check your email for a confirmation link.",
      });
    } catch (error: any) {
      toast({
        title: "Sign up failed",
        description: error.message || "An error occurred during sign up.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      toast({
        title: "Signed out",
        description: "You've been successfully signed out.",
      });
    } catch (error: any) {
      toast({
        title: "Sign out failed",
        description: error.message || "An error occurred during sign out.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const checkConnection = async (): Promise<boolean> => {
    try {
      const { data, error } = await supabase.from('profiles').select('count').limit(1);
      
      if (error && error.code !== 'PGRST116') {
        console.error("Supabase connection check failed:", error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Supabase connection check failed:", error);
      return false;
    }
  };

  const value = {
    supabase,
    user,
    session,
    signIn,
    signUp,
    signOut,
    loading,
    checkConnection,
  };

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  );
}

export function useSupabase() {
  const context = useContext(SupabaseContext);
  if (context === undefined) {
    throw new Error("useSupabase must be used within a SupabaseProvider");
  }
  return context;
}
