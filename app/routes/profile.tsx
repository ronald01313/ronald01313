import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { getCurrentUser, getProfile, getUserBlogs, signOut, type Profile, type Blog, getComments, fetchReactions, updateBlog } from "../lib/supabase";
import Header from "../components/Header";
import { DeletePost } from "../components/DeletePost";
import PostModal from "../components/PostModal";

export default function Profile() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditSuccess, setShowEditSuccess] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalComments, setModalComments] = useState<any[]>([]);
  const [modalReactions, setModalReactions] = useState<any[]>([]);
  const [publishLoading, setPublishLoading] = useState<number | null>(null);

  useEffect(() => {
    const loadUserData = async () => {
      const currentUser = await getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        const userProfile = await getProfile(currentUser.id);
        setProfile(userProfile);
        const userBlogs = await getUserBlogs(currentUser.id);
        setBlogs(userBlogs);
      }
      setLoading(false);
    };
    loadUserData();
  }, []);

  useEffect(() => {
    if (searchParams.get('edited') === 'true') {
      setShowEditSuccess(true);
      setTimeout(() => setShowEditSuccess(false), 5000);
      // Clean up the URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [searchParams]);

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const handleDelete = async () => {
    // Reload blogs after deletion
    const currentUser = await getCurrentUser();
    if (currentUser) {
      const userBlogs = await getUserBlogs(currentUser.id);
      setBlogs(userBlogs);
    }
  };

  const handlePreview = async (blog: Blog) => {
    setSelectedBlog(blog);
    const comments = await getComments(blog.id);
    const reactions = await fetchReactions(blog.id);
    setModalComments(comments);
    setModalReactions(reactions);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBlog(null);
    setModalComments([]);
    setModalReactions([]);
  };

  const handleCommentUpdate = async () => {
    if (selectedBlog) {
      const comments = await getComments(selectedBlog.id);
      setModalComments(comments);
    }
  };

  const handleReactionUpdate = async () => {
    if (selectedBlog) {
      const reactions = await fetchReactions(selectedBlog.id);
      setModalReactions(reactions);
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

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [loading, user, navigate]);

  if (loading) {
    return (
      <div className="pb-12">
        <Header compact title="User Profile" subtitle="Loading your workspace..." />
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="pb-12 transition-colors duration-300">
      <Header 
        compact 
        title={`${profile?.username || "User"}'s Dashboard`} 
        subtitle="Manage your posts, profile information, and account settings."
      />

      <section className="max-w-6xl mx-auto">
        {showEditSuccess && (
          <div className="p-4 mb-8 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/30 text-green-800 dark:text-green-400 rounded-2xl flex items-center shadow-sm">
            <span className="text-xl mr-3">✅</span>
            <span className="font-medium">Post updated successfully!</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar Info */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm transition-colors duration-300">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-blue-200 dark:shadow-none">
                  {profile?.username?.[0]?.toUpperCase() || "U"}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Profile Details</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Personal information</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-transparent hover:border-blue-100 dark:hover:border-blue-900/30 transition-all">
                  <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Username</label>
                  <p className="text-gray-900 dark:text-gray-200 font-semibold">{profile?.username || "Not set"}</p>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-transparent hover:border-blue-100 dark:hover:border-blue-900/30 transition-all">
                  <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Email Address</label>
                  <p className="text-gray-900 dark:text-gray-200 font-semibold truncate">{user.email}</p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-transparent hover:border-blue-100 dark:hover:border-blue-900/30 transition-all">
                  <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Full Name</label>
                  <p className="text-gray-900 dark:text-gray-200 font-semibold">{profile?.full_name || "Not set"}</p>
                </div>

                {profile?.bio && (
                  <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-transparent hover:border-blue-100 dark:hover:border-blue-900/30 transition-all">
                    <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Bio</label>
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{profile.bio}</p>
                  </div>
                )}

                <div className="pt-6 mt-2">
                  <button
                    onClick={handleLogout}
                    className="w-full px-6 py-4 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 rounded-2xl font-bold hover:bg-red-100 dark:hover:bg-red-900/20 transition-all flex items-center justify-center gap-3 border border-red-100 dark:border-red-900/30 group"
                  >
                    <span className="group-hover:-translate-x-1 transition-transform">🚪</span> 
                    Logout Account
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content - Posts */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm min-h-full transition-colors duration-300">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your Stories</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Manage and track your published content</p>
                </div>
                <Link to="/create" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-sm font-bold transition-all shadow-lg shadow-blue-200 dark:shadow-none flex items-center gap-2 group">
                  <span className="group-hover:scale-125 transition-transform">+</span> Create New Story
                </Link>
              </div>

              {blogs.length > 0 ? (
                <div className="space-y-6">
                  {blogs.map((blog) => (
                    <div key={blog.id} className="group border border-gray-50 dark:border-gray-800 rounded-2xl p-6 hover:border-blue-100 dark:hover:border-blue-900/30 hover:bg-blue-50/30 dark:hover:bg-blue-900/5 transition-all">
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest rounded-lg border ${
                              blog.published 
                                ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-100 dark:border-green-900/30" 
                                : "bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border-orange-100 dark:border-orange-900/30"
                            }`}>
                              {blog.published ? "● Published" : "○ Draft"}
                            </span>
                            {blog.category && (
                              <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-2.5 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
                                {blog.category}
                              </span>
                            )}
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{blog.title}</h3>
                          <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2 mb-4 leading-relaxed">{blog.excerpt}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest">
                              Last Modified • {new Date(blog.updated_at || blog.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-3 mt-6 pt-6 border-t border-gray-50 dark:border-gray-800">
                        <button
                          onClick={() => handlePublishToggle(blog)}
                          disabled={publishLoading === blog.id}
                          className={`flex-1 min-w-[110px] px-4 py-2.5 text-xs font-bold rounded-xl transition-all border ${
                            blog.published 
                              ? "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700" 
                              : "bg-green-600 text-white border-green-700 hover:bg-green-700 shadow-md shadow-green-100 dark:shadow-none"
                          }`}
                        >
                          {publishLoading === blog.id ? "Working..." : blog.published ? "Take Down" : "Publish Now"}
                        </button>
                        <button
                          onClick={() => handlePreview(blog)}
                          className="flex-1 min-w-[90px] px-4 py-2.5 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 text-xs font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                        >
                          Preview
                        </button>
                        <Link
                          to={`/create?edit=${blog.id}`}
                          className="flex-1 min-w-[90px] px-4 py-2.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30 text-xs font-bold rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all text-center"
                        >
                          Edit
                        </Link>
                        <div className="flex-1 min-w-[90px]">
                          <DeletePost
                            postId={blog.id}
                            postTitle={blog.title}
                            onDelete={handleDelete}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-24 bg-gray-50 dark:bg-gray-800/30 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700 transition-colors duration-300">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl">
                    ✍️
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No stories yet</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-xs mx-auto">You haven't written any blog posts yet. Start sharing your ideas today!</p>
                  <Link to="/create" className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 dark:shadow-none">
                    Start Writing Now →
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {selectedBlog && (
        <PostModal
          blog={selectedBlog}
          comments={modalComments}
          reactions={modalReactions}
          userId={user?.id}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onCommentUpdate={handleCommentUpdate}
          onReactionUpdate={handleReactionUpdate}
        />
      )}
    </div>
  );
}
