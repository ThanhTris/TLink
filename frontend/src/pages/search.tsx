import React, { useEffect, useState } from "react";
import ContentHeader from "../components/ContentHeader";
import ContentPost from "../components/ContentPost";
import SidebarRecommendations from "../components/SidebarRecommendations";
import { searchPosts } from "../api/post";
import { parseMySQLDateVN } from "../utils/timeAgo";
import { useUser } from "../hooks/useUser";
import { useSearchParams } from "react-router-dom";
import PostModal from "../components/PostModal";

type FEPost = {
  id: number;
  title: string;
  content: string;
  likes_count?: number;
  comment_count?: number;
  is_saved?: boolean;
  is_liked?: boolean;
  created_at: Date;
  parent_tags?: string[];
  child_tags?: string[];
  user_avatar?: string;
  user_name?: string;
  author_id?: number;
  images?: any[];
  files?: any[];
};

const toDate = (v: any) => (v ? parseMySQLDateVN(v) : new Date());

const Search: React.FC = () => {
  const [searchParams] = useSearchParams();
  const keyword = searchParams.get("keyword") || "";
  const user = useUser();
  const [posts, setPosts] = useState<FEPost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const userId = user.id;
        const res = await searchPosts(keyword, 10, 0, userId || undefined);
        const { success, message, data } = res.data as { success: boolean; message?: string; data?: any[] };
        if (!success) throw new Error(message || "Lỗi khi tìm kiếm bài viết");
        if (!data || data.length === 0) {
          setPosts([]);
          return;
        }
        // Chuẩn hóa dữ liệu giống trang Home
        const mapped: FEPost[] = data.map((p: any) => ({
          id: Number(p.id),
          title: p.title ?? "",
          content: p.content ?? "",
          likes_count: Number(p.likes_count ?? 0),
          comment_count: Number(p.comment_count ?? 0),
          is_saved: !!p.is_saved,
          is_liked: !!p.is_liked,
          created_at: toDate(p.created_at),
          parent_tags: Array.isArray(p.parent_tags) ? p.parent_tags : [],
          child_tags: Array.isArray(p.child_tags) ? p.child_tags : [],
          user_name: p.user_name,
          user_avatar: p.user_avatar,
          author_id: p.author_id,
          images: Array.isArray(p.images) ? p.images : [],
          files: Array.isArray(p.files) ? p.files : [],
        }));
        if (mounted) setPosts(mapped);
      } catch (e: any) {
        if (mounted) setError(e?.message || "Không tìm được bài viết");
        // eslint-disable-next-line no-console
        console.error("Error searching posts:", e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [keyword, user.id]);

  return (
    <div className="px-16 py-8">
      <ContentHeader title={`về "${keyword}"`} />
      {loading && <div>Đang tải...</div>}
      {!loading && !error && posts.length === 0 && (
        <div className="text-gray-500 italic">Không có bài viết nào phù hợp</div>
      )}
      {error && <div className="text-red-500">Lỗi: {error}</div>}
      {!loading &&
        !error &&
        posts.length > 0 &&
        posts.map((post) => (
          <ContentPost key={post.id} {...post} initialComments={[]} />
        ))}
      <SidebarRecommendations
        userId={user.id}
        onItemClick={(postId) => setSelectedPostId(postId)}
      />
      {/* Nếu muốn mở modal bài viết khi click gợi ý, có thể dùng PostModal như trang home */}
      {selectedPostId !== null && (
        <PostModal
          postId={selectedPostId}
          open={selectedPostId !== null}
          onClose={() => setSelectedPostId(null)}
        />
      )}
    </div>
  );
};

export default Search;
