import { upsertReaction, removeReaction } from "../lib/supabase";

interface ReactionsProps {
  blogId: number;
  userId: string | null;
  reactions: any[];
  onReactionUpdate: () => void;
}

export default function Reactions({ blogId, userId, reactions, onReactionUpdate }: ReactionsProps) {
  const likeCount = reactions?.filter((r) => r.reaction === "like").length || 0;
  const dislikeCount = reactions?.filter((r) => r.reaction === "dislike").length || 0;
  
  const userReaction = userId ? reactions?.find(r => r.user_id === userId)?.reaction : null;

  const handleReaction = async (type: string) => {
    if (!userId || !blogId) return;
    
    try {
      if (userReaction === type) {
        // If clicking the same reaction, remove it (toggle off)
        await removeReaction(blogId, userId);
      } else {
        // Upsert new reaction
        await upsertReaction(blogId, userId, type);
      }
      onReactionUpdate();
    } catch (error) {
      console.error(`Error ${type}ing:`, error);
    }
  };

  const btnBaseClass = "flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 font-bold text-sm";
  const disabledClass = "opacity-50 cursor-not-allowed grayscale";

  return (
    <div className="flex items-center gap-3">
      <button
        disabled={!userId}
        onClick={(e) => { e.stopPropagation(); handleReaction("like"); }}
        className={`
          ${btnBaseClass}
          ${!userId ? disabledClass : ""}
          ${userReaction === "like" 
            ? "bg-green-600 text-white shadow-lg shadow-green-200 dark:shadow-none" 
            : "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/40"}
        `}
        title={!userId ? "Login to like" : "Like"}
      >
        <span className="text-lg">👍</span>
        <span>{likeCount}</span>
      </button>

      <button
        disabled={!userId}
        onClick={(e) => { e.stopPropagation(); handleReaction("dislike"); }}
        className={`
          ${btnBaseClass}
          ${!userId ? disabledClass : ""}
          ${userReaction === "dislike" 
            ? "bg-red-600 text-white shadow-lg shadow-red-200 dark:shadow-none" 
            : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40"}
        `}
        title={!userId ? "Login to dislike" : "Dislike"}
      >
        <span className="text-lg">👎</span>
        <span>{dislikeCount}</span>
      </button>
      
      {!userId && (
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-2">
          Login to react
        </span>
      )}
    </div>
  );
}
