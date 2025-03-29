
import { supabase } from "@/lib/supabase";

export interface VoiceLog {
  id?: string;
  name: string;
  voice_id: string; // Note: Although stored as int2 in DB, we'll use string here for compatibility
  created_at?: string;
  user_id?: string; // Note: Although stored as int2 in DB, we'll use string here for compatibility
}

export const saveVoiceLog = async (log: VoiceLog) => {
  try {
    const { data, error } = await supabase
      .from('voice_logs')
      .insert([log])
      .select();
    
    if (error) throw error;
    return data?.[0];
  } catch (error) {
    console.error("Error saving voice log:", error);
    throw error;
  }
};

export const getVoiceLogs = async (userId?: string) => {
  try {
    let query = supabase
      .from('voice_logs')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (userId) {
      query = query.eq('user_id', userId);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error getting voice logs:", error);
    return [];
  }
};
