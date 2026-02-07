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
  onPostClick?: () => void;
}

export default function BlogPost({ blog, comments, reactions, userId, onReactionUpdate, onCommentUpdate, onPostClick }: BlogPostProps) {
  return (
    <article
      className="bg-white dark:bg-gray-900 p-8 border border-gray-100 dark:border-gray-800 rounded-xl shadow-sm transition-all duration-300 hover:shadow-lg hover:border-gray-200 dark:hover:border-gray-700 cursor-pointer h-full flex flex-col"
      onClick={onPostClick}
    >
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
        <h3 className="m-0 mb-3 lg:mb-0 text-gray-900 dark:text-white text-2xl lg:text-3xl font-bold leading-tight line-clamp-2">
          {blog.title}
        </h3>
        {blog.category && (
          <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap mt-3 lg:mt-0 border border-blue-100 dark:border-blue-900/50">
            {blog.category}
          </span>
        )}
      </div>

      {blog.blog_images && blog.blog_images.length > 0 && (
        <div className="mb-6 overflow-hidden rounded-lg">
          <img
            src={`${blog.blog_images.find(img => img.is_featured)?.image_url || blog.blog_images[0].image_url}?t=${Date.now()}`}
            alt={blog.title}
            className="w-full h-48 lg:h-64 object-cover border border-gray-100 dark:border-gray-800 shadow-sm transition-transform duration-500 hover:scale-105"
          />
        </div>
      )}

      {blog.excerpt && (
        <p className="text-gray-700 dark:text-gray-400 m-0 mb-6 leading-relaxed text-base lg:text-lg font-medium line-clamp-3">
          {blog.excerpt}
        </p>
      )}

      <div className="mt-auto flex flex-col sm:flex-row justify-between items-start sm:items-center text-gray-500 dark:text-gray-400 text-sm mb-6 border-t border-gray-50 dark:border-gray-800 pt-4">
        <span className="font-medium">{new Date(blog.created_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}</span>
        <span className="font-medium mt-2 sm:mt-0">By <span className="text-gray-700 dark:text-gray-300">{blog.profiles?.username || "Unknown"}</span></span>
      </div>

      <div className="flex items-center justify-between mb-4">
        <span className="text-gray-600 dark:text-gray-400 text-sm">
          💬 {comments?.length || 0} {comments?.length === 1 ? 'Comment' : 'Comments'}
        </span>
      </div>

      <div className="border-t border-gray-50 dark:border-gray-800 pt-4">
        <Reactions
          blogId={blog.id}
          userId={userId}
          reactions={reactions}
          onReactionUpdate={onReactionUpdate}
        />
      </div>
    </article>
  );
}
