import Reactions from "./Reactions";
import Comments from "./Comments";
import { formatDate } from "../lib/utils";
import type { Blog, BlogImage } from "../lib/supabase";

interface ImageGridProps {
  images: BlogImage[];
  title: string;
}

export const ImageGrid = ({ images, title }: ImageGridProps) => {
  if (!images || images.length === 0) return null;

  const count = images.length;
  const displayImages = images.slice(0, 5);
  const remainingCount = count - 5;

  const renderImage = (img: BlogImage, className: string, index: number) => (
    <div key={img.id} className={`relative overflow-hidden ${className} group/img h-full w-full`}>
      <img
        src={img.image_url}
        alt={`${title} - image ${index + 1}`}
        className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-105"
      />
      {index === 4 && remainingCount > 0 && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-[2px]">
          <span className="text-white text-2xl font-black">+{remainingCount}</span>
        </div>
      )}
    </div>
  );

  return (
    <div className="rounded-2xl overflow-hidden mb-6 aspect-[16/10] w-full bg-zinc-100 dark:bg-zinc-800 flex-shrink-0">
      {count === 1 && renderImage(displayImages[0], "h-full w-full", 0)}
      
      {count === 2 && (
        <div className="grid grid-cols-2 gap-1 h-full">
          {renderImage(displayImages[0], "h-full", 0)}
          {renderImage(displayImages[1], "h-full", 1)}
        </div>
      )}

      {count === 3 && (
        <div className="grid grid-cols-2 gap-1 h-full">
          {renderImage(displayImages[0], "h-full", 0)}
          <div className="grid grid-rows-2 gap-1 h-full">
            {renderImage(displayImages[1], "h-full", 1)}
            {renderImage(displayImages[2], "h-full", 2)}
          </div>
        </div>
      )}

      {count === 4 && (
        <div className="grid grid-rows-2 gap-1 h-full">
          {renderImage(displayImages[0], "h-full", 0)}
          <div className="grid grid-cols-3 gap-1 h-full">
            {renderImage(displayImages[1], "h-full", 1)}
            {renderImage(displayImages[2], "h-full", 2)}
            {renderImage(displayImages[3], "h-full", 3)}
          </div>
        </div>
      )}

      {count >= 5 && (
        <div className="grid grid-rows-2 gap-1 h-full">
          <div className="grid grid-cols-2 gap-1 h-full">
            {renderImage(displayImages[0], "h-full", 0)}
            {renderImage(displayImages[1], "h-full", 1)}
          </div>
          <div className="grid grid-cols-3 gap-1 h-full">
            {renderImage(displayImages[2], "h-full", 2)}
            {renderImage(displayImages[3], "h-full", 3)}
            {renderImage(displayImages[4], "h-full", 4)}
          </div>
        </div>
      )}
    </div>
  );
};

interface BlogPostProps {
  blog: Blog;
  comments: any[];
  reactions: any[];
  userId: string | null;
  onReactionUpdate: () => void;
  onCommentUpdate: () => void;
  onPostClick?: () => void;
}

export default function BlogPost({ blog, comments, reactions, userId, onReactionUpdate, onCommentUpdate, onPostClick }: BlogPostProps) {
  return (
    <article
      className="bg-white dark:bg-zinc-900 group cursor-pointer h-full flex flex-col transition-all duration-300 border border-zinc-100 dark:border-zinc-800 rounded-3xl p-5 hover:shadow-xl hover:border-blue-100 dark:hover:border-zinc-700"
      onClick={onPostClick}
    >
      <ImageGrid images={blog.blog_images || []} title={blog.title} />

      <div className="flex flex-col flex-grow">
        <div className="flex items-center gap-2 mb-3">
          {blog.category && (
            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
              {blog.category}
            </span>
          )}
          <span className="text-[10px] text-zinc-300 dark:text-zinc-600">•</span>
          <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
            {new Date(blog.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        </div>

        <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-3 leading-snug group-hover:text-blue-600 transition-colors line-clamp-2 break-words">
          {blog.title}
        </h3>

        {blog.excerpt && (
          <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed font-normal line-clamp-3 mb-6 break-words">
            {blog.excerpt.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, "")}
          </p>
        )}

        <div className="mt-auto pt-6 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-500 uppercase">
                {blog.profiles?.username?.[0]}
              </div>
              <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-tighter">{blog.profiles?.username}</span>
            </div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
              {comments?.length || 0} {comments?.length === 1 ? 'Comment' : 'Comments'}
            </span>
          </div>

          <div className="pt-4 border-t border-zinc-50 dark:border-zinc-800/50" onClick={(e) => e.stopPropagation()}>
            <Reactions
              blogId={blog.id}
              userId={userId}
              reactions={reactions}
              onReactionUpdate={onReactionUpdate}
            />
          </div>
        </div>
      </div>
    </article>
  );
}
