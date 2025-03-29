
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { VoiceRecorder } from "./VoiceRecorder";
import { elevenlabsService, SavedVoice } from "@/services/elevenlabs";
import { saveVoiceRecording } from "@/services/voiceService";
import { Mic, Play, AlertCircle, Wand2, VolumeX, Volume2, ExternalLink } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useSupabase } from "@/context/SupabaseContext";
import { SavedVoices } from "./SavedVoices";

export function VoiceForm() {
  const [voiceSample, setVoiceSample] = useState<Blob | null>(null);
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [generatedAudio, setGeneratedAudio] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [apiKey, setApiKey] = useState(elevenlabsService.getApiKey() || "");
  const [availableVoices, setAvailableVoices] = useState<any[]>([]);
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>(elevenlabsService.getApiKey() ? "EXAVITQu4vr4xnSDxMaL" : "");
  const [isConnected, setIsConnected] = useState<boolean>(!!elevenlabsService.getApiKey());
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [voiceName, setVoiceName] = useState<string>("");
  const audioRef = useRef<HTMLAudioElement>(null);
  const { toast } = useToast();
  const { user } = useSupabase();

  useEffect(() => {
    const checkConnection = async () => {
      const apiKey = elevenlabsService.getApiKey();
      if (apiKey) {
        try {
          const voices = await elevenlabsService.getAvailableVoices();
          setAvailableVoices(voices);
          setIsConnected(true);
          
          toast({
            title: "Connected to ElevenLabs",
            description: `Successfully connected with ${voices.length} available voices`,
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
  }, [toast]);

  const handleSampleReady = (blob: Blob) => {
    setVoiceSample(blob);
  };

  const handleGenerateVoice = async () => {
    if (!voiceSample) {
      toast({
        title: "Missing Voice Sample",
        description: "Please upload or record a voice sample first.",
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

    if (!voiceName.trim()) {
      toast({
        title: "Missing Voice Name",
        description: "Please enter a name for your voice.",
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
        // Clone the voice
        const savedVoice = await elevenlabsService.cloneVoice(voiceSample, voiceName);
        
        // Save to Supabase if user is logged in
        if (user) {
          await saveVoiceRecording({
            name: voiceName,
            voice_id: savedVoice.voice_id,
            user_id: user.id
          });
        }
        
        // Generate speech with the cloned voice
        const audioBlob = await elevenlabsService.textToSpeech(text, savedVoice.voice_id);
        
        const audioUrl = URL.createObjectURL(audioBlob);
        setGeneratedAudio(audioUrl);

        toast({
          title: "Voice Generated",
          description: "Your text has been converted to speech with your voice!",
        });
      } catch (error: any) {
        if (error.message && error.message.includes("subscription does not include voice cloning")) {
          toast({
            title: "Subscription Required",
            description: "Voice cloning requires a paid ElevenLabs subscription. Try using a preset voice instead.",
            variant: "destructive",
          });
        } else {
          throw error;
        }
      }
    } catch (error: any) {
      console.error("Error generating voice:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate voice. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUsePresetVoice = async () => {
    if (!text.trim()) {
      toast({
        title: "Missing Text",
        description: "Please enter the text you want to convert to speech.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedVoiceId) {
      toast({
        title: "No Voice Selected",
        description: "Please select a voice to use.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);

      const audioBlob = await elevenlabsService.textToSpeech(text, selectedVoiceId);
      
      const audioUrl = URL.createObjectURL(audioBlob);
      setGeneratedAudio(audioUrl);

      toast({
        title: "Voice Generated",
        description: "Your text has been converted to speech!",
      });
    } catch (error: any) {
      console.error("Error generating voice:", error);
      toast({
        title: "Error",
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
        const voices = await elevenlabsService.getAvailableVoices();
        setAvailableVoices(voices);
        setIsConnected(true);
        
        toast({
          title: "API Key Saved",
          description: `Successfully connected with ${voices.length} available voices`,
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
              Voice cloning requires a paid ElevenLabs subscription. If you don't have one,
              you can still use the preset voices.{" "}
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
              <div className="mt-2">
                <Label htmlFor="voice-name">Name your voice</Label>
                <Input 
                  id="voice-name" 
                  placeholder="Enter a name for your voice"
                  value={voiceName}
                  onChange={(e) => setVoiceName(e.target.value)}
                  className="mt-1"
                />
              </div>
            )}
          </div>

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

          {/* Use your saved voices section */}
          {isConnected && (
            <SavedVoices onVoiceSelect={setSelectedVoiceId} text={text} />
          )}

          {isConnected && availableVoices.length > 0 && (
            <div>
              <Label htmlFor="voice-select">Or use a preset voice</Label>
              <div className="mt-2">
                <Select value={selectedVoiceId} onValueChange={setSelectedVoiceId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a voice" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableVoices.map(voice => (
                      <SelectItem key={voice.voice_id} value={voice.voice_id}>
                        {voice.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-4">
            <Button
              onClick={handleGenerateVoice}
              className="bg-voiceback hover:bg-voiceback/90"
              disabled={isLoading || !isConnected || !voiceSample || !voiceName.trim()}
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

            {isConnected && selectedVoiceId && (
              <Button
                onClick={handleUsePresetVoice}
                variant="outline"
                disabled={isLoading || !isConnected}
              >
                {isLoading ? (
                  "Generating..."
                ) : (
                  <>
                    <Volume2 className="h-4 w-4 mr-2" /> Use Preset Voice
                  </>
                )}
              </Button>
            )}
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
