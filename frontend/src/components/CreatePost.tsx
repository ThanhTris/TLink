import React, { useEffect, useRef, useState } from "react";
import Button from "./Button";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import {getCurrentUserIdFromLocalStorage } from "../api/post";

import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List as ListIcon,
  Link as LinkIcon,
  Image as ImageIcon,
  Paperclip,
  Smile,
  X,
} from "lucide-react";
import { createPost, uploadPostImage, uploadPostFile, updatePost as apiUpdatePost } from "../api/post";

const tagOptions = [
  {
    parent: "Thảo luận chung",
    children: ["Giới thiệu – Làm quen", "Chuyện ngoài IT (off-topic)"],
  },
  {
    parent: "Lập trình",
    children: [
      "HTML",
      "CSS",
      "JavaScript",
      "React",
      "Node.js",
      "Java",
      "PHP",
      "Android",
      "iOS",
      "Flutter",
    ],
  },
  { parent: "Hệ điều hành", children: ["Windows", "Linux / Ubuntu", "macOS"] },
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
    authorId: number;
    tagParent: string;
    tagChild?: string;
    childTags?: string[];
    imageFiles?: File[];
    docFiles?: File[];
    // thêm: dữ liệu tồn tại (khi chỉnh sửa)
    existingImageUrls?: string[];
    existingDocUrls?: { name: string; url: string }[];
  }) => void;
  // thêm: hỗ trợ chế độ chỉnh sửa với dữ liệu ban đầu
  mode?: "create" | "edit";
  initialTitle?: string;
  initialContent?: string;
  initialTagParent?: string;
  initialChildTags?: string[];
  initialImageUrls?: string[];
  initialDocUrls?: { name: string; url: string }[];
  heading?: string;
  submitLabel?: string;
  postId?: number; // thêm prop này để biết đang edit bài nào
}

