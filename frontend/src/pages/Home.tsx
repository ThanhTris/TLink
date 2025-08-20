import React, { use, useEffect, useState } from "react";
import ContentHeader from "../components/ContentHeader";
import CreatePost from "../components/CreatePost";
import ContentPost from "../components/ContentPost";
import {
  getPostsByCategory,

} from "../api/post";
import { parseMySQLDateVN } from "../utils/timeAgo";
import { useUser } from "../hooks/useUser";

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

// Use the proper VN date parsing function
const toDate = (v: any) => (v ? parseMySQLDateVN(v) : new Date());
const user = useUser();

type PostsResponse = {
  success: boolean;
  message?: string;
  data?: any[];
};

const Home: React.FC = () => {
  const [showCreate, setShowCreate] = useState(false);
  const [posts, setPosts] = useState<FEPost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const userId = user.id;
        const res = await getPostsByCategory(
          "/home",
          10,
          0,
          userId || undefined
        );

        const { success, message, data } = res.data as PostsResponse;

        if (!success) {
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
          is_saved: p.is_saved, // đã là boolean
          is_liked: p.is_liked, // đã là boolean
          created_at: toDate(p.created_at),
          parent_tags: p.parent_tags ?? [],
          child_tags: p.child_tags ?? [],
          user_name: p.user_name,
          author_id: p.author_id,
          images: p.images ?? p.image ? [p.image] : [],
          files: p.files ?? p.file ? [p.file] : [],
        }));

        setPosts(mapped);

        if (mounted) setPosts(mapped);
      } catch (e: any) {
        if (mounted) setError(e?.message || "Không tải được bài viết");
        console.error("Error fetching posts:", e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="px-16 py-8">
      <ContentHeader title="Mới nhất" onCreate={() => setShowCreate(true)} />
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
          <div className="w-full max-w-2xl">
            <CreatePost
              onCancel={() => setShowCreate(false)}
              onSubmit={() => setShowCreate(false)}
            />
          </div>
        </div>
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
    </div>
  );
};

export default Home;
