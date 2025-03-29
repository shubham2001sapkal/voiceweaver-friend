
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

// Update the logVoiceGeneration method in the ElevenLabsService class
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
