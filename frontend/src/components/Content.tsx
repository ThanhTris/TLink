import React, { useEffect, useRef, useState } from "react";
import { Heart, MessageCircle } from "lucide-react";
import Button from "./Button";

interface ContentProps {
  title: string;
  author: string;
  createdAt: Date;
  tags: string[];
  content: string;
  likes: number;
  comments: number;
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

const Content: React.FC<ContentProps> = ({
  title,
  author,
  createdAt,
  tags,
  content,
  likes,
  comments,
}) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(likes);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleLike = () => {
    setLiked((prevLiked) => {
      setLikeCount((prevCount) => (prevLiked ? prevCount - 1 : prevCount + 1));
      return !prevLiked;
    });
  };

  return (
    <div className="bg-gray-200 rounded-xl px-5 pt-5 pb-2 mt-6 shadow-sm">
      {/* Tiêu đề (click để xem chi tiết) */}
      <h2 className="text-lg font-semibold mb-1 line-clamp-1 hover:underline cursor-pointer">
        {title}
      </h2>

      {/* Tác giả và thời gian thẻ tag */}
      <div className="flex items-center text-sm text-gray-500 gap-2 mb-2">
        <span>Đăng bởi {author}</span>
        <span>• {timeAgo(createdAt)}</span>
        <div className="flex flex-wrap items-center justify-between gap-1 mb-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs"
            >
              #{tag}
            </span>
          ))}{" "}
        </div>
      </div>


      {/* Nội dung bài viết (giới hạn 2 dòng với ellipsis) */}
      <div
        ref={contentRef}
        className="text-gray-800 mb-1 line-clamp-2 min-h-[1.5rem] overflow-hidden"
      >
        {content}
      </div>

      {/* Like & Comment */}
      <div className="flex gap-6 text-gray-500 text-sm">
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
        <span className="flex items-center gap-1">
          <MessageCircle size={16} />
          {comments} Bình luận
        </span>
      </div>
    </div>
  );
};

export default Content;
