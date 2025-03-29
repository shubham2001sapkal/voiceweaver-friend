
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
    playAudio,
    handleSampleReady,
    toggleSavedSamples
  };
}
