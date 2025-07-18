import React, { useState } from "react";
import ContentHeader from "../components/ContentPostHeader";
import CreatePost from "../components/CreatePost";
import Content from "../components/ContentPost";

// Định nghĩa interface cho Comment
interface Comment {
  id: number;
  author: string;
  content: string;
  createdAt: Date;
  likes: number;
  replies: Comment[];
  isEditing?: boolean;
  avatarSrc: string;
}

// Dữ liệu mẫu cho các bài viết
const mockPosts = [
  {
    id: 1,
    title: "Hướng dẫn lắp ráp PC gaming từ A đến Z",
    author: "Nguyễn Văn A",
    createdAt: new Date(Date.now() - 60 * 60 * 1000), // 1 giờ trước
    tags: ["PhầnCứng", "PCGaming"],
    content:
      "Bài viết chi tiết hướng dẫn từng bước lắp ráp một bộ PC gaming mạnh mẽ, từ chọn linh kiện đến cài đặt phần mềm cơ bản. Phù hợp cho người mới bắt đầu và cả những người muốn nâng cấp.",
    likes: 120,
    comments: 45,
    initialComments: [
      {
        id: 1,
        author: "Trần Thị B",
        content: "Cảm ơn bạn, bài viết rất hữu ích!",
        createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 phút trước
        likes: 5,
        replies: [
          {
            id: 2,
            author: "Nguyễn Văn A",
            content: "Cảm ơn bạn! Mình sẽ cập nhật thêm video hướng dẫn.",
            createdAt: new Date(Date.now() - 15 * 60 * 1000), // 15 phút trước
            likes: 2,
            replies: [],
            avatarSrc: "https://th.bing.com/th/id/OIP.yGZbQOjxXDG_TrUC67FWtwHaGS?w=224&h=190&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3",
          },
        ],
        avatarSrc: "https://tse1.mm.bing.net/th/id/OIP.hjFOYx5pbMGSQ2bODUjn6AHaHa?rs=1&pid=ImgDetMain&o=7&rm=3",
      },
      {
        id: 3,
        author: "Lê Văn C",
        content: "Mình cần thêm thông tin về nguồn điện, bạn có thể bổ sung không?",
        createdAt: new Date(Date.now() - 45 * 60 * 1000), // 45 phút trước
        likes: 3,
        replies: [],
        avatarSrc: "https://tse1.mm.bing.net/th/id/OIP.yptIBi6t7e8DMnxSNFHBTgHaHE?w=600&h=573&rs=1&pid=ImgDetMain&o=7&rm=3",
      },
    ],
  },
  {
    id: 2,
    title: "Mẹo tối ưu hóa FPS trong game",
    author: "Trần Thị B",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 giờ trước
    tags: ["Game", "HiệuSuất"],
    content:
      "Hướng dẫn chi tiết cách tối ưu hóa FPS để chơi game mượt mà hơn, bao gồm cài đặt phần mềm và phần cứng.",
    likes: 85,
    comments: 30,
    initialComments: [
      {
        id: 4,
        author: "Phạm Văn D",
        content: "Mẹo này thật sự hiệu quả, FPS tăng rõ rệt!",
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 giờ trước
        likes: 4,
        replies: [
          {
            id: 5,
            author: "Trần Thị B",
            content: "Cảm ơn bạn! Bạn thử giảm thêm setting không?",
            createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 phút trước
            likes: 1,
            replies: [],
            avatarSrc: "https://tse1.mm.bing.net/th/id/OIP.hjFOYx5pbMGSQ2bODUjn6AHaHa?rs=1&pid=ImgDetMain&o=7&rm=3",
          },
        ],
        avatarSrc: "https://th.bing.com/th/id/R.f6829313c230739ceae4a2dfe6bfde96?rik=h8vIHVeE%2f1IN%2fA&riu=http%3a%2f%2fwww.hdwallpapers.in%2fwalls%2fanime_girl_192-normal5.4.jpg&ehk=UYZcmU5ScnjoAQ9CiP%2bw7u9dFQsl%2bxTkxOI8xUqWcCQ%3d&risl=&pid=ImgRaw&r=0",
      },
    ],
  },
  {
    id: 3,
    title: "So sánh CPU Intel vs AMD 2025",
    author: "Lê Văn C",
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 ngày trước
    tags: ["PhầnCứng", "SoSánh"],
    content:
      "Phân tích chi tiết hiệu năng và giá cả giữa các dòng CPU Intel và AMD mới nhất trong năm 2025.",
    likes: 200,
    comments: 60,
    initialComments: [
      {
        id: 6,
        author: "Hoàng Thị E",
        content: "AMD có vẻ đáng tiền hơn, bạn nghĩ sao?",
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 giờ trước
        likes: 6,
        replies: [
          {
            id: 7,
            author: "Lê Văn C",
            content: "Đúng vậy, đặc biệt với dòng Ryzen 9!",
            createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 giờ trước
            likes: 3,
            replies: [],
            avatarSrc: "https://tse1.mm.bing.net/th/id/OIP.yptIBi6t7e8DMnxSNFHBTgHaHE?w=600&h=573&rs=1&pid=ImgDetMain&o=7&rm=3",
          },
        ],
        avatarSrc: "https://tse4.mm.bing.net/th/id/OIP.iRPRnmiICADP6aEVTvEoswHaJ4?rs=1&pid=ImgDetMain&o=7&rm=3",
      },
      {
        id: 8,
        author: "Nguyễn Văn F",
        content: "Intel vẫn tốt hơn cho overclocking.",
        createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000), // 18 giờ trước
        likes: 2,
        replies: [],
        avatarSrc: "https://tse4.mm.bing.net/th/id/OIP.0muxMegycGNRNpSw76aXSQHaFj?w=2048&h=1536&rs=1&pid=ImgDetMain&o=7&rm=3",
      },
    ],
  },
];

const Home: React.FC = () => {
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="px-16 py-8">
      <ContentHeader title="Mới nhất" onCreate={() => setShowCreate(true)} />
      {showCreate && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="w-full max-w-2xl">
            <CreatePost
              onCancel={() => setShowCreate(false)}
              onSubmit={(data) => {
                // Xử lý đăng bài ở đây (ví dụ: thêm vào mockPosts)
                const newPost = {
                  id: Date.now(),
                  ...data,
                  createdAt: new Date(),
                  likes: 0,
                  comments: 0,
                  initialComments: [],
                };
                // Cập nhật mockPosts (nếu dùng state)
                // setMockPosts((prev) => [...prev, newPost]);
                setShowCreate(false);
              }}
            />
          </div>
        </div>
      )}
      {/* Sử dụng map để render danh sách bài viết */}
      {mockPosts.map((post) => (
        <Content
          key={post.id}
          title={post.title}
          author={post.author}
          createdAt={post.createdAt}
          tags={post.tags}
          content={post.content}
          likes={post.likes}
          comments={post.comments}
          initialComments={post.initialComments} // Chỉ truyền initialComments, không cần avatarSrc riêng
        />
      ))}
    </div>
  );
};

export default Home;