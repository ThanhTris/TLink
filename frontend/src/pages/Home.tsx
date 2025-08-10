import React, { useState } from "react";
import ContentHeader from "../components/ContentHeader";
import CreatePost from "../components/CreatePost";
import Content from "../components/ContentPost";

// Sửa mockComments theo FEComment/CommentIteam (like_count, is_like; bỏ avatarSrc)
const mockComments = [
  // Post 1
  {
    id: 1,
    post_id: 1,
    user_id: 1,
    parent_id: null,
    level: 1,
    content: "Bài viết rất chi tiết và dễ hiểu, cảm ơn tác giả nhiều!",
    createdAt: new Date(Date.now() - 5 * 60 * 1000),
    like_count: 4,
    is_like: false,
  },
  {
    id: 2,
    post_id: 1,
    user_id: 2,
    parent_id: 1,
    level: 2,
    content: "Bạn có thể chia sẻ thêm về lựa chọn card màn hình không?",
    createdAt: new Date(Date.now() - 4 * 60 * 1000),
    like_count: 1,
    is_like: false,
  },
  {
    id: 3,
    post_id: 1,
    user_id: 1,
    parent_id: 2,
    level: 3,
    content: "Mình sẽ bổ sung chi tiết về card màn hình ở phần sau nhé!",
    createdAt: new Date(Date.now() - 3 * 60 * 1000),
    like_count: 2,
    is_like: false,
  },
  {
    id: 4,
    post_id: 1,
    user_id: 3,
    parent_id: 2,
    level: 3,
    content: "Mình cũng quan tâm chủ đề này, cảm ơn bạn đã hỏi!",
    createdAt: new Date(Date.now() - 2 * 60 * 1000),
    like_count: 0,
    is_like: false,
  },
  {
    id: 5,
    post_id: 1,
    user_id: 4,
    parent_id: 1,
    level: 2,
    content: "Đồng ý, rất hữu ích!",
    createdAt: new Date(Date.now() - 3 * 60 * 1000),
    like_count: 2,
    is_like: false,
  },
  {
    id: 6,
    post_id: 1,
    user_id: 5,
    parent_id: 5,
    level: 3,
    content: "Cảm ơn các bạn đã đọc!",
    createdAt: new Date(Date.now() - 1 * 60 * 1000),
    like_count: 1,
    is_like: false,
  },
  {
    id: 7,
    post_id: 1,
    user_id: 9,
    parent_id: null,
    level: 1,
    content: "Mình đã thử và thành công, cảm ơn tác giả!",
    createdAt: new Date(Date.now() - 10 * 60 * 1000),
    like_count: 3,
    is_like: false,
  },
  {
    id: 8,
    post_id: 1,
    user_id: 10,
    parent_id: null,
    level: 1,
    content: "Mình cần thêm thông tin về nguồn điện, bạn có thể bổ sung không?",
    createdAt: new Date(Date.now() - 45 * 60 * 1000),
    like_count: 3,
    is_like: false,
  },
  {
    id: 9,
    post_id: 1,
    user_id: 11,
    parent_id: 10,
    level: 2,
    content: "Mình sẽ cập nhật thông tin về nguồn điện trong bài viết sau nhé!",
    createdAt: new Date(Date.now() - 30 * 60 * 1000),
    like_count: 2,
    is_like: false,
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
    like_count: 4,
    is_like: false,
  },
  {
    id: 10,
    post_id: 2,
    user_id: 2,
    parent_id: 9,
    level: 2,
    content: "Cảm ơn bạn! Bạn thử giảm thêm setting không?",
    createdAt: new Date(Date.now() - 30 * 60 * 1000),
    like_count: 1,
    is_like: false,
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
    like_count: 6,
    is_like: false,
  },
  {
    id: 12,
    post_id: 3,
    user_id: 3,
    parent_id: 11,
    level: 2,
    content: "Đúng vậy, đặc biệt với dòng Ryzen 9!",
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    like_count: 3,
    is_like: false,
  },
  {
    id: 13,
    post_id: 3,
    user_id: 6,
    parent_id: null,
    level: 1,
    content: "Intel vẫn tốt hơn cho overclocking.",
    createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000),
    like_count: 2,
    is_like: false,
  },
];

// Giả lập dữ liệu users
const mockUsers = [
  { id: 2, name: "Nguyễn Văn A" },
  { id: 4, name: "Trần Thị B" },
  { id: 5, name: "Lê Văn C" },
];

// Giả lập dữ liệu post_likes
const mockPostLikes = [
  { post_id: 1, user_id: 2 },
  { post_id: 1, user_id: 4 },
  { post_id: 2, user_id: 4 },
  { post_id: 3, user_id: 5 },
  { post_id: 3, user_id: 2 },
];

