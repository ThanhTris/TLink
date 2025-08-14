import React, { useState, useMemo, useEffect } from "react";
import { Heart, MessageCircle, Ellipsis, Eye, EyeOff, BookmarkCheck, BookmarkX, X } from "lucide-react";
import Button from "./Button";
import CommentSection from "./CommentPostSection";
import { getTimeAgoStrict, formatDateTimeVN } from "../utils/timeAgo";
import { likePost as apiLikePost, unlikePost as apiUnlikePost, getCurrentUserIdFromLocalStorage } from "../api/post";
import { useDispatch } from "react-redux";
import CreatePost from "./CreatePost";

interface ContentProps {
  id: number;
  title: string;
  content: string;
  likes_count?: number; // backend có thể trả về likes_count
  comment_count?: number;
  is_saved?: boolean;
  is_like?: boolean;
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
}

const ContentPost: React.FC<ContentProps> = ({
  id,
  title,
  content,
  likes_count,
  comment_count,
  is_saved,
  is_like,
  created_at,
  parent_tags = [],
  child_tags = [],
  initialComments = [],
  images = [],
  files = [],
  author_id,
  user_name,
}) => {
  const dispatch = useDispatch();
  const [liked, setLiked] = useState(is_like);
  const [likeCount, setLikeCount] = useState(
    typeof likes_count === "number" ? likes_count : 0
  );
  const [isBookmarked, setIsBookmarked] = useState(is_saved);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>(initialComments); // dùng initialComments
  // thêm: trạng thái menu/ẩn/chỉnh sửa/xóa
  const [menuOpen, setMenuOpen] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);

  // thêm: state hiển thị sau khi chỉnh sửa
  const [displayTitle, setDisplayTitle] = useState(title);
  const [displayContent, setDisplayContent] = useState(
    typeof content === "string" ? content : String(content ?? "")
  );
  const [displayParentTags, setDisplayParentTags] = useState<string[]>(parent_tags);
  const [displayChildTags, setDisplayChildTags] = useState<string[]>(child_tags);

  const currentUserId = getCurrentUserIdFromLocalStorage();

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

  const toggleReadMore = () => setIsExpanded((v) => !v);
  const toggleComments = () => setShowComments((v) => !v);
  const toggleBookmark = () => setIsBookmarked((v) => !v);

  const addComment = async (content: string) => {
    // const newComment = await postService.addComment(id, content, 1);
    // setComments((prev) => [...prev, newComment]);
  };

  useEffect(() => {
    if (!isEditing) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isEditing]);

  if (isDeleted) {
    return null; // đã xóa khỏi giao diện
  }

  // Hiển thị tên người đăng: ưu tiên user_name từ backend
  const displayName = user_name || "Người dùng";

  // Xử lý images: backend có thể trả về mảng string hoặc mảng object {url}
  const displayImages = useMemo(() => {
    if (!images) return [];
    if (Array.isArray(images) && images.length > 0) {
      if (typeof images[0] === "string") return images as string[];
      if (typeof images[0] === "object" && images[0] !== null) {
        return (images as any[]).map((img) => img.url || img.image_url).filter(Boolean);
      }
    }
    return [];
  }, [images]);

  // Xử lý files: backend có thể trả về mảng string hoặc object {url, name}
  const displayFiles = useMemo(() => {
    if (!files) return [];
    if (Array.isArray(files) && files.length > 0) {
      if (typeof files[0] === "string") {
        return (files as string[]).map((url) => ({ url, name: url }));
      }
      if (typeof files[0] === "object" && files[0] !== null) {
        return (files as any[]).map((f) => ({
          url: f.url || f.file_url,
          name: f.name || f.file_name || f.url || f.file_url,
        })).filter(f => !!f.url);
      }
    }
    return [];
  }, [files]);

  return (
    <div className="relative px-5 pt-5 pb-2 mt-6 bg-gray-200 shadow-sm rounded-xl w-full">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-lg font-semibold line-clamp-1">{displayTitle}</h2>
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
              <div className="absolute right-0 mt-1 w-56 bg-white rounded shadow z-10 p-1">
                {!isOwner ? (
                  <>
                    {/* Ẩn/Hiện bài viết */}
                    {!isHidden ? (
                      <Button
                        onClick={() => {
                          setIsHidden(true);
                          setMenuOpen(false);
                        }}
                        className="block w-full text-left px-4 py-2 rounded-md hover:bg-gray-100"
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
                        className="block w-full text-left px-4 py-2 rounded-md text-blue-600 hover:bg-gray-100"
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
                        onClick={() => {
                          setIsBookmarked(true);
                          setMenuOpen(false);
                        }}
                        className="block w-full text-left px-4 py-2 rounded-md  hover:bg-gray-100"
                      >
                        <span className="flex items-center gap-2">
                          <BookmarkCheck size={16} />
                          Lưu bài viết
                        </span>
                      </Button>
                    ) : (
                      <Button
                        onClick={() => {
                          setIsBookmarked(false);
                          setMenuOpen(false);
                        }}
                        className="block w-full text-left px-4 py-2 rounded-md text-red-600 hover:bg-gray-100"
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
                      className="block w-full text-left px-4 py-2 rounded-md text-blue-600 hover:bg-gray-100"
                    >
                      Chỉnh sửa
                    </Button>
                    <Button
                      onClick={() => {
                        if (confirm("Bạn có chắc muốn xóa bài viết này?")) {
                          setIsDeleted(true);
                          setMenuOpen(false);
                        }
                      }}
                      className="block w-full text-left px-4 py-2 rounded-md text-red-600 hover:bg-gray-100"
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

      <div className="flex items-center flex-wrap gap-2 mb-2 text-sm text-gray-500">
        <span>Đăng bởi {displayName}</span>
        <span>• </span>
        <span title={timeTooltip} className="cursor-help hover:text-gray-700">
          {timeAgoDisplay}
        </span>
        {displayParentTags && displayParentTags.map((tag, idx) => (
          <span key={`parent-tag-${idx}`} className="px-2 py-1 text-xs text-gray-600 bg-gray-100 rounded-full">
            #{tag}
          </span>
        ))}
        {displayChildTags && displayChildTags.map((tag, idx) => (
          <span key={`child-tag-${idx}`} className="px-2 py-1 text-xs text-gray-600 bg-gray-100 rounded-full">
            #{tag}
          </span>
        ))}
      </div>

      {isHidden ? (
        <div className="mb-3 text-sm text-gray-600 italic">Bài viết đã bị ẩn.</div>
      ) : (
        <>
          <div
            className={`text-gray-800 mb-3 relative ${
              !isExpanded ? "line-clamp-3 min-h-[36px] max-h-[72px] overflow-hidden" : ""
            }`}
            style={{ wordBreak: "break-word" }}
          >
            {displayContent}
            {!isExpanded && displayContent.length > 100 && (
              <span
                className="absolute right-0 bottom-0 bg-gray-200 pl-2 cursor-pointer text-blue-500 hover:underline"
                onClick={toggleReadMore}
              >
                Read More
              </span>
            )}
          </div>

          {/* images gallery */}
          {displayImages.length > 0 && (
            <div className="mb-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
              {displayImages.map((src, idx) => (
                <a key={`post-img-${idx}`} href={src} target="_blank" rel="noreferrer">
                  <img
                    src={src}
                    alt={`img-${idx}`}
                    className="w-full h-40 object-cover rounded-lg border border-gray-300"
                    loading="lazy"
                  />
                </a>
              ))}
            </div>
          )}

          {/* files list */}
          {displayFiles.length > 0 && (
            <div className="mb-3">
              {displayFiles.map((f, idx) => (
                <div key={`post-file-${idx}`} className="flex items-center gap-2 text-sm">
                  <a
                    href={f.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline break-all"
                  >
                    {f.name || f.url}
                  </a>
                </div>
              ))}
            </div>
          )}

          {isExpanded && (
            <Button onClick={toggleReadMore} className="text-blue-500 hover:text-blue-700">
              Thu gọn
            </Button>
          )}

          <div className="flex gap-6 mb-3 text-sm text-gray-500">
            <Button
              className={`flex items-center gap-1 cursor-pointer focus:outline-none ${
                liked ? "text-red-500 hover:text-red-600" : "text-gray-600 hover:text-gray-800"
              }`}
              onClick={handleLike}
            >
              <Heart size={16} fill={liked ? "currentColor" : "none"} />
              {likeCount} Thích
            </Button>
            <Button
              className="flex items-center gap-1 cursor-pointer focus:outline-none"
              onClick={toggleComments}
            >
              <MessageCircle size={16} />
              {comments.length || comment_count} Bình luận
            </Button>
          </div>

          {showComments && (
            <CommentSection
              initialComments={comments}
              onAddComment={addComment}
              currentUser="You"
              post_id={id}
            />
          )}
        </>
      )}

      {/* Form chỉnh sửa (modal overlay) */}
      {isEditing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/50"
          onClick={() => setIsEditing(false)}
        >
          <div
            className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto overflow-x-hidden rounded-xl bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              onClick={() => setIsEditing(false)}
              className="absolute top-3 right-3 p-2 rounded-full text-gray-600 hover:bg-gray-100"
              title="Đóng"
              aria-label="Đóng"
            >
              <X size={18} />
            </Button>
            <CreatePost
              mode="edit"
              heading="Chỉnh sửa bài viết"
              submitLabel="Cập nhật"
              initialTitle={displayTitle}
              initialContent={displayContent}
              initialTagParent={displayParentTags[0] || "Thảo luận chung"}
              initialChildTags={displayChildTags}
              initialImageUrls={displayImages}
              initialDocUrls={displayFiles}
              onCancel={() => setIsEditing(false)}
              onSubmit={(data) => {
                setDisplayTitle(data.title);
                setDisplayContent(data.content);
                if (data.tagParent) setDisplayParentTags([data.tagParent]);
                if (data.childTags) setDisplayChildTags(data.childTags);
                setIsEditing(false);
                // có thể gọi API cập nhật ở đây nếu cần.
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentPost;