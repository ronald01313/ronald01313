"use client";

import { useState, useEffect } from "react";
import {
  fetchBlogs,
  getComments,
  addComment,
  fetchReactions,
  upsertReaction,
  getCurrentUser,
  type Blog,
} from "../lib/supabase";


const formatDate = (value?: string | null) => {
  if (!value) return "—";

  const date = new Date(value);
  if (isNaN(date.getTime())) return "—";

  return date.toISOString().split("T")[0];
};

const countReactions = (reactions: any[], type: string) => {
  return reactions?.filter((r) => r.reaction === type).length || 0;
};


export default function Home() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [comments, setComments] = useState<Record<string, any[]>>({});
  const [reactions, setReactions] = useState<Record<string, any[]>>({});
  const [commentText, setCommentText] = useState<Record<string, string>>({});
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  /* ------------------ Load user ------------------ */
  useEffect(() => {
    getCurrentUser().then((user) => setUserId(user?.id ?? null));
  }, []);

  /* ------------------ Load blogs ------------------ */
  const loadBlogs = async () => {
    setLoading(true);
    const data = await fetchBlogs();
    setBlogs(data);
    setLoading(false);
  };

  /* ------------------ Load comments & reactions ------------------ */
  const loadExtras = async (blogId: string) => {
    const [c, r] = await Promise.all([
      getComments(parseInt(blogId)),
      fetchReactions(blogId),
    ]);

    setComments((prev) => ({ ...prev, [blogId]: c }));
    setReactions((prev) => ({ ...prev, [blogId]: r }));
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    loadBlogs();
  }, [mounted]);

  useEffect(() => {
    blogs.forEach((b) => loadExtras(b.id.toString()));
  }, [blogs]);

  if (!mounted) return null;

  return (
    <div>
       <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px" }}>
         <span>{formatDate(blogs[0]?.created_at)}</span>
      <span>By {blogs[0]?.profiles?.username || "Unknown"}</span></div>

      {/* Header */}
      <header style={{ textAlign: "center", marginBottom: "50px" }}>
        <h1 style={{ fontSize: "48px", margin: "0 0 10px 0", color: "#333" }}>My Blog</h1>
        <p style={{ fontSize: "18px", color: "#666", margin: "0" }}>Thoughts, stories, and ideas</p>
      </header>

    

      {/* Featured Posts */}
      <section>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
          <h2 style={{ fontSize: "32px", margin: "0", color: "#333" }}>
            Latest Posts {blogs.length > 0 && `(${blogs.length} ${blogs.length === 1 ? "Post" : "Posts"})`}
          </h2>
          <button
            onClick={loadBlogs}
            disabled={loading}
            style={{
              padding: "8px 16px",
              backgroundColor: "#2196F3",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: "14px",
              fontWeight: "600",
              opacity: loading ? 0.6 : 1,
              transition: "all 0.2s"
            }}
          >
            {loading ? "Refreshing..." : "🔄 Refresh"}
          </button>
        </div>
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#999" }}>
            <p>Loading posts...</p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "30px" }}>
            {blogs.length > 0 ? (
              blogs.map((blog) => (
                <article
                  key={blog.id}
                  style={{
                    padding: "25px",
                    border: "1px solid #e0e0e0",
                    borderRadius: "8px",
                    transition: "all 0.3s ease",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "10px" }}>
                    <h3 style={{ margin: "0 0 10px 0", color: "#333", fontSize: "24px" }}>
                      {blog.title}
                    </h3>
                    {blog.category && <span style={{
                      backgroundColor: "#f0f0f0",
                      padding: "4px 12px",
                      borderRadius: "20px",
                      fontSize: "12px",
                      whiteSpace: "nowrap"
                    }}>
                      {blog.category}
                    </span>}
                  </div>

                  {/* Display featured image or first image */}
                  {blog.blog_images && blog.blog_images.length > 0 && (
                    <div style={{ marginBottom: "15px" }}>
                      <img
                        src={blog.blog_images.find(img => img.is_featured)?.image_url || blog.blog_images[0].image_url}
                        alt={blog.title}
                        style={{
                          width: "100%",
                          maxHeight: "300px",
                          objectFit: "cover",
                          borderRadius: "8px",
                          border: "1px solid #e0e0e0"
                        }}
                      />
                    </div>
                  )}
                  {blog.excerpt && <p style={{ color: "#666", margin: "0 0 15px 0", lineHeight: "1.6" }}>
                    {blog.excerpt}
                  </p>}
                  <div style={{ display: "flex", justifyContent: "space-between", color: "#999", fontSize: "14px" }}>
                    <span>{new Date(blog.created_at).toLocaleDateString()}</span>
                    <span>By {blog.profiles?.username || "Unknown"}</span>
                  </div>

                  {/* Reactions */}
                  <div style={{ marginTop: "15px" }}>
                    <button
                      disabled={!userId}
                      onClick={async () => {
                        await upsertReaction(blog.id.toString(), userId!, "like");
                        loadExtras(blog.id.toString());
                      }}
                    >
                      👍{" "}
                      {reactions[blog.id.toString()]?.filter((r) => r.reaction === "like")
                        .length || 0}
                    </button>

                    <button
                      disabled={!userId}
                      onClick={async () => {
                        await upsertReaction(blog.id.toString(), userId!, "dislike");
                        loadExtras(blog.id.toString());
                      }}
                      style={{ marginLeft: "10px" }}
                    >
                      👎{" "}
                      {reactions[blog.id.toString()]?.filter((r) => r.reaction === "dislike")
                        .length || 0}
                    </button>
                  </div>

                  {/* Comments */}
                  <div style={{ marginTop: "20px" }}>
                    <h4>Comments</h4>

                    {comments[blog.id.toString()]?.length ? (
                      comments[blog.id.toString()].map((c) => (
                        <div
                          key={c.id}
                          style={{
                            padding: "8px 0",
                            borderBottom: "1px solid #eee",
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                            <strong>{c.profiles?.username || "Anonymous"}</strong>
                            <span style={{ fontSize: "12px", color: "#999" }}>{new Date(c.created_at).toLocaleDateString()}</span>
                          </div>
                          <p style={{ margin: "4px 0" }}>{c.content}</p>
                        </div>
                      ))
                    ) : (
                      <p style={{ color: "#999" }}>No comments yet</p>
                    )}

                    {/* Add comment */}
                    {userId && (
                      <div style={{ marginTop: "10px" }}>
                        <textarea
                          placeholder="Write a comment..."
                          value={commentText[blog.id.toString()] || ""}
                          onChange={(e) =>
                            setCommentText((prev) => ({
                              ...prev,
                              [blog.id.toString()]: e.target.value,
                            }))
                          }
                          style={{ width: "100%", padding: "8px" }}
                        />
                        <button
                          onClick={async () => {
                            if (!commentText[blog.id.toString()]) return;
                            await addComment({ blog_id: blog.id, user_id: userId!, content: commentText[blog.id.toString()] });
                            setCommentText((prev) => ({
                              ...prev,
                              [blog.id.toString()]: "",
                            }));
                            loadExtras(blog.id.toString());
                          }}
                          style={{ marginTop: "5px" }}
                        >
                          Post Comment
                        </button>
                      </div>
                    )}
                  </div>
                </article>
              ))
            ) : (
              <p style={{ textAlign: "center", color: "#999", padding: "40px" }}>No posts yet. Create your first post!</p>
            )}
          </div>
        )}
      </section>

      {/* Footer CTA */}
      <section style={{ textAlign: "center", marginTop: "50px", padding: "30px", backgroundColor: "#f9f9f9", borderRadius: "8px" }}>
        <h2 style={{ color: "#333", marginBottom: "10px" }}>Want to stay updated?</h2>
        <p style={{ color: "#666", marginBottom: "20px" }}>Subscribe to get new posts delivered to your inbox</p>
        <button
          style={{
            padding: "12px 30px",
            fontSize: "16px",
            backgroundColor: "rgb(255, 152, 0)",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "500",
            transition: "all 0.3s ease",
          }}
        >
          Subscribe Now
        </button>
      </section>
    </div>
  );
}
