
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface SavedVoicesProps {
  onVoiceSelect: (voiceId: string) => void;
  text: string;
  selectedVoiceId: string;
}

export function SavedVoices({ onVoiceSelect, text, selectedVoiceId }: SavedVoicesProps) {
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { toast } = useToast();

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
