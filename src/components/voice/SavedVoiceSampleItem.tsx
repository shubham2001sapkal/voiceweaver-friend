
import React from "react";
import { Button } from "@/components/ui/button";
import { VoiceLogEntry } from "@/services/elevenlabs";
import { Download, Play } from "lucide-react";

interface SavedVoiceSampleItemProps {
  sample: VoiceLogEntry;
  onUseSample: (sample: VoiceLogEntry) => void;
  onDownload: (sample: VoiceLogEntry) => void;
  onPlay: (sample: VoiceLogEntry) => void;
}

export function SavedVoiceSampleItem({ 
  sample, 
  onUseSample, 
  onDownload, 
  onPlay 
}: SavedVoiceSampleItemProps) {
  return (
    <div className="p-3 border rounded-md bg-background">
      <p className="font-medium truncate">{sample.text}</p>
      <p className="text-xs text-muted-foreground mb-2">
        {new Date(sample.created_at || '').toLocaleString()}
      </p>
      <div className="flex gap-2 flex-wrap">
        <Button 
          variant="secondary" 
          size="sm" 
          onClick={() => onUseSample(sample)}
        >
          Use This Sample
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onDownload(sample)}
        >
          <Download className="h-3 w-3 mr-1" /> Download
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onPlay(sample)}
        >
          <Play className="h-3 w-3 mr-1" /> Play
        </Button>
      </div>
    </div>
  );
}
