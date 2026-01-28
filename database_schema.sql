-- BlogApp Database Schema
-- Run this SQL in your Supabase SQL Editor to create the complete schema

-- 1. Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- 2. Blogs table
CREATE TABLE IF NOT EXISTS blogs (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  category VARCHAR(100),
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- 3. Blog Images table
CREATE TABLE IF NOT EXISTS blog_images (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  blog_id BIGINT NOT NULL REFERENCES blogs(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text VARCHAR(255),
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- 4. Comments table
CREATE TABLE IF NOT EXISTS comments (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  blog_id BIGINT NOT NULL REFERENCES blogs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  parent_comment_id BIGINT REFERENCES comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- Enable Row Level Security (RLS) for all tables
ALTER TABLE IF EXISTS profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS blog_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS comments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Published blogs are viewable by everyone" ON blogs;
DROP POLICY IF EXISTS "Users can insert their own blogs" ON blogs;
DROP POLICY IF EXISTS "Users can update their own blogs" ON blogs;
DROP POLICY IF EXISTS "Users can delete their own blogs" ON blogs;
DROP POLICY IF EXISTS "Blog images are viewable with blog" ON blog_images;
DROP POLICY IF EXISTS "Users can insert images for their blogs" ON blog_images;
DROP POLICY IF EXISTS "Users can delete their blog images" ON blog_images;
DROP POLICY IF EXISTS "Comments are viewable by everyone" ON comments;
DROP POLICY IF EXISTS "Authenticated users can insert comments" ON comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON comments;

-- Profiles RLS policies
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Blogs RLS policies
CREATE POLICY "Published blogs are viewable by everyone" ON blogs
  FOR SELECT USING (published = true OR auth.uid() = user_id);

CREATE POLICY "Users can insert their own blogs" ON blogs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own blogs" ON blogs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own blogs" ON blogs
  FOR DELETE USING (auth.uid() = user_id);

-- Blog Images RLS policies
CREATE POLICY "Blog images are viewable with blog" ON blog_images
  FOR SELECT USING (true);

CREATE POLICY "Users can insert images for their blogs" ON blog_images
  FOR INSERT WITH CHECK (
    auth.uid() = (SELECT user_id FROM blogs WHERE id = blog_images.blog_id)
  );

CREATE POLICY "Users can delete their blog images" ON blog_images
  FOR DELETE USING (
    auth.uid() = (SELECT user_id FROM blogs WHERE id = blog_images.blog_id)
  );

-- Comments RLS policies
CREATE POLICY "Comments are viewable by everyone" ON comments
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert comments" ON comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" ON comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" ON comments
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS blogs_user_id_idx ON blogs(user_id);
CREATE INDEX IF NOT EXISTS blogs_created_at_idx ON blogs(created_at DESC);
CREATE INDEX IF NOT EXISTS blog_images_blog_id_idx ON blog_images(blog_id);
CREATE INDEX IF NOT EXISTS comments_blog_id_idx ON comments(blog_id);
CREATE INDEX IF NOT EXISTS comments_user_id_idx ON comments(user_id);
CREATE INDEX IF NOT EXISTS comments_parent_id_idx ON comments(parent_comment_id);
