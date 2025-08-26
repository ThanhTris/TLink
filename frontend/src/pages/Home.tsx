import React, { useEffect, useState } from "react";
import ContentHeader from "../components/ContentHeader";
import CreatePost from "../components/CreatePost";
import ContentPost from "../components/ContentPost";
import SidebarRecommendations from "../components/SidebarRecommendations";
import PostModal from "../components/PostModal";
import {
  getPostsByCategory,
  countPostsHomePopular,
} from "../api/post";
import { parseMySQLDateVN } from "../utils/timeAgo";
import { useUser } from "../hooks/useUser";
import Toast from "../components/Toast";

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
const PAGE_SIZE = 10;

const Home: React.FC = () => {
  const user = useUser();
  const [showCreate, setShowCreate] = useState(false);
  const [posts, setPosts] = useState<FEPost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);

  // Phân trang
  const [totalPosts, setTotalPosts] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Lấy tổng số bài viết (cho phân trang)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await countPostsHomePopular();
        const { success, data, message } = (res as { data: any }).data;
        if (!success) throw new Error(message || "Lỗi khi đếm bài viết");
        if (mounted) setTotalPosts(Number(data || 0));
      } catch (e: any) {
        if (mounted) setTotalPosts(0);
        setToast({ message: e?.message || "Không lấy được tổng số bài viết", type: "error" });
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Lấy bài viết theo trang
  const fetchPosts = async (page: number) => {
    try {
      setLoading(true);
      setError(null);
      const userId = user.id;
      const offset = (page - 1) * PAGE_SIZE;
      const res = await getPostsByCategory(
        "/home",
        PAGE_SIZE,
        offset,
        userId || undefined
      );
      const { success, message, data } = res.data as { success: boolean; message?: string; data?: any[] };
      if (!success) {
        setToast({ message: message || "Lỗi khi tải bài viết", type: "error" });
        throw new Error(message || "Lỗi khi tải bài viết");
      }
      if (!data || data.length === 0) {
        setPosts([]);
        return;
      }
      const mapped: FEPost[] = data.map((p) => ({
        id: Number(p.id),
        title: p.title ?? "",
        content: p.content ?? "",
        likes_count: Number(p.likes_count ?? 0),
        comment_count: Number(p.comment_count ?? 0),
        is_saved: p.is_saved,
        is_liked: p.is_liked,
        created_at: toDate(p.created_at),
        parent_tags: p.parent_tags ?? [],
        child_tags: p.child_tags ?? [],
        user_name: p.user_name,
        author_id: p.author_id,
        images: Array.isArray(p.images) ? p.images : [],
        files: Array.isArray(p.files) ? p.files : [],
      }));
      setPosts(mapped);
    } catch (e: any) {
      setError(e?.message || "Không tải được bài viết");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(currentPage);
    // eslint-disable-next-line
  }, [user.id, currentPage]);

  // Tổng số trang
  const totalPages = Math.ceil(totalPosts / PAGE_SIZE);

  // Chuyển trang
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  // Đóng toast sau 2s
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 2000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  // Reload lại khi tạo bài viết thành công
  const handleCreatePostSuccess = () => {
    setShowCreate(false);
    // Reload lại tổng số bài viết và trang đầu tiên
    (async () => {
      await fetchPosts(1);
      setCurrentPage(1);
      // Reload lại tổng số bài viết
      try {
        const res = await countPostsHomePopular();
        const { success, data } = res.data as { success: boolean; data?: any };
        if (success) setTotalPosts(Number(data || 0));
      } catch {}
    })();
    setToast({ message: "Tạo bài viết thành công", type: "success" });
  };

  // Helper: Tạo mảng số trang hiển thị dạng << < 1 2 ... n-1 n > >
  function getPagination(current: number, total: number, max: number = 5): number[] {
    if (total <= max) return Array.from({ length: total }, (_, i) => i + 1);
    const pages: number[] = [];
    const left = Math.max(1, current - 1);
    const right = Math.min(total, current + 1);

    if (left > 2) pages.push(1, -1); // -1 là dấu ...
    else for (let i = 1; i < left; i++) pages.push(i);

    for (let i = left; i <= right; i++) pages.push(i);

    if (right < total - 1) pages.push(-1, total);
    else for (let i = right + 1; i <= total; i++) pages.push(i);

    return pages;
  }

  return (
    <div className="px-16 py-8">
      <ContentHeader title="Mới nhất" onCreate={() => setShowCreate(true)} />
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
          <div className="w-full">
            <CreatePost
              onCancel={() => setShowCreate(false)}
              onSubmit={handleCreatePostSuccess}
            />
          </div>
        </div>
      )}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      {loading && <div>Đang tải...</div>}
      {!loading && !error && posts.length === 0 && (
        <div className="italic text-gray-500">Không có bài viết nào</div>
      )}
      {error && <div className="text-red-500">Lỗi: {error}</div>}
      {!loading &&
        !error &&
        posts.length > 0 &&
        posts.map((post) => (
          <ContentPost
            key={post.id}
            {...post}
            is_saved={post.is_saved}
            is_liked={post.is_liked}
            initialComments={[]}
          />
        ))}
      {/* Phân trang */}
      {!loading && totalPages > 1 && (
        <div className="flex justify-center mt-8 gap-2">
          {totalPages > 5 && (
            <>
              <button
                className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
                disabled={currentPage === 1}
                onClick={() => handlePageChange(1)}
                title="Trang đầu"
              >
                &laquo;
              </button>
              <button
                className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
                title="Trang trước"
              >
                &lt;
              </button>
            </>
          )}
          {getPagination(currentPage, totalPages, 5).map((page, idx) =>
            page === -1 ? (
              <span key={`ellipsis-${idx}`} className="px-2 py-1 text-gray-500 select-none">...</span>
            ) : (
              <button
                key={page}
                className={`px-3 py-1 rounded ${currentPage === page ? "bg-blue-500 text-white" : "bg-gray-200 hover:bg-gray-300"}`}
                onClick={() => handlePageChange(page)}
              >
                {page}
              </button>
            )
          )}
          {totalPages > 5 && (
            <>
              <button
                className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
                title="Trang sau"
              >
                &gt;
              </button>
              <button
                className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(totalPages)}
                title="Trang cuối"
              >
                &raquo;
              </button>
            </>
          )}
        </div>
      )}
      <SidebarRecommendations
        userId={user.id}
        onItemClick={(postId) => setSelectedPostId(postId)}
      />
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

export default Home;
