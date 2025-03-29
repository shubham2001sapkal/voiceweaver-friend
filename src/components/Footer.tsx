
import React from "react";
import { useIsMobile } from "@/hooks/use-mobile";

export function Footer() {
  const isMobile = useIsMobile();
  
  return (
    <footer className={`py-3 sm:py-4 md:py-6 px-2 sm:px-4 md:px-6 text-center ${isMobile ? 'text-[10px]' : 'text-xs sm:text-sm'} text-muted-foreground`}>
      <p>© VoiceBack By Knoxed - AI Voice Cloning Platform. All rights reserved.</p>
    </footer>
  );
}
