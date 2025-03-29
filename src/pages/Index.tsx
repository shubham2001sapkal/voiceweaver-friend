
import { Header } from "@/components/Header";
import { VoiceForm } from "@/components/ResponsiveVoiceForm";
import { Footer } from "@/components/Footer";
import { useEffect, useState, useRef } from "react";
import { useToast } from "@/components/ui/use-toast";
import { TypewriterEffect } from "@/components/TypewriterEffect";
import { useSupabase } from "@/context/SupabaseContext";
import { useIsMobile } from "@/hooks/use-mobile";

const Index = () => {
  const { toast } = useToast();
  const supabaseContext = useSupabase();
  const { checkConnection } = supabaseContext;
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'failed'>('checking');
  const hasToastBeenShown = useRef(false);
  const isMobile = useIsMobile();
  
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
        <div className="w-full mx-auto px-2 sm:px-4 py-4 sm:py-6 md:py-12">
          <div className="text-center mb-4 sm:mb-8 md:mb-12">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-3 md:mb-4 text-voiceback dark:text-primary">
              AI Voice Cloning
            </h1>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl max-w-3xl mx-auto text-gray-600 dark:text-gray-300 px-2">
              Restore your voice with the power of AI. Perfect for those who have lost their voice due to medical conditions.
            </p>
          </div>
          
          <VoiceForm />

          <div className="text-center mt-6 sm:mt-8 md:mt-12 mb-3 sm:mb-4 md:mb-6">
            <TypewriterEffect 
              text="For people who lost their voice, VoiceBack restores their ability to speak using AI" 
              className={`${isMobile ? 'text-xs' : 'text-sm md:text-base'} text-gray-600 dark:text-gray-400 italic`}
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
