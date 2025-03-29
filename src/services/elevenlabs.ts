
// This service will handle the integration with ElevenLabs API

export interface ElevenLabsOptions {
  apiKey?: string;
  voiceId?: string;
  model?: string;
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

  public async cloneVoice(audioBlob: Blob, name: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error("API key is required for voice cloning");
    }

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', 'Voice cloned via VoiceBack app');
      formData.append('files', audioBlob, 'voice_sample.wav');

      const response = await fetch(`${this.apiUrl}/voices/add`, {
        method: 'POST',
        headers: {
          'xi-api-key': this.apiKey
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to clone voice: ${errorData.detail || response.statusText}`);
      }

      const data = await response.json();
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
        const errorText = await response.text();
        throw new Error(`Failed to convert text to speech: ${errorText}`);
      }

      return await response.blob();
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

