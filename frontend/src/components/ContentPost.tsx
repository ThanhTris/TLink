import React, { useState } from "react";
import { Heart, MessageCircle, Bookmark } from "lucide-react";
import Button from "./Button";
import CommentSection from "./CommentPostSection";

interface Comment {
  id: number;
  author: string;
  content: string;
  createdAt: Date;
  likes: number;
  replies: Comment[];
  isEditing?: boolean;
  avatarSrc: string; // Thêm avatarSrc để đồng bộ với CommentSection
}

interface ContentProps {
  title: string;
  author: string;
  createdAt: Date;
  tags: string[];
  content: string;
  likes: number;
  comments: number;
  initialComments?: Comment[];
}

function timeAgo(date: Date) {
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return `${diff} giây trước`;
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)} ngày trước`;
  if (diff < 31536000) return `${Math.floor(diff / 2592000)} tháng trước`;
  return `${Math.floor(diff / 31536000)} năm trước`;
}

const ContentPost: React.FC<ContentProps> = ({
  title,
  author,
  createdAt,
  tags,
  content,
  likes,
  comments: initialCommentsCount,
  initialComments = [],
}) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(likes);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false); // Thêm trạng thái bookmark
  const currentUser = "You"; // Giả định người dùng hiện tại

  const handleLike = () => {
    const newLiked = !liked;
    setLiked(newLiked);
    setLikeCount((prev) => (newLiked ? prev + 1 : prev - 1));
  };

  const toggleReadMore = () => {
    setIsExpanded(!isExpanded);
  };

  const toggleComments = () => {
    setShowComments(!showComments);
  };

  const toggleBookmark = () => {
    setIsBookmarked(!isBookmarked); // Toggle trạng thái bookmark
  };

  const addComment = (content: string) => {
    // Logic cập nhật số lượng comment (nếu cần)
    // Ví dụ: Gửi lên server hoặc cập nhật state cha
  };

  return (
    <div className="bg-gray-200 rounded-xl px-5 pt-5 pb-2 mt-6 shadow-sm relative">
      {/* Tiêu đề và Icon Bookmark */}
      <div className="flex justify-between items-center mb-1">
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

      {/* Tác giả và thời gian */}
      <div className="text-sm text-gray-500 flex items-center gap-2 mb-2">
        <span>Đăng bởi {author}</span>
        <span>• {timeAgo(createdAt)}</span>
      </div>

      {/* Thẻ tag */}
      <div className="flex flex-wrap gap-1 mb-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs"
          >
            #{tag}
          </span>
        ))}
      </div>

      {/* Nội dung bài viết */}
      <div
        className={`text-gray-800 mb-3 ${
          !isExpanded ? "line-clamp-2 min-h-[24px] max-h-[48px] overflow-hidden" : ""
        }`}
      >
        {content}
      </div>

      {/* Read More / Thu gọn */}
      {!isExpanded && content.length > 100 && (
        <Button
          onClick={toggleReadMore}
          className="text-blue-500 hover:text-blue-700"
        >
          Read More
        </Button>
      )}
      {isExpanded && (
        <Button
          onClick={toggleReadMore}
          className="text-blue-500 hover:text-blue-700"
        >
          Thu gọn
        </Button>
      )}

      {/* Like & Comment */}
      <div className="flex gap-6 text-gray-500 text-sm mb-3">
        <Button
          className="flex items-center gap-1 focus:outline-none cursor-pointer"
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
          className="flex items-center gap-1 focus:outline-none cursor-pointer"
          onClick={toggleComments}
        >
          <MessageCircle size={16} />
          {initialComments.length || initialCommentsCount} Bình luận
        </Button>
      </div>

      {/* Section bình luận */}
      {showComments && (
        <CommentSection
          initialComments={initialComments}
          onAddComment={addComment}
          currentUser={currentUser}
        />
      )}
    </div>
  );
};

export default ContentPost;