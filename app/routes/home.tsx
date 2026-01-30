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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <h2 className="text-3xl sm:text-4xl m-0 text-gray-800">
            Latest Posts {blogs.length > 0 && `(${blogs.length} ${blogs.length === 1 ? "Post" : "Posts"})`}
          </h2>
          <button
            onClick={loadBlogs}
            disabled={loading}
            className="mt-4 sm:mt-0 px-4 py-2 bg-blue-500 text-white border-none rounded cursor-pointer text-sm font-semibold opacity-60 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200"
          >
            {loading ? "Refreshing..." : "🔄 Refresh"}
          </button>
        </div>
        {loading ? (
          <div className="text-center py-10 text-gray-500">
            <p>Loading posts...</p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
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
              <p className="text-center text-gray-500 py-10 col-span-full">No posts yet. Create your first post!</p>
            )}
          </div>
        )}
      </section>

      <FooterCTA />
    </div>
  );
}
