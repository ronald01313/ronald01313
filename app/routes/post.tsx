import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getBlogById, type Blog } from "../lib/supabase";
import Header from "../components/Header";

export default function PostPage() {
  const { id } = useParams<{ id: string }>();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadBlog = async () => {
      if (!id) {
        setError("Invalid post ID");
        setLoading(false);
        return;
      }

      try {
        const blogId = parseInt(id);
        if (isNaN(blogId)) {
          setError("Invalid blog ID");
          setLoading(false);
          return;
        }

        const blogData = await getBlogById(blogId);
        if (blogData) {
          setBlog(blogData);
        } else {
          setError("Post not found");
        }
      } catch (err) {
        console.error("Error loading blog:", err);
        setError("Failed to load post");
      } finally {
        setLoading(false);
      }
    };

    loadBlog();
  }, [id]);

  if (loading) {
    return (
      <div>
        <Header compact subtitle="Loading the latest stories and ideas..." />
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading post...</p>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div>
        <Header compact title="Post Not Found" subtitle="Sorry, we couldn't find what you were looking for." />
        <div className="text-center py-10">
          <p className="text-red-500 mb-6">{error || "Post not found"}</p>
          <Link to="/" className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-md">Go back to home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-12">
      <Header 
        compact 
        title={blog.title} 
        subtitle={`Published on ${new Date(blog.created_at).toLocaleDateString()} by ${blog.profiles?.username || "Anonymous"}`}
      />

      <article className="max-w-4xl mx-auto bg-white p-8 sm:p-12 rounded-3xl border border-gray-100 shadow-sm">
        {blog.category && (
          <div className="mb-6">
            <span className="inline-block bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold border border-blue-100">
              {blog.category}
            </span>
          </div>
        )}

        {blog.blog_images?.[0] && (
          <div className="mb-10 overflow-hidden rounded-2xl shadow-lg">
            <img 
              src={blog.blog_images[0].image_url} 
              alt={blog.title} 
              className="w-full h-auto max-h-[500px] object-cover"
            />
          </div>
        )}

        {blog.excerpt && (
          <div className="text-xl text-gray-700 mb-8 italic">
            {blog.excerpt}
          </div>
        )}

        <div className="prose prose-lg max-w-none">
          {blog.content.split('\n').map((paragraph, index) => (
            <p key={index} className="mb-4">
              {paragraph}
            </p>
          ))}
        </div>

        <footer className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <Link to="/" className="text-blue-500 hover:underline">← Back to Home</Link>
            <Link to="/profile" className="text-blue-500 hover:underline">View Profile →</Link>
          </div>
        </footer>
      </article>
    </div>
  );
}
