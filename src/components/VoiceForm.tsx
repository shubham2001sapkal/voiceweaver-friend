
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useSupabase } from "@/context/SupabaseContext";
import { VoiceRecorder } from "@/components/VoiceRecorder";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { elevenLabsService, VoiceLogEntry } from "@/services/elevenlabs";
import { InfoCircle } from "lucide-react";

export function VoiceForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedSample, setSelectedSample] = useState<Blob | null>(null);
  const [savedVoiceSamples, setSavedVoiceSamples] = useState<VoiceLogEntry[]>([]);
  const [showSavedSamples, setShowSavedSamples] = useState(false);
  const [fetchStatus, setFetchStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const { toast } = useToast();
  const { supabase } = useSupabase();

  // Function to fetch saved voice samples from Supabase
  const fetchSavedVoiceSamples = async () => {
    try {
      setFetchStatus('loading');
      console.log('Attempting to fetch voice samples from voice_logs');
      
      // Query voice logs from the database
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

  // Add a function to use a saved voice sample for cloning
  const useSavedVoiceSample = (voiceLog: VoiceLogEntry) => {
    try {
      if (voiceLog.audio_data) {
        // Convert the base64 audio data back to a blob
        const byteCharacters = atob(voiceLog.audio_data.split(',')[1]);
        const byteNumbers = new Array(byteCharacters.length);
        
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'audio/webm' });
        
        // Set the selected sample and play it
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

  // Function to play the audio blob
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

  // Handle sample selection from the VoiceRecorder component
  const handleSampleReady = (blob: Blob) => {
    setSelectedSample(blob);
    console.log("Voice sample ready:", blob);
    
    toast({
      title: "Voice Sample Recorded",
      description: "Your voice sample has been processed and is ready for use.",
    });
  };

  // Toggle showing/hiding saved samples
  const toggleSavedSamples = () => {
    if (!showSavedSamples) {
      fetchSavedVoiceSamples();
    }
    setShowSavedSamples(!showSavedSamples);
  };

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm w-full max-w-4xl mx-auto">
      <div className="flex flex-col space-y-1.5 p-6">
        <h3 className="text-2xl font-semibold leading-none tracking-tight">Voice Cloning</h3>
        <p className="text-sm text-muted-foreground">
          Record a voice sample to be used for cloning.
        </p>
      </div>

      <div className="p-6 space-y-6">
        <Alert variant="default" className="bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800">
          <InfoCircle className="h-4 w-4" />
          <AlertTitle>Database Status</AlertTitle>
          <AlertDescription>
            Voice samples will be saved to your Supabase voice_logs table. Make sure Row Level Security (RLS) policies are properly configured.
          </AlertDescription>
        </Alert>

        <VoiceRecorder onSampleReady={handleSampleReady} />

        {selectedSample && (
          <div className="mt-4 p-4 border rounded-md bg-muted/50">
            <h4 className="font-medium mb-2">Selected Voice Sample</h4>
            <Button variant="outline" onClick={() => playAudio(selectedSample)}>
              Play Sample
            </Button>
          </div>
        )}

        <div className="mt-4">
          <Button variant="outline" onClick={toggleSavedSamples}>
            {showSavedSamples ? "Hide Saved Samples" : "Show Saved Samples"}
          </Button>

          {showSavedSamples && (
            <div className="mt-4 space-y-4">
              <h4 className="font-medium">Saved Voice Samples</h4>
              
              {fetchStatus === 'loading' && (
                <p className="text-muted-foreground">Loading saved voice samples...</p>
              )}
              
              {fetchStatus === 'error' && (
                <Alert variant="destructive">
                  <AlertTitle>Error Fetching Samples</AlertTitle>
                  <AlertDescription>
                    There was an error retrieving your saved voice samples. Check your database configuration.
                  </AlertDescription>
                </Alert>
              )}
              
              {fetchStatus === 'success' && savedVoiceSamples.length === 0 && (
                <p className="text-muted-foreground">No saved voice samples found.</p>
              )}
              
              {fetchStatus === 'success' && savedVoiceSamples.length > 0 && (
                <div className="grid gap-4 sm:grid-cols-2">
                  {savedVoiceSamples.map((sample, index) => (
                    <div key={sample.id || index} className="p-3 border rounded-md bg-background">
                      <p className="font-medium truncate">{sample.text}</p>
                      <p className="text-xs text-muted-foreground mb-2">
                        {new Date(sample.created_at || '').toLocaleString()}
                      </p>
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        onClick={() => useSavedVoiceSample(sample)}
                      >
                        Use This Sample
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default VoiceForm;
