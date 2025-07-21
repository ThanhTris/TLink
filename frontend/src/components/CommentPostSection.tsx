import React, { useState } from "react";
import { Heart } from "lucide-react";
import Button from "./Button";
import { getTimeAgo } from "../utils/timeAgo";
import { postService } from "../services/postService";

interface Comment {
  id: number;
  post_id: number;
  user_id: number;
  content: string;
  createdAt: Date;
  likes: number;
  replies: Comment[];
  isEditing?: boolean;
  avatarSrc: string;
  isHidden?: boolean;
}

interface CommentSectionProps {
  initialComments: Comment[];
  onAddComment: (content: string) => void;
  currentUser: string;
  post_id: number;
}

const currentUserId = 1; // Giả lập user hiện tại, bạn có thể truyền từ props

const CommentPostSection: React.FC<CommentSectionProps> = ({
  initialComments,
  onAddComment,
  currentUser,
  post_id,
}) => {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState("");
  const [editCommentId, setEditCommentId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");
  const [showMenuId, setShowMenuId] = useState<number | null>(null);
  const [likedComments, setLikedComments] = useState<{ [key: number]: boolean }>({});
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [newReply, setNewReply] = useState("");

  // Thêm bình luận mới (cấp 0)
  const addComment = async () => {
    if (newComment.trim()) {
      const newCommentObj: Comment = {
        id: Date.now(),
        post_id,
        user_id: currentUserId,
        content: newComment,
        createdAt: new Date(),
        likes: 0,
        replies: [],
        avatarSrc: "https://tse3.mm.bing.net/th/id/OIP.cVIjZO1CHBYfqIB04Kb9LgHaFj?w=1400&h=1050&rs=1&pid=ImgDetMain&o=7&rm=3",
      };
      await postService.addComment(post_id, newComment, currentUserId);
      onAddComment(newComment);
      setComments([...comments, newCommentObj]);
      setNewComment("");
    }
  };

  // Đệ quy thêm reply vào đúng comment cha
  const addReplyRecursive = (list: Comment[], parentId: number, replyObj: Comment): Comment[] => {
    return list.map((comment) => {
      if (comment.id === parentId) {
        return { ...comment, replies: [...comment.replies, replyObj] };
      }
      return { ...comment, replies: addReplyRecursive(comment.replies, parentId, replyObj) };
    });
  };

  // Thêm trả lời cho bất kỳ cấp nào
  const addReply = async (parentId: number) => {
    if (newReply.trim()) {
      const replyObj: Comment = {
        id: Date.now() + Math.random(),
        post_id,
        user_id: currentUserId,
        content: newReply,
        createdAt: new Date(),
        likes: 0,
        replies: [],
        avatarSrc: "https://tse3.mm.bing.net/th/id/OIP.cVIjZO1CHBYfqIB04Kb9LgHaFj?w=1400&h=1050&rs=1&pid=ImgDetMain&o=7&rm=3",
      };
      await postService.addComment(post_id, newReply, currentUserId);
      setComments((prev) => addReplyRecursive(prev, parentId, replyObj));
      setNewReply("");
      setReplyTo(null);
    }
  };

  // Đệ quy like comment/reply
  const toggleLikeRecursive = (list: Comment[], commentId: number): Comment[] => {
    return list.map((comment) => {
      if (comment.id === commentId) {
        return {
          ...comment,
          likes: likedComments[commentId] ? comment.likes - 1 : comment.likes + 1,
        };
      }
      return { ...comment, replies: toggleLikeRecursive(comment.replies, commentId) };
    });
  };

  const toggleLikeComment = (commentId: number) => {
    setLikedComments((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
    setComments((prev) => toggleLikeRecursive(prev, commentId));
  };

  // Đệ quy chỉnh sửa
  const editRecursive = (list: Comment[], commentId: number, content: string): Comment[] => {
    return list.map((comment) => {
      if (comment.id === commentId) {
        return { ...comment, content, isEditing: false };
      }
      return { ...comment, replies: editRecursive(comment.replies, commentId, content) };
    });
  };

  const saveEdit = (commentId: number) => {
    setComments((prev) => editRecursive(prev, commentId, editContent));
    setEditCommentId(null);
  };

  // Đệ quy xóa
  const deleteRecursive = (list: Comment[], commentId: number): Comment[] => {
    return list
      .filter((comment) => comment.id !== commentId)
      .map((comment) => ({
        ...comment,
        replies: deleteRecursive(comment.replies, commentId),
      }));
  };

  const deleteComment = (commentId: number) => {
    setComments((prev) => deleteRecursive(prev, commentId));
    setShowMenuId(null);
  };

  // Đệ quy ẩn/hiện comment
  const hideRecursive = (list: Comment[], commentId: number, hide: boolean): Comment[] => {
    return list.map((comment) => {
      if (comment.id === commentId) {
        return { ...comment, isHidden: hide };
      }
      return { ...comment, replies: hideRecursive(comment.replies, commentId, hide) };
    });
  };

  const hideComment = (commentId: number) => {
    setComments((prev) => hideRecursive(prev, commentId, true));
    setShowMenuId(null);
  };
  const showComment = (commentId: number) => {
    setComments((prev) => hideRecursive(prev, commentId, false));
    setShowMenuId(null);
  };

  // Hiện/ẩn menu
  const toggleMenu = (commentId: number) => {
    setShowMenuId(showMenuId === commentId ? null : commentId);
  };

  // Xử lý Enter
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>, action: () => void) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      action();
    }
  };

  // Render song song cho cấp 3+
  const renderParallelComments = (comments: Comment[], currentLevel: number) => (
    <div className="flex gap-8 mt-2">
      {comments.map((c, idx) =>
        renderComment(c, currentLevel, idx === comments.length - 1)
      )}
    </div>
  );

  // Render comment dạng cây, từ cấp 3 trở đi song song
  const renderComment = (
    comment: Comment,
    level = 0,
    isLast = false,
    parentLevels: boolean[] = []
  ) => (
    <div key={comment.id} className="relative flex">
      {/* Đường dọc cho cấp 1, 2 */}
      {level > 0 && level < 3 && (
        <div className="absolute left-0 top-0 bottom-0 w-6 flex flex-col items-center">
          <div className="w-px h-full bg-gray-300" />
        </div>
      )}
      {/* Đường ngang nối avatar cho cấp 1, 2 */}
      {level > 0 && level < 3 && (
        <div
          className="absolute"
          style={{
            left: 20,
            top: 32,
            width: 20,
            height: 2,
            background: "#d1d5db",
            zIndex: 1,
          }}
        />
      )}
      <div className={`flex-1 ${level > 0 ? "ml-8 pl-6" : ""}`}>
        <div className="flex items-start group relative z-10">
          <img
            src={comment.avatarSrc}
            alt={`User_${comment.user_id}'s avatar`}
            className="w-10 h-10 rounded-full mr-3"
          />
          <div className="flex-1">
            <div className="flex items-center">
              <span className="font-medium text-gray-900">{`User_${comment.user_id}`}</span>
              <span className="ml-2 text-xs text-gray-500">{getTimeAgo(comment.createdAt)}</span>
              <div className="relative ml-auto">
                <Button
                  onClick={() => toggleMenu(comment.id)}
                  className="text-gray-500 hover:text-gray-700 focus:outline-none p-1"
                >
                  ...
                </Button>
                {showMenuId === comment.id && (
                  <div className="absolute right-0 mt-2 w-32 bg-white border rounded-md shadow-lg z-10">
                    {comment.user_id === currentUserId ? (
                      <>
                        {editCommentId !== comment.id && (
                          <>
                            <Button
                              onClick={() => {
                                setEditCommentId(comment.id);
                                setEditContent(comment.content);
                                setShowMenuId(null);
                              }}
                              className="block w-full text-left px-4 py-2 text-blue-500 hover:bg-gray-100"
                            >
                              Chỉnh sửa
                            </Button>
                            <Button
                              onClick={() => deleteComment(comment.id)}
                              className="block w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100"
                            >
                              Xóa
                            </Button>
                          </>
                        )}
                        {editCommentId === comment.id && (
                          <Button
                            onClick={() => saveEdit(comment.id)}
                            className="block w-full text-left px-4 py-2 text-green-500 hover:bg-gray-100"
                          >
                            Lưu
                          </Button>
                        )}
                      </>
                    ) : (
                      <>
                        {!comment.isHidden ? (
                          <Button
                            onClick={() => hideComment(comment.id)}
                            className="block w-full text-left px-4 py-2 text-yellow-500 hover:bg-gray-100"
                          >
                            Ẩn
                          </Button>
                        ) : (
                          <Button
                            onClick={() => showComment(comment.id)}
                            className="block w-full text-left px-4 py-2 text-blue-500 hover:bg-gray-100"
                          >
                            Hiện lại
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
            {editCommentId === comment.id ? (
              <input
                type="text"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full p-2 mt-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => handleKeyPress(e, () => saveEdit(comment.id))}
              />
            ) : (
              <p className="mt-1 text-gray-700 break-words">
                {comment.isHidden ? "[Bình luận đã bị ẩn]" : comment.content}
              </p>
            )}
            <div className="flex gap-4 mt-1 text-sm text-gray-600">
              <Button
                onClick={() => toggleLikeComment(comment.id)}
                className="flex items-center gap-1 hover:text-red-500 focus:outline-none"
              >
                <Heart
                  size={16}
                  color={likedComments[comment.id] ? "#ef4444" : "gray"}
                  fill={likedComments[comment.id] ? "#ef4444" : "none"}
                />
                {comment.likes} Thích
              </Button>
              <Button
                onClick={() => setReplyTo(comment.id)}
                className="hover:text-blue-500 focus:outline-none"
              >
                Trả lời
              </Button>
            </div>
            {replyTo === comment.id && (
              <div className="flex items-start mt-2">
                <img
                  src="https://tse3.mm.bing.net/th/id/OIP.cVIjZO1CHBYfqIB04Kb9LgHaFj?w=1400&h=1050&rs=1&pid=ImgDetMain&o=7&rm=3"
                  alt={`${currentUser}'s avatar`}
                  className="w-8 h-8 rounded-full mr-3"
                />
                <input
                  type="text"
                  placeholder="Viết trả lời của bạn..."
                  value={newReply}
                  onChange={(e) => setNewReply(e.target.value)}
                  className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) => handleKeyPress(e, () => addReply(comment.id))}
                />
                <Button
                  onClick={() => addReply(comment.id)}
                  className="ml-2 px-4 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Đăng
                </Button>
              </div>
            )}
            {/* Render replies: cấp 0,1,2 là cây, cấp 3+ song song */}
            {comment.replies && comment.replies.length > 0 && (
              level < 2
                ? <div className="mt-4">{comment.replies.map((reply, idx) =>
                    renderComment(reply, level + 1, idx === comment.replies.length - 1)
                  )}</div>
                : renderParallelComments(comment.replies, level + 1)
            )}
          </div>
        </div>
        {/* Đường kẻ phía dưới avatar nếu có replies và là cấp 0,1 */}
        {comment.replies && comment.replies.length > 0 && level < 2 && (
          <div
            className="absolute"
            style={{
              left: 28,
              top: 56,
              width: 2,
              height: 24,
              background: "#d1d5db",
              zIndex: 0,
            }}
          />
        )}
      </div>
    </div>
  );

  return (
    <div className="mb-6 ml-4">
      {comments.map((comment) => renderComment(comment))}
      {/* Add new comment */}
      <div className="flex items-start mt-4">
        <img
          src="https://tse3.mm.bing.net/th/id/OIP.cVIjZO1CHBYfqIB04Kb9LgHaFj?w=1400&h=1050&rs=1&pid=ImgDetMain&o=7&rm=3"
          alt={`${currentUser}'s avatar`}
          className="w-10 h-10 rounded-full mr-3"
        />
        <input
          type="text"
          placeholder="Viết bình luận của bạn..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          onKeyPress={(e) => handleKeyPress(e, addComment)}
        />
        <Button
          onClick={addComment}
          className="ml-2 px-4 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Đăng
        </Button>
      </div>
    </div>
  );
};

export default CommentPostSection;