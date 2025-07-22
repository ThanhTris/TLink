import React, { useState } from "react";
import ContentHeader from "../../components/ContentHeader";
import CreatePost from "../../components/CreatePost";
import Content from "../../components/ContentPost";
import type { Comment } from "../../types/comment";
import type { like } from "../../types/like";
import type { favorite } from "../../types/favorite";

const mockComments: Comment[] = [
  // Post 1
  {
    id: 1,
    post_id: 1,
    user_id: 1,
    parent_id: null,
    level: 1,
    content: "Bài viết rất chi tiết và dễ hiểu, cảm ơn tác giả nhiều!",
    createdAt: new Date(Date.now() - 5 * 60 * 1000),
    likes: 4,
    avatarSrc: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    id: 2,
    post_id: 1,
    user_id: 2,
    parent_id: 1,
    level: 2,
    content: "Bạn có thể chia sẻ thêm về lựa chọn card màn hình không?",
    createdAt: new Date(Date.now() - 4 * 60 * 1000),
    likes: 1,
    avatarSrc: "https://randomuser.me/api/portraits/men/45.jpg",
  },
  {
    id: 3,
    post_id: 1,
    user_id: 1,
    parent_id: 2,
    level: 3,
    content: "Mình sẽ bổ sung chi tiết về card màn hình ở phần sau nhé!",
    createdAt: new Date(Date.now() - 3 * 60 * 1000),
    likes: 2,
    avatarSrc: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    id: 4,
    post_id: 1,
    user_id: 3,
    parent_id: 2,
    level: 3,
    content: "Mình cũng quan tâm chủ đề này, cảm ơn bạn đã hỏi!",
    createdAt: new Date(Date.now() - 2 * 60 * 1000),
    likes: 0,
    avatarSrc: "https://randomuser.me/api/portraits/men/46.jpg",
  },
  {
    id: 5,
    post_id: 1,
    user_id: 4,
    parent_id: 1,
    level: 2,
    content: "Đồng ý, rất hữu ích!",
    createdAt: new Date(Date.now() - 3 * 60 * 1000),
    likes: 2,
    avatarSrc: "https://randomuser.me/api/portraits/men/33.jpg",
  },
  {
    id: 6,
    post_id: 1,
    user_id: 5,
    parent_id: 5,
    level: 3,
    content: "Cảm ơn các bạn đã đọc!",
    createdAt: new Date(Date.now() - 1 * 60 * 1000),
    likes: 1,
    avatarSrc: "https://randomuser.me/api/portraits/women/35.jpg",
  },
  {
    id: 7,
    post_id: 1,
    user_id: 6,
    parent_id: 6,
    level: 3,
    content: "Không có gì!",
    createdAt: new Date(Date.now() - 30 * 1000),
    likes: 0,
    avatarSrc: "https://randomuser.me/api/portraits/men/21.jpg",
  },
  {
    id: 8,
    post_id: 1,
    user_id: 7,
    parent_id: 6,
    level: 3,
    content: "Thật tuyệt vời!",
    createdAt: new Date(Date.now() - 2 * 60 * 1000),
    likes: 1,
    avatarSrc: "https://randomuser.me/api/portraits/women/11.jpg",
  },
  {
    id: 9,
    post_id: 1,
    user_id: 8,
    parent_id: 8,
    level: 3,
    content: "Cảm ơn bạn!",
    createdAt: new Date(Date.now() - 1 * 60 * 1000),
    likes: 0,
    avatarSrc: "https://randomuser.me/api/portraits/women/17.jpg",
  },
  {
    id: 10,
    post_id: 1,
    user_id: 9,
    parent_id: null,
    level: 1,
    content: "Mình đã thử và thành công, cảm ơn tác giả!",
    createdAt: new Date(Date.now() - 10 * 60 * 1000),
    likes: 3,
    avatarSrc: "https://randomuser.me/api/portraits/women/12.jpg",
  },
  {
    id: 11,
    post_id: 1,
    user_id: 10,
    parent_id: null,
    level: 1,
    content: "Mình cần thêm thông tin về nguồn điện, bạn có thể bổ sung không?",
    createdAt: new Date(Date.now() - 45 * 60 * 1000),
    likes: 3,
    avatarSrc: "https://tse1.mm.bing.net/th/id/OIP.yptIBi6t7e8DMnxSNFHBTgHaHE?w=600&h=573&rs=1&pid=ImgDetMain&o=7&rm=3",
  },
  {
    id: 12,
    post_id: 1,
    user_id: 11,
    parent_id: 10,
    level: 2,
    content: "Mình sẽ cập nhật thông tin về nguồn điện trong bài viết sau nhé!",
    createdAt: new Date(Date.now() - 30 * 60 * 1000),
    likes: 2,
    avatarSrc: "https://tse4.mm.bing.net/th/id/OIP.0muxMegycGNRNpSw76aXSQHaFj?w=2048&h=1536&rs=1&pid=ImgDetMain&o=7&rm=3",
  },

  // Post 2
  {
    id: 9,
    post_id: 2,
    user_id: 4,
    parent_id: null,
    level: 1,
    content: "Mẹo này thật sự hiệu quả, FPS tăng rõ rệt!",
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
    likes: 4,
    avatarSrc: "https://th.bing.com/th/id/R.f6829313c230739ceae4a2dfe6bfde96?rik=h8vIHVeE%2f1IN%2fA&riu=http%3a%2f%2fwww.hdwallpapers.in%2fwalls%2fanime_girl_192-normal5.4.jpg&ehk=UYZcmU5ScnjoAQ9CiP%2bw7u9dFQsl%2bxTkxOI8xUqWcCQ%3d&risl=&pid=ImgRaw&r=0",
  },
  {
    id: 10,
    post_id: 2,
    user_id: 2,
    parent_id: 9,
    level: 2,
    content: "Cảm ơn bạn! Bạn thử giảm thêm setting không?",
    createdAt: new Date(Date.now() - 30 * 60 * 1000),
    likes: 1,
    avatarSrc: "https://tse1.mm.bing.net/th/id/OIP.hjFOYx5pbMGSQ2bODUjn6AHaHa?rs=1&pid=ImgDetMain&o=7&rm=3",
  },

  // Post 3
  {
    id: 11,
    post_id: 3,
    user_id: 5,
    parent_id: null,
    level: 1,
    content: "AMD có vẻ đáng tiền hơn, bạn nghĩ sao?",
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    likes: 6,
    avatarSrc: "https://tse4.mm.bing.net/th/id/OIP.iRPRnmiICADP6aEVTvEoswHaJ4?rs=1&pid=ImgDetMain&o=7&rm=3",
  },
  {
    id: 12,
    post_id: 3,
    user_id: 3,
    parent_id: 11,
    level: 2,
    content: "Đúng vậy, đặc biệt với dòng Ryzen 9!",
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    likes: 3,
    avatarSrc: "https://tse1.mm.bing.net/th/id/OIP.yptIBi6t7e8DMnxSNFHBTgHaHE?w=600&h=573&rs=1&pid=ImgDetMain&o=7&rm=3",
  },
  {
    id: 13,
    post_id: 3,
    user_id: 6,
    parent_id: null,
    level: 1,
    content: "Intel vẫn tốt hơn cho overclocking.",
    createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000),
    likes: 2,
    avatarSrc: "https://tse4.mm.bing.net/th/id/OIP.0muxMegycGNRNpSw76aXSQHaFj?w=2048&h=1536&rs=1&pid=ImgDetMain&o=7&rm=3",
  },
];

