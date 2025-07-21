import React, { useState } from "react";
import { Heart, MessageCircle, Bookmark } from "lucide-react";
import Button from "./Button";
import CommentSection from "./CommentPostSection";
import { getTimeAgo } from "../utils/timeAgo";
import { postService } from "../services/postService";
import { useDispatch } from "react-redux";

interface ContentProps {
  id: number;
  user_id: number;
  title: string;
  content: string;
  status: string;
  likes: number;
  comments: number;
  createdAt: Date;
  updated_at: Date;
  tagParent: string;
  tagChild: string;
  initialComments?: any[];
  initialLikes?: any[];
  initialFavorites?: any[];
}

const ContentPost: React.FC<ContentProps> = ({
  id,
  user_id,
  title,
  createdAt,
  updated_at,
  tagParent,
  tagChild,
  content,
  status,
  likes,
  comments: initialCommentsCount,
  initialComments = [],
  initialLikes = [],
  initialFavorites = [],
}) => {
  const dispatch = useDispatch();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(likes);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(initialFavorites.length > 0);
  const [comments, setComments] = useState<any[]>(initialComments);
  const timeAgo = getTimeAgo(createdAt);

  const handleLike = async () => {
    const newLiked = !liked;
    setLiked(newLiked);
    setLikeCount((prev) => (newLiked ? prev + 1 : prev - 1));
    await postService.addLike(id, 1);
  };

  const toggleReadMore = () => setIsExpanded((v) => !v);
  const toggleComments = () => setShowComments((v) => !v);
  const toggleBookmark = () => setIsBookmarked((v) => !v);

  const addComment = async (content: string) => {
    const newComment = await postService.addComment(id, content, 1);
    setComments((prev) => [...prev, newComment]);
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
      <div className="flex items-center gap-2 mb-2 text-sm text-gray-500">
        <span>Đăng bởi User_{user_id}</span>
        <span>• {timeAgo}</span>
      </div>
      <div className="flex flex-wrap gap-1 mb-2">
        <span className="px-2 py-1 text-xs text-gray-600 bg-gray-100 rounded-full">
          #{tagParent}
        </span>
        <span className="px-2 py-1 text-xs text-gray-600 bg-gray-100 rounded-full">
          #{tagChild}
        </span>
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
      {isExpanded && (
        <Button onClick={toggleReadMore} className="text-blue-500 hover:text-blue-700">
          Thu gọn
        </Button>
      )}
      <div className="flex gap-6 mb-3 text-sm text-gray-500">
        <Button
          className="flex items-center gap-1 cursor-pointer focus:outline-none"
          onClick={handleLike}
        >
          <Heart
            size={16}
            color={liked ? "#ef4444" : "gray"}
            fill={liked ? "#ef4444" : "none"}
          />
          {likeCount} Thích
        </Button>
        <Button
          className="flex items-center gap-1 cursor-pointer focus:outline-none"
          onClick={toggleComments}
        >
          <MessageCircle size={16} />
          {comments.length || initialCommentsCount} Bình luận
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