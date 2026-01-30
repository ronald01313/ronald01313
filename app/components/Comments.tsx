import { useState } from "react";
import { addComment } from "../lib/supabase";

interface CommentsProps {
  blogId: number;
  userId: string | null;
  comments: any[];
  onCommentUpdate: () => void;
}

export default function Comments({ blogId, userId, comments, onCommentUpdate }: CommentsProps) {
  const [commentText, setCommentText] = useState("");

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    await addComment({ blog_id: blogId, user_id: userId!, content: commentText });
    setCommentText("");
    onCommentUpdate();
  };

  return (
    <div style={{ marginTop: "20px" }}>
      <h4>Comments</h4>

      {comments?.length ? (
        comments.map((c) => (
          <div
            key={c.id}
            style={{
              padding: "8px 0",
              borderBottom: "1px solid #eee",
              backgroundColor: c.user_id === userId ? "#e3f2fd" : "transparent",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
              <strong style={{ color: "black" }}>{c.profiles?.username || "Anonymous"}</strong>
              <span style={{ fontSize: "12px", color: "#999" }}>{new Date(c.created_at).toLocaleDateString()}</span>
            </div>
            <p style={{ margin: "4px 0", color: "black" }}>{c.content}</p>
          </div>
        ))
      ) : (
        <p style={{ color: "#999" }}>No comments yet</p>
      )}

      {userId && (
        <div style={{ marginTop: "10px" }}>
          <textarea
            placeholder="Write a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            style={{
              width: "100%",
              padding: "8px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              fontSize: "14px",
              color: "#333",
              minHeight: "80px",
              resize: "vertical"
            }}
          />
          <button
            onClick={handleAddComment}
            style={{
              marginTop: "5px",
              padding: "8px 16px",
              backgroundColor: "#2196F3",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "14px"
            }}
          >
            Post Comment
          </button>
        </div>
      )}
    </div>
  );
}
