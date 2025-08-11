import React, { useEffect, useState } from "react";
import ContentHeader from "../components/ContentHeader";
import CreatePost from "../components/CreatePost";
import Content from "../components/ContentPost";
import { getPostsByCategory } from "../api/post";

type FEPost = {
  id: number;
  name: string;
  title: string;
  content: string;
  like_count: number;
  comment_count: number;
  is_saved: boolean;
  is_like: boolean;
  created_at: Date;
  parent_tags: string[];
  child_tags: string[];
};

const toDate = (v: any) => (v ? new Date(v) : new Date());

const home: React.FC = () => {
  const [showCreate, setShowCreate] = useState(false);
  const [posts, setPosts] = useState<FEPost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await getPostsByCategory("/home", 10, 0); // userId auto from localStorage
        const items = (res as { data?: { data?: any[] } })?.data?.data ?? [];
        const mapped: FEPost[] = items.map((p: any) => ({
          id: p.id,
          name: p.name,
          title: p.title,
          content: p.content,
          like_count: Number(p.like_count ?? 0),
          comment_count: Number(p.comment_count ?? 0),
          is_saved: !!p.is_saved,
          is_like: !!p.is_like,
          created_at: toDate(p.created_at),
          parent_tags: Array.isArray(p.parent_tags) ? p.parent_tags : [],
          child_tags: Array.isArray(p.child_tags) ? p.child_tags : [],
        }));
        if (mounted) setPosts(mapped);
      } catch (e: any) {
        if (mounted) setError(e?.message || "Không tải được bài viết");
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
              onSubmit={(data) => {
                const newPost = {
                  id: Date.now(),
                  user_id: data.user_id,
                  title: data.title,
                  content: data.content,
                  likes: 0,
                  comments: 0,
                  createdAt: new Date(),
                  updated_at: new Date(),
                  tagParent: data.tagParent,
                  tagChild: data.tagChild,
                  initialComments: [],
                  initialLikes: [],
                  initialFavorites: [],
                };
                setShowCreate(false);
              }}
            />
          </div>
        </div>
      )}
      {loading && <div>Đang tải...</div>}
      {error && <div className="text-red-500">Lỗi: {error}</div>}
      {!loading &&
        !error &&
        posts.map((post) => (
          <Content
            key={post.id}
            id={post.id}
            name={post.name}
            title={post.title}
            content={post.content}
            like_count={post.like_count}
            comment_count={post.comment_count}
            is_saved={post.is_saved}
            is_like={post.is_like}
            created_at={post.created_at}
            parent_tags={post.parent_tags}
            child_tags={post.child_tags}
            initialComments={[]} // không cần comment mock
          />
        ))}
    </div>
  );
};

export default home;