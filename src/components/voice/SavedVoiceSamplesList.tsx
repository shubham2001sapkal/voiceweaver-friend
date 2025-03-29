
import React from "react";
import { Button } from "@/components/ui/button";
import { VoiceLogEntry } from "@/services/elevenlabs";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { SavedVoiceSampleItem } from "./SavedVoiceSampleItem";

interface SavedVoiceSamplesListProps {
  showSavedSamples: boolean;
  toggleSavedSamples: () => void;
  fetchStatus: 'idle' | 'loading' | 'success' | 'error';
  savedVoiceSamples: VoiceLogEntry[];
  onUseSample: (sample: VoiceLogEntry) => void;
  onDownload: (sample: VoiceLogEntry) => void;
  onPlay: (sample: VoiceLogEntry) => void;
}

export function SavedVoiceSamplesList({
  showSavedSamples,
  toggleSavedSamples,
  fetchStatus,
  savedVoiceSamples,
  onUseSample,
  onDownload,
  onPlay
}: SavedVoiceSamplesListProps) {
  return (
    <div className="mt-4">
      <Button variant="outline" onClick={toggleSavedSamples}>
        {showSavedSamples ? "Hide Saved Samples" : "Show Saved Samples"}
      </Button>

      {showSavedSamples && (
        <div className="mt-4 space-y-4">
          <h4 className="font-medium">Saved Voice Samples</h4>
          
          {fetchStatus === 'loading' && (
            <p className="text-muted-foreground">Loading saved voice samples...</p>
          )}
          
          {fetchStatus === 'error' && (
            <Alert variant="destructive">
              <AlertTitle>Error Fetching Samples</AlertTitle>
              <AlertDescription>
                There was an error retrieving your saved voice samples. Check your database configuration.
              </AlertDescription>
            </Alert>
          )}
          
          {fetchStatus === 'success' && savedVoiceSamples.length === 0 && (
            <p className="text-muted-foreground">No saved voice samples found.</p>
          )}
          
          {fetchStatus === 'success' && savedVoiceSamples.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2">
              {savedVoiceSamples.map((sample, index) => (
                <SavedVoiceSampleItem 
                  key={sample.id || index} 
                  sample={sample} 
                  onUseSample={onUseSample}
                  onDownload={onDownload}
                  onPlay={onPlay}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
