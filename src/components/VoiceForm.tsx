
import React from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { VoiceRecorder } from "@/components/VoiceRecorder";
import { SelectedSample } from "@/components/voice/SelectedSample";
import { SavedVoiceSamplesList } from "@/components/voice/SavedVoiceSamplesList";
import { useVoiceForm } from "@/hooks/useVoiceForm";

export function VoiceForm() {
  const {
    selectedSample,
    savedVoiceSamples,
    showSavedSamples,
    fetchStatus,
    playAudio,
    handleSampleReady,
    toggleSavedSamples,
    useSavedVoiceSample
  } = useVoiceForm();

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm w-full max-w-4xl mx-auto">
      <div className="flex flex-col space-y-1.5 p-6">
        <h3 className="text-2xl font-semibold leading-none tracking-tight">Voice Cloning</h3>
        <p className="text-sm text-muted-foreground">
          Record a voice sample to be used for cloning.
        </p>
      </div>

      <div className="p-6 space-y-6">
        <Alert variant="default" className="bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800">
          <Info className="h-4 w-4" />
          <AlertTitle>Database Status</AlertTitle>
          <AlertDescription>
            Voice samples will be saved to your Supabase voice_logs table. Make sure Row Level Security (RLS) policies are properly configured.
          </AlertDescription>
        </Alert>

        <VoiceRecorder onSampleReady={handleSampleReady} />

        <SelectedSample 
          selectedSample={selectedSample} 
          playAudio={playAudio} 
        />

        <SavedVoiceSamplesList 
          showSavedSamples={showSavedSamples}
          toggleSavedSamples={toggleSavedSamples}
          fetchStatus={fetchStatus}
          savedVoiceSamples={savedVoiceSamples}
          onUseSample={useSavedVoiceSample}
        />
      </div>
    </div>
  );
}

export default VoiceForm;
