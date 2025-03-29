
import { supabase } from "@/lib/supabase";

export interface VoiceRecording {
  id?: string;
  name: string;
  voice_id: string;
  created_at?: string;
  user_id?: string;
}

export const saveVoiceRecording = async (recording: VoiceRecording) => {
  try {
    const { data, error } = await supabase
      .from('voice_recordings')
      .insert([recording])
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
    let query = supabase
      .from('voice_recordings')
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
