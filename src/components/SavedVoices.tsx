
import { useState, useRef } from "react";
import { elevenlabsService } from "@/services/elevenlabs";
import { Button } from "@/components/ui/button";
import { Play, Volume2, VolumeX } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface SavedVoicesProps {
  onVoiceSelect: (voiceId: string) => void;
  text: string;
  selectedVoiceId: string;
}

export function SavedVoices({ onVoiceSelect, text, selectedVoiceId }: SavedVoicesProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { toast } = useToast();

  const playWithVoice = async () => {
    if (!selectedVoiceId || !text.trim()) {
      toast({
        title: "Cannot Play",
        description: "Please select a voice and enter text to speak",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsPlaying(true);
      const audioBlob = await elevenlabsService.textToSpeech(text, selectedVoiceId);
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

  return (
    <div className="space-y-3 mt-3">
      <div className="flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          disabled={!selectedVoiceId || !text.trim() || isPlaying}
          onClick={playWithVoice}
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
