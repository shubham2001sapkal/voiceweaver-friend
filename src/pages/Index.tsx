
import { Header } from "@/components/Header";
import { VoiceForm } from "@/components/VoiceForm";
import { Footer } from "@/components/Footer";
import { useSupabase } from "@/context/SupabaseContext";
import { useEffect, useState, useRef } from "react";
import { toast } from "@/components/ui/use-toast";
import { TypewriterEffect } from "@/components/TypewriterEffect";

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
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-gray-900">
      <Header />
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-voiceback dark:text-primary">
              AI Voice Cloning
            </h1>
            <p className="text-lg md:text-xl max-w-3xl mx-auto text-gray-600 dark:text-gray-300">
              Restore your voice with the power of AI. Perfect for those who have lost their voice due to medical conditions.
            </p>
          </div>
          
          <div className="flex items-center justify-center gap-2 mb-8">
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
          
          <VoiceForm />

          <div className="text-center mt-12 mb-6">
            <TypewriterEffect 
              text="For people who lost their voice, VoiceBack restores their ability to speak using AI" 
              className="text-base text-gray-600 dark:text-gray-400 italic"
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
