
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://quaexlcelfiknbpgprdk.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF1YWV4bGNlbGZpa25icGdwcmRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMyMjgzMjUsImV4cCI6MjA1ODgwNDMyNX0.oM_y_eTF04SyQLiiE6eqxk4Dku0hbFyWr36z_-T8IZs";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Initialize ElevenLabs API key
const elevenlabsApiKey = "sk_57f596ce6c2f2172c5090f2aabc6cf52b5c10093359d8e24";
localStorage.setItem('elevenlabs_api_key', elevenlabsApiKey);
