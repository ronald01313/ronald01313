import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  fetchBlogs,
  getComments,
  fetchReactions,
  getCurrentUser,
  type Blog,
} from "../lib/supabase";
import Header from "../components/Header";
import BlogPost from "../components/BlogPost";
import FooterCTA from "../components/FooterCTA";
import PostModal from "../components/PostModal";

export default function Home() {
  const location = useLocation();
  const componentKey = location.key || 'home';
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [comments, setComments] = useState<Record<string, any[]>>({});
  const [reactions, setReactions] = useState<Record<string, any[]>>({});
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Modal state
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    // Sort blogs by created_at in descending order (latest first)
    const sortedData = data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    setBlogs(sortedData);
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

    // Always check if we need to refresh due to post edits
    const needsRefresh = localStorage.getItem('blogDataChanged');
    if (needsRefresh === 'true') {
      localStorage.removeItem('blogDataChanged');
      loadBlogs();
    } else {
      loadBlogs();
    }
  }, [mounted]);

  // Also check for data changes on every render (in case component was already mounted)
  useEffect(() => {
    const checkForDataChanges = () => {
      const needsRefresh = localStorage.getItem('blogDataChanged');
      if (needsRefresh === 'true' && mounted) {
        localStorage.removeItem('blogDataChanged');
        loadBlogs();
      }
    };

    // Check immediately
    checkForDataChanges();

    // Also check periodically (every 1 second) in case the flag was set while component was mounted
    const interval = setInterval(checkForDataChanges, 1000);

    return () => clearInterval(interval);
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

  // Force reload when refreshKey changes (triggered by post edits)
  useEffect(() => {
    if (refreshKey > 0) {
      loadBlogs();
    }
  }, [refreshKey]);

  // Refresh blogs when data changes (triggered by post edits)
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'blogDataChanged' && mounted) {
        loadBlogs();
      }
    };

    const handleCustomEvent = () => {
      if (mounted) {
        loadBlogs();
      }
    };

    const handleForceRefresh = () => {
      if (mounted) {
        setRefreshKey(prev => prev + 1);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('blogDataChanged', handleCustomEvent);
    window.addEventListener('forceHomeRefresh', handleForceRefresh);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('blogDataChanged', handleCustomEvent);
      window.removeEventListener('forceHomeRefresh', handleForceRefresh);
    };
  }, [mounted]);

  // Modal handlers
  const handlePostClick = async (blog: Blog) => {
    setSelectedBlog(blog);
    await loadExtras(blog.id.toString()); // Ensure comments are loaded
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedBlog(null);
  };

  const handleCommentUpdate = async () => {
    if (selectedBlog) {
      await loadExtras(selectedBlog.id.toString());
    }
  };

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
          <div className="flex flex-col gap-8">
            {blogs.length > 0 ? (
              blogs.filter(blog => blog.id != null && !isNaN(Number(blog.id))).map((blog) => (
                <BlogPost
                  key={`${blog.id}-${refreshKey}`}
                  blog={blog}
                  comments={comments[blog.id.toString()]}
                  reactions={reactions[blog.id.toString()]}
                  userId={userId}
                  onReactionUpdate={() => loadExtras(blog.id.toString())}
                  onCommentUpdate={() => loadExtras(blog.id.toString())}
                  onPostClick={() => handlePostClick(blog)}
                />
              ))
            ) : (
              <p className="text-center text-gray-500 py-10 col-span-full">No posts yet. Create your first post!</p>
            )}
          </div>
        )}
      </section>

      <FooterCTA />

      {/* Post Modal */}
      {selectedBlog && (
        <PostModal
          blog={selectedBlog}
          comments={comments[selectedBlog.id.toString()] || []}
          reactions={reactions[selectedBlog.id.toString()] || []}
          userId={userId}
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onCommentUpdate={handleCommentUpdate}
        />
      )}
    </div>
  );
}
