import React, { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import Button from "./Button";
import { getTimeAgo } from "../utils/timeAgo";

import { buildCommentTree } from "../utils/buildCommentTree";
import CommentIteam from "./CommentIteam";
import ReplyIteam from "./ReplyIteam";
import { useUser } from "../hooks/useUser";
import {
  getCommentsTree,
  addComment as apiAddComment,
  likeComment as apiLikeComment,
  unlikeComment as apiUnlikeComment,
  updateComment as apiUpdateComment,
  deleteComment as apiDeleteComment,
} from "../api/comment";
import { getInfoUserById } from "../api/user";


interface FEComment {
  id: number;
  post_id: number;
  author_id: number;
  name: string;
  avatar: string;
  parent_id: number | null;
  level: number;
  content: string;
  createdAt: Date;
  like_count: number;
  is_liked: boolean;
  replies?: FEComment[];
  isHidden?: boolean;
  mention_user_id?: number | null;
  mentionName?: string; 
}

interface CommentSectionProps {
  initialComments: any[];
  onAddComment: (content: string) => void;
  currentUser: string;
  post_id: number;
}
const avatar = "https://i.pinimg.com/736x/86/78/44/867844ee7058d9bb79afb30dcb4a96ed.jpg";
const CommentPostSection: React.FC<CommentSectionProps> = ({
  initialComments,
  onAddComment,
  currentUser,
  post_id,
}) => {
  const user = useUser();
  const currentUserId = user.id;

  const [flatComments, setFlatComments] = useState<FEComment[]>([]);
  const [comments, setComments] = useState<FEComment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyDrafts, setReplyDrafts] = useState<Record<number, string>>({});
  const [replyFocusId, setReplyFocusId] = useState<number | null>(null);
  const [replyMentions, setReplyMentions] = useState<Record<number, string | undefined>>({});
  const [replyMentionUserIds, setReplyMentionUserIds] = useState<Record<number, number | null>>({});
  const [replyFocusTick, setReplyFocusTick] = useState(0);
  const [showMenuId, setShowMenuId] = useState<number | null>(null);
  const [editCommentId, setEditCommentId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");

  // Lấy thông tin user khác qua API
  const fetchUserInfo = async (userId: number) => {
    try {
      const res = await getInfoUserById(userId);
      const data = (res as any).data?.data;
      return {
        name: data?.name,
        avatar: data?.avatar,
      };
    } catch {
      return {
        name: "Unknown",
        avatar: avatar,
      };
    }
  };

  // Hàm map comment lấy mentionName nếu có, tối ưu lấy info tác giả
  const mapCommentWithMentionName = async (c: any) => {
    let name: string = c.author_name;
    let avatar: string = c.author_avatar;
    // Nếu là comment của user hiện tại, lấy từ local FE
    if (c.author_id === currentUserId) {
      name = user.name || c.author_name;
      avatar = user.avatar || c.author_avatar;
    }
    // Nếu backend không trả về, fallback gọi API
    if (!name || !avatar) {
      const info = await fetchUserInfo(c.author_id);
      name = info.name;
      avatar = info.avatar;
    }
    let mentionName: string | undefined = undefined;
    if (c.mention_user_id) {
      const mentionInfo = await fetchUserInfo(c.mention_user_id);
      mentionName = mentionInfo.name;
    }
    return {
      id: c.id,
      post_id: c.post_id,
      author_id: c.author_id,
      name,
      avatar,
      parent_id: c.parent_id,
      level: c.level,
      content: c.content,
      createdAt: new Date(c.created_at),
      like_count: c.likes_count ?? 0,
      is_liked: c.is_liked ?? false,
      mention_user_id: c.mention_user_id ?? null,
      mentionName, // luôn truyền trường này
    };
  };

  // Lấy danh sách comment từ API
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await getCommentsTree(post_id, currentUserId);
        const data = (res as any).data?.data || [];
        const mapped: FEComment[] = await Promise.all(data.map(mapCommentWithMentionName));
        setFlatComments(mapped);
      } catch (e) {
        setFlatComments([]);
      }
    };
    fetchComments();
    // eslint-disable-next-line
  }, [post_id, currentUserId]);

  useEffect(() => {
    setComments(buildCommentTree(flatComments));
  }, [flatComments]);

  // Thêm bình luận mới (cấp 1)
  const addComment = async () => {
    if (newComment.trim()) {
      await apiAddComment(post_id, newComment, currentUserId);
      setNewComment("");
      // Reload lại comment
      const res = await getCommentsTree(post_id, currentUserId);
      const data = (res as any).data?.data || [];
      const mapped: FEComment[] = await Promise.all(data.map(mapCommentWithMentionName));
      setFlatComments(mapped);
      onAddComment(newComment);
    }
  };

  // Thêm reply (child)
  const addReply = async (parent: FEComment, contentOverride?: string) => {
    const text = (contentOverride ?? "").trim();
    if (!text) return;
    const mentionText = replyMentions[parent.id];
    const prefixWithSpace = mentionText ? `${mentionText} ` : "";
    const contentToSave =
      mentionText && text.startsWith(prefixWithSpace) ? text.slice(prefixWithSpace.length) : text;
    await apiAddComment(
      post_id,
      contentToSave,
      currentUserId,
      parent.id,
      replyMentionUserIds[parent.id] ?? null
    );
    // Reload lại comment
    const res = await getCommentsTree(post_id, currentUserId);
    const data = (res as any).data?.data || [];
    const mapped: FEComment[] = await Promise.all(data.map(mapCommentWithMentionName));
    setFlatComments(mapped);
    setReplyDrafts((prev) => {
      const { [parent.id]: _, ...rest } = prev;
      return rest;
    });
    setReplyMentions((prev) => {
      const { [parent.id]: __, ...rest } = prev;
      return rest;
    });
    setReplyMentionUserIds((prev) => {
      const { [parent.id]: ___, ...rest } = prev;
      return rest;
    });
    setReplyFocusId(null);
  };

  // Like comment/reply
  const toggleLikeComment = async (commentId: number, isLiked: boolean) => {
    if (isLiked) {
      await apiUnlikeComment(commentId, currentUserId);
    } else {
      await apiLikeComment(commentId, currentUserId);
    }
    // Reload lại comment
    const res = await getCommentsTree(post_id, currentUserId);
    const data = (res as any).data?.data || [];
    const mapped: FEComment[] = await Promise.all(data.map(mapCommentWithMentionName));
    setFlatComments(mapped);
  };

  // Sửa bình luận
  const saveEdit = async (commentId: number) => {
    await apiUpdateComment(commentId, currentUserId, editContent);
    // Reload lại comment
    const res = await getCommentsTree(post_id, currentUserId);
    const data = (res as any).data?.data || [];
    const mapped: FEComment[] = await Promise.all(data.map(mapCommentWithMentionName));
    setFlatComments(mapped);
    setEditCommentId(null);
    setShowMenuId(null);
  };

  // Xóa bình luận
  const deleteComment = async (commentId: number) => {
    await apiDeleteComment(commentId, currentUserId);
    // Reload lại comment
    const res = await getCommentsTree(post_id, currentUserId);
    const data = (res as any).data?.data || [];
    const mapped: FEComment[] = await Promise.all(data.map(mapCommentWithMentionName));
    setFlatComments(mapped);
    setShowMenuId(null);
  };

  // Khi bấm Trả lời
  const handleReplyClick = (target: FEComment) => {
    const containerId =
      target.level >= 3 && target.parent_id ? target.parent_id : target.id;
    const mention = `@${target.name} `;
    setReplyDrafts((prev) => ({
      ...prev,
      [containerId]: mention,
    }));
    setReplyMentions((prev) => ({
      ...prev,
      [containerId]: `@${target.name}`,
    }));
    setReplyMentionUserIds((prev) => ({
      ...prev,
      [containerId]: target.author_id,
    }));
    setReplyFocusId(containerId);
    setReplyFocusTick((t) => t + 1);
  };

  // Sửa lại renderComment để truyền đúng prop và gọi đúng API
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
              bottom: 36,
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
          is_like={comment.is_liked}
          parent_id={comment.parent_id}
          level={level}
          onLike={() => toggleLikeComment(comment.id, comment.is_liked)}
          onReply={() => handleReplyClick(comment)}
          isOwn={comment.author_id === currentUserId}
          isHidden={!!comment.isHidden}
          isEditing={editCommentId === comment.id}
          editContent={editCommentId === comment.id ? editContent : ""}
          menuOpen={showMenuId === comment.id}
          onToggleMenu={() => setShowMenuId(prev => (prev === comment.id ? null : comment.id))}
          onStartEdit={() => {
            setEditCommentId(comment.id);
            setEditContent(comment.content);
            setShowMenuId(null);
          }}
          onEditChange={(v) => setEditContent(v)}
          onSaveEdit={() => saveEdit(comment.id)}
          onDelete={() => deleteComment(comment.id)}
          onHide={() => {}} // implement if needed
          onShow={() => {}} // implement if needed
          mentionName={comment.mentionName}
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
              level={level + 1}
              currentUserAvatar={user.avatar ?? avatar}
              value={replyDrafts[comment.id] ?? ""}
              placeholder={`Trả lời ${comment.name}`}
              onChange={(v) => {
                setReplyDrafts((prev) => ({ ...prev, [comment.id]: v }));
                setReplyMentions((prev) => {
                  const mention = prev[comment.id];
                  if (mention && !v.startsWith(`${mention} `)) {
                    const { [comment.id]: _, ...rest } = prev;
                    return rest;
                  }
                  return prev;
                });
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
      <div className="mt-4">
        <ReplyIteam
          level={1}
          currentUserAvatar={user.avatar ?? avatar}
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

