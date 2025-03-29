
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AudioFileUploadProps {
  onFileUploaded: (blob: Blob) => void;
}

export function AudioFileUpload({ onFileUploaded }: AudioFileUploadProps) {
  const { toast } = useToast();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('audio/')) {
        file.arrayBuffer().then(buffer => {
          const blob = new Blob([buffer], { type: file.type });
          onFileUploaded(blob);
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

  return (
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
  );
}
