import { useState, useRef } from "react";
import { Link } from "react-router";
import { addComment, deleteComment, updateComment, getComments, uploadCommentImage } from "../lib/supabase";

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
  
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim() || !userId) return;
    setIsSubmitting(true);
    try {
      let imageUrl = undefined;
      if (selectedImage) {
        imageUrl = await uploadCommentImage(selectedImage, userId) || undefined;
      }
      
      await addComment({ 
        blog_id: blogId, 
        user_id: userId, 
        content: commentText.trim(),
        image_url: imageUrl
      });
      
      setCommentText("");
      setSelectedImage(null);
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      
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
      let imageUrl = undefined;
      if (selectedImage) {
        imageUrl = await uploadCommentImage(selectedImage, userId) || undefined;
      }

      await addComment({ 
        blog_id: blogId, 
        user_id: userId, 
        content: replyText.trim(), 
        parent_comment_id: parentId,
        image_url: imageUrl
      });
      
      setReplyText("");
      setSelectedImage(null);
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      
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
          className={`p-6 rounded-2xl border transition-all duration-300 ${
            comment.user_id === userId
              ? "bg-blue-50/30 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30"
              : "bg-zinc-50 dark:bg-zinc-800/50 border-zinc-100 dark:border-zinc-800 hover:border-zinc-200 dark:hover:border-zinc-700"
          }`}
        >
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-zinc-700 dark:text-zinc-300 font-black text-sm border border-zinc-300 dark:border-zinc-600 shadow-sm">
                {comment.profiles?.username?.[0]?.toUpperCase() || "A"}
              </div>
              <div>
                <strong className="block text-sm font-black text-zinc-900 dark:text-white uppercase tracking-tighter">
                  {comment.profiles?.username || "Anonymous"}
                </strong>
                <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-500 uppercase tracking-widest">
                  {new Date(comment.created_at).toLocaleDateString()}
                  {comment.updated_at !== comment.created_at && " • Edited"}
                </span>
              </div>
            </div>

            {comment.user_id === userId && !editingId && (
              <div className="flex gap-4">
                <button
                  onClick={() => startEditing(comment)}
                  className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-all"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(comment.id)}
                  className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-600 transition-all"
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
                className="w-full p-4 bg-white dark:bg-zinc-900 border border-blue-200 dark:border-blue-900/50 rounded-xl resize-vertical min-h-[100px] text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-medium"
              />
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => handleUpdate(comment.id)}
                  disabled={isSubmitting || !editText.trim()}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-md disabled:opacity-50"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="px-6 py-2.5 bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed text-sm whitespace-pre-wrap font-medium">
                {comment.content}
              </p>
              {comment.image_url && (
                <div className="mt-4 overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700 max-w-md">
                  <img src={comment.image_url} alt="Comment attachment" className="w-full h-auto object-cover" />
                </div>
              )}
              {depth < maxDepth && userId && (
                <div className="mt-4">
                  <button
                    onClick={() => setReplyingTo(isReplying ? null : comment.id)}
                    className="text-[10px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all"
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
              className="w-full p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl resize-vertical min-h-[100px] text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-medium"
            />
            
            <div className="mt-3">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id={`reply-image-${comment.id}`}
              />
              <div className="flex flex-wrap gap-3 items-center">
                <button
                  type="button"
                  onClick={() => document.getElementById(`reply-image-${comment.id}`)?.click()}
                  className="px-3 py-1.5 border border-zinc-200 dark:border-zinc-700 rounded-lg text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all flex items-center gap-2"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Add Image
                </button>
                
                {replyingTo === comment.id && imagePreview && (
                  <div className="relative group">
                    <img src={imagePreview} alt="Preview" className="w-12 h-12 object-cover rounded-lg border border-zinc-200 dark:border-zinc-700" />
                    <button
                      onClick={() => { setSelectedImage(null); setImagePreview(null); }}
                      className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[8px] shadow-lg"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => handleAddReply(comment.id)}
                disabled={!replyText.trim() || isSubmitting}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20 disabled:opacity-50"
              >
                Reply
              </button>
              <button
                onClick={() => {
                  setReplyingTo(null);
                  setReplyText("");
                }}
                className="px-6 py-2.5 bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-all"
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
          <div className="text-center py-16 bg-zinc-50 dark:bg-zinc-900/50 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800 transition-all duration-500">
            <p className="text-zinc-500 dark:text-zinc-500 font-bold uppercase tracking-widest text-xs">No comments yet. Be the first to join the conversation!</p>
          </div>
        )}
      </div>

      {/* Add Comment Input */}
      {userId ? (
        <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm mt-12 transition-all duration-500">
          <h4 className="text-xl font-black text-zinc-900 dark:text-white mb-6 uppercase tracking-tighter">Share your thoughts</h4>
          <textarea
            placeholder="What are your thoughts on this post?"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            disabled={isSubmitting}
            className="w-full p-5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700 rounded-2xl resize-vertical min-h-[150px] text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all disabled:opacity-50 text-sm font-medium shadow-inner"
          />
          
          <div className="mt-4">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              ref={fileInputRef}
              className="hidden"
            />
            <div className="flex flex-wrap gap-4 items-center">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Attach Image
              </button>
              
              {imagePreview && (
                <div className="relative group">
                  <img src={imagePreview} alt="Preview" className="w-16 h-16 object-cover rounded-lg border border-zinc-200 dark:border-zinc-700" />
                  <button
                    onClick={() => { setSelectedImage(null); setImagePreview(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end mt-6">
          <button
            onClick={handleAddComment}
            disabled={!commentText.trim() || isSubmitting}
            className="px-10 py-4 bg-blue-600 text-white rounded-xl font-black uppercase tracking-widest hover:bg-blue-700 disabled:bg-zinc-200 dark:disabled:bg-zinc-800 disabled:text-zinc-400 disabled:cursor-not-allowed transition-all shadow-xl shadow-blue-500/20 text-xs"
          >
            {isSubmitting ? "Posting..." : "Post Comment"}
          </button>
          </div>
        </div>
      ) : (
        <div className="text-center p-10 bg-blue-50/50 dark:bg-blue-900/10 rounded-3xl border border-blue-100 dark:border-blue-900/30 transition-all duration-500">
          <p className="text-zinc-600 dark:text-zinc-400 text-sm font-bold">
            Please <Link to="/login" className="text-blue-600 dark:text-blue-400 font-black hover:underline transition-all">login</Link> to participate in the discussion.
          </p>
        </div>
      )}
    </div>
  );
}
