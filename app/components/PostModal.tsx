import { useState } from "react";
import { addComment } from "../lib/supabase";
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
}

export default function PostModal({ blog, comments, reactions, userId, isOpen, onClose, onCommentUpdate }: PostModalProps) {
  const [commentText, setCommentText] = useState("");

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    await addComment({ blog_id: blog.id, user_id: userId!, content: commentText });
    setCommentText("");
    onCommentUpdate();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex justify-between items-start p-6 border-b border-gray-200">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{blog.title}</h2>
            {blog.category && (
              <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                {blog.category}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold ml-4"
          >
            ×
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {/* Blog Images */}
          {blog.blog_images && blog.blog_images.length > 0 && (
            <div className="mb-6">
              <img
                src={blog.blog_images.find(img => img.is_featured)?.image_url || blog.blog_images[0].image_url}
                alt={blog.title}
                className="w-full max-h-96 object-cover rounded-lg border border-gray-200"
              />
            </div>
          )}

          {/* Blog Content */}
          {blog.content && (
            <div className="mb-6 text-gray-700 leading-relaxed">
              <p className="text-lg">{blog.content}</p>
            </div>
          )}

          {/* Blog Excerpt */}
          {blog.excerpt && (
            <div className="mb-6 text-gray-600 italic">
              <p>{blog.excerpt}</p>
            </div>
          )}

          {/* Metadata */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-gray-500 text-sm mb-6 border-t border-gray-100 pt-4">
            <span className="font-medium">
              {new Date(blog.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
            <span className="font-medium mt-2 sm:mt-0">
              By <span className="text-gray-700">{blog.profiles?.username || "Unknown"}</span>
            </span>
          </div>

          {/* Reactions */}
          <div className="mb-6 border-t border-gray-100 pt-4">
            <Reactions
              blogId={blog.id}
              userId={userId}
              reactions={reactions}
              onReactionUpdate={() => {}} // Reactions update handled by parent
            />
          </div>

          {/* Comments Section */}
          <div className="border-t border-gray-100 pt-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Comments ({comments.length})</h3>

            {/* Existing Comments */}
            <div className="mb-6">
              {comments.length > 0 ? (
                comments.map((comment) => (
                  <div key={comment.id} className="border-b border-gray-100 pb-4 mb-4 last:border-b-0 last:pb-0 last:mb-0">
                    <div className="flex justify-between items-start mb-2">
                      <strong className="text-gray-900">{comment.profiles?.username || "Anonymous"}</strong>
                      <span className="text-sm text-gray-500">
                        {new Date(comment.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-700">{comment.content}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 italic">No comments yet. Be the first to comment!</p>
              )}
            </div>

            {/* Add Comment */}
            {userId && (
              <div className="border-t border-gray-100 pt-4">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Add a Comment</h4>
                <textarea
                  placeholder="Write your comment here..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg resize-vertical min-h-[100px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="flex justify-end mt-3">
                  <button
                    onClick={handleAddComment}
                    disabled={!commentText.trim()}
                    className="px-6 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    Post Comment
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
