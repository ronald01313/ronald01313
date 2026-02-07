import { useState } from "react";
import { Link } from "react-router-dom";
import { addComment, deleteComment, updateComment, getComments } from "../lib/supabase";

interface CommentsProps {
  blogId: number;
  userId: string | null;
  comments: any[];
  onCommentUpdate: () => void;
}

export default function Comments({ blogId, userId, comments, onCommentUpdate }: CommentsProps) {
  const [commentText, setCommentText] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");

  const handleAddComment = async () => {
    if (!commentText.trim() || !userId) return;
    setIsSubmitting(true);
    try {
      await addComment({ blog_id: blogId, user_id: userId, content: commentText.trim() });
      setCommentText("");
      onCommentUpdate();
    } catch (err) {
      console.error("Error adding comment:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this comment?")) {
      await deleteComment(id);
      onCommentUpdate();
    }
  };

  const handleUpdate = async (id: number) => {
    if (!editText.trim()) return;
    setIsSubmitting(true);
    try {
      await updateComment(id, editText.trim());
      setEditingId(null);
      setEditText("");
      onCommentUpdate();
    } catch (err) {
      console.error("Error updating comment:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddReply = async (parentId: number) => {
    if (!replyText.trim() || !userId) return;
    setIsSubmitting(true);
    try {
      await addComment({ blog_id: blogId, user_id: userId, content: replyText.trim(), parent_comment_id: parentId });
      setReplyText("");
      setReplyingTo(null);
      onCommentUpdate();
    } catch (err) {
      console.error("Error adding reply:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEditing = (comment: any) => {
    setEditingId(comment.id);
    setEditText(comment.content);
  };

  const renderComment = (comment: any, depth: number = 0) => {
    const isReplying = replyingTo === comment.id;
    const maxDepth = 3; // Limit nesting depth

    return (
      <div key={comment.id} className={`${depth > 0 ? 'ml-8 mt-4' : 'mt-6'}`}>
        <div
          className={`p-6 rounded-2xl border transition-all duration-200 ${
            comment.user_id === userId
              ? "bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30"
              : "bg-gray-50 dark:bg-gray-800/30 border-transparent hover:border-gray-200 dark:hover:border-gray-700"
          }`}
        >
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xs">
                {comment.profiles?.username?.[0]?.toUpperCase() || "A"}
              </div>
              <div>
                <strong className="block text-sm font-bold text-gray-900 dark:text-gray-200">
                  {comment.profiles?.username || "Anonymous"}
                </strong>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  {new Date(comment.created_at).toLocaleDateString()}
                  {comment.updated_at !== comment.created_at && " • Edited"}
                </span>
              </div>
            </div>

            {comment.user_id === userId && !editingId && (
              <div className="flex gap-3">
                <button
                  onClick={() => startEditing(comment)}
                  className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline transition-all"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(comment.id)}
                  className="text-xs font-bold text-red-500 hover:underline transition-all"
                >
                  Delete
                </button>
              </div>
            )}
          </div>

          {editingId === comment.id ? (
            <div className="mt-4">
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="w-full p-4 bg-white dark:bg-gray-900 border border-blue-200 dark:border-blue-900/50 rounded-xl resize-vertical min-h-[80px] text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
              />
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => handleUpdate(comment.id)}
                  disabled={isSubmitting || !editText.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-all shadow-sm disabled:opacity-50"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg text-xs font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm whitespace-pre-wrap">
                {comment.content}
              </p>
              {depth < maxDepth && userId && (
                <div className="mt-3">
                  <button
                    onClick={() => setReplyingTo(isReplying ? null : comment.id)}
                    className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline transition-all"
                  >
                    {isReplying ? 'Cancel Reply' : 'Reply'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {isReplying && (
          <div className="mt-4 ml-8">
            <textarea
              placeholder={`Reply to ${comment.profiles?.username || 'Anonymous'}...`}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              disabled={isSubmitting}
              className="w-full p-4 bg-white dark:bg-gray-900 border border-blue-200 dark:border-blue-900/50 rounded-xl resize-vertical min-h-[80px] text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
            />
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => handleAddReply(comment.id)}
                disabled={!replyText.trim() || isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-all shadow-sm disabled:opacity-50"
              >
                Reply
              </button>
              <button
                onClick={() => {
                  setReplyingTo(null);
                  setReplyText("");
                }}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg text-xs font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {comment.replies && comment.replies.map((reply: any) => renderComment(reply, depth + 1))}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Existing Comments */}
      <div className="space-y-6">
        {comments?.length > 0 ? (
          comments.map((c) => renderComment(c))
        ) : (
          <div className="text-center py-10 bg-gray-50 dark:bg-gray-800/20 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
            <p className="text-gray-500 dark:text-gray-400 italic text-sm">No comments yet. Be the first to join the conversation!</p>
          </div>
        )}
      </div>

      {/* Add Comment Input */}
      {userId ? (
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm mt-8">
          <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Share your thoughts</h4>
          <textarea
            placeholder="What are your thoughts on this post?"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            disabled={isSubmitting}
            className="w-full p-4 bg-gray-50 dark:bg-gray-800 border-none rounded-xl resize-vertical min-h-[120px] text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all disabled:opacity-50 text-sm"
          />
          <div className="flex justify-end mt-4">
            <button
              onClick={handleAddComment}
              disabled={!commentText.trim() || isSubmitting}
              className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-800 disabled:cursor-not-allowed transition-all shadow-md text-sm"
            >
              {isSubmitting ? "Posting..." : "Post Comment"}
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center p-8 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/30">
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Please <Link to="/login" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">login</Link> to participate in the discussion.
          </p>
        </div>
      )}
    </div>
  );
}
