
import React from "react";

type StatusIndicatorProps = {
  status: 'checking' | 'connected' | 'failed' | 'available' | 'unavailable' | 'configured' | 'not_configured';
  label: string;
  checkingText: string;
  successText: string;
  failureText: string;
  additionalText?: string;
};

export function StatusIndicator({ 
  status, 
  label, 
  checkingText, 
  successText, 
  failureText,
  additionalText
}: StatusIndicatorProps) {
  const isChecking = status === 'checking';
  const isSuccess = ['connected', 'available', 'configured'].includes(status);
  
  return (
    <div className="flex items-center gap-2">
      <div className={`h-3 w-3 rounded-full ${
        isChecking ? 'bg-yellow-500' :
        isSuccess ? 'bg-green-500' : 'bg-red-500'
      }`}></div>
      <p className="text-sm">
        {label}: {
          isChecking ? checkingText :
          isSuccess ? successText : 
          failureText + (additionalText ? ` ${additionalText}` : '')
        }
      </p>
    </div>
  );
}
