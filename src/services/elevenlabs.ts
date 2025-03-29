
// This service will handle the integration with ElevenLabs API

export interface ElevenLabsOptions {
  apiKey?: string;
  voiceId?: string;
  model?: string;
}

export interface SavedVoice {
  id: string;
  name: string;
  voice_id: string;
}

export class ElevenLabsService {
  private apiKey: string | null = null;
  private voiceId: string = "EXAVITQu4vr4xnSDxMaL"; // Default to Sarah voice
  private model: string = "eleven_multilingual_v2"; // Default model
  private apiUrl: string = "https://api.elevenlabs.io/v1";
  private savedVoices: SavedVoice[] = [];
  
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
    
    // Try to load saved voices from localStorage
    this.loadSavedVoices();
  }

  private loadSavedVoices() {
    const savedVoicesString = localStorage.getItem('elevenlabs_saved_voices');
    if (savedVoicesString) {
      try {
        this.savedVoices = JSON.parse(savedVoicesString);
      } catch (e) {
        console.error("Failed to parse saved voices:", e);
        this.savedVoices = [];
      }
    }
  }

  private saveSavedVoices() {
    localStorage.setItem('elevenlabs_saved_voices', JSON.stringify(this.savedVoices));
  }

  public addSavedVoice(voice: SavedVoice) {
    // Check if voice already exists
    const existingIndex = this.savedVoices.findIndex(v => v.voice_id === voice.voice_id);
    if (existingIndex >= 0) {
      this.savedVoices[existingIndex] = voice;
    } else {
      this.savedVoices.push(voice);
    }
    this.saveSavedVoices();
  }

  public getSavedVoices(): SavedVoice[] {
    return [...this.savedVoices];
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

  public async cloneVoice(audioBlob: Blob, name: string): Promise<SavedVoice> {
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
        
        // Handle subscription-related errors specifically
        if (errorData.detail && errorData.detail.status === "can_not_use_instant_voice_cloning") {
          throw new Error("Your ElevenLabs subscription does not include voice cloning. Please upgrade your plan.");
        }
        
        throw new Error(`Failed to clone voice: ${errorData.detail?.message || errorData.detail || response.statusText}`);
      }

      const data = await response.json();
      const newVoice: SavedVoice = {
        id: crypto.randomUUID(),
        name: name,
        voice_id: data.voice_id
      };
      
      // Add to saved voices
      this.addSavedVoice(newVoice);
      
      return newVoice;
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
        try {
          const parsedError = JSON.parse(errorData);
          if (parsedError.detail) {
            throw new Error(`Failed to convert text to speech: ${parsedError.detail.message || parsedError.detail}`);
          }
        } catch (e) {
          // If parsing fails, use the original error text
        }
        throw new Error(`Failed to convert text to speech: ${errorData}`);
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
  apiKey: "sk_57f596ce6c2f2172c5090f2aabc6cf52b5c10093359d8e24"
});
