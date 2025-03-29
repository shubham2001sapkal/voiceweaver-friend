
import { supabase } from '@/integrations/supabase/client';

// Database schema definition
export type User = {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
}

export type UserCredentials = {
  email: string;
  password: string;
  full_name?: string;
}

// Type definition for profile data used locally
export interface ProfileData {
  id: string;
  full_name: string;
  email?: string;
}

// Authentication functions
export const createUser = async (credentials: UserCredentials) => {
  const { data, error } = await supabase.auth.signUp({ 
    email: credentials.email, 
    password: credentials.password,
    options: {
      data: {
        full_name: credentials.full_name
      }
    }
  });
  
  if (error) throw error;
  
  // If signup is successful, create the profile immediately (don't wait for confirmation)
  if (data.user) {
    await ensureUserProfile(data.user.id, { 
      full_name: credentials.full_name || 'User',
      email: credentials.email
    });
  }
  
  return data;
};

export const signInUser = async (credentials: { email: string; password: string }) => {
  const { data, error } = await supabase.auth.signInWithPassword({ 
    email: credentials.email, 
    password: credentials.password 
  });
  
  if (error) throw error;
  return data;
};

export const getUserProfile = async (userId: string) => {
  // Use type assertion to work around the typing issue
  const { data, error } = await supabase
    .from('profiles' as any)
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) throw error;
  return data as ProfileData;
};

// This function will check if the user's profile exists
// If not, it will create one
export const ensureUserProfile = async (
  userId: string, 
  userData: { full_name: string; email?: string }
) => {
  try {
    // Use type assertion to work around the typing issue
    const { data, error } = await supabase
      .from('profiles' as any)
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error && error.code === 'PGRST116') {
      // Profile doesn't exist, create one
      const { error: insertError } = await supabase
        .from('profiles' as any)
        .insert([
          { 
            id: userId, 
            full_name: userData.full_name,
            email: userData.email,
          }
        ] as any);
      
      if (insertError) throw insertError;
    } else if (error) {
      throw error;
    }
  } catch (error) {
    console.error("Error in ensureUserProfile:", error);
    throw error;
  }
};
