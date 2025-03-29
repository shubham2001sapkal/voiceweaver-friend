
import { supabase } from "@/integrations/supabase/client";

export interface VoiceRecording {
  id?: string;
  name: string;
  voice_id: string;
  created_at?: string;
  user_id?: string;
}

export const saveVoiceRecording = async (recording: VoiceRecording) => {
  try {
    // Use a type assertion to bypass the type checking
    const { data, error } = await supabase
      .from('voice_recordings' as any)
      .insert([recording] as any)
      .select();
    
    if (error) throw error;
    return data?.[0];
  } catch (error) {
    console.error("Error saving voice recording:", error);
    throw error;
  }
};

export const getVoiceRecordings = async (userId?: string) => {
  try {
    // Use a type assertion to bypass the type checking
    let query = supabase
      .from('voice_recordings' as any)
      .select('*')
      .order('created_at', { ascending: false });
    
    if (userId) {
      query = query.eq('user_id', userId);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error getting voice recordings:", error);
    return [];
  }
};
