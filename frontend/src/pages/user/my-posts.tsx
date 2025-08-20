import React, { useEffect, useState } from "react";
import ContentHeader from "../../components/ContentHeader";
import Content from "../../components/ContentPost";
import { useUser } from "../../hooks/useUser";
import { getUserPosts } from "../../api/user";

const MyPost: React.FC = () => {
  const user = useUser();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user.id) return;
    setLoading(true);
    getUserPosts(user.id)
      .then((res) => {
        if (res.data && typeof res.data === "object" && "data" in res.data) {
          setPosts((res.data as { data?: any[] }).data || []);
        } else {
          setPosts([]);
        }
      })
      .finally(() => setLoading(false));
  }, [user.id]);

  return (
    <div className="px-16 py-8">
      <ContentHeader title="Bài viết của tôi" />
      {loading && <div>Đang tải...</div>}
      {!loading && posts.length === 0 && (
        <div className="text-gray-500 italic">Bạn chưa có bài viết nào</div>
      )}
      {!loading &&
        posts.map((post) => (
          <Content key={post.id} {...post} initialComments={[]} />
        ))}
    </div>
  );
};
export default MyPost;