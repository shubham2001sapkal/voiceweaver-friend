
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://quaexlcelfiknbpgprdk.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF1YWV4bGNlbGZpa25icGdwcmRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMyMjgzMjUsImV4cCI6MjA1ODgwNDMyNX0.oM_y_eTF04SyQLiiE6eqxk4Dku0hbFyWr36z_-T8IZs";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Check if the voice_logs table exists, and create it if it doesn't
export const initVoiceLogsTable = async () => {
  try {
    // First check if the table exists by querying it
    const { error } = await supabase
      .from('voice_logs')
      .select('id')
      .limit(1);
    
    // If there's a "relation does not exist" error, the table might not exist
    if (error && error.code === '42P01') {
      console.error('voice_logs table does not exist. Please create it in the Supabase Dashboard.');
    }
    
    return !error;
  } catch (err) {
    console.error('Error initializing voice_logs table:', err);
    return false;
  }
};

// Call this once during app initialization
initVoiceLogsTable();
