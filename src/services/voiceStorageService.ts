
import { useToast } from "@/hooks/use-toast";
import { useSupabase } from "@/context/SupabaseContext";

export function useVoiceStorageService(supabase: any) {
  const { toast } = useToast();
  const { user } = useSupabase();

  const saveVoiceSampleToSupabase = async (blob: Blob): Promise<void> => {
    try {
      // Convert blob to base64 for storage
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      
      return new Promise((resolve, reject) => {
        reader.onloadend = async () => {
          try {
            // The result contains the base64 encoded data
            const base64data = reader.result as string;
            
            // Prepare the data to be sent to Supabase
            const voiceLogData = {
              text: 'Voice sample recording',
              audio_data: base64data,
              audio_url: null, // We're storing the data directly, not a URL
              type: 'voice_sample'
            };
            
            // Log the structure of data being sent (without the actual base64 for brevity)
            console.log('Sending to Supabase voice_logs:', {
              ...voiceLogData,
              audio_data: 'base64_data_too_long_to_display'
            });
            
            // Insert the voice sample record
            const { data, error } = await supabase.from('voice_logs').insert(voiceLogData);

            console.log('Supabase response:', { data, error });

            if (error) {
              if (error.code === '42501') {
                // This is a Row Level Security error
                if (user) {
                  toast({
                    title: "Permission Error",
                    description: "Unable to save voice sample despite being signed in. Please check your Supabase RLS policies.",
                    variant: "destructive",
                  });
                } else {
                  toast({
                    title: "Authentication Required",
                    description: "You need to be signed in to save voice samples, or update your RLS policies to allow anonymous access.",
                    variant: "destructive",
                  });
                }
                reject(error);
              } else {
                toast({
                  title: "Error Saving Voice Sample",
                  description: error.message || "There was an error saving your voice sample.",
                  variant: "destructive",
                });
                reject(error);
              }
            } else {
              toast({
                title: "Voice Sample Saved",
                description: "Your voice sample was successfully saved to the database.",
                variant: "default",
                className: "bg-green-100 border-green-400 dark:bg-green-900/20",
              });
              resolve();
            }
          } catch (error) {
            reject(error);
          }
        };
        
        reader.onerror = () => {
          reject(new Error("Failed to read file"));
        };
      });
    } catch (error: any) {
      console.error('Failed to save voice sample:', error);
      
      toast({
        title: "Failed to Save Voice Sample",
        description: error.message || "There was an error saving your voice sample.",
        variant: "destructive",
      });
      throw error;
    }
  };

  return { saveVoiceSampleToSupabase };
}
