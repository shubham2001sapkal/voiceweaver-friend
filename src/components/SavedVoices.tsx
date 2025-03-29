
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
        {/* Mute button removed */}
      </div>
      
      <audio ref={audioRef} style={{ display: 'none' }} />
    </div>
  );
}
