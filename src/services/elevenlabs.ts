
import { supabase } from "@/lib/supabase";

// Update the VoiceLogEntry interface to match our Supabase schema
export interface VoiceLogEntry {
  id?: string;
  created_at?: string;
  text: string;
  audio_data?: string;
  audio_url?: string;
  type?: 'voice_sample' | 'generated_speech' | 'error';
  success?: boolean;
  error_message?: string;
}

// ElevenLabsService class
export class ElevenLabsService {
  // Private method to log voice generation to Supabase
  private async logVoiceGeneration(logEntry: VoiceLogEntry): Promise<void> {
    try {
      // Log the data being inserted (omitting large audio_data for brevity)
      const logData = {
        ...logEntry,
        audio_data: logEntry.audio_data ? '[base64_data]' : null
      };
      console.log('Logging voice generation to Supabase:', logData);
      
      await supabase.from('voice_logs').insert([{
        text: logEntry.text,
        audio_data: logEntry.audio_data || null,
        audio_url: logEntry.audio_url || null,
        type: logEntry.type || 'generated_speech',
        success: logEntry.success,
        error_message: logEntry.error_message || null
        // Let created_at be handled by Supabase's default value
      }]);
    } catch (error) {
      console.error('Failed to log voice generation:', error);
      // We don't throw here to avoid breaking the main functionality
    }
  }

  // Method to save voice sample to Supabase
  public async saveVoiceSample(text: string, audioData: string): Promise<void> {
    await this.logVoiceGeneration({
      text: text,
      audio_data: audioData,
      type: 'voice_sample',
      success: true
    });
  }

  // Method to get voice samples from Supabase
  public async getVoiceSamples(): Promise<VoiceLogEntry[]> {
    try {
      const { data, error } = await supabase
        .from('voice_logs')
        .select('*')
        .eq('type', 'voice_sample')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching voice samples:', error);
      throw error;
    }
  }
}

// Create a singleton instance of ElevenLabsService
export const elevenLabsService = new ElevenLabsService();
