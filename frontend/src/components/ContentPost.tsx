import React, { useState, useMemo, useEffect } from "react";
import { Heart, MessageCircle, Ellipsis, Eye, EyeOff, BookmarkCheck, BookmarkX, X, TriangleAlert } from "lucide-react";
import Button from "./Button";
import CommentSection from "./CommentPostSection";
import { getTimeAgoStrict, formatDateTimeVN } from "../utils/timeAgo";
import {
  likePost as apiLikePost,
  unlikePost as apiUnlikePost,
  savePost as apiSavePost,
  unsavePost as apiUnsavePost,
  updatePost as apiUpdatePost,
  deletePost as apiDeletePost,
} from "../api/post";
import { useDispatch } from "react-redux";
import CreatePost from "./CreatePost";
import { useUser } from "../hooks/useUser";
import { getCommentsTree } from "../api/comment";
import PostImagesGallery from "./PostImagesGallery";
import PostFilesList from "./PostFilesList";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
// Thêm Twemoji
import twemoji from "twemoji";
import Toast from "./Toast";

interface ContentProps {
  id: number;
  title: string;
  content: string;
  likes_count?: number; // backend có thể trả về likes_count
  comment_count?: number;
  is_saved?: boolean;
  is_liked?: boolean; // dùng đúng tên trường từ backend
  created_at: Date | string;
  parent_tags?: string[]; // backend trả về mảng string
  child_tags?: string[];
  initialComments?: any[];
  images?: string[] | { url: string }[]; // backend có thể trả về mảng object
  files?: string[] | { url: string; name?: string }[];
  author_id?: number;
  user_name?: string; 

  // onDelete?: (id: number) => void;
  // onUpdate?: (id: number, data: any) => void;
  onPostDeleted?: (postId: number, toastInfo?: { message: string; type: "success" | "error" | "warning"; title?: string }) => void; // sửa kiểu
  onToast?: (toast: { message: string; type: "success" | "error" | "warning"; title?: string }) => void; // thêm prop
}

