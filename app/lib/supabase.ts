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
      .select("*, profiles(username, avatar_url), blog_images(*)")
      .eq("published", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching blogs:", error);
      return [];
    }

    return data || [];
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
export const uploadBlogImage = async (file: File, blogId: number, userId: string): Promise<string | null> => {
  try {
    const fileExt = file.name.split(".").pop();
    const fileName = `${blogId}_${userId}_${Date.now()}.${fileExt}`;
    const filePath = `blog_images/${fileName}`;

    // Try to upload, if bucket doesn't exist, create it first
    let uploadResult = await supabase.storage
      .from("blog-images")
      .upload(filePath, file);

    // If bucket doesn't exist, create it
    if (uploadResult.error?.message?.includes("Bucket not found")) {
      try {
        await supabase.storage.createBucket("blog-images", {
          public: true,
          fileSizeLimit: 10485760, // 10MB
        });
        // Retry upload
        uploadResult = await supabase.storage
          .from("blog-images")
          .upload(filePath, file);
      } catch (bucketErr) {
        console.error("Error creating bucket:", bucketErr);
      }
    }

    if (uploadResult.error) {
      console.error("Error uploading image:", uploadResult.error);
      return null;
    }

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from("blog-images")
      .getPublicUrl(filePath);

    return urlData?.publicUrl || null;
  } catch (err) {
    console.error("Unexpected error uploading image:", err);
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
export const getComments = async (blogId: number): Promise<Comment[]> => {
  try {
    const { data, error } = await supabase
      .from("comments")
      .select("*, profiles(username, avatar_url)")
      .eq("blog_id", blogId)
      .eq("parent_comment_id", null)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching comments:", error);
      return [];
    }

    return data || [];
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