// Giả lập dữ liệu post_saves
const mockPostSaves = [
  { post_id: 1, user_id: 2 },
  { post_id: 2, user_id: 4 },
];

// Giả lập dữ liệu parent_tags
const mockParentTags = [
  { id: 1, name: "PhầnCứng" },
  { id: 2, name: "TốiƯu" },
  { id: 3, name: "CPU" },
];

// Giả lập dữ liệu child_tags
const mockChildTags = [
  { id: 1, name: "PCGaming", parent_tag_id: 1 },
  { id: 2, name: "Game", parent_tag_id: 2 },
  { id: 3, name: "SoSanh", parent_tag_id: 3 },
];

// Giả lập dữ liệu post_parent_tags
const mockPostParentTags = [
  { post_id: 1, parent_tag_id: 1 },
  { post_id: 2, parent_tag_id: 2 },
  { post_id: 3, parent_tag_id: 3 },
];

// Giả lập dữ liệu post_child_tags
const mockPostChildTags = [
  { post_id: 1, child_tag_id: 1 },
  { post_id: 2, child_tag_id: 2 },
  { post_id: 3, child_tag_id: 3 },
];

// Hàm lấy số lượng like của post
function getLikeCount(post_id: number) {
  return mockPostLikes.filter(like => like.post_id === post_id).length;
}

// Hàm lấy số lượng comment của post
function getCommentCount(post_id: number) {
  return mockComments.filter(c => c.post_id === post_id).length;
}

// Hàm kiểm tra is_saved
function isSaved(post_id: number, user_id: number) {
  return mockPostSaves.some(save => save.post_id === post_id && save.user_id === user_id);
}

// Hàm kiểm tra is_like
function isLike(post_id: number, user_id: number) {
  return mockPostLikes.some(like => like.post_id === post_id && like.user_id === user_id);
}

// Hàm lấy tên parent_tags của post
function getParentTagNames(post_id: number) {
  return mockPostParentTags
    .filter(pt => pt.post_id === post_id)
    .map(pt => mockParentTags.find(tag => tag.id === pt.parent_tag_id)?.name ?? "Unknown");
}

// Hàm lấy tên child_tags của post
function getChildTagNames(post_id: number) {
  return mockPostChildTags
    .filter(ct => ct.post_id === post_id)
    .map(ct => mockChildTags.find(tag => tag.id === ct.child_tag_id)?.name ?? "Unknown");
}

const currentUserId = 2; // user hiện tại (bạn)

// Tạo mockPosts mới đúng chuẩn yêu cầu
const mockPosts = [
  {
    id: 1,
    user_id: 2,
    name: mockUsers.find(u => u.id === 2)?.name ?? "Unknown",
    title: "Hướng dẫn lắp ráp PC gaming từ A đến Z",
    content: "Bài viết chi tiết hướng dẫn từng bước lắp ráp một bộ PC gaming mạnh mẽ...",
    like_count: getLikeCount(1),
    comment_count: getCommentCount(1),
    is_saved: isSaved(1, currentUserId),
    is_like: isLike(1, currentUserId),
    created_at: new Date(Date.now() - 60 * 60 * 1000),
    parent_tags: getParentTagNames(1),
    child_tags: getChildTagNames(1),
  },
  {
    id: 2,
    user_id: 4,
    name: mockUsers.find(u => u.id === 4)?.name ?? "Unknown",
    title: "Tối ưu FPS cho game thủ",
    content: "Một số mẹo giúp tăng FPS khi chơi game...",
    like_count: getLikeCount(2),
    comment_count: getCommentCount(2),
    is_saved: isSaved(2, currentUserId),
    is_like: isLike(2, currentUserId),
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000),
    parent_tags: getParentTagNames(2),
    child_tags: getChildTagNames(2),
  },
  {
    id: 3,
    user_id: 5,
    name: mockUsers.find(u => u.id === 5)?.name ?? "Unknown",
    title: "So sánh AMD và Intel mới nhất",
    content: "Bài viết phân tích chi tiết về hai dòng CPU phổ biến...",
    like_count: getLikeCount(3),
    comment_count: getCommentCount(3),
    is_saved: isSaved(3, currentUserId),
    is_like: isLike(3, currentUserId),
    created_at: new Date(Date.now() - 3 * 60 * 60 * 1000),
    parent_tags: getParentTagNames(3),
    child_tags: getChildTagNames(3),
  },
];

const home: React.FC = () => {
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
          initialComments={mockComments.filter(c => c.post_id === post.id)} // thêm
        />
      ))}
    </div>
  );
};
export default home;