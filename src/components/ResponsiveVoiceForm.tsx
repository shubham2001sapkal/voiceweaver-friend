
import React from 'react';
import { VoiceForm as OriginalVoiceForm } from './VoiceForm';
import { useIsMobile } from '@/hooks/use-mobile';

/**
 * This is a wrapper component that adds responsive styling to the VoiceForm
 * without modifying the original component
 */
export const VoiceForm: React.FC = () => {
  const isMobile = useIsMobile();
  
  return (
    <div className={`${isMobile ? 'px-1' : 'px-2 sm:px-4 md:px-6'} max-w-full overflow-hidden`}>
      <OriginalVoiceForm />
    </div>
  );
};
