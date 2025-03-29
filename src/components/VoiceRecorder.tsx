
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSupabase } from "@/context/SupabaseContext";

export function VoiceRecorder({ onSampleReady }: { onSampleReady: (blob: Blob) => void }) {
  const [isRecording, setIsRecording] = useState(false);
  const [recorder, setRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingInterval, setRecordingInterval] = useState<number | null>(null);
  const { toast } = useToast();
  const { supabase } = useSupabase();

  const saveVoiceSampleToSupabase = async (blob: Blob): Promise<void> => {
    try {
      // Convert blob to base64 for storage
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      
      reader.onloadend = async () => {
        // The result contains the base64 encoded data
        const base64data = reader.result as string;
        
        // Prepare the data to be sent to Supabase
        const voiceLogData = {
          text: 'Voice sample recording',
          audio_data: base64data,
          audio_url: null, // We're storing the data directly, not a URL
          type: 'voice_sample'
        };
        
        // Log the structure of data being sent (without the actual base64 for brevity)
        console.log('Sending to Supabase voice_logs:', {
          ...voiceLogData,
          audio_data: 'base64_data_too_long_to_display'
        });
        
        // Insert the voice sample record
        const { data, error } = await supabase.from('voice_logs').insert(voiceLogData);

        console.log('Supabase response:', { data, error });

        if (error) {
          if (error.code === '42501') {
            // This is a Row Level Security error
            toast({
              title: "Permission Error",
              description: "Unable to save voice sample due to row-level security. Please check your Supabase RLS policies.",
              variant: "destructive",
            });
          } else {
            throw error;
          }
        } else {
          toast({
            title: "Voice Sample Saved",
            description: "Your voice sample was successfully saved to the database.",
            variant: "default",
            className: "bg-green-100 border-green-400 dark:bg-green-900/20",
          });
        }
      };
    } catch (error: any) {
      console.error('Failed to save voice sample:', error);
      
      toast({
        title: "Failed to Save Voice Sample",
        description: error.message || "There was an error saving your voice sample.",
        variant: "destructive",
      });
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      setRecorder(mediaRecorder);

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioChunks(chunks);
        onSampleReady(blob);
        // Save the voice sample to Supabase
        saveVoiceSampleToSupabase(blob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      
      // Start timer
      const interval = window.setInterval(() => {
        setRecordingTime((prevTime) => prevTime + 1);
      }, 1000);
      
      setRecordingInterval(interval);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        title: "Microphone Error",
        description: "Unable to access your microphone. Please check your browser permissions.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (recorder) {
      recorder.stop();
      // Stop all audio tracks
      recorder.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      
      // Clear timer
      if (recordingInterval) {
        clearInterval(recordingInterval);
        setRecordingInterval(null);
      }

      toast({
        title: "Voice Sample Recorded",
        description: "Your voice sample has been successfully recorded.",
      });

      // Reset recording time
      setRecordingTime(0);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('audio/')) {
        file.arrayBuffer().then(buffer => {
          const blob = new Blob([buffer], { type: file.type });
          onSampleReady(blob);
          // Save voice sample to Supabase
          saveVoiceSampleToSupabase(blob);
          toast({
            title: "Voice Sample Uploaded",
            description: `File "${file.name}" has been successfully uploaded.`,
          });
        });
      } else {
        toast({
          title: "Invalid File Type",
          description: "Please upload an audio file.",
          variant: "destructive",
        });
      }
    }
  };
  
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex flex-wrap gap-4 justify-center">
        {isRecording ? (
          <Button 
            onClick={stopRecording} 
            variant="destructive"
            className="flex gap-2 items-center"
          >
            <Square className="h-4 w-4" /> Stop Recording ({formatTime(recordingTime)})
          </Button>
        ) : (
          <Button 
            onClick={startRecording} 
            className="bg-voiceback hover:bg-voiceback-700 flex gap-2 items-center"
          >
            <Mic className="h-4 w-4" /> Record Voice Sample
          </Button>
        )}
        
        <div className="relative">
          <input
            type="file"
            id="voice-file"
            accept="audio/*"
            onChange={handleFileUpload}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <Button 
            variant="outline" 
            className="flex gap-2 items-center"
          >
            <Upload className="h-4 w-4" /> Upload Audio File
          </Button>
        </div>
      </div>
    </div>
  );
}
