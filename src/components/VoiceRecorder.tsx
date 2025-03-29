
import { useState } from "react";
import { useSupabase } from "@/context/SupabaseContext";
import { RecordingControls } from "@/components/RecordingControls";
import { AudioFileUpload } from "@/components/AudioFileUpload";
import { useVoiceStorageService } from "@/services/voiceStorageService";

export function VoiceRecorder({ onSampleReady }: { onSampleReady: (blob: Blob) => void }) {
  const { supabase } = useSupabase();
  const { saveVoiceSampleToSupabase } = useVoiceStorageService(supabase);
  const [localAudioUrl, setLocalAudioUrl] = useState<string | null>(null);

  const createLocalAudioUrl = (blob: Blob): string => {
    // Clean up previous URL if it exists
    if (localAudioUrl) {
      URL.revokeObjectURL(localAudioUrl);
    }
    // Create a new URL for local playback
    const url = URL.createObjectURL(blob);
    setLocalAudioUrl(url);
    return url;
  };

  const handleRecordingComplete = async (blob: Blob) => {
    // Create local URL for audio playback
    createLocalAudioUrl(blob);
    
    // Pass blob to parent component
    onSampleReady(blob);
    
    try {
      console.log("Saving recording to Supabase...");
      await saveVoiceSampleToSupabase(blob);
    } catch (error) {
      console.error("Error saving recording to Supabase:", error);
    }
  };

  const handleFileUploaded = async (blob: Blob) => {
    // Create local URL for audio playback
    createLocalAudioUrl(blob);
    
    // Pass blob to parent component
    onSampleReady(blob);
    
    try {
      console.log("Saving uploaded file to Supabase...");
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
      
      {localAudioUrl && (
        <div className="mt-4 text-center">
          <audio controls src={localAudioUrl} className="mx-auto"></audio>
        </div>
      )}
    </div>
  );
}
