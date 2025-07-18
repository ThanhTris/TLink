import React, { useState } from "react";
import Button from "./Button";
import Select from "react-select";

// Dữ liệu tĩnh lấy từ Sidebar
const tagOptions = [
  {
    parent: "Thảo luận chung",
    children: ["Giới thiệu – Làm quen", "Chuyện ngoài IT (off-topic)"],
  },
  {
    parent: "Lập trình",
    children: [
      "Frontend",
      "HTML",
      "CSS",
      "JavaScript",
      "React",
      "Backend",
      "Node.js",
      "Java",
      "PHP",
      "Mobile",
      "Android",
      "iOS",
      "Flutter",
    ],
  },
  {
    parent: "Hệ điều hành",
    children: ["Windows", "Linux / Ubuntu", "macOS"],
  },
  {
    parent: "Bảo mật & mạng",
    children: ["An ninh mạng", "Hệ thống mạng (cấu hình, lỗi…)"],
  },
  {
    parent: "Tài nguyên học tập",
    children: ["Tài liệu – Khóa học", "Chia sẻ kinh nghiệm học IT"],
  },
  {
    parent: "Tuyển dụng & nghề nghiệp",
    children: ["Việc làm IT", "CV, phỏng vấn, lộ trình"],
  },
];

interface CreatePostProps {
  onCancel?: () => void;
  onSubmit?: (data: {
    title: string;
    content: string;
    tagParent: string;
    tagChild: string;
  }) => void;
}

const CreatePost: React.FC<CreatePostProps> = ({ onCancel, onSubmit }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tagParent, setTagParent] = useState(tagOptions[0]?.parent || "");
  const [tagChild, setTagChild] = useState(tagOptions[0]?.children[0] || "");

  const parentOptions = tagOptions.map((tag) => ({
    value: tag.parent,
    label: tag.parent,
  }));

  const childOptions =
    tagOptions
      .find((t) => t.parent === tagParent)
      ?.children.map((child) => ({
        value: child,
        label: child,
      })) || [];

  return (
    <div className="bg-gray-50 rounded-xl p-8 max-w-2xl mx-auto">
      <h3 className="text-xl font-semibold mb-6">Tạo bài viết mới</h3>
      <div className="mb-4">
        <label className="block font-medium mb-1">Tiêu đề bài viết</label>
        <input
          type="text"
          placeholder="Nhập tiêu đề bài viết của bạn..."
          className="w-full bg-transparent border-b border-gray-300 py-2 outline-none"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div className="mb-4">
        <label className="block font-medium mb-1">Nội dung</label>
        <textarea
          placeholder="Viết nội dung bài viết của bạn ở đây..."
          className="w-full bg-transparent border-b border-gray-300 py-2 outline-none min-h-[80px]"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>
      <div className="mb-4">
        <label className="block font-medium mb-1">Thể Loại</label>
        <div className="flex gap-4">
          <div className="w-1/2">
            <Select
              options={parentOptions}
              value={parentOptions.find((opt) => opt.value === tagParent)}
              onChange={(opt) => {
                setTagParent(opt?.value || "");
                const found = tagOptions.find((t) => t.parent === opt?.value);
                setTagChild(found?.children[0] || "");
              }}
              menuPlacement="auto"
              styles={{
                menu: (base) => ({
                  ...base,
                  maxHeight: 200, // Giới hạn chiều cao tối đa (khoảng 8-10 item)
                  overflowY: "auto", // Thêm thanh cuộn nếu vượt quá
                }),
                menuList: (base) => ({
                  ...base,
                  maxHeight: 200, // Đảm bảo menuList cũng giới hạn
                }),
              }}
            />
          </div>
          <div className="w-1/2">
            <Select
              options={childOptions}
              value={childOptions.find((opt) => opt.value === tagChild)}
              onChange={(opt) => setTagChild(opt?.value || "")}
              menuPlacement="auto"
              styles={{
                menu: (base) => ({
                  ...base,
                  maxHeight: 200, // Giới hạn chiều cao tối đa
                  overflowY: "auto", // Thêm thanh cuộn nếu vượt quá
                }),
                menuList: (base) => ({
                  ...base,
                  maxHeight: 200, // Đảm bảo menuList cũng giới hạn
                }),
              }}
            />
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-3 mt-8">
        <Button
          className="bg-gray-100 text-gray-500 px-6 py-2 rounded-full hover:bg-gray-200 transition"
          onClick={onCancel}
        >
          Hủy
        </Button>
        <Button
          className="bg-blue-500 text-white px-6 py-2 rounded-full hover:bg-blue-600 transition"
          onClick={() => onSubmit?.({ title, content, tagParent, tagChild })}
        >
          Đăng bài
        </Button>
      </div>
    </div>
  );
};

export default CreatePost;