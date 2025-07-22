import React, { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import Button from "./Button";
import { getTimeAgo } from "../utils/timeAgo";
import { postService } from "../services/postService";
import type { Comment } from "../types/Comment";
import { buildCommentTree } from "../utils/buildCommentTree";

interface CommentSectionProps {
  initialComments: Comment[];
  onAddComment: (content: string) => void;
  currentUser: string;
  post_id: number;
}

const currentUserId = 1; // Giả lập user hiện tại

const CommentPostSection: React.FC<CommentSectionProps> = ({
  initialComments,
  onAddComment,
  currentUser,
  post_id,
}) => {
  // State lưu mảng phẳng
  const [flatComments, setFlatComments] = useState<Comment[]>(initialComments);
  // State lưu cây comment
  const [comments, setComments] = useState<Comment[]>(
    buildCommentTree(initialComments)
  );
  const [newComment, setNewComment] = useState("");
  const [editCommentId, setEditCommentId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");
  const [showMenuId, setShowMenuId] = useState<number | null>(null);
  const [likedComments, setLikedComments] = useState<{
    [key: number]: boolean;
  }>({});
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [newReply, setNewReply] = useState("");

  // Luôn build lại cây khi flatComments thay đổi
  useEffect(() => {
    setComments(buildCommentTree(flatComments));
  }, [flatComments]);

  // Thêm bình luận mới (cấp 1)
  const addComment = async () => {
    if (newComment.trim()) {
      const newCommentObj: Comment = {
        id: Date.now(),
        post_id,
        user_id: currentUserId,
        parent_id: null,
        level: 1,
        content: newComment,
        createdAt: new Date(),
        likes: 0,
        avatarSrc:
          "https://tse3.mm.bing.net/th/id/OIP.cVIjZO1CHBYfqIB04Kb9LgHaFj?w=1400&h=1050&rs=1&pid=ImgDetMain&o=7&rm=3",
      };
      await postService.addComment(post_id, newComment, currentUserId);
      onAddComment(newComment);
      setFlatComments([...flatComments, newCommentObj]);
      setNewComment("");
    }
  };

  // Thêm trả lời cho bất kỳ cấp nào
  // const addReply = async (parent: Comment) => {
  //   if (newReply.trim()) {
  //     const replyObj: Comment = {
  //       id: Date.now() + Math.random(),
  //       post_id,
  //       user_id: currentUserId,
  //       parent_id: parent.id,
  //       level: Math.min((parent.level || 1) + 1, 3),
  //       content: newReply,
  //       createdAt: new Date(),
  //       likes: 0,
  //       avatarSrc:
  //         "https://tse3.mm.bing.net/th/id/OIP.cVIjZO1CHBYfqIB04Kb9LgHaFj?w=1400&h=1050&rs=1&pid=ImgDetMain&o=7&rm=3",
  //     };
  //     await postService.addComment(post_id, newReply, currentUserId);
  //     setFlatComments([...flatComments, replyObj]);
  //     setNewReply("");
  //     setReplyTo(null);
  //   }
  // };
  const addReply = async (parent: Comment) => {
  if (newReply.trim()) {
    // Nếu reply vào cấp 3 hoặc sâu hơn, set parent_id là cha cấp 3 gần nhất, level = 3
    let replyParent = parent;
    while (replyParent.level > 3 && replyParent.parent_id !== null) {
      const found = flatComments.find((c) => c.id === replyParent.parent_id);
      if (!found) break;
      replyParent = found;
    }
    const replyObj: Comment = {
      id: Date.now() + Math.random(),
      post_id,
      user_id: currentUserId,
      parent_id: replyParent.level >= 3 ? replyParent.id : parent.id,
      level: replyParent.level >= 3 ? 3 : (parent.level || 1) + 1,
      content: newReply,
      createdAt: new Date(),
      likes: 0,
      avatarSrc:
        "https://tse3.mm.bing.net/th/id/OIP.cVIjZO1CHBYfqIB04Kb9LgHaFj?w=1400&h=1050&rs=1&pid=ImgDetMain&o=7&rm=3",
    };
    await postService.addComment(post_id, newReply, currentUserId);
    setFlatComments([...flatComments, replyObj]);
    setNewReply("");
    setReplyTo(null);
  }};

  // Like comment/reply
  const toggleLikeComment = (commentId: number) => {
    setLikedComments((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
    setFlatComments((prev) =>
      prev.map((c) =>
        c.id === commentId
          ? {
              ...c,
              likes: likedComments[commentId] ? c.likes - 1 : c.likes + 1,
            }
          : c
      )
    );
  };

  // Chỉnh sửa comment
  const saveEdit = (commentId: number) => {
    setFlatComments((prev) =>
      prev.map((c) => (c.id === commentId ? { ...c, content: editContent } : c))
    );
    setEditCommentId(null);
  };

  // Xóa comment (và các reply con)
  const deleteComment = (commentId: number) => {
    // Xóa comment và tất cả các con của nó
    const deleteRecursive = (list: Comment[], id: number): Comment[] =>
      list
        .filter((c) => c.id !== id && c.parent_id !== id)
        .map((c) => ({ ...c }));
    setFlatComments((prev) => deleteRecursive(prev, commentId));
    setShowMenuId(null);
  };

  // Ẩn/hiện comment
  const hideComment = (commentId: number) => {
    setFlatComments((prev) =>
      prev.map((c) => (c.id === commentId ? { ...c, isHidden: true } : c))
    );
    setShowMenuId(null);
  };
  const showComment = (commentId: number) => {
    setFlatComments((prev) =>
      prev.map((c) => (c.id === commentId ? { ...c, isHidden: false } : c))
    );
    setShowMenuId(null);
  };

  // Hiện/ẩn menu
  const toggleMenu = (commentId: number) => {
    setShowMenuId(showMenuId === commentId ? null : commentId);
  };

  // Xử lý Enter
  const handleKeyPress = (
    e: React.KeyboardEvent<HTMLInputElement>,
    action: () => void
  ) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      action();
    }
  };

  // Render song song cho cấp 3+
  const renderParallelComments = (
    comments: Comment[],
    currentLevel: number
  ) => (
    <div className="flex gap-8 mt-2">
      {comments.map((c, idx) =>
        renderComment(c, currentLevel, idx === comments.length - 1)
      )}
    </div>
  );

  // Render comment dạng cây, từ cấp 3 trở đi song song
  const renderComment = (comment: Comment, level = 1, isLast = false) => (
    <div key={comment.id} className="relative flex">
      {/* Đường dọc cho cấp 1, 2 */}
      {level > 1 && level < 4 && (
        <div className="absolute left-0 top-0 bottom-0 w-6 flex flex-col items-center">
          <div className="w-px h-full bg-gray-300" />
        </div>
      )}
      {/* Đường ngang nối avatar cho cấp 1, 2 */}
      {level > 1 && level < 4 && (
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
      <div className={`flex-1 ${level > 1 ? "ml-8 pl-6" : ""}`}>
        <div className="flex items-start group relative z-10">
          <img
            src={comment.avatarSrc}
            alt={`User_${comment.user_id}'s avatar`}
            className="w-10 h-10 rounded-full mr-3"
          />
          <div className="flex-1">
            <div className="flex items-center">
              <span className="font-medium text-gray-900">{`User_${comment.user_id}`}</span>
              <span className="ml-2 text-xs text-gray-500">
                {getTimeAgo(comment.createdAt)}
              </span>
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
                onKeyPress={(e) =>
                  handleKeyPress(e, () => saveEdit(comment.id))
                }
              />
            ) : (
              <p className="mt-1 text-gray-700 break-words">
                {comment.isHidden ? (
                  "[Bình luận đã bị ẩn]"
                ) : (
                  <>
                    {comment.parent_id !== null && (
                      <b>
                        @
                        {`User_${
                          flatComments.find((u) => u.id === comment.parent_id)
                            ?.user_id || "?"
                        }`}{" "}
                      </b>
                    )}
                    {comment.content}
                  </>
                )}
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
                <div className="flex-1 flex items-center border rounded-md p-2 bg-white">
                  <span className="font-bold text-gray-700 mr-1">
                    @{`User_${comment.user_id}`}
                  </span>
                  <input
                    type="text"
                    placeholder="Viết trả lời của bạn..."
                    value={newReply}
                    onChange={(e) => setNewReply(e.target.value)}
                    className="flex-1 border-none outline-none focus:ring-0"
                    onKeyPress={(e) =>
                      handleKeyPress(e, () => addReply(comment))
                    }
                    style={{ background: "transparent" }}
                  />
                </div>
                <Button
                  onClick={() => addReply(comment)}
                  className="ml-2 px-4 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Đăng
                </Button>
              </div>
            )}
            {/* Render replies: cấp 1,2 là cây, cấp 3+ song song */}
            {comment.replies &&
              comment.replies.length > 0 &&
              (comment.level < 3 ? (
                <div className="mt-4">
                  {comment.replies.map((reply, idx) =>
                    renderComment(
                      reply,
                      comment.level + 1,
                      idx === (comment.replies?.length ?? 0) - 1
                    )
                  )}
                </div>
              ) : (
                renderParallelComments(comment.replies, comment.level + 1)
              ))}
          </div>
        </div>
        {/* Đường kẻ phía dưới avatar nếu có replies và là cấp 1,2 */}
        {comment.replies && comment.replies.length > 0 && comment.level < 3 && (
          <div
            className="absolute"
            style={{
              left: 28,
              top: 56,
              width: 2,
              background: "#d1d5db",
              zIndex: 0,
              height: "calc(100% - 48px)",
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
