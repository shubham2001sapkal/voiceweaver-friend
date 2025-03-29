import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { VoiceRecorder } from "./VoiceRecorder";
import { elevenlabsService } from "@/services/elevenlabs";
import { Mic, Play, AlertCircle, Wand2, VolumeX, Volume2, ExternalLink } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useSupabase } from "@/context/SupabaseContext";

export function VoiceForm() {
  const [voiceSample, setVoiceSample] = useState<Blob | null>(null);
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [generatedAudio, setGeneratedAudio] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [apiKey, setApiKey] = useState(elevenlabsService.getApiKey() || "");
  const [isConnected, setIsConnected] = useState<boolean>(!!elevenlabsService.getApiKey());
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [savedVoiceSamples, setSavedVoiceSamples] = useState<any[]>([]);
  const [selectedSavedVoice, setSelectedSavedVoice] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { toast } = useToast();
  const { supabase } = useSupabase();

  useEffect(() => {
    const checkConnection = async () => {
      const apiKey = elevenlabsService.getApiKey();
      if (apiKey) {
        try {
          await elevenlabsService.getAvailableVoices();
          setIsConnected(true);
          
          toast({
            title: "Connected to ElevenLabs",
            description: "Successfully connected to ElevenLabs API",
          });
        } catch (error) {
          console.error("Failed to connect to ElevenLabs", error);
          setIsConnected(false);
          
          toast({
            title: "ElevenLabs Connection Failed",
            description: "Please check your API key",
            variant: "destructive",
          });
        }
      }
    };
    
    checkConnection();
    fetchSavedVoiceSamples();
  }, [toast]);

  const fetchSavedVoiceSamples = async () => {
    try {
      const { data, error } = await supabase
        .from('voice_logs')
        .select('*')
        .eq('type', 'voice_sample')
        .eq('success', true)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      if (data && data.length > 0) {
        setSavedVoiceSamples(data);
        toast({
          title: "Voice Samples Retrieved",
          description: `Found ${data.length} saved voice samples.`,
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

  const handleSampleReady = (blob: Blob) => {
    setVoiceSample(blob);
    
    toast({
      title: "Voice Sample Ready",
      description: "Your voice sample is ready for cloning.",
    });
  };

  const handleGenerateVoice = async () => {
    if (!voiceSample && !selectedSavedVoice) {
      toast({
        title: "Missing Voice Sample",
        description: "Please upload, record, or select a saved voice sample first.",
        variant: "destructive",
      });
      return;
    }

    if (!text.trim()) {
      toast({
        title: "Missing Text",
        description: "Please enter the text you want to convert to speech.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);

      if (!elevenlabsService.getApiKey()) {
        setIsSettingsOpen(true);
        setIsLoading(false);
        return;
      }

      try {
        let voiceId;
        
        if (selectedSavedVoice && !voiceSample) {
          const selectedVoice = savedVoiceSamples.find(sample => sample.id === selectedSavedVoice);
          if (selectedVoice && selectedVoice.audio_url) {
            try {
              const response = await fetch(selectedVoice.audio_url);
              const audioBlob = await response.blob();
              voiceId = await elevenlabsService.cloneVoice(audioBlob, "Saved Voice");
              
              toast({
                title: "Saved Voice Retrieved",
                description: "Successfully retrieved your saved voice sample.",
              });
            } catch (error: any) {
              throw new Error(`Failed to retrieve saved voice sample: ${error.message}`);
            }
          } else {
            throw new Error("Selected voice sample not found or invalid.");
          }
        } else {
          voiceId = await elevenlabsService.cloneVoice(voiceSample!, "My Voice");
        }
        
        toast({
          title: "Voice Cloned Successfully",
          description: "Your voice has been cloned. Now generating speech...",
        });
        
        const audioBlob = await elevenlabsService.textToSpeech(text, voiceId);
        
        const audioUrl = URL.createObjectURL(audioBlob);
        setGeneratedAudio(audioUrl);

        await supabase.from('voice_logs').insert({
          text: text,
          audio_url: audioUrl,
          success: true,
          type: 'generated_speech'
        });

        toast({
          title: "Voice Generated Successfully",
          description: "Your text has been converted to speech with your voice!",
          variant: "default",
          className: "bg-green-100 border-green-400 dark:bg-green-900/20",
        });
      } catch (error: any) {
        if (error.message && error.message.includes("subscription does not include voice cloning")) {
          await supabase.from('voice_logs').insert({
            text: text,
            success: false,
            error_message: "Subscription does not include voice cloning",
            type: 'error'
          });
          
          toast({
            title: "Subscription Required",
            description: "Voice cloning requires a paid ElevenLabs subscription. Please upgrade your plan.",
            variant: "destructive",
          });
        } else {
          throw error;
        }
      }
    } catch (error: any) {
      console.error("Error generating voice:", error);
      
      await supabase.from('voice_logs').insert({
        text: text || "Voice generation attempt",
        success: false,
        error_message: error.message || "Unknown error",
        type: 'error'
      });
      
      toast({
        title: "Voice Generation Failed",
        description: error.message || "Failed to generate voice. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const playAudio = () => {
    if (audioRef.current && generatedAudio) {
      if (isMuted) {
        audioRef.current.muted = true;
      } else {
        audioRef.current.muted = false;
      }
      audioRef.current.play();
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
  };

  const saveApiKey = async () => {
    if (apiKey.trim()) {
      elevenlabsService.setApiKey(apiKey.trim());
      setIsSettingsOpen(false);
      
      try {
        await elevenlabsService.getAvailableVoices();
        setIsConnected(true);
        
        toast({
          title: "API Key Saved",
          description: "Successfully connected to ElevenLabs API",
        });
      } catch (error) {
        console.error("Failed to connect with the provided API key", error);
        setIsConnected(false);
        
        toast({
          title: "Connection Failed",
          description: "The API key you provided seems to be invalid.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Invalid API Key",
        description: "Please enter a valid API key.",
        variant: "destructive",
      });
    }
  };

  const handleSelectSavedVoice = (voiceId: string) => {
    setSelectedSavedVoice(voiceId);
    setVoiceSample(null);
    
    toast({
      title: "Saved Voice Selected",
      description: "You'll use this saved voice sample for generation.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-voiceback dark:text-primary flex items-center justify-center gap-2">
            <Mic className="h-6 w-6" /> VoiceBack
          </h1>
          <p className="text-muted-foreground mt-2">
            Restore your voice with the power of AI
          </p>
          
          {isConnected ? (
            <div className="flex items-center justify-center mt-2 text-sm text-green-600 dark:text-green-400">
              <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
              Connected to ElevenLabs
            </div>
          ) : (
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="flex items-center justify-center mt-2 text-sm text-red-600 dark:text-red-400 hover:underline"
            >
              <div className="h-2 w-2 rounded-full bg-red-500 mr-2"></div>
              Not connected to ElevenLabs - Click to connect
            </button>
          )}
        </div>

        {isConnected && (
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Subscription Notice</AlertTitle>
            <AlertDescription>
              Voice cloning requires a paid ElevenLabs subscription.{" "}
              <a 
                href="https://elevenlabs.io/subscription" 
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-primary underline hover:text-primary/90"
              >
                Upgrade your plan <ExternalLink className="ml-1 h-3 w-3" />
              </a>
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div>
            <Label htmlFor="voice-sample">Voice Sample</Label>
            <div className="mt-2">
              <VoiceRecorder onSampleReady={handleSampleReady} />
            </div>
            {voiceSample && (
              <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                ✓ Voice sample ready
              </p>
            )}
          </div>
          
          {savedVoiceSamples.length > 0 && (
            <div>
              <Label>Saved Voice Samples</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {savedVoiceSamples.slice(0, 5).map((sample) => (
                  <Button
                    key={sample.id}
                    variant={selectedSavedVoice === sample.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleSelectSavedVoice(sample.id)}
                  >
                    {new Date(sample.created_at).toLocaleDateString()}
                  </Button>
                ))}
              </div>
              {selectedSavedVoice && (
                <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                  ✓ Using saved voice sample
                </p>
              )}
            </div>
          )}

          <div>
            <Label htmlFor="text-input">What would you like to say?</Label>
            <Textarea
              id="text-input"
              placeholder="Type what you want to say..."
              className="mt-2 min-h-[100px]"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-4">
            <Button
              onClick={handleGenerateVoice}
              className="bg-voiceback hover:bg-voiceback/90"
              disabled={isLoading || !isConnected || (!voiceSample && !selectedSavedVoice)}
              title={!isConnected ? "Connect to ElevenLabs first" : ""}
            >
              {isLoading ? (
                "Generating..."
              ) : (
                <>
                  <Wand2 className="h-4 w-4 mr-2" /> Clone & Generate Voice
                </>
              )}
            </Button>
          </div>

          {generatedAudio && (
            <div className="mt-4 p-3 bg-secondary rounded-md flex items-center justify-between">
              <span className="text-sm font-medium">Generated audio ready</span>
              <div className="flex gap-2 items-center">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={toggleMute}
                  className="w-8 h-8"
                >
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={playAudio}
                  className="flex items-center gap-1"
                >
                  <Play className="h-4 w-4" /> Play
                </Button>
                <a
                  href={generatedAudio}
                  download="voiceback-generated.mp3"
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground"
                >
                  Download
                </a>
              </div>
              <audio ref={audioRef} src={generatedAudio} />
            </div>
          )}
        </div>

        <div className="text-center mt-8 text-sm text-muted-foreground italic">
          "For people who lost their voice, VoiceBack restores their ability to speak using AI"
        </div>
      </div>

      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ElevenLabs API Key Required</DialogTitle>
            <DialogDescription>
              To generate voice, you need to enter your ElevenLabs API key. You can get a key by signing up at{" "}
              <a 
                href="https://elevenlabs.io" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-voiceback dark:text-primary underline"
              >
                elevenlabs.io
              </a>
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="api-key">ElevenLabs API Key</Label>
              <Input
                id="api-key"
                placeholder="Enter your API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
            </div>
            
            <div className="flex items-center p-3 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 rounded-md">
              <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
              <p className="text-sm">
                Your API key will be stored locally on your device. We never store or transmit your API key to our servers.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSettingsOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-voiceback hover:bg-voiceback/90" onClick={saveApiKey}>
              Save API Key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
