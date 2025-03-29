
import { Header } from "@/components/Header";
import { VoiceForm } from "@/components/VoiceForm";
import { Footer } from "@/components/Footer";
import { useSupabase } from "@/context/SupabaseContext";
import { useEffect, useState, useRef } from "react";
import { toast } from "@/components/ui/use-toast";

const Index = () => {
  const { checkConnection, supabase } = useSupabase();
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'failed'>('checking');
  const [logTableStatus, setLogTableStatus] = useState<'checking' | 'available' | 'unavailable'>('checking');
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
              const { error } = await supabase.from('voice_logs').select('id').limit(1);
              
              if (error && (error.code === '42P01' || error.message.includes('does not exist'))) {
                setLogTableStatus('unavailable');
                toast({
                  title: "Voice Logs Table Missing",
                  description: "The voice_logs table is not available. Create it in your Supabase dashboard.",
                  variant: "destructive",
                });
              } else {
                setLogTableStatus('available');
                toast({
                  title: "Voice Logs Ready",
                  description: "Voice logs will be recorded in the voice_logs table",
                });
              }
            } catch (error) {
              setLogTableStatus('unavailable');
            }
          } else {
            setLogTableStatus('unavailable');
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
  }, [checkConnection, supabase]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 px-4 py-6">
        <div className="max-w-4xl mx-auto mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className={`h-3 w-3 rounded-full ${
              connectionStatus === 'checking' ? 'bg-yellow-500' :
              connectionStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Supabase: {
                connectionStatus === 'checking' ? 'Checking connection...' :
                connectionStatus === 'connected' ? 'Connected' : 'Connection failed'
              }
            </p>
          </div>
          
          {connectionStatus === 'connected' && (
            <div className="flex items-center gap-2 mb-4">
              <div className={`h-3 w-3 rounded-full ${
                logTableStatus === 'checking' ? 'bg-yellow-500' :
                logTableStatus === 'available' ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Voice Logs: {
                  logTableStatus === 'checking' ? 'Checking table...' :
                  logTableStatus === 'available' ? 'Ready to record logs' : 'Table not available'
                }
              </p>
            </div>
          )}
        </div>
        <VoiceForm />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
