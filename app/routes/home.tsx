import { useState, useEffect } from "react";
import {
  fetchBlogs,
  getComments,
  fetchReactions,
  fetchAllExtras,
  getCurrentUser,
  type Blog,
} from "../lib/supabase";
import Header from "../components/Header";
import BlogPost from "../components/BlogPost";
import PostModal from "../components/PostModal";
import Reactions from "../components/Reactions";

const CATEGORIES = ["All", "Technology", "Lifestyle", "Travel", "Food", "Business", "Health"];

export default function Home() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [comments, setComments] = useState<Record<string, any[]>>({});
  const [reactions, setReactions] = useState<Record<string, any[]>>({});
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Modal state
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  /* ------------------ Load user ------------------ */
  useEffect(() => {
    getCurrentUser().then((user) => {
      setUserId(user?.id ?? null);
    });
  }, []);

  /* ------------------ Load blogs ------------------ */
  const loadBlogs = async () => {
    setLoading(true);
    try {
      const data = await fetchBlogs();
      // Sort blogs by created_at in descending order (latest first)
      const sortedData = data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setBlogs(sortedData);

      // Batch load comments and reactions
      const blogIds = sortedData.map(b => b.id).filter(id => id != null) as number[];
      if (blogIds.length > 0) {
        const extras = await fetchAllExtras(blogIds);
        setComments(extras.comments);
        setReactions(extras.reactions);
      }
    } catch (err) {
      console.error("Error loading blogs:", err);
    } finally {
      setLoading(false);
    }
  };

  /* ------------------ Load individual extras (fallback) ------------------ */
  const loadExtras = async (blogId: string) => {
    const blogIdNum = parseInt(blogId);
    if (isNaN(blogIdNum) || blogIdNum == null) return;

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
  }, [mounted, refreshKey]);

  // Periodic check for changes from other tabs
  useEffect(() => {
    const interval = setInterval(() => {
      const needsRefresh = localStorage.getItem('blogDataChanged');
      if (needsRefresh === 'true' && mounted) {
        localStorage.removeItem('blogDataChanged');
        loadBlogs();
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [mounted]);

  // Modal handlers
  const handlePostClick = async (blog: Blog) => {
    setSelectedBlog(blog);
    await loadExtras(blog.id.toString());
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

  const handleReactionUpdate = async () => {
    if (selectedBlog) {
      await loadExtras(selectedBlog.id.toString());
    }
  };

  if (!mounted) return null;

  // Filter logic
  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch = blog.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         blog.excerpt?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || blog.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredPost = blogs[0];
  const otherPosts = filteredBlogs.filter(p => p.id !== featuredPost?.id);

  return (
    <div className="pb-12 transition-colors duration-300">
      {/* Hero Header */}
      <Header 
        title="Welcome to RHD Blog" 
        subtitle="Discover stories, thinking, and expertise from writers on any topic."
      />

      {/* Search and Filters */}
      <section className="mb-16">
        <div className="flex flex-col md:flex-row gap-8 justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-8 mb-12">
          <div className="flex overflow-x-auto gap-8 w-full md:w-auto no-scrollbar">
            {CATEGORIES.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`text-sm font-bold uppercase tracking-widest whitespace-nowrap transition-all relative py-2 ${
                  selectedCategory === category 
                  ? "text-blue-600 after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-blue-600" 
                  : "text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
          
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Search..."
              className="w-full bg-transparent border-none text-sm font-bold uppercase tracking-widest text-zinc-900 dark:text-white placeholder:text-zinc-300 focus:ring-0 outline-none p-0"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-500 dark:text-gray-400 animate-pulse">Fetching the latest stories...</p>
          </div>
        ) : (
          <>
            {/* Featured Post (only on "All" and when not searching) */}
            {selectedCategory === "All" && searchTerm === "" && featuredPost && (
              <div className="mb-20">
                <div
                  className="group relative flex flex-col lg:flex-row items-center gap-12 cursor-pointer"
                  onClick={() => handlePostClick(featuredPost)}
                >
                  {featuredPost.blog_images?.[0] && (
                    <div className="w-full lg:w-3/5 overflow-hidden rounded-2xl aspect-[16/10]">
                      <img 
                        src={featuredPost.blog_images[0].image_url} 
                        alt={featuredPost.title}
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                      />
                    </div>
                  )}
                  <div className={`w-full ${featuredPost.blog_images?.[0] ? 'lg:w-2/5' : 'text-center'}`}>
                    <span className="text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-widest mb-6 block">
                      Featured • {featuredPost.category || "Story"}
                    </span>
                    <h3 className="text-4xl md:text-5xl font-extrabold text-zinc-900 dark:text-white mb-6 leading-tight group-hover:text-blue-600 transition-colors">
                      {featuredPost.title}
                    </h3>
                    <p className="text-zinc-500 dark:text-zinc-400 text-lg mb-8 line-clamp-3 leading-relaxed font-light">
                      {featuredPost.excerpt}
                    </p>
                    <div className="flex flex-col gap-6 text-sm text-zinc-400 border-t border-zinc-100 dark:border-zinc-800 pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <span className="font-bold text-zinc-900 dark:text-zinc-200 uppercase tracking-tighter">By {featuredPost.profiles?.username}</span>
                          <span className="opacity-30">•</span>
                          <span className="uppercase tracking-widest text-[10px] font-bold">{new Date(featuredPost.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                          {comments[featuredPost.id.toString()]?.length || 0} Comments
                        </span>
                      </div>
                      <div className="pt-4 border-t border-zinc-50 dark:border-zinc-800/50" onClick={(e) => e.stopPropagation()}>
                        <Reactions
                          blogId={featuredPost.id}
                          userId={userId}
                          reactions={reactions[featuredPost.id.toString()] || []}
                          onReactionUpdate={() => loadExtras(featuredPost.id.toString())}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Grid Posts */}
            <div>
              <div className="flex justify-between items-end mb-12">
                <div>
                  <h2 className="text-sm font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.2em]">
                    {selectedCategory === "All" && searchTerm === "" ? "Recent Entries" : `Filtered Results`}
                  </h2>
                </div>
                <button
                  onClick={() => setRefreshKey(k => k + 1)}
                  className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-blue-600 transition-colors"
                >
                  Refresh Feed
                </button>
              </div>

              {filteredBlogs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {(selectedCategory === "All" && searchTerm === "" ? otherPosts : filteredBlogs).map((blog) => (
                    <div key={blog.id} className="h-full flex flex-col">
                      <BlogPost
                        blog={blog}
                        comments={comments[blog.id.toString()]}
                        reactions={reactions[blog.id.toString()]}
                        userId={userId}
                        onReactionUpdate={() => loadExtras(blog.id.toString())}
                        onCommentUpdate={() => loadExtras(blog.id.toString())}
                        onPostClick={() => handlePostClick(blog)}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-gradient-to-br from-white to-blue-50 dark:bg-slate-900 rounded-3xl border border-dashed border-blue-200 dark:border-slate-800 shadow-lg">
                  <span className="text-5xl mb-4 block">🏜️</span>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">No posts found</h3>
                  <p className="text-gray-600 dark:text-gray-400">Try adjusting your search or category filters.</p>
                  <button
                    onClick={() => {setSearchTerm(""); setSelectedCategory("All");}}
                    className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200/50"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </section>

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
          onReactionUpdate={handleReactionUpdate}
        />
      )}
    </div>
  );
}
