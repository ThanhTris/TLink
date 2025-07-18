import React, { useState } from "react";
import { Heart } from "lucide-react";
import Button from "./Button";

interface Comment {
  id: number;
  author: string;
  content: string;
  createdAt: Date;
  likes: number;
  replies: Comment[];
  isEditing?: boolean;
  avatarSrc: string;
}

interface CommentSectionProps {
  initialComments: Comment[];
  onAddComment: (content: string) => void;
  currentUser: string;
}

const CommentPostSection: React.FC<CommentSectionProps> = ({
  initialComments,
  onAddComment,
  currentUser,
}) => {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState("");
  const [editCommentId, setEditCommentId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");
  const [showMenuId, setShowMenuId] = useState<number | null>(null);
  const [likedComments, setLikedComments] = useState<{ [key: number]: boolean }>({}); // Theo dõi trạng thái thả tim
  const [replyTo, setReplyTo] = useState<number | null>(null); // Theo dõi comment đang trả lời
  const [newReply, setNewReply] = useState(""); // Nội dung trả lời

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

  const addComment = () => {
    if (newComment.trim()) {
      const newCommentObj: Comment = {
        id: Date.now(),
        author: currentUser,
        content: newComment,
        createdAt: new Date(),
        likes: 0,
        replies: [],
        avatarSrc: "https://tse3.mm.bing.net/th/id/OIP.cVIjZO1CHBYfqIB04Kb9LgHaFj?w=1400&h=1050&rs=1&pid=ImgDetMain&o=7&rm=3",
      };
      onAddComment(newComment);
      setComments([...comments, newCommentObj]);
      setNewComment("");
    }
  };

  const addReply = (commentId: number) => {
    if (newReply.trim()) {
      setComments((prev) => {
        const updatedComments = prev.map((comment) =>
          comment.id === commentId
            ? {
                ...comment,
                replies: [
                  ...comment.replies,
                  {
                    id: Date.now() + Math.random(),
                    author: currentUser,
                    content: newReply,
                    createdAt: new Date(),
                    likes: 0,
                    replies: [],
                    avatarSrc: "https://tse3.mm.bing.net/th/id/OIP.cVIjZO1CHBYfqIB04Kb9LgHaFj?w=1400&h=1050&rs=1&pid=ImgDetMain&o=7&rm=3",
                  },
                ],
              }
            : comment
        );
        return updatedComments;
      });
      setNewReply("");
      setReplyTo(null); // Đóng ô trả lời sau khi gửi
    }
  };

  const toggleLikeComment = (commentId: number, isReply?: boolean) => {
    setLikedComments((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
    setComments((prev) =>
      prev.map((comment) => {
        if (comment.id === commentId) {
          return {
            ...comment,
            likes: prev[commentId] ? comment.likes - 1 : comment.likes + 1,
          };
        }
        if (isReply) {
          return {
            ...comment,
            replies: comment.replies.map((reply) =>
              reply.id === commentId
                ? { ...reply, likes: prev[commentId] ? reply.likes - 1 : reply.likes + 1 }
                : reply
            ),
          };
        }
        return comment;
      })
    );
  };

  const startEditing = (commentId: number, content: string) => {
    setEditCommentId(commentId);
    setEditContent(content);
    setShowMenuId(null);
  };

  const saveEdit = (commentId: number) => {
    setComments((prev) =>
      prev.map((comment) =>
        comment.id === commentId
          ? { ...comment, content: editContent, isEditing: false }
          : comment
      )
    );
    setEditCommentId(null);
  };

  const deleteComment = (commentId: number) => {
    setComments((prev) => prev.filter((comment) => comment.id !== commentId));
    setShowMenuId(null);
  };

  const toggleMenu = (commentId: number) => {
    setShowMenuId(showMenuId === commentId ? null : commentId);
  };

  // Xử lý phím Enter để đăng bình luận hoặc trả lời
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>, action: () => void) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      action();
    }
  };

  return (
    <div className="ml-4 mb-4">
      {/* Danh sách bình luận */}
      {comments.map((comment) => (
        <div key={comment.id} className="relative">
          <div className="bg-white p-3 rounded-lg mb-2 flex items-start">
            {/* Phần 1: Avatar */}
            <img
              src={comment.avatarSrc}
              alt={`${comment.author}'s avatar`}
              className="w-10 h-10 rounded-full mr-3"
            />
            {/* Phần 2: Nội dung bình luận */}
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-semibold">{comment.author}</span>
                  <span className="text-xs text-gray-500 ml-2">
                    {timeAgo(comment.createdAt)}
                  </span>
                </div>
                {comment.author === currentUser && (
                  <div className="relative">
                    {/* Phần 3: Dấu ... */}
                    <Button
                      onClick={() => toggleMenu(comment.id)}
                      className="text-gray-500 hover:text-gray-700 focus:outline-none"
                    >
                      ...
                    </Button>
                    {showMenuId === comment.id && (
                      <div className="absolute right-0 mt-2 w-24 bg-white border rounded shadow-lg z-10">
                        {!comment.isEditing ? (
                          <>
                            <Button
                              onClick={() => startEditing(comment.id, comment.content)}
                              className="block w-full text-left px-4 py-2 text-blue-500 hover:bg-gray-100"
                            >
                              Edit
                            </Button>
                            <Button
                              onClick={() => deleteComment(comment.id)}
                              className="block w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100"
                            >
                              Delete
                            </Button>
                          </>
                        ) : (
                          <Button
                            onClick={() => saveEdit(comment.id)}
                            className="block w-full text-left px-4 py-2 text-green-500 hover:bg-gray-100"
                          >
                            Save
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
              {comment.isEditing ? (
                <input
                  type="text"
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full p-1 border rounded mt-1"
                  onKeyPress={(e) => handleKeyPress(e, () => saveEdit(comment.id))}
                />
              ) : (
                <div className="text-gray-700 mt-1">{comment.content}</div>
              )}
              <div className="flex gap-6 text-gray-500 text-sm mt-1">
                <Button
                  className="flex items-center gap-1 focus:outline-none cursor-pointer"
                  onClick={() => toggleLikeComment(comment.id)}
                >
                  <Heart
                    size={16}
                    color={likedComments[comment.id] ? "#ef4444" : "gray"}
                    fill={likedComments[comment.id] ? "#ef4444" : "none"}
                  />
                  {comment.likes} Thích
                </Button>
                <Button
                  className="text-gray-500 hover:text-blue-500"
                  onClick={() => setReplyTo(comment.id)}
                >
                  Trả lời
                </Button>
              </div>
            </div>
          </div>
          {/* Ô nhập trả lời, hiển thị ngay dưới comment cha */}
          {replyTo === comment.id && (
            <div className="relative ml-14 mt-2">
              <div className="absolute left-0 top-0 h-full border-l-2 border-gray-300"></div>
              <div className="bg-white p-3 rounded-lg flex items-start relative ml-4">
                <img
                  src={comment.avatarSrc} // Sử dụng avatar của comment cha
                  alt={`${comment.author}'s avatar`}
                  className="w-10 h-10 rounded-full mr-3"
                />
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Viết trả lời của bạn..."
                    value={newReply}
                    onChange={(e) => setNewReply(e.target.value)}
                    className="w-full p-2 border rounded"
                    onKeyPress={(e) => handleKeyPress(e, () => addReply(comment.id))}
                  />
                  <Button
                    onClick={() => addReply(comment.id)}
                    className="mt-2 bg-blue-500 text-white hover:bg-blue-600"
                  >
                    Đăng trả lời
                  </Button>
                </div>
              </div>
            </div>
          )}
          {/* Hiển thị các trả lời con */}
          {comment.replies.map((reply) => (
            <div key={reply.id} className="relative ml-14 mt-2">
              <div className="absolute left-0 top-0 h-full border-l-2 border-gray-300"></div>
              <div className="bg-white p-3 rounded-lg flex items-start relative ml-4">
                <img
                  src={reply.avatarSrc}
                  alt={`${reply.author}'s avatar`}
                  className="w-10 h-10 rounded-full mr-3"
                />
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-semibold">{reply.author}</span>
                      <span className="text-xs text-gray-500 ml-2">
                        {timeAgo(reply.createdAt)}
                      </span>
                    </div>
                    {reply.author === currentUser && (
                      <div className="relative">
                        <Button
                          onClick={() => toggleMenu(reply.id)}
                          className="text-gray-500 hover:text-gray-700 focus:outline-none"
                        >
                          ...
                        </Button>
                        {showMenuId === reply.id && (
                          <div className="absolute right-0 mt-2 w-24 bg-white border rounded shadow-lg z-10">
                            {!reply.isEditing ? (
                              <>
                                <Button
                                  onClick={() => startEditing(reply.id, reply.content)}
                                  className="block w-full text-left px-4 py-2 text-blue-500 hover:bg-gray-100"
                                >
                                  Edit
                                </Button>
                                <Button
                                  onClick={() => deleteComment(reply.id)}
                                  className="block w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100"
                                >
                                  Delete
                                </Button>
                              </>
                            ) : (
                              <Button
                                onClick={() => saveEdit(reply.id)}
                                className="block w-full text-left px-4 py-2 text-green-500 hover:bg-gray-100"
                              >
                                Save
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  {reply.isEditing ? (
                    <input
                      type="text"
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full p-1 border rounded mt-1"
                      onKeyPress={(e) => handleKeyPress(e, () => saveEdit(reply.id))}
                    />
                  ) : (
                    <div className="text-gray-700 mt-1">{reply.content}</div>
                  )}
                  <div className="flex gap-6 text-gray-500 text-sm mt-1">
                    <Button
                      className="flex items-center gap-1 focus:outline-none cursor-pointer"
                      onClick={() => toggleLikeComment(reply.id, true)}
                    >
                      <Heart
                        size={16}
                        color={likedComments[reply.id] ? "#ef4444" : "gray"}
                        fill={likedComments[reply.id] ? "#ef4444" : "none"}
                      />
                      {reply.likes} Thích
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}

      {/* Ô nhập bình luận */}
      <div className="mt-2 flex items-start">
        <img
          src="https://tse3.mm.bing.net/th/id/OIP.cVIjZO1CHBYfqIB04Kb9LgHaFj?w=1400&h=1050&rs=1&pid=ImgDetMain&o=7&rm=3"
          alt={`${currentUser}'s avatar`}
          className="w-10 h-10 rounded-full mr-3"
        />
        <div className="flex-1">
          <input
            type="text"
            placeholder="Viết bình luận của bạn..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="w-full p-2 border rounded"
            onKeyPress={(e) => handleKeyPress(e, addComment)}
          />
          <Button
            onClick={addComment}
            className="mt-2 bg-blue-500 text-white hover:bg-blue-600"
          >
            Đăng bình luận
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CommentPostSection;