const CreatePost: React.FC<CreatePostProps> = ({
  onCancel,
  onSubmit,
  mode = "create",
  initialTitle,
  initialContent,
  initialTagParent,
  initialChildTags,
  initialImageUrls = [],
  initialDocUrls = [],
  heading,
  submitLabel,
  postId, // nhận prop postId
}) => {
  const isEdit = mode === "edit";

  const [title, setTitle] = useState(initialTitle || "");
  const [content, setContent] = useState(initialContent || "");
  const [tagParent, setTagParent] = useState(
    initialTagParent || tagOptions[0]?.parent || "Thảo luận chung"
  );
  const [childTags, setChildTags] = useState<string[]>(initialChildTags || []);

  // ảnh: tách ảnh tồn tại vs ảnh mới
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>(initialImageUrls || []);
  const [imageOrigins, setImageOrigins] = useState<("existing" | "new")[]>(
    (initialImageUrls || []).map(() => "existing")
  );

  // tài liệu: tách tài liệu tồn tại vs tài liệu mới
  const [docFiles, setDocFiles] = useState<File[]>([]);
  const [existingDocUrls, setExistingDocUrls] = useState<{ name: string; url: string }[]>(
    initialDocUrls || []
  );

  const [imagePreviewsStateVersion] = useState(0); // giữ place-holder cho deps cleanup

  const authorIdRaw = getCurrentUserIdFromLocalStorage();
  const authorId = typeof authorIdRaw === "number" && Number.isFinite(authorIdRaw) ? authorIdRaw : 0; // fallback 0 nếu null

  const parentOptions = tagOptions.map((tag) => ({
    value: tag.parent,
    label: tag.parent,
  }));
  const childOptions =
    tagOptions
      .find((t) => t.parent === tagParent)
      ?.children.map((child) => ({ value: child, label: child })) || [];

  // markdown helpers
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const surroundSelection = (left: string, right: string = left) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart ?? 0;
    const end = ta.selectionEnd ?? 0;
    const before = content.slice(0, start);
    const selected = content.slice(start, end);
    const after = content.slice(end);
    const next = before + left + selected + right + after;
    setContent(next);
    setTimeout(() => {
      ta.focus();
      ta.selectionStart = start + left.length;
      ta.selectionEnd = end + left.length;
    }, 0);
  };
  const insertAtCursor = (txt: string) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart ?? 0;
    const end = ta.selectionEnd ?? 0;
    const before = content.slice(0, start);
    const after = content.slice(end);
    const next = before + txt + after;
    setContent(next);
    setTimeout(() => {
      ta.focus();
      const pos = start + txt.length;
      ta.selectionStart = pos;
      ta.selectionEnd = pos;
    }, 0);
  };

  // file helpers
  const imgInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const addFiles = (files: File[]) => {
    const imgs = files.filter((f) => f.type.startsWith("image/"));
    const docs = files.filter((f) => !f.type.startsWith("image/"));
    if (imgs.length) {
      setImageFiles((prev) => [...prev, ...imgs]);
      imgs.forEach((f) => {
        const url = URL.createObjectURL(f);
        setImagePreviews((prev) => [...prev, url]);
        setImageOrigins((prev) => [...prev, "new"]);
      });
    }
    if (docs.length) setDocFiles((prev) => [...prev, ...docs]);
  };
  const removeImageByIndex = (i: number) => {
    const url = imagePreviews[i];
    const origin = imageOrigins[i];
    if (origin === "new" && url?.startsWith("blob:")) {
      URL.revokeObjectURL(url);
    }
    // nếu là ảnh mới: cần xóa đúng file tương ứng
    if (origin === "new") {
      const nthNew = imageOrigins.slice(0, i).filter((o) => o === "new").length;
      setImageFiles((prev) => prev.filter((_, idx) => idx !== nthNew));
    }
    setImagePreviews((prev) => prev.filter((_, idx) => idx !== i));
    setImageOrigins((prev) => prev.filter((_, idx) => idx !== i));
  };
  const removeDocFileByIndex = (i: number) => {
    setDocFiles((prev) => prev.filter((_, idx) => idx !== i));
  };
  const removeExistingDocByIndex = (i: number) => {
    setExistingDocUrls((prev) => prev.filter((_, idx) => idx !== i));
  };

  // cleanup created object URLs on unmount
  useEffect(() => {
    return () => {
      imagePreviews.forEach((u, idx) => {
        if (imageOrigins[idx] === "new" && typeof u === "string" && u.startsWith("blob:")) {
          URL.revokeObjectURL(u);
        }
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imagePreviewsStateVersion]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files || []);
    addFiles(files);
  };

  const handleSubmit = async () => {
    const keptExistingImageUrls = imagePreviews.filter((_, i) => imageOrigins[i] === "existing");
    try {
      // Đảm bảo childTags là mảng string hoặc undefined
      const payload: any = {
        title,
        content,
        authorId,
        tagParent,
        ...(childTags.length > 0 ? { childTags } : {}),
      };

      let usedPostId = postId;
      if (mode === "edit") {
        // Gọi API cập nhật bài viết
        if (!postId) throw new Error("Thiếu postId để cập nhật");
        await apiUpdatePost(postId, payload);
        usedPostId = postId;
      } else {
        // Gọi API tạo mới bài viết
        const res = await createPost(payload);
        usedPostId = (res as any)?.data?.data;
        if (!usedPostId) throw new Error("Không lấy được postId");
      }

      // 2. Upload ảnh mới (nếu có)
      for (const file of imageFiles) {
        await uploadPostImage(usedPostId, file);
      }

      // 3. Upload file tài liệu mới (nếu có)
      for (const file of docFiles) {
        await uploadPostFile(usedPostId, file);
      }

      // 4. Gọi callback khi xong
      onSubmit?.({
        title,
        content,
        authorId, 
        tagParent,
        ...(childTags.length > 0 ? { childTags } : {}),
        imageFiles: [],
        docFiles: [],
        existingImageUrls: keptExistingImageUrls,
        existingDocUrls: existingDocUrls,
      });
    } catch (err) {
      alert((mode === "edit" ? "Cập nhật" : "Tạo") + " bài viết thất bại: " + (err as any)?.message);
    }
  };

  const canSubmit = title.trim().length > 0 && content.trim().length > 0;
  const headingText = heading || (isEdit ? "Chỉnh sửa bài viết" : "Tạo bài viết mới");
  const submitText = submitLabel || (isEdit ? "Cập nhật" : "Đăng bài");

  return (
    <div className="bg-gray-50 rounded-xl p-6 w-full max-w-3xl mx-auto">
      <h3 className="text-xl font-semibold mb-6">{headingText}</h3>

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
        <label className="block font-medium mb-1">Thẻ</label>
        <div className="flex gap-4">
          <div className="w-2/5 min-w-0">
            <Select
              options={parentOptions}
              value={parentOptions.find((opt) => opt.value === tagParent)}
              onChange={(opt) => {
                const nxt = opt?.value || "Thảo luận chung";
                setTagParent(nxt);
                // reset all child tags when parent changes
                setChildTags([]);
              }}
              menuPlacement="auto"
              styles={{
                menu: (base) => ({
                  ...base,
                  maxHeight: 200,
                  overflowY: "auto",
                }),
                menuList: (base) => ({ ...base, maxHeight: 200 }),
                option: (base) => ({ ...base, cursor: "pointer" }),
                clearIndicator: (base) => ({ ...base, cursor: "pointer" }),
                dropdownIndicator: (base) => ({ ...base, cursor: "pointer" }),
              }}
            />
          </div>
          <div className="w-3/5 min-w-0">
            <CreatableSelect
              isMulti
              options={childOptions}
              value={childTags.map((t) => ({ value: t, label: t }))}
              onChange={(opts) => {
                const arr = Array.isArray(opts) ? opts : [];
                setChildTags(
                  arr.map((o: any) => String(o.value)).filter(Boolean)
                );
              }}
              onCreateOption={(val) => {
                const v = val.trim();
                if (!v) return;
                setChildTags((prev) =>
                  prev.includes(v) ? prev : [...prev, v]
                );
              }}
              isClearable
              placeholder="Chọn hoặc nhập thẻ con (có thể nhiều mục)"
              menuPlacement="auto"
              styles={{
                menu: (base) => ({
                  ...base,
                  maxHeight: 200,
                  overflowY: "auto",
                }),
                menuList: (base) => ({ ...base, maxHeight: 200 }),
                option: (base) => ({ ...base, cursor: "pointer" }),
                multiValueRemove: (base) => ({
                  ...base,
                  cursor: "pointer",
                }),
                clearIndicator: (base) => ({ ...base, cursor: "pointer" }),
                dropdownIndicator: (base) => ({ ...base, cursor: "pointer" }),
              }}
            />
          </div>
        </div>
      </div>

      <div
        className="mb-3 border rounded-md"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        <div className="flex items-center gap-2 px-2 py-2 border-b">
          <Button
            onClick={() => surroundSelection("**")}
            className="px-2"
            title="In đậm"
          >
            <Bold size={16} />
          </Button>
          <Button
            onClick={() => surroundSelection("*")}
            className="px-2"
            title="In nghiêng"
          >
            <Italic size={16} />
          </Button>
          <Button
            onClick={() => surroundSelection("<u>", "</u>")}
            className="px-2"
            title="Gạch chân"
          >
            <UnderlineIcon size={16} />
          </Button>
          <Button
            onClick={() => insertAtCursor("\n- ")}
            className="px-2"
            title="Danh sách"
          >
            <ListIcon size={16} />
          </Button>
          <Button
            onClick={() => insertAtCursor("[liên kết](https://)")}
            className="px-2"
            title="Chèn link"
          >
            <LinkIcon size={16} />
          </Button>
          <Button
            onClick={() => imgInputRef.current?.click()}
            className="px-2"
            title="Tải ảnh"
          >
            <ImageIcon size={16} />
          </Button>
          <input
            ref={imgInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => addFiles(Array.from(e.target.files || []))}
          />
          <Button
            onClick={() => docInputRef.current?.click()}
            className="px-2"
            title="Đính kèm tài liệu"
          >
            <Paperclip size={16} />
          </Button>
          <input
            ref={docInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => addFiles(Array.from(e.target.files || []))}
          />
          <Button
            onClick={() => insertAtCursor(" 😀 ")}
            className="px-2"
            title="Emoji"
          >
            <Smile size={16} />
          </Button>
          <div className="ml-auto text-xs text-gray-500">
            Kéo thả ảnh/tệp vào khung
          </div>
        </div>

        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Ghi nội dung ở đây. Sử dụng Markdown để định dạng. Kéo thả ảnh/tệp vào khung này."
          className="w-full min-h-[160px] px-3 py-2 focus:outline-none bg-transparent"
        />
      </div>

      {/* ảnh xem trước: gồm cả ảnh tồn tại và mới */}
      {imagePreviews.length > 0 && (
        <div className="mb-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
          {imagePreviews.map((src, i) => (
            <div key={i} className="relative">
              <img
                src={src}
                alt={`preview-${i}`}
                className="w-full h-28 object-cover rounded border"
              />
              <Button
                onClick={() => removeImageByIndex(i)}
                className="absolute -top-2 -right-2 bg-white text-red-600 border rounded-full w-6 h-6 text-xs"
                title="Xóa"
              >
                <X size={14} />
              </Button>
              <div className="absolute left-1 bottom-1 text-[10px] bg-white/80 px-1 rounded">
                {imageOrigins[i] === "existing" ? "Tồn tại" : "Mới"}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* tài liệu: hiển thị tài liệu tồn tại và mới */}
      {existingDocUrls.length > 0 && (
        <div className="mb-2">
          {existingDocUrls.map((f, i) => (
            <div key={`exist-${i}`} className="flex items-center gap-2 text-sm">
              <Paperclip size={14} />
              <a href={f.url} target="_blank" rel="noreferrer" className="truncate text-blue-600 hover:underline">
                {f.name || f.url}
              </a>
              <Button
                onClick={() => removeExistingDocByIndex(i)}
                className="text-gray-500 hover:text-gray-700"
                title="Xóa"
              >
                <X size={14} />
              </Button>
            </div>
          ))}
        </div>
      )}

      {docFiles.length > 0 && (
        <div className="mb-3">
          {docFiles.map((f, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <Paperclip size={14} />
              <span className="truncate">{f.name}</span>
              <Button
                onClick={() => removeDocFileByIndex(i)}
                className="text-gray-500 hover:text-gray-700"
                title="Xóa"
              >
                <X size={14} />
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-end gap-3 mt-8">
        <Button
          className="bg-gray-200 text-black px-6 py-2 rounded-full hover:bg-gray-300 transition"
          onClick={onCancel}
        >
          Hủy
        </Button>
        <Button
          className={`bg-blue-500 text-white px-6 py-2 rounded-full hover:bg-blue-600 transition ${
            !canSubmit ? "opacity-60" : ""
          }`}
          onClick={handleSubmit}
          disabled={!canSubmit}
          title={!canSubmit ? "Nhập tiêu đề và nội dung trước khi đăng" : undefined}
        >
          {submitText}
        </Button>
      </div>
    </div>
  );
};

export default CreatePost;