const ContentPost: React.FC<ContentProps> = ({
  id,
  title,
  content,
  likes_count,
  comment_count,
  is_saved,
  is_liked,
  created_at,
  parent_tags = [],
  child_tags = [],
  initialComments = [],
  images = [],
  files = [],
  author_id,
  user_name,
  onPostDeleted,
  onToast,
}) => {
  const dispatch = useDispatch();
  const [liked, setLiked] = useState(is_liked); // boolean từ backend
  const [likeCount, setLikeCount] = useState(
    typeof likes_count === "number" ? likes_count : 0
  );
  const [isBookmarked, setIsBookmarked] = useState(is_saved); // boolean từ backend
  const [isExpanded, setIsExpanded] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>(initialComments); // dùng initialComments
  // thêm: trạng thái menu/ẩn/chỉnh sửa/xóa
  const [menuOpen, setMenuOpen] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  // NEW: confirm delete modal state
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  // NEW: success toast state
  const [successToast, setSuccessToast] = useState<null | {
    id: number;
    message: string;
    title?: string;
    type?: "success" | "error" | "warning";
  }>(null);

  // thêm: state hiển thị sau khi chỉnh sửa
  const [displayTitle, setDisplayTitle] = useState(title);
  const [displayContent, setDisplayContent] = useState(
    typeof content === "string" ? content : String(content ?? "")
  );
  const [displayParentTags, setDisplayParentTags] = useState<string[]>(parent_tags);
  const [displayChildTags, setDisplayChildTags] = useState<string[]>(child_tags);

  const user = useUser();
  const currentUserId = user.id;

  // xác định chủ sở hữu: chỉ so sánh author_id với user_id trong localStorage
  const isOwner = useMemo(() => {
    const aId = author_id != null ? String(author_id) : null;
    const uIdStr = currentUserId != null ? String(currentUserId) : null;
    return !!aId && !!uIdStr && aId === uIdStr;
  }, [author_id, currentUserId]);

  // Use the new Vietnamese time functions
  const timeAgoDisplay = getTimeAgoStrict(created_at);
  const timeTooltip = formatDateTimeVN(created_at);

  const handleLike = async () => {
    const newLiked = !liked;
    setLiked(newLiked);
    setLikeCount((prev) => (newLiked ? prev + 1 : prev - 1)); // optimistic
    try {
      const numericUid = Number(currentUserId);
      if (Number.isFinite(numericUid)) {
        if (newLiked) {
          await apiLikePost(id, numericUid);
        } else {
          await apiUnlikePost(id, numericUid);
        }
      } else {
        throw new Error("Invalid user id");
      }
    } catch {
      // rollback on error
      setLiked((prev) => !prev);
      setLikeCount((prev) => (newLiked ? prev - 1 : prev + 1));
    }
  };

  const handleBookmark = async () => {
    const newBookmarked = !isBookmarked;
    setIsBookmarked(newBookmarked);
    try {
      const numericUid = Number(currentUserId);
      if (Number.isFinite(numericUid)) {
        if (newBookmarked) {
          await apiSavePost(id, numericUid);
        } else {
          await apiUnsavePost(id, numericUid);
        }
      } else {
        throw new Error("Invalid user id");
      }
    } catch {
      // rollback on error
      setIsBookmarked((prev) => !prev);
    }
  };

  const toggleReadMore = () => setIsExpanded((v) => !v);
  const toggleComments = () => setShowComments((v) => !v);
  const toggleBookmark = () => setIsBookmarked((v) => !v);

  const addComment = async (content: string) => {
    // const newComment = await postService.addComment(id, content, 1);
    // setComments((prev) => [...prev, newComment]);
  };

  // Lock body scroll when editing only (not for confirm delete)
  useEffect(() => {
    if (!isEditing) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isEditing]);

  // Lock body scroll when confirm delete modal is open
  useEffect(() => {
    if (!isConfirmDeleteOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isConfirmDeleteOpen]);

  // Đồng bộ lại state liked khi prop is_liked thay đổi (ví dụ khi load lại từ backend)
  useEffect(() => {
    setLiked(is_liked);
  }, [is_liked]);

  useEffect(() => {
    setIsBookmarked(is_saved);
  }, [is_saved]);

  // Khi mở comment box, fetch lại comment mới nhất từ backend
  useEffect(() => {
    if (showComments) {
      const fetchComments = async () => {
        try {
          const res = await getCommentsTree(id, currentUserId);
          const data = (res as any).data?.data || [];
          setComments(data);
        } catch {
          setComments([]);
        }
      };
      fetchComments();
    }
    // eslint-disable-next-line
  }, [showComments, id, currentUserId]);

  // Hiển thị tên người đăng: ưu tiên user_name từ backend
  const displayName = user_name || "Người dùng";

  // Xử lý images: backend trả về mảng object {id, name, type}
  const displayImages = useMemo(() => {
    if (!images) return [];
    if (Array.isArray(images) && images.length > 0) {
      return (images as any[]).map((img) => ({
        url: `/api/posts/image/${img.id}`,
        id: img.id,
        name: img.name,
        type: img.type,
      }));
    }
    return [];
  }, [images]);

  // Xử lý files: backend trả về mảng object {id, name, type}
  const displayFiles = useMemo(() => {
    if (!files) return [];
    if (Array.isArray(files) && files.length > 0) {
      return (files as any[]).map((f) => ({
        url: `/api/posts/file/${f.id}`,
        name: f.name,
        id: f.id,
        type: f.type,
      }));
    }
    return [];
  }, [files]);

  // Xử lý xóa bài viết (không dùng window.confirm)
  const handleDelete = async () => {
    if (!id) return;
    let toastInfo: { message: string; type: "success" | "error" | "warning"; title?: string } | undefined;
    try {
      const response = await apiDeletePost(id);
      const isSuccess = (response as any)?.data?.success;
      const backendMessage = (response as any)?.data?.message || "Bài viết đã được xóa thành công";
      if (isSuccess) {
        toastInfo = {
          title: "Thành công",
          type: "success",
          message: backendMessage,
        };
        onPostDeleted?.(id, toastInfo);
        // Notify parent toast handler if provided
        onToast?.(toastInfo);
        // If no parent handlers provided, show a local toast fallback
  if (!onPostDeleted && !onToast) setSuccessToast({ id: Date.now() + Math.random(), ...toastInfo });
      } else {
        toastInfo = {
          title: "Thất bại",
          type: "error",
          message: backendMessage,
        };
        onPostDeleted?.(id, toastInfo);
        onToast?.(toastInfo);
  if (!onPostDeleted && !onToast) setSuccessToast({ id: Date.now() + Math.random(), ...toastInfo });
      }
    } catch (err) {
      const errorMessage = (err as any)?.response?.data?.message || "Xóa bài viết thất bại!";
      toastInfo = {
        title: "Thất bại",
        type: "error",
        message: errorMessage,
      };
      onPostDeleted?.(id, toastInfo);
      onToast?.(toastInfo);
  if (!onPostDeleted && !onToast) setSuccessToast({ id: Date.now() + Math.random(), ...toastInfo });
    } finally {
      setIsConfirmDeleteOpen(false);
    }
  };

  // Auto-dismiss local successToast after 2s
  React.useEffect(() => {
    if (!successToast) return;
    const t = setTimeout(() => setSuccessToast(null), 2000);
    return () => clearTimeout(t);
  }, [successToast]);

  // Xử lý cập nhật bài viết
  const handleUpdate = async (data: {
    title: string;
    content: string;
    parentTagName?: string; // Updated to match backend parameter
    childTags?: string[];
  }) => {
    try {
      await apiUpdatePost(id, {
        title: data.title,
        content: data.content,
        authorId: currentUserId ?? undefined,
        parentTagName: data.parentTagName, // Updated to match backend parameter
        childTags: data.childTags,
      });
      setDisplayTitle(data.title);
      setDisplayContent(data.content);
      if (data.parentTagName) setDisplayParentTags([data.parentTagName]); // Updated to match backend parameter
      if (data.childTags) setDisplayChildTags(data.childTags);
      setIsEditing(false);
    } catch (err) {
      alert("Cập nhật bài viết thất bại!");
    }
  };

  const markdownComponents = {
    // Bỏ hỗ trợ gạch chân (ins, u)
    ul: ({node, ...props}: any) => <ul className="pl-6 list-disc" {...props} />,
    ol: ({node, ...props}: any) => <ol className="pl-6 list-decimal" {...props} />,
    li: ({node, ...props}: any) => <li className="mb-1" {...props} />,
    text: ({value}: any) => (
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

  // Helper: Đếm số dòng markdown (sau khi render)
  function countMarkdownLines(md: string) {
    return (md || "").split(/\r?\n/).length;
  }

  // Helper: loại bỏ markdown để lấy plain text
  function stripMarkdown(md: string) {
    return (md || "")
      // bỏ ảnh ![alt](url)
      .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
      // giữ text của link [text](url)
      .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
      // bỏ tiêu đề, ký tự nhấn mạnh, code, gạch, blockquote
      .replace(/[#>*_`~\-]+/g, "")
      // bỏ bullet/ordered list ở đầu dòng
      .replace(/^\s*[-*+]\s+/gm, "")
      .replace(/^\s*\d+\.\s+/gm, "")
      // gộp xuống dòng thành khoảng trắng
      .replace(/\r?\n+/g, " ")
      .trim();
  }

  // Helper: cắt ngắn và thêm "..."
  function makeExcerpt(md: string, maxChars = 300) { // Changed from 200 to 300
    const plain = stripMarkdown(md);
    if (plain.length <= maxChars) return plain;
    return (plain.slice(0, maxChars).replace(/\s+\S*$/, "") + "...").trim();
  }

  // Helper: cắt ngắn markdown content giữ nguyên format
  function truncateMarkdown(md: string, maxChars = 300) {
    if (!md || md.length <= maxChars) return md;
    // Cắt tại vị trí maxChars và tìm điểm cắt hợp lý (không cắt giữa từ)
    let truncated = md.slice(0, maxChars);
    const lastSpaceIndex = truncated.lastIndexOf(' ');
    if (lastSpaceIndex > maxChars * 0.8) { // Chỉ cắt tại khoảng trắng nếu không quá ngắn
      truncated = truncated.slice(0, lastSpaceIndex);
    }
    return truncated + '...';
  }

  // Helper: kiểm tra nội dung có cần truncate không dựa trên plain text
  function shouldTruncateContent(md: string, maxChars = 300) {
    const plainText = stripMarkdown(md);
    return plainText.length > maxChars;
  }

  // Helper: cắt ngắn markdown content giữ nguyên format và thêm inline button
  function getTruncatedMarkdownWithButton(md: string, maxChars = 300) {
    if (!md || !shouldTruncateContent(md, maxChars)) return md;
    
    let truncated = md.slice(0, maxChars);
    const lastSpaceIndex = truncated.lastIndexOf(' ');
    if (lastSpaceIndex > maxChars * 0.8) {
      truncated = truncated.slice(0, lastSpaceIndex);
    }
    
    // Trả về markdown đã cắt ngắn với "..." nhưng không có button ở đây
    return truncated + '...';
  }

  // Xác định có cần nút "Xem thêm" hay không
  const shouldShowExpand = useMemo(() => {
    return countMarkdownLines(displayContent) > 3 || shouldTruncateContent(displayContent, 300);
  }, [displayContent]);

  return (
    <div className="relative w-full px-5 pt-5 pb-2 mt-6 bg-[var(--bg-card)] shadow-[var(--shadow-card)] border border-[rgba(255,255,255,0.45)] rounded-xl">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-lg font-semibold text-[var(--text-main)] line-clamp-1">{displayTitle}</h2>
        <div className="flex items-center gap-1">
          <div className="relative">
            <Button
              onClick={() => setMenuOpen((v) => !v)}
              className="text-gray-500 cursor-pointer hover:text-gray-700 focus:outline-none"
              title="Tùy chọn"
            >
              <Ellipsis size={20} />
            </Button>
            {menuOpen && (
              <div className="absolute right-0 z-10 w-56 p-1 mt-1 bg-white rounded shadow">
                {!isOwner ? (
                  <>
                    {/* Ẩn/Hiện bài viết */}
                    {!isHidden ? (
                      <Button
                        onClick={() => {
                          setIsHidden(true);
                          setMenuOpen(false);
                        }}
                        className="block w-full px-4 py-2 text-left rounded-md hover:bg-gray-100"
                      >
                        <span className="flex items-center gap-2">
                          <EyeOff size={16} />
                          Ẩn bài viết
                        </span>
                      </Button>
                    ) : (
                      <Button
                        onClick={() => {
                          setIsHidden(false);
                          setMenuOpen(false);
                        }}
                        className="block w-full px-4 py-2 text-left text-blue-600 rounded-md hover:bg-gray-100"
                      >
                        <span className="flex items-center gap-2">
                          <Eye size={16} />
                          Hiện bài viết
                        </span>
                      </Button>
                    )}

                    {/* Lưu/Hủy lưu bài viết */}
                    {!isBookmarked ? (
                      <Button
                        onClick={async () => {
                          setMenuOpen(false);
                          await handleBookmark();
                        }}
                        className="block w-full px-4 py-2 text-left rounded-md hover:bg-gray-100"
                      >
                        <span className="flex items-center gap-2">
                          <BookmarkCheck size={16} />
                          Lưu bài viết
                        </span>
                      </Button>
                    ) : (
                      <Button
                        onClick={async () => {
                          setMenuOpen(false);
                          await handleBookmark();
                        }}
                        className="block w-full px-4 py-2 text-left text-red-600 rounded-md hover:bg-gray-100"
                      >
                        <span className="flex items-center gap-2">
                          <BookmarkX size={16} />
                          Hủy lưu bài viết
                        </span>
                      </Button>
                    )}
                  </>
                ) : (
                  <>
                    <Button
                      onClick={() => {
                        setIsEditing(true);
                        setMenuOpen(false);
                      }}
                      className="block w-full px-4 py-2 text-left text-blue-600 rounded-md hover:bg-gray-100"
                    >
                      Chỉnh sửa
                    </Button>
                    <Button
                      onClick={() => {
                        setIsConfirmDeleteOpen(true); // OPEN CONFIRM MODAL
                        setMenuOpen(false);
                      }}
                      className="block w-full px-4 py-2 text-left text-red-600 rounded-md hover:bg-gray-100"
                    >
                      Xóa
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-2 text-sm text-gray-500">
        <span>Đăng bởi {displayName}</span>
        <span>• </span>
        <span title={timeTooltip} className="cursor-help hover:text-gray-700">
          {timeAgoDisplay}
        </span>
        {displayParentTags && displayParentTags.map((tag, idx) => (
          <span key={`parent-tag-${idx}`} className="px-2 py-1 text-xs text-[var(--color-accent-green)] bg-[rgba(255,255,255,0.25)] rounded-full">
            #{tag}
          </span>
        ))}
        {displayChildTags && displayChildTags.map((tag, idx) => (
          <span key={`child-tag-${idx}`} className="px-2 py-1 text-xs text-[var(--color-accent-orange)] bg-[rgba(255,255,255,0.25)] rounded-full">
            #{tag}
          </span>
        ))}
      </div>

      {isHidden ? (
        <div className="mb-3 text-sm italic text-gray-600">Bài viết đã bị ẩn.</div>
      ) : (
        <>
          {/* Content section with expand/collapse */}
          <div className="mb-3">
            {!isExpanded ? (
              <div
                className="text-gray-800 transition-all duration-200"
                style={{ wordBreak: "break-word" }}
              >
                {shouldTruncateContent(displayContent, 300) ? (
                  <span>
                    <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                      {getTruncatedMarkdownWithButton(displayContent, 300)}
                    </ReactMarkdown>
                    <Button
                      onClick={toggleReadMore}
                      className="text-blue-500 hover:underline font-medium inline-block ml-1"
          
                    >
                      Xem thêm
                    </Button>
                  </span>
                ) : (
                  <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                    {displayContent}
                  </ReactMarkdown>
                )}
              </div>
            ) : (
              <div
                className="text-gray-800 transition-all duration-200"
                style={{ wordBreak: "break-word" }}
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                  {displayContent}
                </ReactMarkdown>
                <div className="mt-2">
                  <button
                    onClick={toggleReadMore}
                    className="text-blue-500 hover:underline font-medium"
                  >
                    Thu gọn
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Images gallery - always shown below content */}
          {displayImages.length > 0 && (
            <div className="mb-3">
              <PostImagesGallery images={displayImages} />
            </div>
          )}

          {/* Files list - always shown below images */}
          {displayFiles.length > 0 && (
            <div className="mb-3">
              <PostFilesList files={displayFiles} />
            </div>
          )}

          <div className="flex items-center my-3 text-sm text-gray-500 gap-15 ">
            <Button
              className={`flex items-center gap-1 cursor-pointer focus:outline-none transition bg-transparent hover:bg-gray-50 px-4 py-3 rounded ${
                liked ? "text-red-500 hover:text-red-600" : "text-gray-600 hover:text-gray-800"
              }`}
              onClick={handleLike}
            >
              <Heart size={16} fill={liked ? "currentColor" : "none"} />
              {likeCount} Thích
            </Button>
            <Button
              className="flex items-center gap-1 cursor-pointer focus:outline-none transition bg-transparent hover:bg-gray-50 px-4 py-3 rounded"
              onClick={toggleComments}
            >
              <MessageCircle size={16} />
              {comments.length || comment_count} Bình luận
            </Button>
          </div>

          {showComments && (
            <CommentSection
              initialComments={comments}
              onAddComment={() => {}}
              currentUser="You"
              post_id={id}
            />
          )}
        </>
      )}

      {/* Confirm Delete Modal - Full screen overlay with backdrop */}
      {isConfirmDeleteOpen && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setIsConfirmDeleteOpen(false)}
        >
          <div 
            className="user-menu w-full max-w-lg mx-4 p-6 border border-[var(--glass-border)] rounded-xl shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="text-xl font-semibold text-[var(--text-title)] mb-4 line-clamp-1">
              Xóa bài viết "{displayTitle}"?
            </h4>
            <div className="mb-4">
              <p className="text-sm text-red-600 font-medium flex items-center gap-2">
                <TriangleAlert size={16} />
                Hành động này không thể hoàn tác!
              </p>
            </div>
            <div className="flex justify-end gap-8">
              <Button
                className="btn-danger px-5 py-2 rounded-lg"
                onClick={handleDelete}
              >
                Xóa bài viết
              </Button>
              <Button
                className="btn-warning px-5 py-2 rounded-lg"
                onClick={() => setIsConfirmDeleteOpen(false)}
              >
                Hủy
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Form chỉnh sửa (modal overlay) */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-black/20">
          <Button
            onClick={() => setIsEditing(false)}
            className="fixed top-3 right-3 p-2 text-gray-600 rounded-full hover:bg-gray-100"
            title="Đóng"
            aria-label="Đóng"
          >
            <X size={18} />
          </Button>
          <div className="min-h-screen flex items-center justify-center p-4 overflow-y-auto">
            <CreatePost
              mode="edit"
              postId={id}
              heading="Chỉnh sửa bài viết"
              submitLabel="Cập nhật"
              initialTitle={displayTitle}
              initialContent={displayContent}
              initialTagParent={displayParentTags[0] || "Thảo luận chung"}
              initialChildTags={displayChildTags}
              initialImageUrls={displayImages.map(img => img.url)}
              initialDocUrls={displayFiles}
              onCancel={() => setIsEditing(false)}
              onSubmit={handleUpdate}
              onToast={onToast}
            />
          </div>
        </div>
      )}

      {/* Success Toast (fixed positioned) */}
      {/* Khi xóa bài viết, toast sẽ hiển thị ở Home, không hiển thị ở đây nữa */}
      {successToast && (
        <Toast
          key={successToast.id}
          message={successToast.message}
          title={successToast.title}
          type={successToast.type}
          onClose={() => setSuccessToast(null)}
        />
      )}
    </div>
  );
};

export default ContentPost;