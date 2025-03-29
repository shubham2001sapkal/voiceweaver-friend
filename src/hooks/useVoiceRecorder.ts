
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export function useVoiceRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [recorder, setRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingInterval, setRecordingInterval] = useState<number | null>(null);
  const { toast } = useToast();

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
        return blob;
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
      throw error;
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
      
      // The blob will be returned via the ondataavailable callback
      return true;
    }
    return false;
  };
  
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  return {
    isRecording,
    recordingTime,
    startRecording,
    stopRecording,
    formatTime
  };
}
