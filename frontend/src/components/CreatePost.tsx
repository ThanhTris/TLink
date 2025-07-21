import React, { useState } from "react";
import Button from "./Button";
import Select from "react-select";

const tagOptions = [
  { parent: "Thảo luận chung", children: ["Giới thiệu – Làm quen", "Chuyện ngoài IT (off-topic)"] },
  {
    parent: "Lập trình",
    children: ["HTML", "CSS", "JavaScript", "React", "Node.js", "Java", "PHP", "Android", "iOS", "Flutter"],
  },
  { parent: "Hệ điều hành", children: ["Windows", "Linux / Ubuntu", "macOS"] },
  { parent: "Bảo mật & mạng", children: ["An ninh mạng", "Hệ thống mạng (cấu hình, lỗi…)"] },
  { parent: "Tài nguyên học tập", children: ["Tài liệu – Khóa học", "Chia sẻ kinh nghiệm học IT"] },
  { parent: "Tuyển dụng & nghề nghiệp", children: ["Việc làm IT", "CV, phỏng vấn, lộ trình"] },
];

interface CreatePostProps {
  onCancel?: () => void;
  onSubmit?: (data: { title: string; content: string; user_id: number; tagParent: string; tagChild: string }) => void;
}

const CreatePost: React.FC<CreatePostProps> = ({ onCancel, onSubmit }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tagParent, setTagParent] = useState(tagOptions[0]?.parent || "");
  const [tagChild, setTagChild] = useState(tagOptions[0]?.children[0] || "");
  const user_id = 1;

  const parentOptions = tagOptions.map((tag) => ({ value: tag.parent, label: tag.parent }));
  const childOptions =
    tagOptions.find((t) => t.parent === tagParent)?.children.map((child) => ({ value: child, label: child })) || [];

  const handleSubmit = () => {
    onSubmit?.({ title, content, user_id, tagParent, tagChild });
  };

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
        <label className="block font-medium mb-1">Thẻ</label>
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
                menu: (base) => ({ ...base, maxHeight: 200, overflowY: "auto" }),
                menuList: (base) => ({ ...base, maxHeight: 200 }),
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
                menu: (base) => ({ ...base, maxHeight: 200, overflowY: "auto" }),
                menuList: (base) => ({ ...base, maxHeight: 200 }),
              }}
            />
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-3 mt-8">
        <Button className="bg-gray-100 text-black px-6 py-2 rounded-full hover:bg-gray-200 transition" onClick={onCancel}>
          Hủy
        </Button>
        <Button
          className="bg-blue-500 text-white px-6 py-2 rounded-full hover:bg-blue-600 transition"
          onClick={handleSubmit}
        >
          Đăng bài
        </Button>
      </div>
    </div>
  );
};

export default CreatePost;