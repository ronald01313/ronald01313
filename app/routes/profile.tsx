import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { getCurrentUser, getProfile, getUserBlogs, signOut, type Profile, type Blog } from "../lib/supabase";
import Header from "../components/Header";

export default function Profile() {
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditSuccess, setShowEditSuccess] = useState(false);

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
    window.location.href = "/";
  };

  if (loading) {
    return (
      <div>
        <Header />
        <div className="text-center py-10 text-gray-500">
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    window.location.href = "/login";
    return null;
  }

  return (
    <div>
      <Header />

      <section className="max-w-4xl mx-auto py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">User Profile</h1>

        {showEditSuccess && (
          <div className="p-4 mb-6 bg-green-50 border border-green-200 text-green-800 rounded-lg">
            <div className="flex items-center">
              <span className="text-lg mr-2">✅</span>
              <span className="font-medium">Post edited successfully!</span>
            </div>
          </div>
        )}

        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Profile Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Username</label>
              <p className="mt-1 text-gray-900">{profile?.username || "Not set"}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <p className="mt-1 text-gray-900">{user.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <p className="mt-1 text-gray-900">{profile?.full_name || "Not set"}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Bio</label>
              <p className="mt-1 text-gray-900">{profile?.bio || "Not set"}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Your Posts ({blogs.length})</h2>
          {blogs.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {blogs.map((blog) => (
                <div key={blog.id} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-800">{blog.title}</h3>
                  <p className="text-gray-600 mt-2">{blog.excerpt}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Created: {new Date(blog.created_at).toLocaleDateString()}
                  </p>
                  <div className="flex justify-between items-center mt-3">
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                      blog.published ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                    }`}>
                      {blog.published ? "Published" : "Draft"}
                    </span>
                    <a
                      href={`/create?edit=${blog.id}`}
                      className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
                    >
                      Edit
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">You haven't created any posts yet.</p>
          )}
        </div>

        <div className="text-center">
          <button
            onClick={handleLogout}
            className="px-6 py-2 bg-red-500 text-white border-none rounded cursor-pointer text-sm font-semibold transition-all duration-200 hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </section>
    </div>
  );
}
