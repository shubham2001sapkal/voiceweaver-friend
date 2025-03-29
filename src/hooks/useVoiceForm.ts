
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useSupabase } from "@/context/SupabaseContext";
import { VoiceLogEntry } from "@/services/elevenlabs";

export function useVoiceForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedSample, setSelectedSample] = useState<Blob | null>(null);
  const [savedVoiceSamples, setSavedVoiceSamples] = useState<VoiceLogEntry[]>([]);
  const [showSavedSamples, setShowSavedSamples] = useState(false);
  const [fetchStatus, setFetchStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const { toast } = useToast();
  const { supabase } = useSupabase();

  const fetchSavedVoiceSamples = async () => {
    try {
      setFetchStatus('loading');
      console.log('Attempting to fetch voice samples from voice_logs');
      
      const { data, error } = await supabase
        .from('voice_logs')
        .select('*')
        .eq('type', 'voice_sample')
        .order('created_at', { ascending: false });
      
      console.log('Voice logs query result:', { data, error });
      
      if (error) {
        setFetchStatus('error');
        throw error;
      }
      
      if (data && data.length > 0) {
        setSavedVoiceSamples(data);
        setFetchStatus('success');
        console.log('Retrieved voice samples:', data);
        toast({
          title: "Voice Samples Retrieved",
          description: `Found ${data.length} saved voice samples.`,
        });
      } else {
        console.log('No voice samples found');
        setFetchStatus('success');
        toast({
          title: "No Voice Samples",
          description: "No saved voice samples found in the database.",
        });
      }
    } catch (error: any) {
      console.error("Error fetching voice samples:", error);
      setFetchStatus('error');
      toast({
        title: "Failed to Retrieve Voice Samples",
        description: error.message || "There was an error retrieving your saved voice samples.",
        variant: "destructive",
      });
    }
  };

  const useSavedVoiceSample = (voiceLog: VoiceLogEntry) => {
    try {
      if (voiceLog.audio_data) {
        const byteCharacters = atob(voiceLog.audio_data.split(',')[1]);
        const byteNumbers = new Array(byteCharacters.length);
        
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'audio/webm' });
        
        setSelectedSample(blob);
        playAudio(blob);
        
        toast({
          title: "Voice Sample Selected",
          description: "The saved voice sample has been loaded and is ready for cloning.",
        });
      } else {
        toast({
          title: "Invalid Voice Sample",
          description: "This voice sample doesn't contain audio data.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error using saved voice sample:", error);
      toast({
        title: "Error Using Voice Sample",
        description: error.message || "There was an error using this voice sample.",
        variant: "destructive",
      });
    }
  };

  const downloadSavedSample = (voiceLog: VoiceLogEntry) => {
    try {
      if (voiceLog.audio_data) {
        const byteCharacters = atob(voiceLog.audio_data.split(',')[1]);
        const byteNumbers = new Array(byteCharacters.length);
        
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'audio/webm' });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `voice-sample-${new Date().getTime()}.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        toast({
          title: "Voice Sample Downloaded",
          description: "Your voice sample has been downloaded.",
        });
      } else {
        toast({
          title: "Invalid Voice Sample",
          description: "This voice sample doesn't contain audio data.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error downloading voice sample:", error);
      toast({
        title: "Error Downloading Voice Sample",
        description: error.message || "There was an error downloading this voice sample.",
        variant: "destructive",
      });
    }
  };

  const playAudio = (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audio.play().catch(error => {
      console.error("Error playing audio:", error);
      toast({
        title: "Audio Playback Error",
        description: "Failed to play the audio sample.",
        variant: "destructive",
      });
    });
  };

  const handleSampleReady = (blob: Blob) => {
    setSelectedSample(blob);
    console.log("Voice sample ready:", blob);
    
    toast({
      title: "Voice Sample Recorded",
      description: "Your voice sample has been processed and is ready for use.",
    });
  };

  const handleSynthesizeVoice = async (text: string, audioBlob: Blob) => {
    try {
      setIsSubmitting(true);
      
      // Convert blob to base64 for storage
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      
      reader.onloadend = async () => {
        try {
          // The result contains the base64 encoded data
          const base64data = reader.result as string;
          
          // Prepare the data to be sent to Supabase
          const voiceLogData = {
            text: text,
            audio_data: base64data,
            type: 'voice_sample'
          };
          
          // Insert the voice sample record
          const { data, error } = await supabase.from('voice_logs').insert(voiceLogData);

          if (error) {
            throw error;
          }
          
          toast({
            title: "Voice Text Saved",
            description: "Your text and voice sample have been saved to the database.",
            variant: "default",
            className: "bg-green-100 border-green-400 dark:bg-green-900/20",
          });
          
          // Refresh the saved voice samples list if it's visible
          if (showSavedSamples) {
            fetchSavedVoiceSamples();
          }
        } catch (error: any) {
          console.error("Error saving synthesized voice:", error);
          toast({
            title: "Error Saving Voice",
            description: error.message || "There was an error saving your synthesized voice.",
            variant: "destructive",
          });
        } finally {
          setIsSubmitting(false);
        }
      };
      
      reader.onerror = () => {
        setIsSubmitting(false);
        toast({
          title: "Error Processing Audio",
          description: "Failed to process the audio data.",
          variant: "destructive",
        });
      };
    } catch (error: any) {
      console.error("Error in voice synthesis:", error);
      toast({
        title: "Voice Synthesis Error",
        description: error.message || "There was an error processing your request.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  const toggleSavedSamples = () => {
    if (!showSavedSamples) {
      fetchSavedVoiceSamples();
    }
    setShowSavedSamples(!showSavedSamples);
  };

  return {
    isSubmitting,
    setIsSubmitting,
    selectedSample,
    setSelectedSample,
    savedVoiceSamples,
    setSavedVoiceSamples,
    showSavedSamples,
    setShowSavedSamples,
    fetchStatus,
    setFetchStatus,
    fetchSavedVoiceSamples,
    useSavedVoiceSample,
    downloadSavedSample,
    playAudio,
    handleSampleReady,
    toggleSavedSamples,
    handleSynthesizeVoice
  };
}
