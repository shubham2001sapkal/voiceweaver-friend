
import React from 'react';
import { VoiceForm as OriginalVoiceForm } from './VoiceForm';

/**
 * This is a wrapper component that adds responsive styling to the VoiceForm
 * without modifying the original component
 */
export const VoiceForm: React.FC = () => {
  return (
    <div className="px-2 sm:px-4 md:px-6">
      <OriginalVoiceForm />
    </div>
  );
};
