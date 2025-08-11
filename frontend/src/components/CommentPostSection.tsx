import React, { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import Button from "./Button";
import { getTimeAgo } from "../utils/timeAgo";
import { postService } from "../services/postService";
import type { Comment } from "../types/comment";
import { buildCommentTree } from "../utils/buildCommentTree";
import CommentIteam from "./CommentIteam";
import ReplyIteam from "./ReplyIteam";
 import { getCurrentUserIdFromLocalStorage } from "../api/post";

// Giả lập dữ liệu users
const mockUsers = [
  {
    id: 1,
    name: "Nguyễn Văn A",
    avatar:
      "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    id: 2,
    name: "Trần Thị B",
    avatar:
      "https://randomuser.me/api/portraits/men/45.jpg",
  },
  {
    id: 3,
    name: "Lê Văn C",
    avatar:
      "https://randomuser.me/api/portraits/men/46.jpg",
  },
  {
    id: 4,
    name: "Phạm Văn D",
    avatar:
      "https://randomuser.me/api/portraits/men/33.jpg",
  },
  {
    id: 5,
    name: "Hoàng Thị E",
    avatar:
      "https://randomuser.me/api/portraits/women/35.jpg",
  },
  // ...thêm user nếu cần
];

// Giả lập dữ liệu comment_likes
const mockCommentLikes = [
  { comment_id: 1, user_id: 2 },
  { comment_id: 1, user_id: 3 },
  { comment_id: 2, user_id: 1 },
  // ...thêm like nếu cần
];

interface FEComment {
  id: number;
  post_id: number;
  user_id: number;
  name: string;
  avatar: string;
  parent_id: number | null;
  level: number;
  content: string;
  createdAt: Date;
  like_count: number;
  is_like: boolean;
  replies?: FEComment[];
  isHidden?: boolean;
  // new: id user được mention khi nhấn Reply
  mention_user_id?: number | null;
}

interface CommentSectionProps {
  initialComments: any[]; // đổi từ FEComment[] -> any[]
  onAddComment: (content: string) => void;
  currentUser: string;
  post_id: number;
}

const currentUserId = getCurrentUserIdFromLocalStorage() ?? 0; // user hiện tại

// Hàm lấy tên và avatar user
function getUserInfo(user_id: number) {
  const user = mockUsers.find((u) => u.id === user_id);
  return {
    name: user?.name ?? "Unknown",
    avatar:
      user?.avatar ??
      "https://randomuser.me/api/portraits/lego/1.jpg",
  };
}

// Hàm lấy số lượt like của comment
function getCommentLikeCount(comment_id: number) {
  return mockCommentLikes.filter(
    (like) => like.comment_id === comment_id
  ).length;
}

// Hàm kiểm tra user hiện tại đã like comment chưa
function isCommentLiked(comment_id: number, user_id: number) {
  return mockCommentLikes.some(
    (like) => like.comment_id === comment_id && like.user_id === user_id
  );
}

const CommentPostSection: React.FC<CommentSectionProps> = ({
  initialComments,
  onAddComment,
  currentUser,
  post_id,
}) => {
  // Chuyển initialComments sang FEComment chuẩn
  const convertComments = (comments: any[]): FEComment[] =>
    comments.map((c) => ({
      ...c,
      name: getUserInfo(c.user_id).name,
      avatar: getUserInfo(c.user_id).avatar,
      like_count: getCommentLikeCount(c.id),
      is_like: isCommentLiked(c.id, currentUserId),
      // new: lấy mention_user_id nếu có, mặc định null
      mention_user_id: c.mention_user_id ?? null,
    }));

  // State lưu mảng phẳng
  const [flatComments, setFlatComments] = useState<FEComment[]>(
    convertComments(initialComments)
  );
  // State lưu cây comment
  const [comments, setComments] = useState<FEComment[]>(
    buildCommentTree(flatComments)
  );
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [newReply, setNewReply] = useState("");
  const [replyDrafts, setReplyDrafts] = useState<Record<number, string>>({}); // thêm
  // ô nào cần focus
  const [replyFocusId, setReplyFocusId] = useState<number | null>(null);
  // lưu prefix "@Tên" cho từng ô reply (theo comment container id)
  const [replyMentions, setReplyMentions] = useState<Record<number, string | undefined>>({});
  // new: lưu user_id của người được mention theo containerId
  const [replyMentionUserIds, setReplyMentionUserIds] = useState<Record<number, number | null>>({});
  // new: tick to retrigger focus even when focusing the same box
  const [replyFocusTick, setReplyFocusTick] = useState(0);
  const [showMenuId, setShowMenuId] = useState<number | null>(null);
  const [editCommentId, setEditCommentId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");

  useEffect(() => {
    setComments(buildCommentTree(flatComments));
  }, [flatComments]);

  // Thêm bình luận mới (cấp 1)
  const addComment = async () => {
    if (newComment.trim()) {
      const userInfo = getUserInfo(currentUserId);
      const newCommentObj: FEComment = {
        id: Date.now(),
        post_id,
        user_id: currentUserId,
        name: userInfo.name,
        avatar: userInfo.avatar,
        parent_id: null,
        level: 1,
        content: newComment,
        createdAt: new Date(),
        like_count: 0,
        is_like: false,
      };
      await postService.addComment(post_id, newComment, currentUserId);
      onAddComment(newComment);
      setFlatComments([...flatComments, newCommentObj]);
      setNewComment("");
    }
  };

  // Thêm reply (child) cho parent (là comment có chứa ô reply)
  const addReply = async (parent: FEComment, contentOverride?: string) => {
    const text = (contentOverride ?? "").trim() || newReply.trim();
    if (!text) return;

    const userInfo = getUserInfo(currentUserId);
    const nextLevel = Math.min((parent.level || 1) + 1, 3);

    // new: nếu đang có mention thì loại bỏ "@Tên " khỏi content khi lưu
    const mentionText = replyMentions[parent.id]; // dạng "@Tên"
    const prefixWithSpace = mentionText ? `${mentionText} ` : "";
    const contentToSave =
      mentionText && text.startsWith(prefixWithSpace) ? text.slice(prefixWithSpace.length) : text;

    const replyObj: FEComment = {
      id: Date.now() + Math.random(),
      post_id,
      user_id: currentUserId,
      name: userInfo.name,
      avatar: userInfo.avatar,
      parent_id: parent.id,
      level: nextLevel,
      content: contentToSave,
      createdAt: new Date(),
      like_count: 0,
      is_like: false,
      // new: gắn user được mention (nếu có)
      mention_user_id: replyMentionUserIds[parent.id] ?? null,
    };
    await postService.addComment(post_id, contentToSave, currentUserId);
    setFlatComments((prev) => [...prev, replyObj]);

    // clear draft/prefix/focus cho ô của parent
    setReplyDrafts((prev) => {
      const { [parent.id]: _, ...rest } = prev;
      return rest;
    });
    setReplyMentions((prev) => {
      const { [parent.id]: __, ...rest } = prev;
      return rest;
    });
    // new: clear mention user id map
    setReplyMentionUserIds((prev) => {
      const { [parent.id]: ___, ...rest } = prev;
      return rest;
    });
    setReplyFocusId(null);
    setNewReply("");
    setReplyTo(null);
  };

  // Khi bấm Trả lời: nếu là level 3 thì route về ô reply của cha (level 2)
  const handleReplyClick = (target: FEComment) => {
    const containerId =
      target.level >= 3 && target.parent_id ? target.parent_id : target.id;
    const mention = `@${target.name} `;

    setReplyDrafts((prev) => ({
      ...prev,
      [containerId]: mention, // ghi đè mỗi lần
    }));
    setReplyMentions((prev) => ({
      ...prev,
      [containerId]: `@${target.name}`,
    }));
    // new: lưu user được mention để gắn vào reply khi submit
    setReplyMentionUserIds((prev) => ({
      ...prev,
      [containerId]: target.user_id,
    }));
    setReplyFocusId(containerId);
    setReplyFocusTick((t) => t + 1);
  };

  const onInlineKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, parent: FEComment) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      addReply(parent, replyDrafts[parent.id] ?? "");
    }
  };

  // Like comment/reply
  const toggleLikeComment = (commentId: number) => {
    setFlatComments((prev) =>
      prev.map((c) =>
        c.id === commentId
          ? {
              ...c,
              is_like: !c.is_like,
              like_count: c.is_like ? c.like_count - 1 : c.like_count + 1,
            }
          : c
      )
    );
  };

  const toggleMenu = (commentId: number) => {
    setShowMenuId(prev => (prev === commentId ? null : commentId));
  };

  const saveEdit = (commentId: number) => {
    setFlatComments(prev =>
      prev.map(c => (c.id === commentId ? { ...c, content: editContent } : c))
    );
    setEditCommentId(null);
    setShowMenuId(null);
  };

  const deleteComment = (commentId: number) => {
    const deleteRecursive = (list: FEComment[], id: number): FEComment[] =>
      list.filter(c => c.id !== id && c.parent_id !== id).map(c => ({ ...c }));
    setFlatComments(prev => deleteRecursive(prev, commentId));
    setShowMenuId(null);
  };

  const hideComment = (commentId: number) => {
    setFlatComments(prev =>
      prev.map(c => (c.id === commentId ? { ...c, isHidden: true } : c))
    );
    setShowMenuId(null);
  };
  const showComment = (commentId: number) => {
    setFlatComments(prev =>
      prev.map(c => (c.id === commentId ? { ...c, isHidden: false } : c))
    );
    setShowMenuId(null);
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
    comments: FEComment[],
    currentLevel: number
  ) => (
    <div className="flex gap-8 mt-2">
      {comments.map((c, idx) =>
        renderComment(c, currentLevel)
      )}
    </div>
  );

  // Render comment dạng cây, level 1 chứa level 2,3; level 2 chứa level 3
  const renderComment = (comment: FEComment, level = 1) => {
    const hasChildren = !!(comment.replies && comment.replies.length > 0);
    const showInlineAtThisLevel = level === 1 || level === 2;
    const shouldDrawVertical = level === 1 || level === 2;

    function clearMention(id: number): void {
      setReplyMentions(prev => {
      const { [id]: _, ...rest } = prev;
      return rest;
      });
      setReplyMentionUserIds(prev => {
      const { [id]: __, ...rest } = prev;
      return rest;
      });
      setReplyDrafts(prev => {
      const { [id]: ___, ...rest } = prev;
      return rest;
      });
    }

    return (
      <div
        key={comment.id}
        className="relative"
        style={{ marginLeft: level === 1 ? 0 : 42 }}
      >
        {shouldDrawVertical && (
          <div
            className="absolute"
            style={{
              left: 18,
              top: 45,
              bottom: 36, // tới avatar user
              width: "2px",
              background: "#d1d5db",
              zIndex: 0,
            }}
          />
        )}

        <CommentIteam
          id={comment.id}
          avatar={comment.avatar}
          name={comment.name}
          createdAt={comment.createdAt}
          content={comment.content}
          like_count={comment.like_count}
          is_like={comment.is_like}
          parent_id={comment.parent_id}
          level={level}
          onLike={() => toggleLikeComment(comment.id)}
          onReply={() => handleReplyClick(comment)}
          // menu/edit/visibility
          isOwn={comment.user_id === currentUserId}
          isHidden={!!comment.isHidden}
          isEditing={editCommentId === comment.id}
          editContent={editCommentId === comment.id ? editContent : ""}
          menuOpen={showMenuId === comment.id}
          onToggleMenu={() => toggleMenu(comment.id)}
          onStartEdit={() => {
            setEditCommentId(comment.id);
            setEditContent(comment.content);
            setShowMenuId(null);
          }}
          onEditChange={(v) => setEditContent(v)}
          onSaveEdit={() => saveEdit(comment.id)}
          onDelete={() => deleteComment(comment.id)}
          onHide={() => hideComment(comment.id)}
          onShow={() => showComment(comment.id)}
          // render prefix khi có mention_user_id
          mentionName={comment.mention_user_id ? getUserInfo(comment.mention_user_id).name : undefined}
          // new: cho phép clear mention khi xóa @ trong edit mode
          onClearMention={() => clearMention(comment.id)}
        />

        {hasChildren && (
          <div className="mt-0">
            {comment.replies!.map((reply) => renderComment(reply, level + 1))}
          </div>
        )}

        {showInlineAtThisLevel && (
          <div style={{ marginLeft: 42 }}>
            <ReplyIteam
              level={level + 1} // để arc hiển thị vì >= 2
              currentUserAvatar={getUserInfo(currentUserId).avatar}
              value={replyDrafts[comment.id] ?? ""}
              placeholder={`Trả lời ${comment.name}`}
              onChange={(v) => {
                // cập nhật nội dung
                setReplyDrafts((prev) => ({ ...prev, [comment.id]: v }));
                // nếu người dùng đã xóa prefix thì bỏ overlay và mention_user_id
                setReplyMentions((prev) => {
                  const mention = prev[comment.id];
                  if (mention && !v.startsWith(`${mention} `)) {
                    const { [comment.id]: _, ...rest } = prev;
                    return rest;
                  }
                  return prev;
                });
                // new: khi xóa prefix thì bỏ luôn user id được mention
                setReplyMentionUserIds((prev) => {
                  const currentMention = replyMentions[comment.id];
                  if (currentMention && !v.startsWith(`${currentMention} `)) {
                    const { [comment.id]: __, ...rest } = prev;
                    return rest;
                  }
                  return prev;
                });
              }}
              onSubmit={() => addReply(comment, replyDrafts[comment.id] ?? "")}
              // hiển thị prefix in đậm và focus đúng ô
              mentionPrefix={replyMentions[comment.id]}
              autoFocus={replyFocusId === comment.id}
              focusTick={replyFocusTick}
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="mb-6 ml-4">
      {comments.map((comment) => renderComment(comment))}
      {/* Add new comment -> dùng ReplyIteam */}
      <div className="mt-4">
        <ReplyIteam
          level={1}
          currentUserAvatar={getUserInfo(currentUserId).avatar}
          value={newComment}
          placeholder="Viết bình luận của bạn..."
          onChange={(v) => setNewComment(v)}
          onSubmit={addComment}
        />
      </div>
    </div>
  );
};

export default CommentPostSection;

