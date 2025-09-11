import React, { useEffect, useRef, useState } from "react";
import Button from "./Button";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import {useUser} from "../hooks/useUser";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import EmojiPicker, { Theme } from "emoji-picker-react";
// Thêm Twemoji
import twemoji from "twemoji";

import {
  Bold,
  Italic,
  List as ListIcon,
  ListOrdered as ListOrderedIcon,
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
    children: ["Giới thiệu – Làm quen", "Chuyện ngoài IT", "Hỏi đáp linh tinh", "Thảo luận công nghệ"],
  },
  {
    parent: "Lập trình",
    children: [
      "Web",
      "Mobile",
      "Backend",
      "Frontend",
      "Machine Learning",
      "Data",
    ],
  },
  { parent: "Hệ điều hành", children: ["Windows", "Linux / Ubuntu", "macOS", "Command Line", "Cài đặt hệ điều hành", "Dual Boot"] },
  {
    parent: "Bảo mật & mạng",
    children: ["An ninh mạng", "Hệ thống mạng", "Kiểm thử bảo mật", "Firewall/ IDS", "Mã hóa & bảo vệ dữ liệu" ],
  },
  {
    parent: "Tài nguyên học tập",
    children: ["Tài liệu – Khóa học", "Chia sẻ kinh nghiệm", "Lộ trình học tập"],
  },
  {
    parent: "Tuyển dụng & nghề nghiệp",
    children: ["Việc làm IT", "CV & phỏng vấn", "Freelance"],
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
  const [imagePreviews, setImagePreviews] = useState<string[]>(
    (initialImageUrls || []).map((img: any) => {
      if (typeof img === "object" && img?.id) {
        return `/api/posts/image/${img.id}`;
      }
      return img;
    })
  );
  const [imageOrigins, setImageOrigins] = useState<("existing" | "new")[]>(
    (initialImageUrls || []).map(() => "existing")
  );

  // tài liệu: tách tài liệu tồn tại vs tài liệu mới
  const [docFiles, setDocFiles] = useState<File[]>([]);
  const [existingDocUrls, setExistingDocUrls] = useState<{ name: string; url: string }[]>(
    (initialDocUrls || []).map((doc: any) => {
      if (typeof doc === "object" && doc?.id) {
        return {
          name: doc.name || doc.file_name || `file-${doc.id}`,
          url: `/api/posts/file/${doc.id}`,
        };
      }
      if (typeof doc === "object" && doc?.url) {
        return { name: doc.name || doc.url, url: doc.url };
      }
      if (typeof doc === "string") {
        return { name: doc, url: doc };
      }
      return doc;
    })
  );

  const [imagePreviewsStateVersion] = useState(0); // giữ place-holder cho deps cleanup

  const user = useUser();
  const authorId = user.id;
  
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
    const keptExistingImageUrls = imagePreviews
      .map((url, i) => (imageOrigins[i] === "existing" ? url : null))
      .filter(Boolean);

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
        // Truyền đúng định dạng cho FE (url hoặc object {name, url})
        existingImageUrls: keptExistingImageUrls.filter((url): url is string => url !== null),
        existingDocUrls: existingDocUrls,
      });
    } catch (err) {
      alert((mode === "edit" ? "Cập nhật" : "Tạo") + " bài viết thất bại: " + (err as any)?.message);
    }
  };

  const canSubmit = title.trim().length > 0 && content.trim().length > 0;
  const headingText = heading || (isEdit ? "Chỉnh sửa bài viết" : "Tạo bài viết mới");
  const submitText = submitLabel || (isEdit ? "Cập nhật" : "Đăng bài");

  // Xóa state showIconPicker và iconList ở trên

  // Thêm hàm xử lý chèn danh sách
  const handleListInsert = (ordered: boolean) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart ?? 0;
    const before = content.slice(0, start);
    const after = content.slice(start);
    const prefix = ordered ? "1. " : "- ";
    // Nếu đang ở đầu dòng hoặc dòng mới thì thêm prefix, nếu không thì xuống dòng rồi thêm
    let insert = "";
    if (start === 0 || before.endsWith("\n")) {
      insert = prefix;
    } else {
      insert = "\n" + prefix;
    }
    const next = before + insert + after;
    setContent(next);
    setTimeout(() => {
      ta.focus();
      const pos = before.length + insert.length;
      ta.selectionStart = pos;
      ta.selectionEnd = pos;
    }, 0);
  };

  // Xử lý tự động thêm prefix khi Enter trong list
  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Ctrl+B: bold
    if (e.ctrlKey && (e.key === "b" || e.key === "B")) {
      e.preventDefault();
      surroundSelection("**");
      return;
    }
    // Ctrl+I: italic
    if (e.ctrlKey && (e.key === "i" || e.key === "I")) {
      e.preventDefault();
      surroundSelection("*");
      return;
    }
    // Ctrl+U: underline (gạch chân)
    if (e.ctrlKey && (e.key === "u" || e.key === "U")) {
      e.preventDefault();
      surroundSelection("++", "++");
      return;
    }
    // Ctrl+L: link
    if (e.ctrlKey && (e.key === "l" || e.key === "L")) {
      e.preventDefault();
      insertAtCursor("[liên kết](https://)");
      return;
    }
    // Ctrl+Shift+8: unordered list (dấu chấm)
    if (e.ctrlKey && e.shiftKey && e.key === "8") {
      e.preventDefault();
      insertAtCursor("- ");
      return;
    }
    // Ctrl+Shift+7: ordered list (số)
    if (e.ctrlKey && e.shiftKey && e.key === "7") {
      e.preventDefault();
      insertAtCursor("1. ");
      return;
    }
    // Enter: tự động thêm prefix cho list
    if (e.key === "Enter") {
      const ta = textareaRef.current;
      if (!ta) return;
      const start = ta.selectionStart ?? 0;
      const before = content.slice(0, start);
      const lastLine = before.split("\n").pop() || "";
      let prefix = "";
      if (/^(\s*)- /.test(lastLine)) {
        prefix = lastLine.match(/^(\s*)- /)?.[0] || "- ";
      } else if (/^(\s*)\d+\.\s/.test(lastLine)) {
        // Tăng số thứ tự cho ordered list
        const match = lastLine.match(/^(\s*)(\d+)\.\s/);
        if (match) {
          const indent = match[1] || "";
          const num = parseInt(match[2], 10) + 1;
          prefix = `${indent}${num}. `;
        }
      }
      if (prefix) {
        e.preventDefault();
        const after = content.slice(start);
        const next = before + "\n" + prefix + after;
        setContent(next);
        setTimeout(() => {
          ta.focus();
          const pos = before.length + 1 + prefix.length;
          ta.selectionStart = pos;
          ta.selectionEnd = pos;
        }, 0);
      }
    }
  };

  // Custom render cho <u> (gạch chân), list, và text (dùng Twemoji cho text)
  const markdownComponents = {
    // Bỏ hỗ trợ gạch chân (ins)
    ul: ({node, ...props}: any) => <ul className="pl-6 list-disc" {...props} />,
    ol: ({node, ...props}: any) => <ol className="pl-6 list-decimal" {...props} />,
    li: ({node, ...props}: any) => <li className="mb-1" {...props} />,
    // Custom text node để render emoji unicode bằng twemoji SVG
    text: ({value}: any) => (
      <span
        dangerouslySetInnerHTML={{
          __html: twemoji.parse(value, {
            folder: "svg",
            ext: ".svg",
            className: "inline align-[-0.125em] w-5 h-5",
            base: "https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/",
          }),
        }}
      />
    ),
  };

  // State for showing/hiding the emoji picker
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  // Đóng emoji picker khi click ra ngoài
  useEffect(() => {
    if (!showEmojiPicker) return;
    function handleClickOutside(e: MouseEvent) {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(e.target as Node)
      ) {
        setShowEmojiPicker(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showEmojiPicker]);

  const previewRef = useRef<HTMLDivElement>(null);

  const handleTextareaScroll = () => {
    const ta = textareaRef.current;
    const preview = previewRef.current;
    if (!ta || !preview) return;
    // Tính tỷ lệ cuộn của textarea
    const percent =
      ta.scrollTop / (ta.scrollHeight - ta.clientHeight || 1);
    // Cuộn preview theo tỷ lệ tương ứng
    preview.scrollTop = percent * (preview.scrollHeight - preview.clientHeight);
  };

  // State to track if the content textarea is focused
  const [isContentFocused, setIsContentFocused] = useState(false);

  return (
    <div className="w-full max-w-6xl p-6 mx-auto bg-gray-50 rounded-xl">
      <h3 className="mb-6 text-xl font-semibold">{headingText}</h3>
      <div className="flex flex-col gap-6 md:flex-row">
        {/* Left: Form nhập bài viết */}
        <div className="flex flex-col w-1/2">
          <div className="mb-4">
            <label className="block mb-1 font-medium">Tiêu đề bài viết</label>
            <input
              type="text"
              placeholder="Nhập tiêu đề bài viết của bạn..."
              className={`w-full py-2 bg-transparent border-b outline-none transition-colors border-gray-300 focus:border-blue-500 ${
                title.length > 0 ? "border-blue-500" : ""
              }`}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-medium">Thẻ</label>
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
                  placeholder="Chọn hoặc nhập thẻ con"
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
            className={`mb-3 border rounded-md transition-colors ${
              isContentFocused
                ? "border-blue-500"
                : "border-black "
            }`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
          >
            <div
              className={`flex items-center gap-2 px-2 py-2 border-b transition-colors ${
                isContentFocused
                  ? "border-blue-500"
                  : "border-black"
              }`}
            >
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
                onClick={() => handleListInsert(false)}
                className="px-2"
                title="Danh sách chấm"
              >
                <ListIcon size={16} />
              </Button>
              <Button
                onClick={() => handleListInsert(true)}
                className="px-2"
                title="Danh sách số"
              >
                <ListOrderedIcon size={16} />
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
                // Dùng nút emoji để mở bảng emoji
                onClick={() => {
                  setShowEmojiPicker((v) => !v);
                }}
                className="relative px-2"
                title="Chèn emoji"
              >
                <Smile size={16} />
                {showEmojiPicker && (
                  <div
                    ref={emojiPickerRef}
                    className="absolute left-0 z-50 mt-2"
                  >
                    <EmojiPicker
                      onEmojiClick={(emojiData) => {
                        insertAtCursor(emojiData.emoji + " ");
                        setShowEmojiPicker(false);
                      }}
                      height={350}
                      width={320}
                      theme={"light" as Theme}
                    />
                  </div>
                )}
              </Button>
              <div className="ml-auto text-xs text-gray-500">
                Kéo thả ảnh/tệp vào khung
              </div>
            </div>
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleTextareaKeyDown}
              onScroll={handleTextareaScroll}
              placeholder="Ghi nội dung ở đây. Sử dụng Markdown để định dạng. Kéo thả ảnh/tệp vào khung này."
              className="w-full px-3 py-2 bg-transparent outline-none min-h-40"
              onFocus={() => setIsContentFocused(true)}
              onBlur={() => setIsContentFocused(false)}
            />
          </div>
          {/* ảnh xem trước: gồm cả ảnh tồn tại và mới */}
          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mb-3 sm:grid-cols-4">
              {imagePreviews.map((src, i) => (
                <div key={i} className="relative">
                  <img
                    src={src}
                    alt={`preview-${i}`}
                    className="object-cover w-full border rounded h-28"
                  />
                  <Button
                    onClick={() => removeImageByIndex(i)}
                    className="absolute w-6 h-6 text-xs text-red-600 bg-white border rounded-full -top-2 -right-2"
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
                  <a href={f.url} target="_blank" rel="noreferrer" className="text-blue-600 truncate hover:underline">
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
              className="px-6 py-2 text-black transition bg-gray-200 rounded-full hover:bg-gray-300"
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
        {/* Right: Preview */}
        <div
          ref={previewRef}
          className="flex flex-col self-start w-1/2 h-full p-4 overflow-y-auto max-h-92"
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={markdownComponents}
          >
            {content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;
