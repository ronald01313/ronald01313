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
      className="bg-white dark:bg-zinc-900 p-8 border border-zinc-100 dark:border-zinc-800 rounded-2xl shadow-sm transition-all duration-500 hover:shadow-xl hover:border-zinc-200 dark:hover:border-zinc-700 cursor-pointer h-full flex flex-col group"
      onClick={onPostClick}
    >
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <h3 className="m-0 text-zinc-900 dark:text-white text-2xl lg:text-3xl font-black leading-tight line-clamp-2 tracking-tighter group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {blog.title}
        </h3>
        {blog.category && (
          <span className="bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest whitespace-nowrap border border-zinc-200 dark:border-zinc-700 shadow-sm">
            {blog.category}
          </span>
        )}
      </div>

      {blog.blog_images && blog.blog_images.length > 0 && (
        <div className="mb-6 overflow-hidden rounded-xl border border-zinc-100 dark:border-zinc-800 shadow-inner">
          <img
            src={`${blog.blog_images.find(img => img.is_featured)?.image_url || blog.blog_images[0].image_url}?t=${Date.now()}`}
            alt={blog.title}
            className="w-full h-48 lg:h-64 object-cover transition-transform duration-700 group-hover:scale-110"
          />
        </div>
      )}

      {blog.excerpt && (
        <p className="text-zinc-600 dark:text-zinc-400 m-0 mb-8 leading-relaxed text-base lg:text-lg font-medium line-clamp-3">
          {blog.excerpt}
        </p>
      )}

      <div className="mt-auto flex flex-col sm:flex-row justify-between items-start sm:items-center text-zinc-500 dark:text-zinc-500 text-sm mb-6 border-t border-zinc-100 dark:border-zinc-800 pt-6 gap-4">
        <span className="font-bold uppercase tracking-wider">{new Date(blog.created_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })}</span>
        <span className="font-bold uppercase tracking-wider">By <span className="text-zinc-900 dark:text-zinc-200">{blog.profiles?.username || "Unknown"}</span></span>
      </div>

      <div className="flex items-center justify-between mb-4">
        <span className="text-zinc-500 dark:text-zinc-400 text-xs font-bold uppercase tracking-widest">
          💬 {comments?.length || 0} {comments?.length === 1 ? 'Comment' : 'Comments'}
        </span>
      </div>

      <div className="border-t border-zinc-100 dark:border-zinc-800 pt-6">
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
