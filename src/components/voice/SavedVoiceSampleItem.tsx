
import React from "react";
import { Button } from "@/components/ui/button";
import { VoiceLogEntry } from "@/services/elevenlabs";

interface SavedVoiceSampleItemProps {
  sample: VoiceLogEntry;
  onUseSample: (sample: VoiceLogEntry) => void;
}

export function SavedVoiceSampleItem({ sample, onUseSample }: SavedVoiceSampleItemProps) {
  return (
    <div className="p-3 border rounded-md bg-background">
      <p className="font-medium truncate">{sample.text}</p>
      <p className="text-xs text-muted-foreground mb-2">
        {new Date(sample.created_at || '').toLocaleString()}
      </p>
      <Button 
        variant="secondary" 
        size="sm" 
        onClick={() => onUseSample(sample)}
      >
        Use This Sample
      </Button>
    </div>
  );
}
