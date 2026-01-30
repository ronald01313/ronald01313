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
    const success = await deleteBlog(postId);
    
    if (success) {
      if (onDelete) {
        onDelete();
      }
      alert(`Post "${postTitle}" deleted successfully!`);
    } else {
      alert("Failed to delete post. Please try again.");
    }
    setShowConfirm(false);
    setLoading(false);
  };

  if (!showConfirm) {
    return (
      <button
        onClick={() => setShowConfirm(true)}
        disabled={loading || disabled}
        style={{
          padding: "8px 16px",
          backgroundColor: "rgb(244, 67, 54)",
          color: "white",
          border: "none",
          borderRadius: "4px",
          fontSize: "14px",
          cursor: loading || disabled ? "not-allowed" : "pointer",
          fontWeight: "500",
          opacity: loading || disabled ? 0.6 : 1,
          transition: "all 0.3s ease",
        }}
      >
        {loading ? "Deleting..." : "Delete"}
      </button>
    );
  }

  return (
    <div style={{
      padding: "20px",
      backgroundColor: "#fff3cd",
      border: "1px solid #ffc107",
      borderRadius: "4px",
      marginTop: "15px",
    }}>
      <p style={{ color: "#333", marginBottom: "15px", fontWeight: "500" }}>
        Are you sure you want to delete "{postTitle}"? This action cannot be undone.
      </p>
      <div style={{ display: "flex", gap: "10px" }}>
        <button
          onClick={handleDelete}
          disabled={loading || disabled}
          style={{
            padding: "8px 16px",
            backgroundColor: "rgb(244, 67, 54)",
            color: "white",
            border: "none",
            borderRadius: "4px",
            fontSize: "14px",
            cursor: loading || disabled ? "not-allowed" : "pointer",
            fontWeight: "500",
            opacity: loading || disabled ? 0.6 : 1,
            transition: "all 0.3s ease",
          }}
        >
          {loading ? "Deleting..." : "Yes, Delete"}
        </button>
        <button
          onClick={() => setShowConfirm(false)}
          disabled={loading || disabled}
          style={{
            padding: "8px 16px",
            backgroundColor: "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "4px",
            fontSize: "14px",
            cursor: loading || disabled ? "not-allowed" : "pointer",
            fontWeight: "500",
            opacity: loading || disabled ? 0.6 : 1,
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
