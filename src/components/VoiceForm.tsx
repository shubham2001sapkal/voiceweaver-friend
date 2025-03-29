
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { VoiceRecorder } from "@/components/VoiceRecorder";
import { SavedVoices } from "@/components/SavedVoices";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

export const VoiceForm = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [step, setStep] = useState<'record' | 'samples' | 'generate'>('record');
  const isMobile = useIsMobile();

  const handleNext = () => {
    if (step === 'record') {
      setStep('samples');
    } else if (step === 'samples') {
      setStep('generate');
    } else {
      setStep('record');
    }
  };

  const handleBack = () => {
    if (step === 'generate') {
      setStep('samples');
    } else if (step === 'samples') {
      setStep('record');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <Card className="w-full max-w-3xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl text-center text-voiceback dark:text-primary">
            {step === 'record' && 'Record Your Voice Sample'}
            {step === 'samples' && 'Your Voice Samples'}
            {step === 'generate' && 'Generate Voice'}
          </CardTitle>
          <CardDescription className="text-center">
            {step === 'record' && 'We need a few samples of your voice to create a digital clone.'}
            {step === 'samples' && 'Review your recorded samples or record more.'}
            {step === 'generate' && 'Generate speech with your cloned voice.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 'record' && <VoiceRecorder isRecording={isRecording} onToggleRecording={() => setIsRecording(!isRecording)} />}
          {step === 'samples' && <SavedVoices />}
          {step === 'generate' && (
            <div className="text-center p-8">
              <p className="text-muted-foreground mb-4">
                Your voice model is being trained. This may take a few minutes.
              </p>
              <div className="animate-pulse bg-secondary h-4 w-2/3 mx-auto rounded-full"></div>
            </div>
          )}
        </CardContent>
        <CardFooter className={`flex ${isMobile ? 'flex-col' : 'flex-row'} gap-2 justify-between`}>
          {step !== 'record' && (
            <Button variant="outline" onClick={handleBack} className={isMobile ? 'w-full' : ''}>
              Back
            </Button>
          )}
          <Button 
            onClick={handleNext} 
            className={`${step === 'record' ? (isMobile ? 'w-full' : 'ml-auto') : (isMobile ? 'w-full' : '')}`}
          >
            {step === 'record' && 'Next: Review Samples'}
            {step === 'samples' && 'Next: Generate Voice'}
            {step === 'generate' && 'Start Over'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
