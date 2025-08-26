import React, { useEffect, useState } from "react";
import RecommendationItem from "./RecommendationItem";
import { getPostsByCategory } from "../api/post";

interface SidebarRecommendationProps {
  userId?: number;
  onItemClick?: (postId: number) => void;
}

type Post = {
  id: number;
  title: string;
  content: string;
  images?: { id: number; name: string; type: string }[];
  child_tags?: string[];
  parent_tags?: string[];
};

const SidebarRecommendations: React.FC<SidebarRecommendationProps> = ({
  userId,
  onItemClick,
}) => {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const res: any = await getPostsByCategory("/popular", 5, 0, userId);
        // Sửa lỗi typescript: ép kiểu any cho res, kiểm tra kỹ mảng
        const data: Post[] = Array.isArray(res && res.data && res.data.data) ? res.data.data : [];
        setPosts(data);
      } catch {
        setPosts([]);
      }
    })();
  }, [userId]);

  return (
    <aside
      className="fixed top-[64px] right-0 h-[calc(100vh-64px)] w-70 bg-white border-r border-black/10 shadow-md px-2 py-4 overflow-y-auto sidebar-hide-scrollbar"
    >
      <div className="mb-3 font-bold text-2xl">Có thể bạn thích</div>
      {posts.length === 0 && (
        <div className="text-gray-500 text-sm">Không có gợi ý nào</div>
      )}
      {posts.map((post) => (
        <RecommendationItem
          key={post.id}
          title={post.title}
          content={post.content}
          imageUrl={
            post.images && post.images.length > 0
              ? `/api/posts/image/${post.images[0].id}`
              : undefined
          }
          tags={[
            ...(post.parent_tags || []),
            ...(post.child_tags || []),
          ]}
          onClick={() => onItemClick?.(post.id)}
        />
      ))}
    </aside>
  );
};

export default SidebarRecommendations;
