
import React from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { VoiceRecorder } from "@/components/VoiceRecorder";
import { SelectedSample } from "@/components/voice/SelectedSample";
import { SavedVoiceSamplesList } from "@/components/voice/SavedVoiceSamplesList";
import { useVoiceForm } from "@/hooks/useVoiceForm";

export function VoiceForm() {
  const {
    isSubmitting,
    selectedSample,
    savedVoiceSamples,
    showSavedSamples,
    fetchStatus,
    playAudio,
    handleSampleReady,
    toggleSavedSamples,
    useSavedVoiceSample,
    downloadSavedSample,
    playSavedSample,
    handleSynthesizeVoice
  } = useVoiceForm();

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm w-full max-w-4xl mx-auto">
      <div className="flex flex-col space-y-1.5 p-6">
        <h3 className="text-2xl font-semibold leading-none tracking-tight">Voice Cloning</h3>
        <p className="text-sm text-muted-foreground">
          Record a voice sample, add text, and save it to the database.
        </p>
      </div>

      <div className="p-6 space-y-6">
        <Alert variant="default" className="bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800">
          <Info className="h-4 w-4" />
          <AlertTitle>Database Status</AlertTitle>
          <AlertDescription>
            Voice samples and text will be saved to your Supabase voice_logs table.
          </AlertDescription>
        </Alert>

        <VoiceRecorder onSampleReady={handleSampleReady} />

        <SelectedSample 
          selectedSample={selectedSample} 
          playAudio={playAudio}
          onSynthesizeVoice={handleSynthesizeVoice}
        />

        <SavedVoiceSamplesList 
          showSavedSamples={showSavedSamples}
          toggleSavedSamples={toggleSavedSamples}
          fetchStatus={fetchStatus}
          savedVoiceSamples={savedVoiceSamples}
          onUseSample={useSavedVoiceSample}
          onDownload={downloadSavedSample}
          onPlay={playSavedSample}
        />
      </div>
    </div>
  );
}

export default VoiceForm;
