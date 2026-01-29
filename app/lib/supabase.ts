import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://ufconzvumukyigdmnyho.supabase.co";
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY || "sb_publishable_EWBPiOXo8YR_efftLECvHg_yT6-p8VQ";

export const supabase = createClient(supabaseUrl, supabaseKey);

// Interfaces
export interface Profile {
  id: string;
  username: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  created_at: string;
  updated_at: string;
}

export interface Blog {
  id: number;
  user_id: string;
  title: string;
  excerpt?: string;
  content: string;
  category?: string;
  published: boolean;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
  blog_images?: BlogImage[];
}

export interface BlogImage {
  id: number;
  blog_id: number;
  image_url: string;
  alt_text?: string;
  is_featured: boolean;
  created_at: string;
}

export interface Comment {
  id: number;
  blog_id: number;
  user_id: string;
  content: string;
  parent_comment_id?: number;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
}

// Profile functions
export const getProfile = async (userId: string): Promise<Profile | null> => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching profile:", error);
      return null;
    }

    return data;
  } catch (err) {
    console.error("Unexpected error fetching profile:", err);
    return null;
  }
};

export const createProfile = async (userId: string, username: string, fullName?: string): Promise<Profile | null> => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .insert([
        {
          id: userId,
          username,
          full_name: fullName,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error creating profile:", error);
      return null;
    }

    return data;
  } catch (err) {
    console.error("Unexpected error creating profile:", err);
    return null;
  }
};

// Blog functions
export const fetchBlogs = async (): Promise<Blog[]> => {
  try {
    const { data, error } = await supabase
      .from("blogs")
      .select("*, blog_images(*)")
      .eq("published", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching blogs:", error);
      return [];
    }

    // Filter out blogs with null/undefined ids and fetch profiles separately for each blog
    const validBlogs = (data || []).filter(blog => blog.id != null);
    const blogsWithProfiles = await Promise.all(
      validBlogs.map(async (blog) => {
        const profile = await getProfile(blog.user_id);
        return {
          ...blog,
          profiles: profile
        };
      })
    );

    return blogsWithProfiles;
  } catch (err) {
    console.error("Unexpected error fetching blogs:", err);
    return [];
  }
};

export const getUserBlogs = async (userId: string): Promise<Blog[]> => {
  try {
    const { data, error } = await supabase
      .from("blogs")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching user blogs:", error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("Unexpected error fetching user blogs:", err);
    return [];
  }
};

export const createBlog = async (blog: Omit<Blog, "id" | "created_at" | "updated_at">): Promise<Blog | null> => {
  try {
    const { data, error } = await supabase
      .from("blogs")
      .insert([blog])
      .select()
      .single();

    if (error) {
      console.error("Supabase error creating blog:", error);
      console.error("Error details:", { code: error.code, message: error.message, details: error.details });
      return null;
    }

    return data;
  } catch (err) {
    console.error("Unexpected error creating blog:", err);
    throw err;
  }
};

export const deleteBlog = async (blogId: number): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("blogs")
      .delete()
      .eq("id", blogId);

    if (error) {
      console.error("Error deleting blog:", error);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Unexpected error deleting blog:", err);
    return false;
  }
};

export const updateBlog = async (blogId: number, updates: Partial<Blog>): Promise<Blog | null> => {
  try {
    const { data, error } = await supabase
      .from("blogs")
      .update(updates)
      .eq("id", blogId)
      .select()
      .single();

    if (error) {
      console.error("Error updating blog:", error);
      return null;
    }

    return data;
  } catch (err) {
    console.error("Unexpected error updating blog:", err);
    return null;
  }
};

// Blog Image functions
export const uploadAndSaveBlogImage = async (
  file: File,
  blogId: number,
  userId: string,
  altText?: string,
  isFeatured: boolean = false
): Promise<BlogImage | null> => {
  try {
    const fileExt = file.name.split(".").pop();
    const fileName = `${blogId}_${userId}_${Date.now()}.${fileExt}`;
    const filePath = `blog_images/${fileName}`;

    // 1️⃣ Upload to Storage
    const { error: uploadError } = await supabase.storage
      .from("blog-images")
      .upload(filePath, file);

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return null;
    }

    // 2️⃣ Get public URL
    const { data: urlData } = supabase.storage
      .from("blog-images")
      .getPublicUrl(filePath);

    if (!urlData?.publicUrl) return null;

    // 3️⃣ Insert into DB table
    const { data, error } = await supabase
      .from("blog_images")
      .insert([
        {
          blog_id: blogId,
          image_url: urlData.publicUrl,
          alt_text: altText,
          is_featured: isFeatured,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("DB insert error:", error);
      return null;
    }

    return data;
  } catch (err) {
    console.error("Unexpected upload error:", err);
    return null;
  }
};


export const addBlogImage = async (image: Omit<BlogImage, "id" | "created_at">): Promise<BlogImage | null> => {
  try {
    const { data, error } = await supabase
      .from("blog_images")
      .insert([image])
      .select()
      .single();

    if (error) {
      console.error("Error adding blog image:", error);
      return null;
    }

    return data;
  } catch (err) {
    console.error("Unexpected error adding blog image:", err);
    return null;
  }
};

export const deleteBlogImage = async (imageId: number): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("blog_images")
      .delete()
      .eq("id", imageId);

    if (error) {
      console.error("Error deleting blog image:", error);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Unexpected error deleting blog image:", err);
    return false;
  }
};

