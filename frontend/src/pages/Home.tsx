import React, { useState } from "react";
import ContentHeader from "../components/ContentHeader";
import CreatePost from "../components/CreatePost";
import Content from "../components/ContentPost";

interface Comment {
  id: number;
  post_id: number;
  user_id: number;
  content: string;
  createdAt: Date;
  likes: number;
  replies: Comment[];
  isEditing?: boolean;
  avatarSrc: string;
}

interface Like {
  id: number;
  comment_id: number;
  user_id: number;
  created_at: Date;
}

interface Favorite {
  id: number;
  post_id: number;
  user_id: number;
  created_at: Date;
}

const mockPosts = [
  {
    id: 1,
    user_id: 1,
    title: "Hướng dẫn lắp ráp PC gaming từ A đến Z",
    content:
      "Bài viết chi tiết hướng dẫn từng bước lắp ráp một bộ PC gaming mạnh mẽ, từ chọn linh kiện đến cài đặt phần mềm cơ bản. Phù hợp cho người mới bắt đầu và cả những người muốn nâng cấp.",
    status: "published",
    likes: 120,
    comments: 45,
    createdAt: new Date(Date.now() - 60 * 60 * 1000),
    updated_at: new Date(),
    tagParent: "PhầnCứng",
    tagChild: "PCGaming",
    initialComments: [
      {
        id: 1,
        post_id: 1,
        user_id: 2,
        content: "Bài viết rất chi tiết và dễ hiểu, cảm ơn tác giả nhiều!",
        createdAt: new Date(Date.now() - 5 * 60 * 1000),
        likes: 4,
        avatarSrc: "https://randomuser.me/api/portraits/women/44.jpg",
        replies: [
          {
            id: 2,
            post_id: 1,
            user_id: 3,
            content: "Đồng ý, rất hữu ích!",
            createdAt: new Date(Date.now() - 3 * 60 * 1000),
            likes: 2,
            avatarSrc: "https://randomuser.me/api/portraits/men/33.jpg",
            replies: [
              {
                id: 3,
                post_id: 1,
                user_id: 4,
                content: "Cảm ơn các bạn đã đọc!",
                createdAt: new Date(Date.now() - 1 * 60 * 1000),
                likes: 1,
                avatarSrc: "https://randomuser.me/api/portraits/women/35.jpg",
                replies: [
                  {
                    id: 4,
                    post_id: 1,
                    user_id: 5,
                    content: "Không có gì!",
                    createdAt: new Date(Date.now() - 30 * 1000),
                    likes: 0,
                    avatarSrc: "https://randomuser.me/api/portraits/men/21.jpg",
                    replies: [],
                  },
                  {
                    id: 5,
                    post_id: 1,
                    user_id: 6,
                    content: "Thật tuyệt vời!",
                    createdAt: new Date(Date.now() - 2 * 60 * 1000),
                    likes: 1,
                    avatarSrc:
                      "https://randomuser.me/api/portraits/women/11.jpg",
                    replies: [
                      {
                        id: 6,
                        post_id: 1,
                        user_id: 7,
                        content: "Cảm ơn bạn!",
                        createdAt: new Date(Date.now() - 1 * 60 * 1000),
                        likes: 0,
                        avatarSrc:
                          "https://randomuser.me/api/portraits/women/17.jpg",
                        replies: [],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        id: 7,
        post_id: 1,
        user_id: 8,
        content: "Mình đã thử và thành công, cảm ơn tác giả!",
        createdAt: new Date(Date.now() - 10 * 60 * 1000),
        likes: 3,
        avatarSrc: "https://randomuser.me/api/portraits/women/12.jpg",
        replies: [],
      },
      {
        id: 3,
        post_id: 1,
        user_id: 3,
        content:
          "Mình cần thêm thông tin về nguồn điện, bạn có thể bổ sung không?",
        createdAt: new Date(Date.now() - 45 * 60 * 1000),
        likes: 3,
        replies: [],
        avatarSrc:
          "https://tse1.mm.bing.net/th/id/OIP.yptIBi6t7e8DMnxSNFHBTgHaHE?w=600&h=573&rs=1&pid=ImgDetMain&o=7&rm=3",
      },
    ],
    initialLikes: [],
    initialFavorites: [],
  },
  {
    id: 2,
    user_id: 2,
    title: "Mẹo tối ưu hóa FPS trong game",
    content:
      "Hướng dẫn chi tiết cách tối ưu hóa FPS để chơi game mượt mà hơn, bao gồm cài đặt phần mềm và phần cứng.",
    status: "published",
    likes: 85,
    comments: 30,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    updated_at: new Date(),
    tagParent: "Game",
    tagChild: "HiệuSuất",
    initialComments: [
      {
        id: 4,
        post_id: 2,
        user_id: 4,
        content: "Mẹo này thật sự hiệu quả, FPS tăng rõ rệt!",
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
        likes: 4,
        replies: [
          {
            id: 5,
            post_id: 2,
            user_id: 2,
            content: "Cảm ơn bạn! Bạn thử giảm thêm setting không?",
            createdAt: new Date(Date.now() - 30 * 60 * 1000),
            likes: 1,
            replies: [],
            avatarSrc:
              "https://tse1.mm.bing.net/th/id/OIP.hjFOYx5pbMGSQ2bODUjn6AHaHa?rs=1&pid=ImgDetMain&o=7&rm=3",
          },
        ],
        avatarSrc:
          "https://th.bing.com/th/id/R.f6829313c230739ceae4a2dfe6bfde96?rik=h8vIHVeE%2f1IN%2fA&riu=http%3a%2f%2fwww.hdwallpapers.in%2fwalls%2fanime_girl_192-normal5.4.jpg&ehk=UYZcmU5ScnjoAQ9CiP%2bw7u9dFQsl%2bxTkxOI8xUqWcCQ%3d&risl=&pid=ImgRaw&r=0",
      },
    ],
    initialLikes: [],
    initialFavorites: [],
  },
  {
    id: 3,
    user_id: 3,
    title: "So sánh CPU Intel vs AMD 2025",
    content:
      "Phân tích chi tiết hiệu năng và giá cả giữa các dòng CPU Intel và AMD mới nhất trong năm 2025.",
    status: "published",
    likes: 200,
    comments: 60,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    updated_at: new Date(),
    tagParent: "PhầnCứng",
    tagChild: "SoSánh",
    initialComments: [
      {
        id: 6,
        post_id: 3,
        user_id: 5,
        content: "AMD có vẻ đáng tiền hơn, bạn nghĩ sao?",
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
        likes: 6,
        replies: [
          {
            id: 7,
            post_id: 3,
            user_id: 3,
            content: "Đúng vậy, đặc biệt với dòng Ryzen 9!",
            createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
            likes: 3,
            replies: [],
            avatarSrc:
              "https://tse1.mm.bing.net/th/id/OIP.yptIBi6t7e8DMnxSNFHBTgHaHE?w=600&h=573&rs=1&pid=ImgDetMain&o=7&rm=3",
          },
        ],
        avatarSrc:
          "https://tse4.mm.bing.net/th/id/OIP.iRPRnmiICADP6aEVTvEoswHaJ4?rs=1&pid=ImgDetMain&o=7&rm=3",
      },
      {
        id: 8,
        post_id: 3,
        user_id: 6,
        content: "Intel vẫn tốt hơn cho overclocking.",
        createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000),
        likes: 2,
        replies: [],
        avatarSrc:
          "https://tse4.mm.bing.net/th/id/OIP.0muxMegycGNRNpSw76aXSQHaFj?w=2048&h=1536&rs=1&pid=ImgDetMain&o=7&rm=3",
      },
    ],
    initialLikes: [],
    initialFavorites: [],
  },
];

const Home: React.FC = () => {
  const [showCreate, setShowCreate] = useState(false);

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

export default Home;
