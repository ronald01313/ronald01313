import { upsertReaction } from "../lib/supabase";

interface ReactionsProps {
  blogId: number;
  userId: string | null;
  reactions: any[];
  onReactionUpdate: () => void;
}

export default function Reactions({ blogId, userId, reactions, onReactionUpdate }: ReactionsProps) {
  const likeCount = reactions?.filter((r) => r.reaction === "like").length || 0;
  const dislikeCount = reactions?.filter((r) => r.reaction === "dislike").length || 0;

  const handleReaction = async (type: string) => {
    if (!userId || !blogId) return;
    try {
      await upsertReaction(blogId, userId, type);
      onReactionUpdate();
    } catch (error) {
      console.error(`Error ${type}ing:`, error);
    }
  };

  return (
    <div style={{ marginTop: "15px" }}>
      <button
        disabled={!userId || !blogId}
        onClick={() => handleReaction("like")}
        style={{
          padding: "8px 12px",
          backgroundColor: userId && blogId ? "#4CAF50" : "#ccc",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: userId && blogId ? "pointer" : "not-allowed",
          marginRight: "5px",
          opacity: userId && blogId ? 1 : 0.6
        }}
      >
        👍 {likeCount}
      </button>

      <button
        disabled={!userId || !blogId}
        onClick={() => handleReaction("dislike")}
        style={{
          padding: "8px 12px",
          backgroundColor: userId && blogId ? "#f44336" : "#ccc",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: userId && blogId ? "pointer" : "not-allowed",
          opacity: userId && blogId ? 1 : 0.6
        }}
      >
        👎 {dislikeCount}
      </button>
    </div>
  );
}
