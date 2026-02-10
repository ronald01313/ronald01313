import { useState } from "react";
import { deleteBlog } from "../lib/supabase";

interface DeletePostProps {
  postId: number;
  postTitle: string;
  onDelete?: () => void;
  disabled?: boolean;
}

export function DeletePost({ postId, postTitle, onDelete, disabled = false }: DeletePostProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      const success = await deleteBlog(postId);
      
      if (success) {
        if (onDelete) {
          onDelete();
        }
      } else {
        alert("Failed to delete post. Please try again.");
      }
    } catch (err) {
      console.error("Error deleting post:", err);
      alert("An error occurred while deleting the post.");
    } finally {
      setShowConfirm(false);
      setLoading(false);
    }
  };

  if (!showConfirm) {
    return (
      <button
        onClick={() => setShowConfirm(true)}
        disabled={loading || disabled}
        className="w-full px-4 py-3 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-red-100 dark:hover:bg-red-900/20 transition-all text-center shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "..." : "Delete"}
      </button>
    );
  }

  return (
    <div className="p-4 bg-zinc-900 dark:bg-zinc-800 rounded-xl border border-zinc-800 dark:border-zinc-700 shadow-2xl absolute bottom-full right-0 mb-4 w-64 z-50 transform origin-bottom transition-all duration-300 animate-in fade-in zoom-in slide-in-from-bottom-2">
      <p className="text-white text-[11px] font-bold mb-4 uppercase tracking-tighter leading-tight">
        Confirm deletion of "{postTitle}"?
      </p>
      <div className="flex gap-2">
        <button
          onClick={handleDelete}
          disabled={loading || disabled}
          className="flex-1 py-2.5 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-red-700 transition-all shadow-lg shadow-red-500/20 disabled:opacity-50"
        >
          {loading ? "..." : "Yes"}
        </button>
        <button
          onClick={() => setShowConfirm(false)}
          disabled={loading || disabled}
          className="flex-1 py-2.5 bg-zinc-700 text-zinc-300 text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-zinc-600 transition-all disabled:opacity-50"
        >
          No
        </button>
      </div>
      <div className="absolute top-full right-8 w-3 h-3 bg-zinc-900 dark:bg-zinc-800 rotate-45 -mt-1.5 border-r border-b border-zinc-800 dark:border-zinc-700"></div>
    </div>
  );
}
