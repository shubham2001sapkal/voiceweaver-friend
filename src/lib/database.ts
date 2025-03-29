
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
  
  // We'll let the database trigger handle profile creation instead of doing it here
  // This avoids the RLS policy violation
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
  // Use a more specific cast that works around TypeScript limitations
  const client = supabase as any;
  const { data, error } = await client
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) throw error;
  return data as ProfileData;
};

// This function is modified to avoid the RLS policy violation
export const ensureUserProfile = async (
  userId: string, 
  userData: { full_name: string; email?: string }
) => {
  try {
    // Check if profile exists first
    const client = supabase as any;
    const { data, error } = await client
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    // If there's a "not found" error, we will NOT try to create the profile here
    // because it's likely being created by the database trigger
    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    
    // If no profile exists, we'll return without trying to create one
    // The database trigger will handle this
    return data;
  } catch (error) {
    console.error("Error in ensureUserProfile:", error);
    // We don't throw the error here to prevent signup failures
    return null;
  }
};
