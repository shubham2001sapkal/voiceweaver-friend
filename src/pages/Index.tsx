
import { Header } from "@/components/Header";
import { VoiceForm } from "@/components/VoiceForm";
import { Footer } from "@/components/Footer";
import { useEffect, useState, useRef } from "react";
import { useToast } from "@/components/ui/use-toast";
import { TypewriterEffect } from "@/components/TypewriterEffect";
import { useSupabase } from "@/context/SupabaseContext";

const Index = () => {
  const { toast } = useToast();
  const supabaseContext = useSupabase();
  const { checkConnection } = supabaseContext;
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'failed'>('checking');
  const hasToastBeenShown = useRef(false);
  
  useEffect(() => {
    const verifyConnection = async () => {
      if (!checkConnection) return;
      
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
  }, [checkConnection, toast]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-gray-900">
      <Header />
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-12">
          <div className="text-center mb-8 md:mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-voiceback dark:text-primary">
              AI Voice Cloning
            </h1>
            <p className="text-base sm:text-lg md:text-xl max-w-3xl mx-auto text-gray-600 dark:text-gray-300">
              Restore your voice with the power of AI. Perfect for those who have lost their voice due to medical conditions.
            </p>
          </div>
          
          <VoiceForm />

          <div className="text-center mt-8 md:mt-12 mb-6">
            <TypewriterEffect 
              text="For people who lost their voice, VoiceBack restores their ability to speak using AI" 
              className="text-sm sm:text-base text-gray-600 dark:text-gray-400 italic"
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
