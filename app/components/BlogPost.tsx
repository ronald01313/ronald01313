import Reactions from "./Reactions";
import Comments from "./Comments";
import { formatDate } from "../lib/utils";
import type { Blog } from "../lib/supabase";

interface BlogPostProps {
  blog: Blog;
  comments: any[];
  reactions: any[];
  userId: string | null;
  onReactionUpdate: () => void;
  onCommentUpdate: () => void;
}

export default function BlogPost({ blog, comments, reactions, userId, onReactionUpdate, onCommentUpdate }: BlogPostProps) {
  return (
    <article className="p-6 border border-gray-200 rounded-lg transition-all duration-300 hover:shadow-md">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3">
        <h3 className="m-0 mb-2 sm:mb-0 text-gray-800 text-xl sm:text-2xl">
          {blog.title}
        </h3>
        {blog.category && (
          <span className="bg-gray-100 px-3 py-1 rounded-full text-xs whitespace-nowrap mt-2 sm:mt-0">
            {blog.category}
          </span>
        )}
      </div>

      {blog.blog_images && blog.blog_images.length > 0 && (
        <div className="mb-4">
          <img
            src={blog.blog_images.find(img => img.is_featured)?.image_url || blog.blog_images[0].image_url}
            alt={blog.title}
            className="w-full max-h-64 sm:max-h-80 object-cover rounded-lg border border-gray-200"
          />
        </div>
      )}

      {blog.excerpt && (
        <p className="text-gray-600 m-0 mb-4 leading-relaxed text-sm sm:text-base">
          {blog.excerpt}
        </p>
      )}

      <div className="flex flex-col sm:flex-row justify-between text-gray-500 text-sm mb-4">
        <span>{new Date(blog.created_at).toLocaleDateString()}</span>
        <span>By {blog.profiles?.username || "Unknown"}</span>
      </div>

      <Reactions
        blogId={blog.id}
        userId={userId}
        reactions={reactions}
        onReactionUpdate={onReactionUpdate}
      />

      <Comments
        blogId={blog.id}
        userId={userId}
        comments={comments}
        onCommentUpdate={onCommentUpdate}
      />
    </article>
  );
}