// Comment functions
export const getComments = async (blogId: number | string): Promise<Comment[]> => {
  const id = typeof blogId === 'string' ? parseInt(blogId) : blogId;
  if (isNaN(id) || id == null) {
    console.warn("Invalid blogId:", blogId);
    return [];
  }

  try {
    const { data, error } = await supabase
      .from("comments")
      .select("*")
      .eq("blog_id", id)
      .is("parent_comment_id", null)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching comments:", error.message || error);
      return [];
    }

    // Fetch profiles separately for each comment
    const commentsWithProfiles = await Promise.all(
      (data || []).map(async (comment) => {
        const profile = await getProfile(comment.user_id);
        return {
          ...comment,
          profiles: profile ? { username: profile.username, avatar_url: profile.avatar_url } : null
        };
      })
    );

    return commentsWithProfiles;
  } catch (err) {
    console.error("Unexpected error fetching comments:", err);
    return [];
  }
};

export const addComment = async (comment: Omit<Comment, "id" | "created_at" | "updated_at">): Promise<Comment | null> => {
  try {
    const { data, error } = await supabase
      .from("comments")
      .insert([comment])
      .select()
      .single();

    if (error) {
      console.error("Error adding comment:", error);
      return null;
    }

    return data;
  } catch (err) {
    console.error("Unexpected error adding comment:", err);
    return null;
  }
};

export const deleteComment = async (commentId: number): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId);

    if (error) {
      console.error("Error deleting comment:", error);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Unexpected error deleting comment:", err);
    return false;
  }
};

// Register a new user with Supabase Auth
export const signUp = async (email: string, password: string, username: string): Promise<{ success: boolean; message: string }> => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      console.error("Error signing up:", error);
      return { success: false, message: error.message };
    }

    // Create user profile after signup
    if (data.user?.id) {
      await createProfile(data.user.id, username);
    }

    return { success: true, message: "Registration successful! You can now log in with your credentials." };
  } catch (err) {
    console.error("Unexpected error during signup:", err);
    return { success: false, message: "An unexpected error occurred" };
  }
};

// Login user with Supabase Auth
export const signIn = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Error signing in:", error);
      return { success: false, message: error.message };
    }

    return { success: true, message: "Login successful!" };
  } catch (err) {
    console.error("Unexpected error during signin:", err);
    return { success: false, message: "An unexpected error occurred" };
  }
};

// Logout user from Supabase Auth
export const signOut = async (): Promise<{ success: boolean; message: string }> => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Error signing out:", error);
      return { success: false, message: error.message };
    }

    return { success: true, message: "Logged out successfully" };
  } catch (err) {
    console.error("Unexpected error during signout:", err);
    return { success: false, message: "An unexpected error occurred" };
  }
};

// Get current user session
export const getCurrentUser = async () => {
  try {
    const { data } = await supabase.auth.getSession();
    return data.session?.user || null;
  } catch (err) {
    console.error("Error getting current user:", err);
    return null;
  }
};

// Reaction functions
export type Reaction = {
  id: string;
  blog_id: number;
  user_id: string;
  reaction: string;
};
export async function fetchReactions(blogId: number) {
  const { data, error } = await supabase
    .from("reactions")
    .select("reaction")
    .eq("blog_id", blogId);

  if (error) {
    console.error("Error fetching reactions:", error.message || error);
    return [];
  }

  return data;
}
export async function upsertReaction(
  blogId: number,
  userId: string,
  reaction: string
) {
  const { error } = await supabase
    .from("reactions")
    .upsert(
      { blog_id: blogId, user_id: userId, reaction },
      { onConflict: "blog_id,user_id" }
    );

  if (error) {
    console.error("Error upserting reaction:", error.message || error);
    throw error;
  }
}
export async function removeReaction(blogId: number, userId: string) {
  const { error } = await supabase
    .from("reactions")
    .delete()
    .eq("blog_id", blogId)
    .eq("user_id", userId);

  if (error) throw error;
}
