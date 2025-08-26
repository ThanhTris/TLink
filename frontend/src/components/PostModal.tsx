import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useUser } from "../hooks/useUser";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import twemoji from "twemoji";
import PostImagesGallery from "./PostImagesGallery";
import PostFilesList from "./PostFilesList";
import CommentSection from "./CommentPostSection";
import ReplyIteam from "./ReplyIteam";
import { getPostsByCategory } from "../api/post";
import { getCommentsTree, addComment as apiAddComment } from "../api/comment";
import Button from "./Button";
import { getTimeAgoStrict, formatDateTimeVN } from "../utils/timeAgo";
import { Heart, MessageCircle } from "lucide-react";

interface PostModalProps {
  postId: number;
  open: boolean;
  onClose: () => void;
}

const PostModal: React.FC<PostModalProps> = ({ postId, open, onClose }) => {
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<any[]>([]);
  const [commentValue, setCommentValue] = useState("");
  const [commentFocusTick, setCommentFocusTick] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const user = useUser();

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    (async () => {
      try {
        const res: any = await getPostsByCategory("/home", 5, 0, user.id);
        let data = res?.data?.data || [];
        let found = data.find((p: any) => Number(p.id) === Number(postId));
        setPost(found || null);
      } catch {
        setPost(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [postId, open, user.id]);

  useEffect(() => {
    if (!open || !postId) return;
    (async () => {
      try {
        const res = await getCommentsTree(postId, user.id);
        setComments((res as any).data?.data || []);
      } catch {
        setComments([]);
      }
    })();
  }, [open, postId, user.id]);

  useEffect(() => {
    if (post) {
      setIsLiked(!!post.is_liked);
      setLikeCount(Number(post.likes_count) || 0);
    }
  }, [post]);

  // Dummy like handler (bạn nên thay bằng gọi API thực tế)
  const handleLikePost = () => {
    setIsLiked((prev) => !prev);
    setLikeCount((prev) => prev + (isLiked ? -1 : 1));
    // TODO: Gọi API like/unlike post ở đây nếu cần
  };

  if (!open) return null;

  // Defensive: avoid error if post is null or created_at is undefined
  const createdAt = post?.created_at;
  let timeAgoDisplay = "";
  let timeTooltip = "";
  try {
    if (createdAt) {
      timeAgoDisplay = getTimeAgoStrict(createdAt);
      timeTooltip = formatDateTimeVN(createdAt);
    }
  } catch {
    timeAgoDisplay = "";
    timeTooltip = "";
  }

  // Xử lý images/files/tags
  const displayImages = Array.isArray(post?.images)
    ? post.images.map((img: any) => ({
        url: `/api/posts/image/${img.id}`,
        id: img.id,
        name: img.name,
        type: img.type,
      }))
    : [];
  const displayFiles = Array.isArray(post?.files)
    ? post.files.map((f: any) => ({
        url: `/api/posts/file/${f.id}`,
        name: f.name,
        id: f.id,
        type: f.type,
      }))
    : [];
  const displayParentTags = post?.parent_tags || [];
  const displayChildTags = post?.child_tags || [];

  // Markdown render
  const markdownComponents = {
    ul: ({ node, ...props }: any) => (
      <ul className="pl-6 list-disc" {...props} />
    ),
    ol: ({ node, ...props }: any) => (
      <ol className="pl-6 list-decimal" {...props} />
    ),
    li: ({ node, ...props }: any) => <li className="mb-1" {...props} />,
    text: ({ value }: any) => (
      <span
        dangerouslySetInnerHTML={{
          __html: twemoji.parse(value, {
            folder: "svg",
            ext: ".svg",
            className: "inline align-[-0.125em] w-5 h-5",
            base: "https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/",
          }),
        }}
      />
    ),
  };

  // Xử lý gửi bình luận cấp 1
  const handleSubmitComment = async () => {
    if (!commentValue.trim()) return;
    try {
      // Gọi API tạo bình luận cấp 1 (parentId và mentionUserId đều null)
      await apiAddComment(postId, commentValue, user.id, null, null);
      setCommentValue("");
      setCommentFocusTick((t) => t + 1);
      // Reload lại comment tree
      const res = await getCommentsTree(postId, user.id);
      setComments((res as any).data?.data || []);
    } catch {
      setComments([]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div
        className="relative w-3xl max-h-[90vh] bg-white rounded-xl shadow-xl flex flex-col overflow-hidden pointer-events-auto"
        onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="relative sticky top-0 z-10 flex items-center flex-shrink-0 px-6 py-4 bg-white border-b border-gray-300">
          <div className="flex justify-center flex-1">
            <span className="text-lg font-semibold">
              Bài viết của {post?.user_name || "Người dùng"}
            </span>
          </div>
          <Button
            className="absolute p-2 -translate-y-1/2 rounded-full hover:bg-gray-100 right-6 top-1/2"
            onClick={onClose}>
            <X size={22} />
          </Button>
        </div>
        {/* Content (scrollable) */}
        <div className="flex-1 px-6 py-4 overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Đang tải...</div>
          ) : post ? (
            <>
              {/* User info */}
              <div className="flex items-center gap-3 mb-2">
                <img
                  src={post.user_avatar || "/default-avatar.png"}
                  alt="avatar"
                  className="w-12 h-12 border rounded-full"
                />
                <div className="flex flex-col">
                  <span className="font-semibold">
                    {post.user_name || "Người dùng"}
                  </span>
                  <span className="text-xs text-gray-500" title={timeTooltip}>
                    {timeAgoDisplay}
                  </span>
                </div>
              </div>
              {/* Tags */}
              <div className="flex flex-wrap items-center gap-2 mb-2 text-sm text-gray-500">
                {displayParentTags.map((tag: string, idx: number) => (
                  <span
                    key={`parent-tag-${idx}`}
                    className="px-2 py-1 text-xs text-gray-600 bg-gray-100 rounded-full">
                    #{tag}
                  </span>
                ))}
                {displayChildTags.map((tag: string, idx: number) => (
                  <span
                    key={`child-tag-${idx}`}
                    className="px-2 py-1 text-xs text-gray-600 bg-gray-100 rounded-full">
                    #{tag}
                  </span>
                ))}
              </div>
              {/* Title */}
              <h2 className="mb-2 text-xl font-bold">{post.title}</h2>
              {/* Content */}
              <div
                className="relative mb-3 text-gray-800 transition-all duration-200"
                style={{ wordBreak: "break-word" }}>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={markdownComponents}>
                  {post.content}
                </ReactMarkdown>
              </div>
              {/* images gallery */}
              {displayImages.length > 0 && (
                <PostImagesGallery images={displayImages} />
              )}
              {/* files list */}
              {displayFiles.length > 0 && (
                <PostFilesList files={displayFiles} />
              )}
              {/* Like & comment info (ngay trước phần bình luận) */}
              <div className="flex items-center justify-around gap-6 py-4 my-3 text-sm text-gray-500 border-t border-b border-gray-300">
                <Button
                  className={`flex items-center gap-1 cursor-pointer focus:outline-none ${
                    isLiked ? "text-red-500 hover:text-red-600" : "text-gray-600 hover:text-gray-800"
                  }`}
                  onClick={handleLikePost}
                >
                  <Heart size={16} fill={isLiked ? "#ef4444" : "none"} />
                  {likeCount} Thích
                </Button>
                <Button
                  className="flex items-center gap-1 cursor-pointer focus:outline-none"
                  // Không cần onClick vì modal luôn mở comment
                  disabled
                >
                  <MessageCircle size={16} />
                  {(post?.comment_count ?? comments.length ?? 0)} Bình luận
                </Button>
              </div>
              {/* Comment section */}
              <div className="mt-6">
                <CommentSection
                  initialComments={comments}
                  onAddComment={() => {}}
                  currentUser={user.name}
                  post_id={postId}
                  showReplyBox={false}
                />
              </div>
            </>
          ) : (
            <div className="p-8 text-center text-gray-500">
              Không tìm thấy bài viết
            </div>
          )}
        </div>
        {/* Footer: ReplyItem để tạo bình luận cấp 1 */}
        <div className="sticky bottom-0 z-10 flex-shrink-0 px-4 pt-6 border-t border-gray-300 bg-gray-50">
          <ReplyIteam
            level={1}
            currentUserAvatar={user.avatar || "/default-avatar.png"}
            value={commentValue}
            onChange={setCommentValue}
            onSubmit={handleSubmitComment}
            placeholder="Viết bình luận của bạn..."
            autoFocus={false}
            focusTick={commentFocusTick}
            hideAvatar={false}
          />
        </div>
      </div>
      {/* Overlay click để đóng */}
      <div className="fixed inset-0 z-40 pointer-events-none" />
    </div>
  );
};

export default PostModal;
