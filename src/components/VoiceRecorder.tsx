
import { useState } from "react";
import { useSupabase } from "@/context/SupabaseContext";
import { RecordingControls } from "@/components/RecordingControls";
import { AudioFileUpload } from "@/components/AudioFileUpload";
import { useVoiceStorageService } from "@/services/voiceStorageService";

export function VoiceRecorder({ onSampleReady }: { onSampleReady: (blob: Blob) => void }) {
  const { supabase } = useSupabase();
  const { saveVoiceSampleToSupabase } = useVoiceStorageService(supabase);

  const handleRecordingComplete = async (blob: Blob) => {
    onSampleReady(blob);
    try {
      await saveVoiceSampleToSupabase(blob);
    } catch (error) {
      console.error("Error saving recording to Supabase:", error);
    }
  };

  const handleFileUploaded = async (blob: Blob) => {
    onSampleReady(blob);
    try {
      await saveVoiceSampleToSupabase(blob);
    } catch (error) {
      console.error("Error saving uploaded file to Supabase:", error);
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex flex-wrap gap-4 justify-center">
        <RecordingControls onRecordingComplete={handleRecordingComplete} />
        <AudioFileUpload onFileUploaded={handleFileUploaded} />
      </div>
    </div>
  );
}