// Thêm mockPosts đúng chuẩn, mỗi post có initialComments là các comment của post đó
const mockPosts = [
  {
    id: 1,
    user_id: 2,
    title: "Hướng dẫn lắp ráp PC gaming từ A đến Z",
    content: "Bài viết chi tiết hướng dẫn từng bước lắp ráp một bộ PC gaming mạnh mẽ...",
    status: "published",
    likes: 120,
    comments: mockComments.filter(c => c.post_id === 1).length,
    createdAt: new Date(Date.now() - 60 * 60 * 1000),
    updated_at: new Date(Date.now() - 30 * 60 * 1000),
    tagParent: "PhầnCứng",
    tagChild: "PCGaming",
    initialComments: mockComments.filter(c => c.post_id === 1),
    initialLikes: [],
    initialFavorites: [],
  },
  {
    id: 2,
    user_id: 4,
    title: "Tối ưu FPS cho game thủ",
    content: "Một số mẹo giúp tăng FPS khi chơi game...",
    status: "published",
    likes: 50,
    comments: mockComments.filter(c => c.post_id === 2).length,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    updated_at: new Date(Date.now() - 90 * 60 * 1000),
    tagParent: "TốiƯu",
    tagChild: "Game",
    initialComments: mockComments.filter(c => c.post_id === 2),
    initialLikes: [],
    initialFavorites: [],
  },
  {
    id: 3,
    user_id: 5,
    title: "So sánh AMD và Intel mới nhất",
    content: "Bài viết phân tích chi tiết về hai dòng CPU phổ biến...",
    status: "published",
    likes: 80,
    comments: mockComments.filter(c => c.post_id === 3).length,
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
    updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000),
    tagParent: "CPU",
    tagChild: "SoSanh",
    initialComments: mockComments.filter(c => c.post_id === 3),
    initialLikes: [],
    initialFavorites: [],
  },
];

const Resources: React.FC = () => {
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="px-16 py-8">
      <ContentHeader title="về Tài nguyên học tập" onCreate={() => setShowCreate(true)} />
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
                  status: "published",
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
      {mockPosts.map((post) => (
        <Content
          key={post.id}
          id={post.id}
          user_id={post.user_id}
          title={post.title}
          createdAt={post.createdAt}
          updated_at={post.updated_at}
          tagParent={post.tagParent}
          tagChild={post.tagChild}
          content={post.content}
          status={post.status}
          likes={post.likes}
          comments={post.comments}
          initialComments={post.initialComments}
          initialLikes={post.initialLikes}
          initialFavorites={post.initialFavorites}
        />
      ))}
    </div>
  );
};
export default Resources;