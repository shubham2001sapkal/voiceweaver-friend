
import { createContext, useContext, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import { Session, User } from "@supabase/supabase-js";
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";

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

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, session?.user);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        throw error;
      }
    } catch (error: any) {
      toast({
        title: "Sign in failed",
        description: error.message || "An error occurred during sign in.",
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
      console.log("Signing up with:", { email, password, fullName });
      
      // Include user metadata with fullName
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            full_name: fullName || ""
          }
        }
      });
      
      if (error) {
        throw error;
      }
      
      console.log("Sign up successful:", data);
      
      // Verify user creation in profiles table (for debugging)
      if (data.user) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();
        
        console.log("Profile check:", { profileData, profileError });
      }
      
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
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Sign out failed",
        description: error.message || "An error occurred during sign out.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const checkConnection = async (): Promise<boolean> => {
    try {
      // Use a simpler ping that's more likely to succeed
      const { data, error } = await supabase.from('_dummy_query_for_ping').select('*').limit(1).maybeSingle();
      
      // The query will likely fail with a 404 error (table not found), but that's expected and means
      // the connection is working since we got a response from the server
      if (error && error.code === 'PGRST116' || error?.code === '42P01') {
        // Table doesn't exist, but connection is working
        return true;
      }
      
      // Any other response means we're connected
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
