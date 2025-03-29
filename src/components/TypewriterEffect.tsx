
import { useState, useEffect } from "react";

interface TypewriterEffectProps {
  text: string;
  className?: string;
  speed?: number;
  delay?: number;
}

export function TypewriterEffect({ 
  text, 
  className = "", 
  speed = 50,
  delay = 500
}: TypewriterEffectProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    // Reset on text change
    setDisplayedText("");
    setCurrentIndex(0);
    setIsTyping(false);
    
    // Delay before starting to type
    const startTimeout = setTimeout(() => {
      setIsTyping(true);
    }, delay);
    
    return () => clearTimeout(startTimeout);
  }, [text, delay]);
  
  useEffect(() => {
    if (!isTyping) return;
    
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prevText => prevText + text[currentIndex]);
        setCurrentIndex(prevIndex => prevIndex + 1);
      }, speed);
      
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, isTyping, speed, text]);

  return (
    <div className={className}>
      <span>{displayedText}</span>
      {currentIndex < text.length && (
        <span className="animate-pulse">|</span>
      )}
    </div>
  );
}
