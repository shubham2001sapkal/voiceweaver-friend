
-- Create extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable RLS (Row Level Security)
ALTER DATABASE postgres SET TIMEZONE TO 'UTC';

-- Voice Recordings Table
CREATE TABLE IF NOT EXISTS voice_recordings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  voice_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE voice_recordings ENABLE ROW LEVEL SECURITY;

-- Create policy to only allow users to view their own voice recordings
CREATE POLICY "Users can view their own voice recordings" 
  ON voice_recordings
  FOR SELECT USING (auth.uid() = user_id);

-- Create policy to only allow users to insert their own voice recordings
CREATE POLICY "Users can insert their own voice recordings" 
  ON voice_recordings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policy to only allow users to update their own voice recordings
CREATE POLICY "Users can update their own voice recordings" 
  ON voice_recordings
  FOR UPDATE USING (auth.uid() = user_id);

-- Create policy to only allow users to delete their own voice recordings
CREATE POLICY "Users can delete their own voice recordings" 
  ON voice_recordings
  FOR DELETE USING (auth.uid() = user_id);

-- Create or update Profiles table linked to auth.users
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  password TEXT,
  full_name TEXT,
  avatar_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all users to view profiles
CREATE POLICY "Anyone can view profiles" 
  ON profiles 
  FOR SELECT USING (true);

-- Create policy to allow users to update their own profile
CREATE POLICY "Users can update their own profile" 
  ON profiles 
  FOR UPDATE USING (auth.uid() = id);

-- Create policy to allow users to insert their own profile
CREATE POLICY "Users can insert their own profile" 
  ON profiles 
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, password, full_name, avatar_url)
  VALUES (
    new.id,
    new.email,
    new.encrypted_password,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to create profile when a new user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
