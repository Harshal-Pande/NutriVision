-- Supabase schema for AINutritionistApp

create table users (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  name text,
  created_at timestamp with time zone default timezone('utc', now())
);

create table scans (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id),
  image_url text,
  nutrition_data jsonb,
  grade integer,
  created_at timestamp with time zone default timezone('utc', now())
);

create table recommendations (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id),
  health_issue text,
  recommendation text,
  created_at timestamp with time zone default timezone('utc', now())
);

create table posts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id),
  title text,
  content text,
  reddit_id text,
  created_at timestamp with time zone default timezone('utc', now())
); 