import React, { useState } from "react";
import ContentHeader from "../components/ContentHeader";
import CreatePost from "../components/CreatePost";
import Content from "../components/Content";

const Home: React.FC = () => {
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="mx-20 my-8">
      <ContentHeader title="Mới nhất" onCreate={() => setShowCreate(true)} />
      {showCreate && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="w-full max-w-2xl">
            <CreatePost
              onCancel={() => setShowCreate(false)}
              onSubmit={(data) => {
                // Xử lý đăng bài ở đây
                setShowCreate(false);
              }}
            />
          </div>
        </div>
      )}
      <Content
        title="Hướng dẫn lắp ráp PC gaming từ A đến Z"
        author="Nguyễn Văn A"
        createdAt={new Date(Date.now() - 60 * 60 * 1000)} // 1 giờ trước
        tags={["PhầnCứng", "PCGaming"]}
        content="Bài viết chi tiết hướng dẫn từng bước lắp ráp một bộ PC gaming mạnh mẽ, từ chọn linh kiện đến cài đặt phần mềm cơ bản. Phù hợp cho người mới bắt đầu và cả những người muốn nâng cấp."
        likes={120}
        comments={45}
      />

      <Content
        title="Hướng dẫn lắp ráp PC gaming từ A đến Z"
        author="Nguyễn Văn A"
        createdAt={new Date(Date.now() - 60 * 60 * 1000)} // 1 giờ trước
        tags={["PhầnCứng", "PCGaming"]}
        content="Bài viết chi tiết hướng dẫn từng bước lắp ráp một bộ PC gaming mạnh mẽ, từ chọn linh kiện đến cài đặt phần mềm cơ bản. Phù hợp cho người mới bắt đầu và cả những người muốn nâng cấp."
        likes={120}
        comments={45}
      />
      <Content
        title="Hướng dẫn lắp ráp PC gaming từ A đến Z"
        author="Nguyễn Văn A"
        createdAt={new Date(Date.now() - 60 * 60 * 1000)} // 1 giờ trước
        tags={["PhầnCứng", "PCGaming"]}
        content="Bài viết chi tiết hướng dẫn từng bước lắp ráp một bộ PC gaming mạnh mẽ, từ chọn linh kiện đến cài đặt phần mềm cơ bản. Phù hợp cho người mới bắt đầu và cả những người muốn nâng cấp."
        likes={120}
        comments={45}
      />
    </div>
  );
};

export default Home;
