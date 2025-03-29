
-- This SQL can be executed in Supabase SQL Editor

-- Create a public profiles table to store user profile information
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text not null,
  full_name text,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- Enable Row Level Security
alter table public.profiles enable row level security;

-- Create policy for profiles - Users can only read/write their own profile
create policy "Users can view their own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on profiles for update
  using (auth.uid() = id);

-- Create a function to create a profile entry when a new user signs up
create or replace function public.create_profile_for_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger the function every time a user is created
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.create_profile_for_user();

-- Create a voice recordings table to store user voice samples
create table public.voice_recordings (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  audio_url text not null,
  processed boolean default false,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- Enable Row Level Security
alter table public.voice_recordings enable row level security;

-- Create policy for voice recordings - Users can only read/write their own recordings
create policy "Users can view their own voice recordings"
  on voice_recordings for select
  using (auth.uid() = user_id);

create policy "Users can insert their own voice recordings"
  on voice_recordings for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own voice recordings"
  on voice_recordings for update
  using (auth.uid() = user_id);

create policy "Users can delete their own voice recordings"
  on voice_recordings for delete
  using (auth.uid() = user_id);
