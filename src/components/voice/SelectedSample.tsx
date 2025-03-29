
import React from "react";
import { Button } from "@/components/ui/button";

interface SelectedSampleProps {
  selectedSample: Blob | null;
  playAudio: (blob: Blob) => void;
}

export function SelectedSample({ selectedSample, playAudio }: SelectedSampleProps) {
  if (!selectedSample) return null;
  
  return (
    <div className="mt-4 p-4 border rounded-md bg-muted/50">
      <h4 className="font-medium mb-2">Selected Voice Sample</h4>
      <Button variant="outline" onClick={() => playAudio(selectedSample)}>
        Play Sample
      </Button>
    </div>
  );
}
