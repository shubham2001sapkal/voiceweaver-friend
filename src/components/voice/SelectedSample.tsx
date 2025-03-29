
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Download } from "lucide-react";

interface SelectedSampleProps {
  selectedSample: Blob | null;
  playAudio: (blob: Blob) => void;
  onSynthesizeVoice?: (text: string, audioBlob: Blob) => void;
}

export function SelectedSample({ selectedSample, playAudio, onSynthesizeVoice }: SelectedSampleProps) {
  const [text, setText] = useState("");
  
  if (!selectedSample) return null;
  
  const downloadAudio = () => {
    if (selectedSample) {
      const url = URL.createObjectURL(selectedSample);
      const a = document.createElement("a");
      a.href = url;
      a.download = "voice-sample.webm";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleSynthesize = () => {
    if (onSynthesizeVoice && text && selectedSample) {
      onSynthesizeVoice(text, selectedSample);
    }
  };
  
  return (
    <div className="mt-4 p-4 border rounded-md bg-muted/50">
      <h4 className="font-medium mb-2">Selected Voice Sample</h4>
      <div className="flex gap-2 mb-4">
        <Button variant="outline" onClick={() => playAudio(selectedSample)}>
          Play Sample
        </Button>
        <Button variant="outline" onClick={downloadAudio}>
          <Download className="h-4 w-4 mr-2" /> Download Sample
        </Button>
      </div>
      
      <div className="mt-4">
        <h4 className="font-medium mb-2">Convert Text to Voice</h4>
        <Textarea
          placeholder="Enter text to convert to voice..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="mb-3"
        />
        <Button 
          variant="default" 
          className="bg-voiceback hover:bg-voiceback-700"
          onClick={handleSynthesize}
          disabled={!text}
        >
          Synthesize Voice
        </Button>
      </div>
    </div>
  );
}
