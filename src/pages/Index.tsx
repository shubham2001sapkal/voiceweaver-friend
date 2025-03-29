
import { Header } from "@/components/Header";
import { VoiceForm } from "@/components/VoiceForm";
import { Footer } from "@/components/Footer";
import { useSupabase } from "@/context/SupabaseContext";
import { useEffect, useState, useRef } from "react";
import { toast } from "@/components/ui/use-toast";

const Index = () => {
  const { checkConnection } = useSupabase();
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'failed'>('checking');
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
          } else {
            toast({
              title: "Connection Failed",
              description: "Failed to connect to Supabase",
              variant: "destructive",
            });
          }
        }
      } catch (error) {
        setConnectionStatus('failed');
        
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
  }, [checkConnection]);

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
        </div>
        <VoiceForm />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
