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
}

export default function BlogPost({ blog, comments, reactions, userId, onReactionUpdate, onCommentUpdate }: BlogPostProps) {
  return (
    <article
      style={{
        padding: "25px",
        border: "1px solid #e0e0e0",
        borderRadius: "8px",
        transition: "all 0.3s ease",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "10px" }}>
        <h3 style={{ margin: "0 0 10px 0", color: "#333", fontSize: "24px" }}>
          {blog.title}
        </h3>
        {blog.category && (
          <span style={{
            backgroundColor: "#f0f0f0",
            padding: "4px 12px",
            borderRadius: "20px",
            fontSize: "12px",
            whiteSpace: "nowrap"
          }}>
            {blog.category}
          </span>
        )}
      </div>

      {blog.blog_images && blog.blog_images.length > 0 && (
        <div style={{ marginBottom: "15px" }}>
          <img
            src={blog.blog_images.find(img => img.is_featured)?.image_url || blog.blog_images[0].image_url}
            alt={blog.title}
            style={{
              width: "100%",
              maxHeight: "300px",
              objectFit: "cover",
              borderRadius: "8px",
              border: "1px solid #e0e0e0"
            }}
          />
        </div>
      )}

      {blog.excerpt && (
        <p style={{ color: "#666", margin: "0 0 15px 0", lineHeight: "1.6" }}>
          {blog.excerpt}
        </p>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", color: "#999", fontSize: "14px" }}>
        <span>{new Date(blog.created_at).toLocaleDateString()}</span>
        <span>By {blog.profiles?.username || "Unknown"}</span>
      </div>

      <Reactions
        blogId={blog.id}
        userId={userId}
        reactions={reactions}
        onReactionUpdate={onReactionUpdate}
      />

      <Comments
        blogId={blog.id}
        userId={userId}
        comments={comments}
        onCommentUpdate={onCommentUpdate}
      />
    </article>
  );
}
