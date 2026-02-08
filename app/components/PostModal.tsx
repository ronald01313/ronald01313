import { useState, useEffect } from "react";
import { addComment, getComments, fetchReactions } from "../lib/supabase";
import Reactions from "./Reactions";
import Comments from "./Comments";
import type { Blog } from "../lib/supabase";

interface PostModalProps {
  blog: Blog;
  comments: any[];
  reactions: any[];
  userId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onCommentUpdate: () => void;
  onReactionUpdate: () => void;
}

export default function PostModal({ blog, comments, reactions, userId, isOpen, onClose, onCommentUpdate, onReactionUpdate }: PostModalProps) {
  const [localComments, setLocalComments] = useState<any[]>(comments);
  const [localReactions, setLocalReactions] = useState<any[]>(reactions);

  // Sync local state when props change
  useEffect(() => {
    setLocalComments(comments);
  }, [comments]);

  useEffect(() => {
    setLocalReactions(reactions);
  }, [reactions]);

  const handleReactionUpdate = async () => {
    try {
      const freshReactions = await fetchReactions(blog.id);
      setLocalReactions(freshReactions);
      onReactionUpdate(); // Notify parent
    } catch (err) {
      console.error("Error refreshing reactions in modal:", err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 dark:border-gray-800 transition-colors duration-300">
        {/* Modal Header */}
        <div className="flex justify-between items-start p-8 border-b border-gray-100 dark:border-gray-800">
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">{blog.title}</h2>
            {blog.category && (
              <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-4 py-1.5 rounded-full text-sm font-semibold border border-blue-100 dark:border-blue-900/50">
                {blog.category}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors text-3xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-8">
          {/* Blog Images */}
          {blog.blog_images && blog.blog_images.length > 0 && (
            <div className="mb-10 overflow-hidden rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800">
              <img
                src={blog.blog_images.find(img => img.is_featured)?.image_url || blog.blog_images[0].image_url}
                alt={blog.title}
                className="w-full max-h-[500px] object-cover"
              />
            </div>
          )}

          {/* Blog Content */}
          <div className="mb-10 text-gray-700 dark:text-gray-300 leading-relaxed text-lg whitespace-pre-wrap">
            {blog.content}
          </div>

          {/* Metadata */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-gray-500 dark:text-gray-400 text-sm mb-10 border-y border-gray-100 dark:border-gray-800 py-6">
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-900 dark:text-gray-200">Published:</span>
              <span>
                {new Date(blog.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-3 sm:mt-0">
              <span className="font-bold text-gray-900 dark:text-gray-200">Author:</span>
              <span className="text-blue-600 dark:text-blue-400 font-medium">{blog.profiles?.username || "Unknown"}</span>
            </div>
          </div>

          {/* Reactions */}
          <div className="mb-10">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Reactions</h3>
            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl">
              <Reactions
                blogId={blog.id}
                userId={userId}
                reactions={localReactions}
                onReactionUpdate={handleReactionUpdate} 
              />
            </div>
          </div>

          {/* Comments Section */}
          <div className="border-t border-blue-200 dark:border-gray-800 pt-10">
            <div className="flex items-center gap-3 mb-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Discussion</h3>
              <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-full text-sm font-bold">{localComments.length}</span>
            </div>

            <Comments 
              blogId={blog.id} 
              userId={userId} 
              comments={localComments} 
              onCommentUpdate={onCommentUpdate}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
