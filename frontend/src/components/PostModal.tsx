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
import { getCommentsTree } from "../api/comment";
import Button from "./Button";
import { getTimeAgoStrict, formatDateTimeVN } from "../utils/timeAgo";

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
    ul: ({ node, ...props }: any) => <ul className="pl-6 list-disc" {...props} />,
    ol: ({ node, ...props }: any) => <ol className="pl-6 list-decimal" {...props} />,
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
  const handleSubmitComment = () => {
    // TODO: Gọi API thêm bình luận cấp 1 cho postId
    // Sau khi thành công, reload lại comment tree
    setCommentValue("");
    setCommentFocusTick((t) => t + 1);
    // Gọi lại getCommentsTree để reload
    (async () => {
      try {
        const res = await getCommentsTree(postId, user.id);
        setComments((res as any).data?.data || []);
      } catch {
        setComments([]);
      }
    })();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div
        className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-xl shadow-xl flex flex-col overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="text-lg font-semibold">
            Bài viết của {post?.user_name || "Người dùng"}
          </div>
          <button
            className="p-2 rounded-full hover:bg-gray-100"
            onClick={onClose}
          >
            <X size={22} />
          </button>
        </div>
        {/* Content */}
        <div className="flex flex-col gap-2 px-6 py-4">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Đang tải...</div>
          ) : post ? (
            <>
              {/* User info */}
              <div className="flex items-center gap-3 mb-2">
                <img
                  src={post.user_avatar || "/default-avatar.png"}
                  alt="avatar"
                  className="w-12 h-12 rounded-full border"
                />
                <div className="flex flex-col">
                  <span className="font-semibold">{post.user_name || "Người dùng"}</span>
                  <span className="text-xs text-gray-500" title={timeTooltip}>
                    {timeAgoDisplay}
                  </span>
                </div>
              </div>
              {/* Tags */}
              <div className="flex flex-wrap items-center gap-2 mb-2 text-sm text-gray-500">
                {displayParentTags.map((tag: string, idx: number) => (
                  <span key={`parent-tag-${idx}`} className="px-2 py-1 text-xs text-gray-600 bg-gray-100 rounded-full">
                    #{tag}
                  </span>
                ))}
                {displayChildTags.map((tag: string, idx: number) => (
                  <span key={`child-tag-${idx}`} className="px-2 py-1 text-xs text-gray-600 bg-gray-100 rounded-full">
                    #{tag}
                  </span>
                ))}
              </div>
              {/* Title */}
              <h2 className="text-xl font-bold mb-2">{post.title}</h2>
              {/* Content */}
              <div className="text-gray-800 mb-3 relative transition-all duration-200" style={{ wordBreak: "break-word" }}>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={markdownComponents}
                >
                  {post.content}
                </ReactMarkdown>
              </div>
              {/* images gallery */}
              {displayImages.length > 0 && <PostImagesGallery images={displayImages} />}
              {/* files list */}
              {displayFiles.length > 0 && <PostFilesList files={displayFiles} />}
              {/* Comment section */}
              <div className="mt-6">
                <CommentSection
                  initialComments={comments}
                  onAddComment={() => {}}
                  currentUser={user.name}
                  post_id={postId}
                />
              </div>
            </>
          ) : (
            <div className="p-8 text-center text-gray-500">Không tìm thấy bài viết</div>
          )}
        </div>
        {/* Footer: ReplyItem để tạo bình luận cấp 1 */}
        <div className="px-6 py-4 border-t bg-gray-50">
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
      <div className="fixed inset-0 z-40" onClick={onClose}></div>
    </div>
  );
};

export default PostModal;
