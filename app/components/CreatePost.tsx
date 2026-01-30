

import { useState, useEffect } from "react";
import { createBlog, getCurrentUser, uploadAndSaveBlogImage, updateBlog} from "../lib/supabase";

interface CreatePostProps {
  onPostCreated?: () => void;
}

export default function CreatePost({ onPostCreated }: CreatePostProps) {
  const [userId, setUserId] = useState<string | null>(null);
  const [userLoading, setUserLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    category: "",
  });
  const [uploadedImages, setUploadedImages] = useState<{ url: string; file: string; fileObject?: File }[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);

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

      // Upload images to Supabase Storage first (temporary - before blog creation)
      // We need to create the blog first to get an ID, then upload images
      const result = await createBlog({
        user_id: userId,
        title: formData.title,
        excerpt: formData.excerpt,
        content: finalContent,
        category: formData.category,
        published: true, // Changed to true for testing
      });

      if (result) {
        // Now upload images and update content with real URLs
        let updatedContent = finalContent;
        
        for (const img of uploadedImages) {
          if (img.fileObject) {
            // Upload to Supabase Storage
            const image = await uploadAndSaveBlogImage(img.fileObject,result.id,userId,img.file,
                uploadedImages.length === 1 // first image = featured
                );

                if (image) {
                // Replace preview URL with real public URL
                updatedContent = updatedContent.replace(img.url, image.image_url);
                }

          }
        }

        // Update blog content with real image URLs if any images were uploaded
        if (updatedContent !== finalContent) {
          await updateBlog(result.id, {
            content: updatedContent,
          });
        }

        // Reset form
        setFormData({
          title: "",
          excerpt: "",
          content: "",
          category: "",
        });
        setUploadedImages([]);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);

        // Notify parent to refresh posts
        if (onPostCreated) {
          onPostCreated();
        }
      } else {
        setError("Failed to create post. Please try again.");
      }
    } catch (err) {
      console.error("Error creating post:", err);
      const errorMessage = err instanceof Error ? err.message : "An error occurred while creating the post.";
      setError(`Failed to create post: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  if (userLoading) {
    return (
      <div className="max-w-2xl mx-auto my-10 p-8 border border-gray-200 rounded-lg text-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto my-10 p-8 border border-gray-200 rounded-lg">
      <h2 className="mb-8 text-gray-800">Create New Post</h2>

      {error && (
        <div className="p-3 mb-5 bg-red-50 text-red-700 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 mb-5 bg-green-50 text-green-800 rounded">
          Post created successfully!
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-5">
          <label className="block mb-2 text-gray-800 font-medium">
            Post Title
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            disabled={loading || !userId}
            className="w-full p-3 border border-gray-300 rounded text-base box-border text-gray-800 disabled:opacity-60"
            placeholder="Enter post title"
          />
        </div>

        <div className="mb-5">
          <label className="block mb-2 text-gray-800 font-medium">
            Category
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            disabled={loading || !userId}
            className="w-full p-3 border border-gray-300 rounded text-base box-border text-gray-800 disabled:opacity-60"
          >
            <option value="">Select a category</option>
            <option value="React">React</option>
            <option value="Web Dev">Web Dev</option>
            <option value="Performance">Performance</option>
            <option value="JavaScript">JavaScript</option>
            <option value="TypeScript">TypeScript</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="mb-5">
          <label className="block mb-2 text-gray-800 font-medium">
            Excerpt
          </label>
          <textarea
            name="excerpt"
            value={formData.excerpt}
            onChange={handleChange}
            disabled={loading || !userId}
            className="w-full p-3 border border-gray-300 rounded text-base box-border min-h-20 font-inherit text-gray-800 disabled:opacity-60"
            placeholder="Brief summary of your post"
          />
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", marginBottom: "5px", color: "#333", fontWeight: "500" }}>
            Content
          </label>
          
          {/* Text Formatting Toolbar */}
          <div style={{
            display: "flex",
            gap: "5px",
            marginBottom: "10px",
            padding: "10px",
            backgroundColor: "#e3f2fd",
            borderRadius: "4px",
            flexWrap: "wrap",
            border: "2px solid #2196F3",
          }}>
            <button
              type="button"
              onClick={() => applyTextFormat("bold")}
              disabled={loading || !userId}
              title="Bold (use **text**)"
              style={{
                padding: "6px 12px",
                backgroundColor: "#FF6B6B",
                border: "none",
                borderRadius: "4px",
                cursor: loading || !userId ? "not-allowed" : "pointer",
                fontWeight: "bold",
                fontSize: "14px",
                color: "white",
                transition: "all 0.2s",
                opacity: loading || !userId ? 0.5 : 1,
              }}
            >
              <strong>B</strong>
            </button>
            <button
              type="button"
              onClick={() => applyTextFormat("italic")}
              disabled={loading || !userId}
              title="Italic (use _text_)"
              style={{
                padding: "6px 12px",
                backgroundColor: "#4ECDC4",
                border: "none",
                borderRadius: "4px",
                cursor: loading || !userId ? "not-allowed" : "pointer",
                fontStyle: "italic",
                fontSize: "14px",
                color: "white",
                transition: "all 0.2s",
                opacity: loading || !userId ? 0.5 : 1,
              }}
            >
              I
            </button>
            <button
              type="button"
              onClick={() => applyTextFormat("code")}
              disabled={loading || !userId}
              title="Code (use `code`)"
              style={{
                padding: "6px 12px",
                backgroundColor: "#95E1D3",
                border: "none",
                borderRadius: "4px",
                cursor: loading || !userId ? "not-allowed" : "pointer",
                fontFamily: "monospace",
                fontSize: "12px",
                color: "#333",
                transition: "all 0.2s",
                opacity: loading || !userId ? 0.5 : 1,
              }}
            >
              &lt;/&gt;
            </button>
            <button
              type="button"
              onClick={() => applyTextFormat("heading")}
              disabled={loading || !userId}
              title="Heading (use ##)"
              style={{
                padding: "6px 12px",
                backgroundColor: "#FFD93D",
                border: "none",
                borderRadius: "4px",
                cursor: loading || !userId ? "not-allowed" : "pointer",
                fontWeight: "bold",
                fontSize: "16px",
                color: "#333",
                transition: "all 0.2s",
                opacity: loading || !userId ? 0.5 : 1,
              }}
            >
              H
            </button>
            <button
              type="button"
              onClick={() => applyTextFormat("link")}
              disabled={loading || !userId}
              title="Link (use [text](url))"
              style={{
                padding: "6px 12px",
                backgroundColor: "#6BCB77",
                border: "none",
                borderRadius: "4px",
                cursor: loading || !userId ? "not-allowed" : "pointer",
                color: "white",
                fontSize: "14px",
                transition: "all 0.2s",
                opacity: loading || !userId ? 0.5 : 1,
              }}
            >
              🔗
            </button>
          </div>

          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            disabled={loading || !userId}
            style={{
              width: "100%",
              padding: "10px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              fontSize: "16px",
              boxSizing: "border-box",
              minHeight: "250px",
              fontFamily: "inherit",
              color: "#333",
              opacity: loading || !userId ? 0.6 : 1,
            }}
            placeholder="Write your post content here... (Supports markdown formatting)"
          />
        </div>

        {/* Image Upload Section */}
        <div className="mb-5 p-4 bg-blue-50 rounded-lg border-2 border-teal-400">
          <label className="block mb-3 text-gray-800 font-semibold text-base">
            📷 Upload Images
          </label>

          {/* File Input Wrapper with Styled Button */}
          <div className="relative inline-block w-full">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={loading || !userId || imageLoading}
              className="absolute opacity-0 w-full h-full cursor-pointer disabled:cursor-not-allowed"
            />
            <button
              type="button"
              disabled={loading || !userId || imageLoading}
              className="w-full p-3 bg-teal-400 border-2 border-teal-400 rounded cursor-pointer text-white font-semibold text-sm transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60"
              onClick={(e) => {
                const input = (e.currentTarget.parentElement?.querySelector('input[type="file"]') as HTMLInputElement);
                input?.click();
              }}
            >
              {imageLoading ? "⏳ Uploading..." : "📁 Choose Image File"}
            </button>
          </div>

          <p className="text-xs text-gray-600 mt-2 font-medium">
            ✅ Upload PNG, JPG, GIF, or WebP
          </p>

          {/* Image Previews */}
          {uploadedImages.length > 0 && (
            <div className="mt-4 p-3 bg-white rounded border border-gray-300">
              <h4 className="text-teal-400 mb-3 text-sm">✓ Uploaded Images ({uploadedImages.length}):</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {uploadedImages.map((img, idx) => (
                  <div key={idx} className="relative shadow-md">
                    <img
                      src={img.url}
                      alt={img.file}
                      className="w-full h-24 object-cover rounded border-2 border-teal-400"
                    />
                    <p className="text-xs text-gray-600 mt-1 text-center break-words">
                      {img.file}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || !userId}
          className="w-full p-3 bg-green-500 text-white border-none rounded text-base font-medium cursor-pointer disabled:cursor-not-allowed disabled:bg-gray-400 mt-3 transition-all duration-300"
        >
          {!userId ? "Please log in to create posts" : loading ? "Creating..." : "Create Post"}
        </button>
      </form>
    </div>
  );
}
