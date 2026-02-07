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
      <section className="mb-12">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-8">
          <div className="relative w-full md:max-w-md">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            <input
              type="text"
              placeholder="Search posts..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex overflow-x-auto pb-2 md:pb-0 gap-2 w-full md:w-auto no-scrollbar">
            {CATEGORIES.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  selectedCategory === category 
                  ? "bg-blue-600 text-white shadow-md" 
                  : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-100 dark:border-gray-800"
                }`}
              >
                {category}
              </button>
            ))}
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
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6 flex items-center gap-2">
                  <span className="text-yellow-500">⭐</span> Featured Post
                </h2>
                <div 
                  className="group relative overflow-hidden rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer"
                  onClick={() => handlePostClick(featuredPost)}
                >
                  <div className="flex flex-col lg:flex-row">
                    {featuredPost.blog_images?.[0] && (
                      <div className="lg:w-1/2 overflow-hidden">
                        <img 
                          src={featuredPost.blog_images[0].image_url} 
                          alt={featuredPost.title}
                          className="w-full h-64 lg:h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      </div>
                    )}
                    <div className={`p-8 lg:p-12 flex flex-col justify-center ${featuredPost.blog_images?.[0] ? 'lg:w-1/2' : 'w-full text-center'}`}>
                      <span className="inline-block px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-4 w-fit mx-auto lg:mx-0">
                        {featuredPost.category || "Featured"}
                      </span>
                      <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-blue-600 transition-colors">
                        {featuredPost.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-lg mb-6 line-clamp-3">
                        {featuredPost.excerpt}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mt-auto justify-center lg:justify-start">
                        <span className="font-semibold text-gray-900 dark:text-gray-200">By {featuredPost.profiles?.username}</span>
                        <span>•</span>
                        <span>{new Date(featuredPost.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Grid Posts */}
            <div>
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                  {selectedCategory === "All" && searchTerm === "" ? "Latest Stories" : `Results for ${selectedCategory !== "All" ? selectedCategory : searchTerm}`}
                  <span className="ml-3 text-sm font-normal text-gray-400">({filteredBlogs.length})</span>
                </h2>
                <button
                  onClick={() => setRefreshKey(k => k + 1)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-500 dark:text-gray-400"
                  title="Refresh posts"
                >
                  🔄
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
                <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-3xl border border-dashed border-gray-200 dark:border-gray-800">
                  <span className="text-5xl mb-4 block">🏜️</span>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">No posts found</h3>
                  <p className="text-gray-500 dark:text-gray-400">Try adjusting your search or category filters.</p>
                  <button 
                    onClick={() => {setSearchTerm(""); setSelectedCategory("All");}}
                    className="mt-6 text-blue-600 dark:text-blue-400 font-semibold hover:underline"
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
