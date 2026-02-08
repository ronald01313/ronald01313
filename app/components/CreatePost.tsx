

import { useState, useEffect, type ReactNode } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { createBlog, getCurrentUser, uploadAndSaveBlogImage, updateBlog, getBlogById, supabase} from "../lib/supabase";

interface CreatePostProps {
  onPostCreated?: () => void;
}

const ToolbarButton = ({ onClick, title, icon }: { onClick: () => void, title: string, icon: ReactNode }) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    className="p-2.5 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl transition-all flex items-center justify-center border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 shadow-sm"
  >
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      {icon}
    </svg>
  </button>
);

export default function CreatePost({ onPostCreated }: CreatePostProps) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const editId = searchParams.get('edit');
  const [isEditing, setIsEditing] = useState(false);

  const [userId, setUserId] = useState<string | null>(null);
  const [userLoading, setUserLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    category: "",
  });
  const [uploadedImages, setUploadedImages] = useState<{ url: string; file: string; fileObject?: File; existing?: boolean; id?: number }[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageUploadSuccess, setImageUploadSuccess] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await getCurrentUser();
        if (user) {
          setUserId(user.id);
        } else {
          setError("You must be logged in to create a post");
        }
      } catch (err) {
        console.error("Error loading user:", err);
        setError("Failed to load user information");
      } finally {
        setUserLoading(false);
      }
    };
    loadUser();
  }, []);

  useEffect(() => {
    const loadBlogForEdit = async () => {
      if (editId && userId) {
        try {
          const blogId = parseInt(editId);
          if (isNaN(blogId)) {
            setError("Invalid blog ID");
            return;
          }
          const blog = await getBlogById(blogId);
          if (blog && blog.user_id === userId) {
            setFormData({
              title: blog.title,
              excerpt: blog.excerpt || "",
              content: blog.content,
              category: blog.category || "",
            });

            // Don't load existing images - we'll replace them entirely when editing

            setIsEditing(true);
          } else {
            setError("Blog not found or you don't have permission to edit it");
          }
        } catch (err) {
          console.error("Error loading blog for edit:", err);
          setError("Failed to load blog for editing");
        }
      }
    };
    loadBlogForEdit();
  }, [editId, userId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const applyTextFormat = (format: string) => {
    const textarea = document.querySelector('textarea[name="content"]') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = formData.content.substring(start, end) || "";
    const before = formData.content.substring(0, start);
    const after = formData.content.substring(end);

    let formatted = "";

    switch (format) {
      case "bold":
        formatted = selected 
          ? `${before}**${selected}**${after}`
          : `${before}**bold text**${after}`;
        break;
      case "italic":
        formatted = selected 
          ? `${before}_${selected}_${after}`
          : `${before}_italic text_${after}`;
        break;
      case "code":
        formatted = selected 
          ? `${before}\`${selected}\`${after}`
          : `${before}\`code\`${after}`;
        break;
      case "link":
        formatted = selected 
          ? `${before}[${selected}](url)${after}`
          : `${before}[link text](url)${after}`;
        break;
      case "heading":
        formatted = selected 
          ? `${before}## ${selected}${after}`
          : `${before}## Heading${after}`;
        break;
      case "list-ul":
        formatted = selected 
          ? `${before}\n- ${selected.replace(/\n/g, "\n- ")}${after}`
          : `${before}\n- List item${after}`;
        break;
      case "list-ol":
        formatted = selected 
          ? `${before}\n1. ${selected.replace(/\n/g, "\n1. ")}${after}`
          : `${before}\n1. List item${after}`;
        break;
      case "hr":
        formatted = `${before}\n---\n${after}`;
        break;
      case "quote":
        formatted = selected 
          ? `${before}\n> ${selected.replace(/\n/g, "\n> ")}${after}`
          : `${before}\n> Quote${after}`;
        break;
      default:
        return;
    }

    // Update state with formatted content
    setFormData((prev) => ({
      ...prev,
      content: formatted,
    }));

    // Restore focus and position cursor after state update
    setTimeout(() => {
      textarea.focus();
      let newPos = start + 2; // default offset
      if (format === "bold") newPos = start + 2;
      else if (format === "italic") newPos = start + 1;
      else if (format === "code") newPos = start + 1;
      else if (format === "heading") newPos = start + 3;
      else if (format === "link") newPos = start + 1;
      
      textarea.setSelectionRange(newPos, newPos);
    }, 0);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    setImageLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        const previewUrl = event.target?.result as string;
        const imageName = file.name;

        // Store file reference for later upload (not the preview URL)
        setUploadedImages((prev) => [...prev, {
          url: previewUrl, // Preview for display
          file: imageName,
          fileObject: file // Store the actual file object
        }]);
        setImageUploadSuccess(true);
        setTimeout(() => setImageUploadSuccess(false), 3000);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error("Error handling image:", err);
      setError("Failed to process image");
    } finally {
      setImageLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    // Validation
    if (!formData.title || !formData.content || !formData.category) {
      setError("Please fill in all required fields");
      setLoading(false);
      return;
    }

    if (formData.title.length < 5) {
      setError("Title must be at least 5 characters");
      setLoading(false);
      return;
    }

    if (formData.content.length < 20) {
      setError("Content must be at least 20 characters");
      setLoading(false);
      return;
    }

    if (!userId) {
      setError("User not authenticated. Please log in again.");
      setLoading(false);
      return;
    }

    try {
      let finalContent = formData.content;

      if (isEditing && editId) {
        // Update existing blog
        const blogId = parseInt(editId);
        const result = await updateBlog(blogId, {
          title: formData.title,
          excerpt: formData.excerpt,
          content: finalContent,
          category: formData.category,
        });

        if (result) {
          // Handle image uploads for editing (if any new images)
          let updatedContent = finalContent;

          const newImages = uploadedImages.filter(img => img.fileObject);

          if (newImages.length > 0) {
            // Delete all existing blog_images for this blog
            await supabase.from('blog_images').delete().eq('blog_id', blogId);

            let firstNew = true;
            for (const img of uploadedImages) {
              if (img.fileObject) {
                // Upload with correct is_featured
                const image = await uploadAndSaveBlogImage(img.fileObject, blogId, userId, img.file, firstNew);

                if (image) {
                  updatedContent = updatedContent.replace(img.url, image.image_url);
                }
                firstNew = false;
              }
            }
          }

          if (updatedContent !== finalContent) {
            await updateBlog(blogId, {
              content: updatedContent,
            });
          }

          setSuccess(true);
          setTimeout(() => setSuccess(false), 3000);

          // Navigate to profile page with success notification
          navigate("/profile?edited=true");

          // Notify parent to refresh posts
          if (onPostCreated) {
            onPostCreated();
          }
        } else {
          setError("Failed to update post. Please try again.");
        }
      } else {
        // Create new blog
        const result = await createBlog({
          user_id: userId,
          title: formData.title,
          excerpt: formData.excerpt,
          content: finalContent,
          category: formData.category,
          published: true,
        });

        if (result) {
          // Now upload images and update content with real URLs
          let updatedContent = finalContent;

          for (const img of uploadedImages) {
            if (img.fileObject) {
              const image = await uploadAndSaveBlogImage(img.fileObject, result.id, userId, img.file,
                uploadedImages.length === 1
              );

              if (image) {
                updatedContent = updatedContent.replace(img.url, image.image_url);
              }
            }
          }

          if (updatedContent !== finalContent) {
            await updateBlog(result.id, {
              content: updatedContent,
            });
          }

          // Navigate to the newly created post
          navigate(`/post/${result.id}`);

          // Reset form
          setFormData({
            title: "",
            excerpt: "",
            content: "",
            category: "",
          });
          setUploadedImages([]);
          setImageUploadSuccess(false);
          setSuccess(true);
          setTimeout(() => setSuccess(false), 3000);

          // Notify parent to refresh posts
          if (onPostCreated) {
            onPostCreated();
          }
        } else {
          setError("Failed to create post. Please try again.");
        }
      }
    } catch (err) {
      console.error("Error submitting post:", err);
      const errorMessage = err instanceof Error ? err.message : "An error occurred while submitting the post.";
      setError(`Failed to ${isEditing ? 'update' : 'create'} post: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  if (userLoading) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-12 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl text-center shadow-xl transition-all duration-500">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-widest text-xs">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto my-12 p-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-xl transition-all duration-500">
      <div className="text-center mb-10">
        <h2 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tighter uppercase">{isEditing ? "Edit Story" : "New Story"}</h2>
        <p className="text-zinc-500 dark:text-zinc-400 mt-2 font-medium">Share your unique insights with the community</p>
      </div>

      {success && (
        <div className="p-5 mb-8 bg-green-50/50 dark:bg-green-900/10 text-green-700 dark:text-green-400 rounded-2xl text-sm font-bold border border-green-100 dark:border-green-900/30 flex items-center gap-3 shadow-sm transition-all duration-500">
          <span className="text-lg">✅</span> {isEditing ? "Story updated successfully" : "Story created successfully"}
        </div>
      )}

      {error && (
        <div className="p-5 mb-8 bg-red-50/50 dark:bg-red-900/10 text-red-700 dark:text-red-400 rounded-2xl text-sm font-bold border border-red-100 dark:border-red-900/30 flex items-center gap-3 shadow-sm transition-all duration-500">
          <span className="text-lg">⚠️</span> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="block text-xs font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest ml-1">
              Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              disabled={loading || !userId}
              className="w-full p-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium shadow-inner disabled:opacity-50"
              placeholder="Give your story a title..."
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest ml-1">
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              disabled={loading || !userId}
              className="w-full p-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium shadow-inner disabled:opacity-50 appearance-none cursor-pointer"
              required
            >
              <option value="">Select Category</option>
              <option value="Technology">Technology</option>
              <option value="Lifestyle">Lifestyle</option>
              <option value="Travel">Travel</option>
              <option value="Food">Food</option>
              <option value="Business">Business</option>
              <option value="Health">Health</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest ml-1">
            Summary
          </label>
          <input
            type="text"
            name="excerpt"
            value={formData.excerpt}
            onChange={handleChange}
            disabled={loading || !userId}
            className="w-full p-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium shadow-inner disabled:opacity-50"
            placeholder="A brief summary of your post..."
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
            Content
          </label>
          
          <div className="border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 transition-all">
            {/* Professional Toolbar */}
            <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-2 flex flex-wrap gap-1 items-center">
              {/* Text Style Group */}
              <div className="flex items-center gap-0.5 pr-2 border-r border-gray-300 dark:border-gray-600 mr-2">
                <ToolbarButton 
                  onClick={() => applyTextFormat("bold")} 
                  title="Bold (Ctrl+B)"
                  icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z" />}
                />
                <ToolbarButton 
                  onClick={() => applyTextFormat("italic")} 
                  title="Italic (Ctrl+I)"
                  icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m-4 0h4m-6 16h4" />}
                />
                <ToolbarButton 
                  onClick={() => applyTextFormat("quote")} 
                  title="Quote"
                  icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />}
                />
              </div>

              {/* Formatting Group */}
              <div className="flex items-center gap-0.5 pr-2 border-r border-gray-300 dark:border-gray-600 mr-2">
                <ToolbarButton 
                  onClick={() => applyTextFormat("heading")} 
                  title="Heading"
                  icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />}
                />
                <ToolbarButton 
                  onClick={() => applyTextFormat("list-ul")} 
                  title="Bullet List"
                  icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16M4 6h.01M4 12h.01M4 18h.01" />}
                />
                <ToolbarButton 
                  onClick={() => applyTextFormat("list-ol")} 
                  title="Numbered List"
                  icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 6h13M7 12h13M7 18h13M3 6h.01M3 12h.01M3 18h.01" />}
                />
              </div>

              {/* Insert Group */}
              <div className="flex items-center gap-0.5">
                <ToolbarButton 
                  onClick={() => applyTextFormat("link")} 
                  title="Insert Link"
                  icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />}
                />
                <ToolbarButton 
                  onClick={() => applyTextFormat("code")} 
                  title="Code Block"
                  icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />}
                />
                <ToolbarButton 
                  onClick={() => applyTextFormat("hr")} 
                  title="Horizontal Rule"
                  icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12h16" />}
                />
              </div>
            </div>

            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              disabled={loading || !userId}
              className="w-full p-6 bg-white dark:bg-gray-900 border-none outline-none disabled:opacity-50 min-h-[400px] resize-vertical font-mono text-sm leading-relaxed text-gray-900 dark:text-gray-100"
              placeholder="Start writing your masterpiece... (Markdown supported)"
              required
            />
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-4 uppercase tracking-wider">
            Images
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={loading || !userId || imageLoading}
            className="block w-full text-sm text-gray-500 dark:text-gray-400
              file:mr-4 file:py-2.5 file:px-4
              file:rounded-xl file:border-0
              file:text-sm file:font-bold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100 transition-all"
          />
          
          {uploadedImages.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
              {uploadedImages.map((img, idx) => (
                <div key={idx} className="relative group rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800">
                  <img src={img.url} alt="Preview" className="w-full h-24 object-cover" />
                  <button
                    type="button"
                    onClick={() => setUploadedImages(prev => prev.filter((_, i) => i !== idx))}
                    className="absolute top-1 right-1 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-md"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-6 pt-8">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-10 py-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-xl font-black uppercase tracking-widest hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all text-xs border border-zinc-200 dark:border-zinc-700 shadow-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !userId}
            className={`px-14 py-4 rounded-xl text-white font-black uppercase tracking-widest text-xs shadow-xl transition-all duration-500 ${
              loading 
              ? "bg-zinc-300 dark:bg-zinc-800 cursor-not-allowed text-zinc-500"
                : "bg-blue-600 hover:bg-blue-700 shadow-blue-500/20"
            }`}
          >
            {loading ? "Saving..." : isEditing ? "Update Story" : "Publish Story"}
          </button>
        </div>
      </form>
    </div>
  );
}
