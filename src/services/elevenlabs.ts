
// This service will handle the integration with ElevenLabs API
import { supabase } from "@/lib/supabase";

export interface ElevenLabsOptions {
  apiKey?: string;
  voiceId?: string;
  model?: string;
}

export interface VoiceLogEntry {
  text: string;
  audio_url?: string;
  success: boolean;
  error_message?: string;
  type?: 'voice_sample' | 'generated_speech' | 'error';
}

export class ElevenLabsService {
  private apiKey: string | null = null;
  private voiceId: string = "EXAVITQu4vr4xnSDxMaL"; // Default to Sarah voice
  private model: string = "eleven_multilingual_v2"; // Default model
  private apiUrl: string = "https://api.elevenlabs.io/v1";
  
  constructor(options?: ElevenLabsOptions) {
    if (options?.apiKey) {
      this.apiKey = options.apiKey;
    }
    if (options?.voiceId) {
      this.voiceId = options.voiceId;
    }
    if (options?.model) {
      this.model = options.model;
    }
  }

  public setApiKey(apiKey: string) {
    this.apiKey = apiKey;
    // Store in localStorage for demo purposes
    // In a production app, this should be handled more securely
    localStorage.setItem('elevenlabs_api_key', apiKey);
  }

  public getApiKey(): string | null {
    if (!this.apiKey) {
      // Try to get from localStorage for demo purposes
      const savedKey = localStorage.getItem('elevenlabs_api_key');
      if (savedKey) {
        this.apiKey = savedKey;
      }
    }
    return this.apiKey;
  }

  public setVoiceId(voiceId: string) {
    this.voiceId = voiceId;
  }

  private async logVoiceGeneration(logEntry: VoiceLogEntry): Promise<void> {
    try {
      await supabase.from('voice_logs').insert([{
        text: logEntry.text,
        audio_url: logEntry.audio_url || null,
        success: logEntry.success,
        error_message: logEntry.error_message || null,
        type: logEntry.type || 'generated_speech'
        // Let created_at be handled by Supabase's default value
      }]);
    } catch (error) {
      console.error('Failed to log voice generation:', error);
      // We don't throw here to avoid breaking the main functionality
    }
  }

  public async cloneVoice(audioBlob: Blob, name: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error("API key is required for voice cloning");
    }

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', 'Voice cloned via VoiceBack app');
      
      // Ensure proper file name and type for better compatibility
      const audioFile = new File([audioBlob], 'voice_sample.wav', { 
        type: audioBlob.type || 'audio/wav'
      });
      formData.append('files', audioFile);

      const response = await fetch(`${this.apiUrl}/voices/add`, {
        method: 'POST',
        headers: {
          'xi-api-key': this.apiKey
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        // Handle subscription-related errors specifically
        if (errorData.detail && errorData.detail.status === "can_not_use_instant_voice_cloning") {
          await this.logVoiceGeneration({
            text: "Voice cloning attempt",
            success: false,
            error_message: "Subscription does not include voice cloning",
            type: 'error'
          });
          throw new Error("Your ElevenLabs subscription does not include voice cloning. Please upgrade your plan.");
        }
        
        const errorMessage = errorData.detail?.message || errorData.detail || response.statusText;
        await this.logVoiceGeneration({
          text: "Voice cloning attempt",
          success: false,
          error_message: errorMessage,
          type: 'error'
        });
        
        throw new Error(`Failed to clone voice: ${errorMessage}`);
      }

      const data = await response.json();
      
      await this.logVoiceGeneration({
        text: "Voice cloning successful",
        success: true,
        type: 'voice_sample'
      });
      
      return data.voice_id;
    } catch (error) {
      console.error('Voice cloning error:', error);
      throw error;
    }
  }

  public async textToSpeech(text: string, voiceId?: string): Promise<Blob> {
    const targetVoiceId = voiceId || this.voiceId;
    
    if (!this.apiKey) {
      throw new Error("API key is required for text-to-speech conversion");
    }

    try {
      const response = await fetch(`${this.apiUrl}/text-to-speech/${targetVoiceId}`, {
        method: 'POST',
        headers: {
          'xi-api-key': this.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: text,
          model_id: this.model,
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        let errorMessage = errorData;
        
        try {
          const parsedError = JSON.parse(errorData);
          if (parsedError.detail) {
            errorMessage = parsedError.detail.message || parsedError.detail;
          }
        } catch (e) {
          // If parsing fails, use the original error text
        }
        
        await this.logVoiceGeneration({
          text: text,
          success: false,
          error_message: errorMessage
        });
        
        throw new Error(`Failed to convert text to speech: ${errorMessage}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      await this.logVoiceGeneration({
        text: text,
        audio_url: audioUrl,
        success: true
      });
      
      return audioBlob;
    } catch (error) {
      console.error('Text-to-speech error:', error);
      throw error;
    }
  }
  
  public async getAvailableVoices(): Promise<any[]> {
    if (!this.apiKey) {
      throw new Error("API key is required to get available voices");
    }
    
    try {
      const response = await fetch(`${this.apiUrl}/voices`, {
        method: 'GET',
        headers: {
          'xi-api-key': this.apiKey
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to get voices: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.voices || [];
    } catch (error) {
      console.error('Get voices error:', error);
      throw error;
    }
  }
}

// Initialize with the provided API key
export const elevenlabsService = new ElevenLabsService({
  apiKey: "sk_1549aa8a13b90c1128e6ff54e26dda966df9b615fb3c364e"
});
