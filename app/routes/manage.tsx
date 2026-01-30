import { useState, useEffect } from "react";
import { DeletePost } from "../components/DeletePost";
import { getUserBlogs, type Blog, getCurrentUser, updateBlog } from "../lib/supabase";

export default function ManagePage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [publishLoading, setPublishLoading] = useState<number | null>(null);

  useEffect(() => {
    const loadUserAndBlogs = async () => {
      setLoading(true);
      const user = await getCurrentUser();
      if (user) {
        setUserId(user.id);
        const userBlogs = await getUserBlogs(user.id);
        setBlogs(userBlogs);
      }
      setLoading(false);
    };
    loadUserAndBlogs();
  }, []);

  const handleDeletePost = async () => {
    // Refresh blogs after deletion
    if (userId) {
      const userBlogs = await getUserBlogs(userId);
      setBlogs(userBlogs);
    }
  };

  const handlePublishToggle = async (blog: Blog) => {
    setPublishLoading(blog.id);
    try {
      const updated = await updateBlog(blog.id, {
        published: !blog.published,
      });
      if (updated) {
        setBlogs(blogs.map(b => b.id === blog.id ? updated : b));
      }
    } catch (err) {
      console.error("Error updating blog:", err);
    } finally {
      setPublishLoading(null);
    }
  };

  return (
    <div style={{ maxWidth: "900px", margin: "40px auto" }}>
      <h2 style={{ fontSize: "32px", marginBottom: "30px", color: "#333" }}>Manage Posts</h2>
      {!userId && (
        <div style={{ padding: "10px", marginBottom: "20px", backgroundColor: "#fee", color: "#c00", borderRadius: "4px" }}>
          You must be logged in to manage posts.
        </div>
      )}
      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#999" }}>
          <p>Loading posts...</p>
        </div>
      ) : (
        <>
          {blogs.length > 0 ? (
            <div style={{ display: "grid", gap: "20px" }}>
              {blogs.map((blog) => (
                <div
                  key={blog.id}
                  style={{
                    padding: "20px",
                    border: "1px solid #e0e0e0",
                    borderRadius: "8px",
                    backgroundColor: "#f9f9f9",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "15px" }}>
                    <div>
                      <h3 style={{ margin: "0 0 5px 0", color: "#333", fontSize: "20px" }}>
                        {blog.title}
                        {blog.published && <span style={{
                          marginLeft: "10px",
                          backgroundColor: "#4CAF50",
                          color: "white",
                          padding: "2px 8px",
                          borderRadius: "4px",
                          fontSize: "12px",
                          fontWeight: "bold"
                        }}>Published</span>}
                        {!blog.published && <span style={{
                          marginLeft: "10px",
                          backgroundColor: "#999",
                          color: "white",
                          padding: "2px 8px",
                          borderRadius: "4px",
                          fontSize: "12px",
                          fontWeight: "bold"
                        }}>Draft</span>}
                      </h3>
                      <p style={{ color: "#666", margin: "0", fontSize: "14px" }}>
                        {new Date(blog.created_at).toLocaleDateString()} {blog.category && `• ${blog.category}`}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                    <button
                      onClick={() => handlePublishToggle(blog)}
                      disabled={publishLoading === blog.id || !userId}
                      style={{
                        padding: "8px 16px",
                        backgroundColor: blog.published ? "#FF6B6B" : "#4CAF50",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: publishLoading === blog.id || !userId ? "not-allowed" : "pointer",
                        fontSize: "14px",
                        fontWeight: "600",
                        opacity: publishLoading === blog.id || !userId ? 0.6 : 1,
                        transition: "all 0.2s"
                      }}
                    >
                      {publishLoading === blog.id ? "..." : blog.published ? "Unpublish" : "Publish"}
                    </button>
                  </div>
                  <DeletePost
                    postId={blog.id}
                    postTitle={blog.title}
                    onDelete={handleDeletePost}
                    disabled={!userId}
                  />
                </div>
              ))}
            </div>
          ) : (
            <p style={{ textAlign: "center", color: "#999", padding: "40px" }}>No posts to manage.</p>
          )}
        </>
      )}
    </div>
  );
}
