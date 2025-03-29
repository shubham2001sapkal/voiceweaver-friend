
import { useState, useEffect, useRef } from "react";
import { useSupabase } from "@/context/SupabaseContext";
import { toast } from "@/hooks/use-toast";

export function useSupabaseConnection() {
  const { checkConnection, supabase, user } = useSupabase();
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'failed'>('checking');
  const [logTableStatus, setLogTableStatus] = useState<'checking' | 'available' | 'unavailable'>('checking');
  const [rlsStatus, setRlsStatus] = useState<'checking' | 'configured' | 'not_configured'>('checking');
  const hasToastBeenShown = useRef(false);
  
  useEffect(() => {
    const verifyConnection = async () => {
      try {
        const isConnected = await checkConnection();
        setConnectionStatus(isConnected ? 'connected' : 'failed');
        
        if (!hasToastBeenShown.current) {
          hasToastBeenShown.current = true;
          
          if (isConnected) {
            toast({
              title: "Supabase Connected",
              description: "Successfully connected to Supabase",
            });

            // Check if voice_logs table exists
            try {
              const { error: tableError } = await supabase.from('voice_logs').select('id').limit(1);
              
              if (tableError && (tableError.code === '42P01' || tableError.message.includes('does not exist'))) {
                setLogTableStatus('unavailable');
                toast({
                  title: "Voice Logs Table Missing",
                  description: "The voice_logs table is not available. Create it in your Supabase dashboard.",
                  variant: "destructive",
                });
              } else {
                setLogTableStatus('available');
                
                // Try an insert to test RLS policies
                const testData = {
                  text: 'RLS policy test',
                  type: 'voice_sample'
                };
                
                const { error: insertError } = await supabase.from('voice_logs').insert(testData);
                
                if (insertError && insertError.code === '42501') {
                  // This is an RLS policy error
                  if (user) {
                    // User is signed in but still getting RLS error
                    setRlsStatus('not_configured');
                    toast({
                      title: "RLS Policies Need Further Configuration",
                      description: "You're signed in, but RLS policies are still blocking inserts. Check your Supabase dashboard.",
                      variant: "destructive",
                    });
                  } else {
                    // User is not signed in, which is expected with the current RLS policy
                    setRlsStatus('not_configured');
                    toast({
                      title: "Authentication Required",
                      description: "Anonymous access is blocked by RLS. Sign in or update RLS policies to allow anonymous access.",
                      variant: "destructive",
                    });
                  }
                } else {
                  setRlsStatus('configured');
                  toast({
                    title: "Voice Logs Ready",
                    description: "Voice logs will be recorded in the voice_logs table",
                  });
                }
              }
            } catch (error) {
              setLogTableStatus('unavailable');
            }
          } else {
            setLogTableStatus('unavailable');
            setRlsStatus('not_configured');
            toast({
              title: "Connection Failed",
              description: "Failed to connect to Supabase",
              variant: "destructive",
            });
          }
        }
      } catch (error) {
        setConnectionStatus('failed');
        setLogTableStatus('unavailable');
        setRlsStatus('not_configured');
        
        if (!hasToastBeenShown.current) {
          hasToastBeenShown.current = true;
          toast({
            title: "Connection Error",
            description: "An error occurred while checking Supabase connection",
            variant: "destructive",
          });
        }
      }
    };
    
    verifyConnection();
  }, [checkConnection, supabase, user]);

  return {
    connectionStatus,
    logTableStatus,
    rlsStatus,
    user
  };
}
