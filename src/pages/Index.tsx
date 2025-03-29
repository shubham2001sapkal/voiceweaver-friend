
import { Header } from "@/components/Header";
import { VoiceForm } from "@/components/VoiceForm";
import { Footer } from "@/components/Footer";
import { useSupabase } from "@/context/SupabaseContext";
import { useEffect, useState, useRef } from "react";
import { toast } from "@/hooks/use-toast";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Info, AlertTriangle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
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

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 px-4 py-6">
        <div className="max-w-4xl mx-auto mb-6">
          <h2 className="text-xl font-bold mb-4">Supabase Connection Status</h2>
          
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className={`h-3 w-3 rounded-full ${
                connectionStatus === 'checking' ? 'bg-yellow-500' :
                connectionStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              <p className="text-sm">
                Database: {
                  connectionStatus === 'checking' ? 'Checking connection...' :
                  connectionStatus === 'connected' ? 'Connected' : 'Connection failed'
                }
              </p>
            </div>
            
            {connectionStatus === 'connected' && (
              <>
                <div className="flex items-center gap-2">
                  <div className={`h-3 w-3 rounded-full ${
                    logTableStatus === 'checking' ? 'bg-yellow-500' :
                    logTableStatus === 'available' ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  <p className="text-sm">
                    Voice Logs Table: {
                      logTableStatus === 'checking' ? 'Checking table...' :
                      logTableStatus === 'available' ? 'Table exists' : 'Table not found'
                    }
                  </p>
                </div>
                
                {logTableStatus === 'available' && (
                  <div className="flex items-center gap-2">
                    <div className={`h-3 w-3 rounded-full ${
                      rlsStatus === 'checking' ? 'bg-yellow-500' :
                      rlsStatus === 'configured' ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    <p className="text-sm">
                      RLS Policies: {
                        rlsStatus === 'checking' ? 'Checking policies...' :
                        rlsStatus === 'configured' ? 'Correctly configured' : 
                        user ? 'Need configuration despite being signed in' : 'Need configuration for anonymous access'
                      }
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
          
          {rlsStatus === 'not_configured' && !user && (
            <Alert className="mt-4 bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertTitle>Anonymous Access Blocked by RLS</AlertTitle>
              <AlertDescription>
                <p className="mb-2">You are currently not signed in, and the RLS policy is set to only allow authenticated users to insert records. You have two options:</p>
                <ol className="list-decimal pl-5 mb-3 space-y-1">
                  <li>Sign in to your account (recommended)</li>
                  <li>Update the RLS policy to allow anonymous access using this SQL in your Supabase dashboard:</li>
                </ol>
                <div className="bg-slate-800 text-slate-100 p-3 rounded-md overflow-x-auto mb-3">
                  <pre><code>CREATE POLICY "Enable insert for anonymous users" ON "public"."voice_logs"
AS PERMISSIVE FOR INSERT
TO anon
WITH CHECK (true);</code></pre>
                </div>
              </AlertDescription>
            </Alert>
          )}
          
          {rlsStatus === 'not_configured' && user && (
            <Alert className="mt-4 bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertTitle>User Authentication Issue</AlertTitle>
              <AlertDescription>
                <p className="mb-2">You're signed in but still unable to insert records. Check that:</p>
                <ol className="list-decimal pl-5 mb-3 space-y-1">
                  <li>Your RLS policy is correctly configured for the 'authenticated' role</li>
                  <li>The session token is being properly passed in requests</li>
                </ol>
              </AlertDescription>
            </Alert>
          )}
        </div>
        
        <VoiceForm />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
