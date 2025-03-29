
import { supabase } from './supabase';

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
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) throw error;
  return data;
};

// This function will check if the user's profile exists
// If not, it will create one
export const ensureUserProfile = async (
  userId: string, 
  userData: { full_name: string; email?: string }
) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error && error.code === 'PGRST116') {
    // Profile doesn't exist, create one
    const { error: insertError } = await supabase
      .from('profiles')
      .insert([
        { 
          id: userId, 
          full_name: userData.full_name,
          email: userData.email,
        }
      ]);
    
    if (insertError) throw insertError;
  } else if (error) {
    throw error;
  }
};

// Here's the SQL to create the profiles table in Supabase:
/*
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to view and edit only their own profile
CREATE POLICY "Users can view their own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

-- Create a trigger to update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
*/
