import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { VoiceRecorder } from "./VoiceRecorder";
import { elevenlabsService } from "@/services/elevenlabs";
import { saveVoiceRecording } from "@/services/voiceService";
import { Mic, Play, AlertCircle, Wand2, VolumeX, Volume2, ExternalLink, RefreshCw } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSupabase } from "@/context/SupabaseContext";
import { SavedVoices } from "./SavedVoices";
import { useIsMobile } from "@/hooks/use-mobile";

export function VoiceForm() {
  const [voiceSample, setVoiceSample] = useState<Blob | null>(null);
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingVoice, setIsGeneratingVoice] = useState(false);
  const [isGeneratingSpeech, setIsGeneratingSpeech] = useState(false);
  const [generatedAudio, setGeneratedAudio] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [apiKey, setApiKey] = useState(elevenlabsService.getApiKey() || "");
  const [availableVoices, setAvailableVoices] = useState<any[]>([]);
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>(elevenlabsService.getApiKey() ? "EXAVITQu4vr4xnSDxMaL" : "");
  const [isConnected, setIsConnected] = useState<boolean>(!!elevenlabsService.getApiKey());
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [voiceName, setVoiceName] = useState<string>("");
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { toast } = useToast();
  const { user } = useSupabase();
  const isMobile = useIsMobile();

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

    if (!voiceName.trim()) {
      toast({
        title: "Missing Voice Name",
        description: "Please enter a name for your voice.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsGeneratingVoice(true);

      if (!elevenlabsService.getApiKey()) {
        setIsSettingsOpen(true);
        setIsGeneratingVoice(false);
        return;
      }

      try {
        const savedVoice = await elevenlabsService.cloneVoice(voiceSample, voiceName);
        
        if (user) {
          await saveVoiceRecording({
            name: voiceName,
            voice_id: savedVoice.voice_id,
            user_id: user.id
          });
        }
        
        toast({
          title: "Voice Saved",
          description: "Your voice has been successfully cloned and saved!",
        });
        
        setIsSubmitted(true);
        setVoiceName("");
        setVoiceSample(null);
        
        window.location.reload();
        
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
      setIsGeneratingVoice(false);
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
      setIsGeneratingSpeech(true);

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
      setIsGeneratingSpeech(false);
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

  const refreshPage = () => {
    window.location.reload();
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg">
          <div className="p-6 flex flex-col items-center text-center h-full">
            <div className="w-16 h-16 bg-voiceback-100 dark:bg-voiceback-900/30 rounded-full flex items-center justify-center mb-4">
              <Mic className="h-8 w-8 text-voiceback dark:text-voiceback-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Record Your Voice</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Upload an audio sample or record your voice directly through your microphone.
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg">
          <div className="p-6 flex flex-col items-center text-center h-full">
            <div className="w-16 h-16 bg-voiceback-100 dark:bg-voiceback-900/30 rounded-full flex items-center justify-center mb-4">
              <Wand2 className="h-8 w-8 text-voiceback dark:text-voiceback-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Create Your Voice</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Our AI technology creates a digital clone of your voice that sounds just like you.
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg">
          <div className="p-6 flex flex-col items-center text-center h-full">
            <div className="w-16 h-16 bg-voiceback-100 dark:bg-voiceback-900/30 rounded-full flex items-center justify-center mb-4">
              <Volume2 className="h-8 w-8 text-voiceback dark:text-voiceback-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Generate Speech</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Type any text and hear it spoken in your voice or select from our preset voices.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-6 flex items-center">
              <span className="w-8 h-8 rounded-full bg-voiceback text-white flex items-center justify-center mr-2 text-sm">1</span>
              Create Your Voice
            </h2>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="voice-name" className="text-base">Name your voice</Label>
                <Input 
                  id="voice-name" 
                  placeholder="Enter a name for your voice"
                  value={voiceName}
                  onChange={(e) => setVoiceName(e.target.value)}
                  className="mt-2"
                />
              </div>
              
              <div>
                <Label htmlFor="voice-sample" className="text-base">Voice Sample</Label>
                <div className="mt-2 bg-gray-50 dark:bg-gray-700/30 p-4 rounded-md">
                  <VoiceRecorder onSampleReady={handleSampleReady} />
                </div>
              </div>
              
              <div className="flex flex-wrap gap-4 pt-2">
                <Button
                  onClick={handleGenerateVoice}
                  className="bg-voiceback hover:bg-voiceback-700 text-white flex-1"
                  disabled={isGeneratingVoice || isGeneratingSpeech || !isConnected || !voiceSample || !voiceName.trim()}
                  title={!isConnected ? "Connect to ElevenLabs first" : ""}
                >
                  {isGeneratingVoice ? (
                    "Saving..."
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4 mr-2" /> Clone & Save Voice
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={refreshPage}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" /> Refresh Voices
                </Button>
              </div>
              
              {!isConnected && (
                <button 
                  onClick={() => setIsSettingsOpen(true)}
                  className="w-full mt-2 text-sm text-voiceback dark:text-primary underline flex items-center justify-center gap-1"
                >
                  <AlertCircle className="h-3 w-3" /> Connect to ElevenLabs first
                </button>
              )}
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-6 flex items-center">
              <span className="w-8 h-8 rounded-full bg-voiceback text-white flex items-center justify-center mr-2 text-sm">2</span>
              Generate Speech
            </h2>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="text-input" className="text-base">What would you like to say?</Label>
                <Textarea
                  id="text-input"
                  placeholder="Type what you want to say..."
                  className="mt-2 min-h-[120px] bg-gray-50 dark:bg-gray-700/30"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
              </div>
              
              {isConnected && availableVoices.length > 0 && (
                <div>
                  <Label htmlFor="voice-select" className="text-base">Select a voice</Label>
                  <div className="mt-2">
                    <Select value={selectedVoiceId} onValueChange={setSelectedVoiceId}>
                      <SelectTrigger className="bg-gray-50 dark:bg-gray-700/30">
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
              
              {isConnected && selectedVoiceId && (
                <Button
                  onClick={handleUsePresetVoice}
                  className="w-full bg-voiceback hover:bg-voiceback/90 text-white"
                  disabled={isGeneratingSpeech || isGeneratingVoice || !text.trim() || !selectedVoiceId}
                >
                  {isGeneratingSpeech ? (
                    "Generating..."
                  ) : (
                    <>
                      <Volume2 className="h-4 w-4 mr-2" /> Generate Speech
                    </>
                  )}
                </Button>
              )}
              
              {isConnected && selectedVoiceId && (
                <SavedVoices 
                  onVoiceSelect={setSelectedVoiceId} 
                  text={text} 
                  selectedVoiceId={selectedVoiceId}
                />
              )}
              
              {generatedAudio && (
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-md">
                  <h3 className="font-medium mb-3">Generated Audio</h3>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
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
                    </div>
                    <a
                      href={generatedAudio}
                      download="voiceback-generated.mp3"
                      className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-md bg-voiceback text-white hover:bg-voiceback-700 transition-colors"
                    >
                      Download Audio
                    </a>
                  </div>
                  <audio ref={audioRef} src={generatedAudio} />
                </div>
              )}
            </div>
          </div>
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
