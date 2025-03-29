
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
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
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
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        toast({
          title: "Sign in failed",
          description: "Email or password is incorrect.",
          variant: "destructive",
        });
        throw error;
      }
      
      toast({
        title: "Welcome back!",
        description: "You've successfully signed in.",
      });
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

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      setLoading(true);
      
      console.log("Signing up with full name:", fullName); // Debug log
      
      // First, create the auth user with user metadata including full name
      const { data: authData, error: authError } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      });
      
      if (authError) {
        toast({
          title: "Sign up failed",
          description: authError.message || "An error occurred during sign up.",
          variant: "destructive",
        });
        throw authError;
      }
      
      // Check if the user was created successfully
      if (!authData.user) {
        const msg = "Failed to create user account";
        toast({
          title: "Sign up failed",
          description: msg,
          variant: "destructive",
        });
        throw new Error(msg);
      }
      
      // Now create a profile entry in the profiles table
      // Use upsert to ensure we don't create duplicate entries
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: authData.user.id,
          full_name: fullName, // Make sure this field matches the column name in Supabase
          email: email,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });
      
      if (profileError) {
        console.error("Error creating user profile:", profileError);
        console.error("Profile error details:", JSON.stringify(profileError));
        toast({
          title: "Profile creation issue",
          description: "Your account was created but there was an issue setting up your profile.",
          variant: "destructive",
        });
      } else {
        console.log("Profile created successfully for user:", authData.user.id);
        console.log("Profile data:", { id: authData.user.id, full_name: fullName, email });
      }
      
      // Log to verify user data is created correctly
      console.log("Created user with data:", authData.user);
      
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
