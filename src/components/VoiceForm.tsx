
const fetchSavedVoiceSamples = async () => {
  try {
    console.log('Attempting to fetch voice samples from voice_logs');
    
    // Query voice logs from the database
    const { data, error } = await supabase
      .from('voice_logs')
      .select('*')
      .eq('type', 'voice_sample')
      .order('created_at', { ascending: false });
    
    console.log('Voice logs query result:', { data, error });
    
    if (error) {
      throw error;
    }
    
    if (data && data.length > 0) {
      setSavedVoiceSamples(data);
      console.log('Retrieved voice samples:', data);
      toast({
        title: "Voice Samples Retrieved",
        description: `Found ${data.length} saved voice samples.`,
      });
    } else {
      console.log('No voice samples found');
      toast({
        title: "No Voice Samples",
        description: "No saved voice samples found in the database.",
      });
    }
  } catch (error: any) {
    console.error("Error fetching voice samples:", error);
    toast({
      title: "Failed to Retrieve Voice Samples",
      description: error.message || "There was an error retrieving your saved voice samples.",
      variant: "destructive",
    });
  }
};

// Add a function to use a saved voice sample for cloning
const useSavedVoiceSample = (voiceLog: any) => {
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
