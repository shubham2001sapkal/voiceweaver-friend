
import { useState, useEffect, useRef } from "react";
import { elevenlabsService, SavedVoice } from "@/services/elevenlabs";
import { getVoiceLogs, VoiceLog } from "@/services/voiceLogService";
import { Button } from "@/components/ui/button";
import { Play, Volume2, VolumeX } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useSupabase } from "@/context/SupabaseContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface SavedVoicesProps {
  onVoiceSelect: (voiceId: string) => void;
  text: string;
}

export function SavedVoices({ onVoiceSelect, text }: SavedVoicesProps) {
  const [savedVoices, setSavedVoices] = useState<SavedVoice[]>([]);
  const [voiceLogs, setVoiceLogs] = useState<VoiceLog[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>("");
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { toast } = useToast();
  const { user } = useSupabase();

  useEffect(() => {
    // Load saved voices both from local storage and from Supabase
    const loadVoices = async () => {
      setIsLoading(true);
      
      // Get locally saved voices from ElevenLabs service
      const localVoices = elevenlabsService.getSavedVoices();
      
      // Get voices from Supabase if user is logged in
      if (user) {
        try {
          const logs = await getVoiceLogs(user.id);
          setVoiceLogs(logs);
          
          // Convert logs to SavedVoice format and merge with local voices
          // (avoiding duplicates based on voice_id)
          const voiceMap = new Map<string, SavedVoice>();
          
          // Add local voices to map
          localVoices.forEach(voice => {
            voiceMap.set(voice.voice_id, voice);
          });
          
          // Add Supabase voices to map
          logs.forEach(log => {
            if (!voiceMap.has(log.voice_id)) {
              voiceMap.set(log.voice_id, {
                id: log.id || crypto.randomUUID(),
                name: log.name,
                voice_id: log.voice_id
              });
            }
          });
          
          // Convert map back to array
          setSavedVoices(Array.from(voiceMap.values()));
        } catch (error) {
          console.error("Error loading voice logs:", error);
          setSavedVoices(localVoices);
        }
      } else {
        setSavedVoices(localVoices);
      }
      
      setIsLoading(false);
    };
    
    loadVoices();
  }, [user]);

  const handleVoiceSelect = (voiceId: string) => {
    setSelectedVoiceId(voiceId);
    onVoiceSelect(voiceId);
  };

  const playWithVoice = async (voiceId: string) => {
    if (!voiceId || !text.trim()) {
      toast({
        title: "Cannot Play",
        description: "Please select a voice and enter text to speak",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsPlaying(true);
      const audioBlob = await elevenlabsService.textToSpeech(text, voiceId);
      const audioUrl = URL.createObjectURL(audioBlob);
      
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.muted = isMuted;
        
        audioRef.current.onended = () => {
          setIsPlaying(false);
          URL.revokeObjectURL(audioUrl);
        };
        
        audioRef.current.play();
      }
    } catch (error: any) {
      setIsPlaying(false);
      toast({
        title: "Error Playing Voice",
        description: error.message || "Failed to play with selected voice",
        variant: "destructive"
      });
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
  };

  if (isLoading) {
    return <div className="text-sm text-muted-foreground mt-2">Loading your voices...</div>;
  }

  if (savedVoices.length === 0 && voiceLogs.length === 0) {
    return <div className="text-sm text-muted-foreground mt-2">No saved voices yet. Record or upload a voice sample first.</div>;
  }

  return (
    <div className="space-y-3 mt-3">
      <div>
        <Label htmlFor="saved-voice-select">Your Saved Voices</Label>
        <Select value={selectedVoiceId} onValueChange={handleVoiceSelect}>
          <SelectTrigger id="saved-voice-select" className="w-full">
            <SelectValue placeholder="Select one of your saved voices" />
          </SelectTrigger>
          <SelectContent>
            {savedVoices.map((voice) => (
              <SelectItem key={voice.id} value={voice.voice_id}>
                {voice.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {savedVoices.length > 0 && (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {savedVoices.map((voice) => (
                <TableRow key={voice.id}>
                  <TableCell>{voice.name}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!text.trim() || isPlaying}
                      onClick={() => playWithVoice(voice.voice_id)}
                      className="flex items-center gap-1"
                    >
                      <Play className="h-4 w-4" /> Play
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <div className="flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          disabled={!selectedVoiceId || !text.trim() || isPlaying}
          onClick={() => playWithVoice(selectedVoiceId)}
          className="flex items-center gap-1"
        >
          <Play className="h-4 w-4" /> Play with selected voice
        </Button>
        
        <Button
          size="icon"
          variant="ghost"
          onClick={toggleMute}
          className="w-8 h-8"
        >
          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </Button>
      </div>
      
      <audio ref={audioRef} style={{ display: 'none' }} />
    </div>
  );
}
