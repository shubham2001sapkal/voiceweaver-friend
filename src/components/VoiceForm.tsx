
  // This is another partial update to modify the fetchSavedVoiceSamples function
  
  const fetchSavedVoiceSamples = async () => {
    try {
      console.log('Attempting to fetch voice samples from voice_logs');
      
      // Simplify the query to just get all voice logs for now
      const { data, error } = await supabase
        .from('voice_logs')
        .select('*')
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
