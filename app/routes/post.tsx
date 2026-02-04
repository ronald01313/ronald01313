import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
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
        <Header />
        <div className="text-center py-10 text-gray-500">
          <p>Loading post...</p>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div>
        <Header />
        <div className="text-center py-10">
          <p className="text-red-500">{error || "Post not found"}</p>
          <a href="/" className="text-blue-500 hover:underline">Go back to home</a>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header />

      <article className="max-w-4xl mx-auto py-8 px-4">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">{blog.title}</h1>
          <div className="flex items-center text-gray-600 mb-4">
            <span className="mr-4">By {blog.profiles?.username || "Anonymous"}</span>
            <span>Published on {new Date(blog.created_at).toLocaleDateString()}</span>
          </div>
          {blog.category && (
            <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
              {blog.category}
            </span>
          )}
        </header>

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
            <a href="/" className="text-blue-500 hover:underline">← Back to Home</a>
            <a href="/profile" className="text-blue-500 hover:underline">View Profile →</a>
          </div>
        </footer>
      </article>
    </div>
  );
}
