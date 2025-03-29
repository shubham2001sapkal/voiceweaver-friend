
import { Button } from "@/components/ui/button";
import { Mic, Square } from "lucide-react";
import { useVoiceRecorder } from "@/hooks/useVoiceRecorder";

interface RecordingControlsProps {
  onRecordingComplete: (blob: Blob) => void;
}

export function RecordingControls({ onRecordingComplete }: RecordingControlsProps) {
  const { isRecording, recordingTime, startRecording, stopRecording, formatTime } = useVoiceRecorder();

  const handleStartRecording = async () => {
    await startRecording();
  };

  const handleStopRecording = () => {
    if (stopRecording()) {
      // Get the latest recording from the MediaRecorder ondataavailable event
      document.addEventListener('dataavailable', (e: any) => {
        if (e.data && e.data.size > 0) {
          onRecordingComplete(e.data);
        }
      }, { once: true });
    }
  };

  return (
    <div>
      {isRecording ? (
        <Button 
          onClick={handleStopRecording} 
          variant="destructive"
          className="flex gap-2 items-center"
        >
          <Square className="h-4 w-4" /> Stop Recording ({formatTime(recordingTime)})
        </Button>
      ) : (
        <Button 
          onClick={handleStartRecording} 
          className="bg-voiceback hover:bg-voiceback-700 flex gap-2 items-center"
        >
          <Mic className="h-4 w-4" /> Record Voice Sample
        </Button>
      )}
    </div>
  );
}
