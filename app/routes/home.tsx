import { useState, useEffect } from "react";
import {
  fetchBlogs,
  getComments,
  //addComment,
  fetchReactions,
  //upsertReaction,
  getCurrentUser,
  type Blog,
} from "../lib/supabase";
import Header from "../components/Header";
import BlogPost from "../components/BlogPost";
import FooterCTA from "../components/FooterCTA";
//import { formatDate } from "../lib/utils";





export default function Home() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [comments, setComments] = useState<Record<string, any[]>>({});
  const [reactions, setReactions] = useState<Record<string, any[]>>({});

  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  /* ------------------ Load user ------------------ */
  useEffect(() => {
    getCurrentUser().then((user) => {
      console.log("Current user:", user);
      console.log("Current user id:", user?.id);
      console.log("User object keys:", user ? Object.keys(user) : "null");
      setUserId(user?.id ?? null);
    });
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
    const blogIdNum = parseInt(blogId);
    if (isNaN(blogIdNum) || blogIdNum == null) {
      console.warn("Invalid blogId for loadExtras:", blogId);
      return;
    }
    const [c, r] = await Promise.all([
      getComments(blogIdNum),
      fetchReactions(blogIdNum),
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
    console.log("Loading extras for blogs:", blogs.map(b => ({ id: b.id, type: typeof b.id })));
    blogs.forEach((b) => {
      if (b.id != null && !isNaN(Number(b.id))) {
        loadExtras(b.id.toString());
      } else {
        console.warn("Skipping blog with invalid id:", b.id, typeof b.id);
      }
    });
  }, [blogs]);

  if (!mounted) return null;

  return (
    <div>
      <Header />

    

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
              blogs.filter(blog => blog.id != null && !isNaN(Number(blog.id))).map((blog) => (
                <BlogPost
                  key={blog.id}
                  blog={blog}
                  comments={comments[blog.id.toString()]}
                  reactions={reactions[blog.id.toString()]}
                  userId={userId}
                  onReactionUpdate={() => loadExtras(blog.id.toString())}
                  onCommentUpdate={() => loadExtras(blog.id.toString())}
                />
              ))
            ) : (
              <p style={{ textAlign: "center", color: "#999", padding: "40px" }}>No posts yet. Create your first post!</p>
            )}
          </div>
        )}
      </section>

      <FooterCTA />
    </div>
  );
}
