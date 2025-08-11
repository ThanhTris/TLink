import React, { useState } from "react";
import { Heart, MessageCircle, Bookmark } from "lucide-react";
import Button from "./Button";
import CommentSection from "./CommentPostSection";
import { getTimeAgo } from "../utils/timeAgo";
import { likePost as apiLikePost, unlikePost as apiUnlikePost, getCurrentUserIdFromLocalStorage } from "../api/post";
import { useDispatch } from "react-redux";

interface ContentProps {
  id: number;
  name: string;
  title: string;
  content: string;
  like_count: number;
  comment_count: number;
  is_saved: boolean;
  is_like: boolean;
  created_at: Date;
  parent_tags: string[];
  child_tags: string[];
  initialComments?: any[]; // thêm
  images?: string[];
  files?: { name: string; url: string }[];
}

const ContentPost: React.FC<ContentProps> = ({
  id,
  name,
  title,
  content,
  like_count,
  comment_count,
  is_saved,
  is_like,
  created_at,
  parent_tags,
  child_tags,
  initialComments = [], // thêm
  images = [],
  files = [],
}) => {
  const dispatch = useDispatch();
  const [liked, setLiked] = useState(is_like);
  const [likeCount, setLikeCount] = useState(like_count);
  const [isBookmarked, setIsBookmarked] = useState(is_saved);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>(initialComments); // dùng initialComments
  const timeAgo = getTimeAgo(created_at);

  const handleLike = async () => {
    const uid = getCurrentUserIdFromLocalStorage();
    if (!uid) return; // chưa đăng nhập -> bỏ qua (hoặc mở modal login nếu cần)
    const newLiked = !liked;
    setLiked(newLiked);
    setLikeCount((prev) => (newLiked ? prev + 1 : prev - 1)); // optimistic
    try {
      if (newLiked) {
        await apiLikePost(id, uid);
      } else {
        await apiUnlikePost(id, uid);
      }
    } catch {
      // rollback on error
      setLiked((prev) => !prev);
      setLikeCount((prev) => (newLiked ? prev - 1 : prev + 1));
    }
  };

  const toggleReadMore = () => setIsExpanded((v) => !v);
  const toggleComments = () => setShowComments((v) => !v);
  const toggleBookmark = () => setIsBookmarked((v) => !v);

  const addComment = async (content: string) => {
    // const newComment = await postService.addComment(id, content, 1);
    // setComments((prev) => [...prev, newComment]);
  };

  return (
    <div className="relative px-5 pt-5 pb-2 mt-6 bg-gray-200 shadow-sm rounded-xl w-full">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-lg font-semibold line-clamp-1">{title}</h2>
        <Button
          onClick={toggleBookmark}
          className="text-gray-500 cursor-pointer hover:text-yellow-500 focus:outline-none"
        >
          <Bookmark
            size={20}
            color={isBookmarked ? "#f59e0b" : "gray"}
            fill={isBookmarked ? "#f59e0b" : "none"}
          />
        </Button>
      </div>
      <div className="flex items-center flex-wrap gap-2 mb-2 text-sm text-gray-500">
        <span>Đăng bởi {name}</span>
        <span>• {timeAgo}</span>
        {parent_tags.map((tag, idx) => (
          <span key={`parent-tag-${idx}`} className="px-2 py-1 text-xs text-gray-600 bg-gray-100 rounded-full">
            #{tag}
          </span>
        ))}
        {child_tags.map((tag, idx) => (
          <span key={`child-tag-${idx}`} className="px-2 py-1 text-xs text-gray-600 bg-gray-100 rounded-full">
            #{tag}
          </span>
        ))}
    
      </div>
      <div
        className={`text-gray-800 mb-3 relative ${
          !isExpanded ? "line-clamp-3 min-h-[36px] max-h-[72px] overflow-hidden" : ""
        }`}
        style={{ wordBreak: "break-word" }}
      >
        {content}
        {!isExpanded && content.length > 100 && (
          <span
            className="absolute right-0 bottom-0 bg-gray-200 pl-2 cursor-pointer text-blue-500 hover:underline"
            onClick={toggleReadMore}
          >
            Read More
          </span>
        )}
      </div>
      {/* images gallery */}
      {images.length > 0 && (
        <div className="mb-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
          {images.map((src, idx) => (
            <a key={`post-img-${idx}`} href={src} target="_blank" rel="noreferrer">
              <img
                src={src}
                alt={`img-${idx}`}
                className="w-full h-40 object-cover rounded-lg border border-gray-300"
                loading="lazy"
              />
            </a>
          ))}
        </div>
      )}
      {/* files list */}
      {files.length > 0 && (
        <div className="mb-3">
          {files.map((f, idx) => (
            <div key={`post-file-${idx}`} className="flex items-center gap-2 text-sm">
              <a
                href={f.url}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 hover:underline break-all"
              >
                {f.name || f.url}
              </a>
            </div>
          ))}
        </div>
      )}
      {isExpanded && (
        <Button onClick={toggleReadMore} className="text-blue-500 hover:text-blue-700">
          Thu gọn
        </Button>
      )}
      <div className="flex gap-6 mb-3 text-sm text-gray-500">
        <Button
          className={`flex items-center gap-1 cursor-pointer focus:outline-none ${
            liked ? "text-red-500 hover:text-red-600" : "text-gray-600 hover:text-gray-800"
          }`}
           onClick={handleLike}
         >
          <Heart size={16} fill={liked ? "currentColor" : "none"} />
           {likeCount} Thích
         </Button>
        <Button
          className="flex items-center gap-1 cursor-pointer focus:outline-none"
          onClick={toggleComments}
        >
          <MessageCircle size={16} />
          {comments.length || comment_count} Bình luận
        </Button>
      </div>
      {showComments && (
        <CommentSection
          initialComments={comments}
          onAddComment={addComment}
          currentUser="You"
          post_id={id}
        />
      )}
    </div>
  );
};

export default ContentPost;