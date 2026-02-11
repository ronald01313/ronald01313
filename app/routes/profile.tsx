import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams, Link } from "react-router";
import { getCurrentUser, getProfile, getUserBlogs, signOut, type Profile, type Blog, getComments, fetchReactions, updateBlog, updateProfile, uploadAvatar } from "../lib/supabase";
import Header from "../components/Header";
import { DeletePost } from "../components/DeletePost";
import PostModal from "../components/PostModal";
import { toast } from "../lib/toast";

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

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editFormData, setEditFormData] = useState({
    username: "",
    full_name: "",
    bio: "",
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadUserData = async () => {
      const currentUser = await getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        const userProfile = await getProfile(currentUser.id);
        setProfile(userProfile);
        if (userProfile) {
          setEditFormData({
            username: userProfile.username || "",
            full_name: userProfile.full_name || "",
            bio: userProfile.bio || "",
          });
        }
        const userBlogs = await getUserBlogs(currentUser.id);
        setBlogs(userBlogs);
      }
      setLoading(false);
    };
    loadUserData();
  }, []);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSavingProfile(true);

    try {
      let avatarUrl = profile?.avatar_url;
      if (avatarFile) {
        const uploadedUrl = await uploadAvatar(user.id, avatarFile);
        if (uploadedUrl) avatarUrl = uploadedUrl;
      }

      const updated = await updateProfile(user.id, {
        username: editFormData.username,
        full_name: editFormData.full_name,
        bio: editFormData.bio,
        avatar_url: avatarUrl,
      });

      if (updated) {
        setProfile(updated);
        setIsEditingProfile(false);
        setAvatarFile(null);
        setAvatarPreview(null);
        toast("Profile updated successfully!");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      toast("Failed to update profile", "error");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

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
        toast(`Post ${updated.published ? 'published' : 'moved to drafts'}`);
      }
    } catch (err) {
      console.error("Error updating blog:", err);
      toast("Failed to update post status", "error");
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
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="pb-12 transition-colors duration-500">
      <Header 
        compact 
        title={`${profile?.username || "User"}'s Dashboard`} 
        subtitle="Manage your posts, profile information, and account settings."
      />

      <section className="max-w-6xl mx-auto px-4">
        {showEditSuccess && (
          <div className="p-5 mb-8 bg-green-50/50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30 text-green-700 dark:text-green-400 rounded-2xl flex items-center shadow-sm transition-all duration-500">
            <span className="text-xl mr-3">✅</span>
            <span className="font-bold text-sm uppercase tracking-wider">Post updated successfully!</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar Info */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xl transition-all duration-500 relative overflow-hidden">
              {!isEditingProfile ? (
                <>
                  <button
                    onClick={() => setIsEditingProfile(true)}
                    className="absolute right-4 top-4 p-2 text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all"
                    title="Edit Profile"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-20 h-20 bg-zinc-900 dark:bg-white rounded-2xl flex items-center justify-center text-white dark:text-zinc-900 text-3xl font-black shadow-lg overflow-hidden border-2 border-zinc-100 dark:border-zinc-800">
                      {profile?.avatar_url ? (
                        <img src={profile.avatar_url} alt={profile.username} className="w-full h-full object-cover" />
                      ) : (
                        profile?.username?.[0]?.toUpperCase() || "U"
                      )}
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter">Profile</h2>
                      <p className="text-xs font-bold text-zinc-500 dark:text-zinc-500 uppercase tracking-widest">Personal Info</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-zinc-50 dark:bg-zinc-800/50 p-5 rounded-2xl border border-zinc-100 dark:border-zinc-700 transition-all shadow-inner">
                      <label className="block text-[10px] font-black text-zinc-500 dark:text-zinc-500 uppercase tracking-widest mb-1">Username</label>
                      <p className="text-zinc-900 dark:text-zinc-200 font-bold">@{profile?.username || "Not set"}</p>
                    </div>
                    
                    <div className="bg-zinc-50 dark:bg-zinc-800/50 p-5 rounded-2xl border border-zinc-100 dark:border-zinc-700 transition-all shadow-inner">
                      <label className="block text-[10px] font-black text-zinc-500 dark:text-zinc-500 uppercase tracking-widest mb-1">Email</label>
                      <p className="text-zinc-900 dark:text-zinc-200 font-bold truncate">{user.email}</p>
                    </div>

                    <div className="bg-zinc-50 dark:bg-zinc-800/50 p-5 rounded-2xl border border-zinc-100 dark:border-zinc-700 transition-all shadow-inner">
                      <label className="block text-[10px] font-black text-zinc-500 dark:text-zinc-500 uppercase tracking-widest mb-1">Full Name</label>
                      <p className="text-zinc-900 dark:text-zinc-200 font-bold">{profile?.full_name || "Not set"}</p>
                    </div>

                    <div className="bg-zinc-50 dark:bg-zinc-800/50 p-5 rounded-2xl border border-zinc-100 dark:border-zinc-700 transition-all shadow-inner">
                      <label className="block text-[10px] font-black text-zinc-500 dark:text-zinc-500 uppercase tracking-widest mb-1">Bio</label>
                      <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed font-medium line-clamp-4">{profile?.bio || "No bio added yet."}</p>
                    </div>

                    <div className="pt-6 mt-2">
                      <button
                        onClick={handleLogout}
                        className="w-full px-6 py-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-2xl font-black uppercase tracking-widest hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all flex items-center justify-center gap-3 border border-zinc-200 dark:border-zinc-700 group shadow-sm text-xs"
                      >
                        Logout Account
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="flex flex-col items-center mb-8">
                    <div 
                      className="w-24 h-24 bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center relative group cursor-pointer overflow-hidden border-2 border-dashed border-zinc-300 dark:border-zinc-700"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {avatarPreview || profile?.avatar_url ? (
                        <img src={avatarPreview || profile?.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <svg className="w-8 h-8 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white text-[10px] font-black uppercase tracking-widest">Change</span>
                      </div>
                    </div>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleAvatarChange} 
                      className="hidden" 
                      accept="image/*" 
                    />
                    <p className="mt-2 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Avatar Image</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1.5 ml-1">Username</label>
                      <input
                        type="text"
                        value={editFormData.username}
                        onChange={(e) => setEditFormData({ ...editFormData, username: e.target.value })}
                        className="w-full p-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1.5 ml-1">Full Name</label>
                      <input
                        type="text"
                        value={editFormData.full_name}
                        onChange={(e) => setEditFormData({ ...editFormData, full_name: e.target.value })}
                        className="w-full p-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1.5 ml-1">Bio</label>
                      <textarea
                        value={editFormData.bio}
                        onChange={(e) => setEditFormData({ ...editFormData, bio: e.target.value })}
                        className="w-full p-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all min-h-[100px] resize-none"
                        placeholder="Tell us about yourself..."
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={savingProfile}
                      className="flex-1 py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50"
                    >
                      {savingProfile ? "Saving..." : "Save Changes"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingProfile(false);
                        setAvatarPreview(null);
                        setAvatarFile(null);
                      }}
                      className="px-6 py-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all border border-zinc-200 dark:border-zinc-700"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Main Content - Posts */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xl min-h-full transition-all duration-500">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12">
                <div>
                  <h2 className="text-3xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter">Your Stories</h2>
                  <p className="text-xs font-bold text-zinc-500 dark:text-zinc-500 uppercase tracking-widest">Manage your published content</p>
                </div>
                <Link to="/create" className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-blue-500/20 flex items-center gap-2 group">
                  Create New Story
                </Link>
              </div>

              {blogs.length > 0 ? (
                <div className="space-y-6">
                  {blogs.map((blog) => (
                    <div key={blog.id} className="group border border-zinc-100 dark:border-zinc-800 rounded-2xl p-6 hover:border-zinc-200 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-all shadow-sm relative">
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-4">
                            <span className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg border ${
                              blog.published 
                                ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-100 dark:border-green-900/30" 
                                : "bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border-orange-100 dark:border-orange-900/30"
                            }`}>
                              {blog.published ? "Published" : "Draft"}
                            </span>
                            {blog.category && (
                              <span className="text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700">
                                {blog.category}
                              </span>
                            )}
                          </div>
                          <div className="flex flex-col md:flex-row gap-6">
                            {blog.blog_images && blog.blog_images.length > 0 && (
                              <div className="w-full md:w-32 h-32 flex-shrink-0">
                                <img 
                                  src={blog.blog_images[0].image_url} 
                                  alt={blog.title}
                                  className="w-full h-full object-cover rounded-xl border border-zinc-100 dark:border-zinc-800"
                                />
                              </div>
                            )}
                            <div className="flex-1">
                              <h3 className="text-2xl font-black text-zinc-900 dark:text-white mb-3 tracking-tighter group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{blog.title}</h3>
                              <p className="text-zinc-500 dark:text-zinc-400 text-sm line-clamp-2 mb-6 leading-relaxed font-medium">{blog.excerpt}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mt-4">
                            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-widest">
                              Modified • {new Date(blog.updated_at || blog.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-3 mt-8 pt-8 border-t border-zinc-100 dark:border-zinc-800">
                        <button
                          onClick={() => handlePublishToggle(blog)}
                          disabled={publishLoading === blog.id}
                          className={`flex-1 min-w-[120px] px-4 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border ${
                            blog.published 
                              ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700" 
                              : "bg-green-600 text-white border-green-700 hover:bg-green-700 shadow-lg shadow-green-500/20"
                          }`}
                        >
                          {publishLoading === blog.id ? "..." : blog.published ? "Take Down" : "Publish"}
                        </button>
                        <button
                          onClick={() => handlePreview(blog)}
                          className="flex-1 min-w-[100px] px-4 py-3 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all shadow-sm"
                        >
                          Preview
                        </button>
                        <Link
                          to={`/create?edit=${blog.id}`}
                          className="flex-1 min-w-[100px] px-4 py-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900/30 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all text-center shadow-sm"
                        >
                          Edit
                        </Link>
                        <div className="flex-1 min-w-[100px] relative">
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
                <div className="text-center py-24 bg-zinc-50 dark:bg-zinc-800/30 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800 transition-all duration-500">
                  <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-800 rounded-3xl flex items-center justify-center mx-auto mb-6 text-3xl shadow-inner">
                    ✍️
                  </div>
                  <h3 className="text-xl font-black text-zinc-900 dark:text-white mb-2 uppercase tracking-tighter">No stories yet</h3>
                  <p className="text-zinc-500 dark:text-zinc-500 mb-10 max-w-xs mx-auto font-medium">Start sharing your unique perspective with the world today!</p>
                  <Link to="/create" className="inline-flex items-center gap-3 px-10 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20">
                    Start Writing Now
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
