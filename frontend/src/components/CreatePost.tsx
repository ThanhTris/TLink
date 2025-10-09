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
import Toast from "./Toast";

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
  Trash2, // thêm
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
  onToast?: (toast: { message: string; type: "success" | "error" | "warning"; title?: string }) => void;
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
  onToast,
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
  // NEW: tên hiển thị cho ảnh (song song với imagePreviews)
  const [imageNames, setImageNames] = useState<string[]>(
    (initialImageUrls || []).map((_: any, idx: number) => `Ảnh ${idx + 1}`)
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

  // Validation config (aligned with backend)
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const allowedImageTypes = new Set([
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/bmp",
    "image/webp",
  ]);
  const allowedDocTypes = new Set([
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "text/plain",
    "application/zip",
    "application/x-rar-compressed",
    // Note: backend also allows images on file endpoint, but UI routes images via image endpoint
    "image/png",
    "image/jpeg",
    "image/jpg",
  ]);
  const formatMB = (bytes: number) => (bytes / (1024 * 1024)).toFixed(2);

  // Local toast stack
  type LocalToast = {
    id: number;
    message: string;
    title?: string;
    type?: "success" | "error" | "warning";
    statusCode?: number;
  };
  const [toasts, setToasts] = useState<LocalToast[]>([]);
  const pushToast = (t: Omit<LocalToast, "id">) =>
    setToasts((prev) => [...prev, { id: Date.now() + Math.random(), ...t }]);

  // file helpers
  const imgInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const addFiles = (files: File[]) => {
    const validImages: File[] = [];
    const validDocs: File[] = [];
    const rejects: { name: string; size: number; reason: string }[] = [];

    files.forEach((f) => {
      const isImage = f.type?.startsWith("image/");
      if (f.size > MAX_FILE_SIZE) {
        rejects.push({ name: f.name, size: f.size, reason: "Kích thước vượt quá 5MB" });
        return;
      }
      if (isImage) {
        if (!allowedImageTypes.has(f.type)) {
          rejects.push({ name: f.name, size: f.size, reason: "Định dạng ảnh không hợp lệ" });
          return;
        }
        validImages.push(f);
      } else {
        if (!allowedDocTypes.has(f.type)) {
          rejects.push({ name: f.name, size: f.size, reason: "Định dạng tệp không hợp lệ" });
          return;
        }
        validDocs.push(f);
      }
    });

    // Show one toast per invalid file
    if (rejects.length) {
      rejects.forEach((r) => {
        pushToast({
          title: "Tệp không hợp lệ",
          type: "error",
          message: `${r.name} (${formatMB(r.size)} MB) — ${r.reason}`,
        });
      });
    }

    if (validImages.length) {
      setImageFiles((prev) => [...prev, ...validImages]);
      validImages.forEach((f) => {
        const url = URL.createObjectURL(f);
        setImagePreviews((prev) => [...prev, url]);
        setImageOrigins((prev) => [...prev, "new"]);
      });
      // NEW: lưu tên ảnh để hiển thị dạng list
      setImageNames((prev) => [
        ...prev,
        ...validImages.map((f, i) => f.name || `Ảnh mới ${prev.length + i + 1}`)
      ]);
    }
    if (validDocs.length) setDocFiles((prev) => [...prev, ...validDocs]);
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
    // NEW: đồng bộ xóa tên ảnh
    setImageNames((prev) => prev.filter((_, idx) => idx !== i));
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
      // Ensure childTags is always sent as an array (backend expects list, null can cause NPE)
      const payload: any = {
        title,
        content,
        authorId,
        parentTagName: tagParent, // Updated to match backend parameter
        childTags: Array.isArray(childTags) ? childTags : [],
      };

      let usedPostId = postId;
      // Use backend response to determine success and message
      if (mode === "edit") {
        // Call API to update the post
        if (!postId) throw new Error("Missing postId for update");
        const res = await apiUpdatePost(postId, payload);
        const apiResp = (res as any)?.data;
        if (!apiResp?.success) {
          // show backend-provided error message if any
          pushToast({ title: "Lỗi", message: apiResp?.message || "Cập nhật thất bại", type: "error" });
          throw new Error(apiResp?.message || "Update failed");
        }
        // Backend indicates success; take message from backend
        pushToast({ title: "Thành công", message: apiResp?.message || "Cập nhật bài viết thành công", type: "success" });
        usedPostId = postId;
      } else {
        // Call API to create a new post
        const res = await createPost(payload);
        const apiResp = (res as any)?.data;
        if (!apiResp?.success) {
          pushToast({ title: "Lỗi", message: apiResp?.message || "Tạo bài viết thất bại", type: "error" });
          throw new Error(apiResp?.message || "Create failed");
        }
        usedPostId = apiResp?.data;
        if (!usedPostId) {
          pushToast({ title: "Lỗi", message: "Không lấy được ID bài viết từ server", type: "error" });
          throw new Error("Failed to retrieve postId");
        }
        // Show backend message for create too
        pushToast({ title: "Thành công", message: apiResp?.message || "Tạo bài viết thành công", type: "success" });
      }

      // 2. Upload new images (if any)
      for (const file of imageFiles) {
        await uploadPostImage(usedPostId, file);
      }

      // 3. Upload new document files (if any)
      for (const file of docFiles) {
        await uploadPostFile(usedPostId, file);
      }

      // 4. Call the callback when done (always include childTags so consumers/backend won't get null)

      onSubmit?.({
        title,
        content,
        authorId,
        tagParent: tagParent, // Updated to match backend parameter
        childTags: Array.isArray(childTags) ? childTags : [],
        imageFiles: [],
        docFiles: [],
        // Pass the correct format to the frontend (url or object {name, url})
        existingImageUrls: keptExistingImageUrls.filter((url): url is string => url !== null),
        existingDocUrls: existingDocUrls,
      });
      // Show toast via parent handler if provided; otherwise use local pushToast
      const finalToast = { message: (mode === "edit" ? "Cập nhật bài viết thành công" : "Tạo bài viết thành công"), type: "success" as const, title: mode === "edit" ? "Cập nhật" : "Thành công" };
      if (onToast) {
        onToast(finalToast);
      } else {
        pushToast(finalToast);
      }
    } catch (err) {
      alert((mode === "edit" ? "Update" : "Create") + " post failed: " + (err as any)?.message);
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

  // React-Select glass styles (shared)
  const commonSelectStyles = {
    control: (base: any, state: any) => ({
      ...base,
      minHeight: 42,
      borderRadius: 12,
      backgroundColor: "var(--glass-bg-soft)",
      backdropFilter: "blur(var(--glass-blur-soft))",
      borderColor: state.isFocused ? "var(--color-primary)" : "var(--glass-border)",
      boxShadow: state.isFocused ? "0 0 0 3px rgba(var(--primary-rgb),.18)" : "none",
      transition: "border-color .15s ease, box-shadow .15s ease",
      ":hover": { borderColor: "var(--color-primary)" },
    }),
    valueContainer: (base: any) => ({
      ...base,
      paddingBlock: 6,
      paddingInline: 10,
    }),
    placeholder: (base: any) => ({
      ...base,
      color: "var(--text-sub)",
    }),
    singleValue: (base: any) => ({
      ...base,
      color: "var(--text-main)",
    }),
    input: (base: any) => ({
      ...base,
      color: "var(--text-main)",
    }),
    indicatorsContainer: (base: any) => ({
      ...base,
      color: "var(--text-sub)",
    }),
    indicatorSeparator: () => ({ display: "none" }),
    dropdownIndicator: (base: any, state: any) => ({
      ...base,
      color: state.isFocused ? "var(--color-primary)" : "var(--text-sub)",
      ":hover": { color: "var(--color-primary)" },
    }),
    clearIndicator: (base: any) => ({
      ...base,
      color: "var(--text-sub)",
      ":hover": { color: "var(--color-danger)" },
    }),
    menu: (base: any) => ({
      ...base,
      borderRadius: 12,
      backgroundColor: "var(--menu-bg)",
      border: "1px solid var(--menu-border)",
      boxShadow: "var(--menu-shadow)",
      overflow: "hidden",
      backdropFilter: "blur(12px)",
    }),
    menuList: (base: any) => ({
      ...base,
      maxHeight: 260,
      paddingBlock: 6,
    }),
    option: (base: any, state: any) => ({
      ...base,
      cursor: "pointer",
      color: state.isSelected ? "var(--color-primary)" : "var(--text-main)",
      backgroundColor: state.isSelected
        ? "rgba(var(--primary-rgb),.12)"
        : state.isFocused
        ? "rgba(255,255,255,.6)"
        : "transparent",
    }),
    multiValue: (base: any) => ({
      ...base,
      backgroundColor: "rgba(var(--primary-rgb),.10)",
      borderRadius: 9999,
      overflow: "hidden",
    }),
    multiValueLabel: (base: any) => ({
      ...base,
      color: "var(--text-main)",
      paddingInline: 8,
    }),
    multiValueRemove: (base: any) => ({
      ...base,
      color: "var(--color-primary)",
      ":hover": {
        backgroundColor: "rgba(var(--primary-rgb),.15)",
        color: "var(--color-danger)",
      },
    }),
  };

  return (
    <div className="w-full max-w-6xl p-6 mx-auto glass-card">
      <h3 className="mb-6 text-xl font-semibold text-[var(--text-title)] glass-surface px-4 py-2">
        {headingText}
      </h3>
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
                    setChildTags([]);
                  }}
                  menuPlacement="auto"
                  classNamePrefix="tag"
                  styles={commonSelectStyles as any}
                />
              </div>
              <div className="w-3/5 min-w-0">
                <CreatableSelect
                  isMulti
                  options={childOptions}
                  value={childTags.map((t) => ({ value: t, label: t }))}
                  onChange={(opts) => {
                    const arr = Array.isArray(opts) ? opts : [];
                    setChildTags(arr.map((o: any) => String(o.value)).filter(Boolean));
                  }}
                  onCreateOption={(val) => {
                    const v = val.trim();
                    if (!v) return;
                    setChildTags((prev) => (prev.includes(v) ? prev : [...prev, v]));
                  }}
                  isClearable
                  placeholder="Chọn hoặc nhập thẻ con"
                  menuPlacement="auto"
                  classNamePrefix="tag"
                  styles={commonSelectStyles as any}
                />
              </div>
            </div>
          </div>
          <div
            className={`mb-3 rounded-xl glass-surface transition-colors border border-[var(--glass-border)] ${
              isContentFocused ? "ring-2 ring-[var(--color-primary)]" : ""
            }`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
          >
            <div className="flex items-center gap-2 px-2 py-2 border-b border-[var(--glass-border)]">
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
                // Restrict to most common extensions supported by backend
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar"
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
          {/* tài liệu tồn tại (giữ bề mặt sáng hơn để dễ đọc) */}
          {existingDocUrls.length > 0 && (
            <div className="mb-2 glass-surface p-2">
              {existingDocUrls.map((f, i) => (
                <div key={`exist-${i}`} className="flex items-center gap-2 text-sm">
                  <Paperclip size={16} />
                  <a
                    href={f.url}
                    target="_blank"
                    rel="noreferrer"
                    className="truncate text-[var(--color-primary)] hover:underline"
                  >
                    {f.name || f.url}
                  </a>
                  <Button onClick={() => removeExistingDocByIndex(i)} className="text-gray-500 hover:text-[var(--color-danger)]" title="Xóa">
                    <X size={16} />
                  </Button>
                </div>
              ))}
            </div>
          )}
          {docFiles.length > 0 && (
            <div className="mb-3">
              {docFiles.map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <Paperclip size={16} />
                  <span className="truncate">{f.name}</span>
                  <Button
                    onClick={() => removeDocFileByIndex(i)}
                    className="text-gray-500 hover:text-[var(--color-danger)]"
                    title="Xóa"
                  >
                    <X size={16} />
                  </Button>
                </div>
              ))}
            </div>
          )}
          <div className="flex justify-end gap-16 mt-8">
            <Button
              className={`btn-safe ${!canSubmit ? "opacity-60" : ""}`}
              onClick={handleSubmit}
              disabled={!canSubmit}
              title={!canSubmit ? "Nhập tiêu đề và nội dung trước khi đăng" : undefined}
            >
              {submitText}
            </Button>
            <Button
              className="btn-danger"
              onClick={onCancel}
            >
              Hủy
            </Button>
          </div>
        </div>
        {/* Right: Preview */}
        <div
          ref={previewRef}
          className="flex flex-col self-start w-1/2 h-full max-h-128 p-4 overflow-y-auto glass-surface"
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
            {content}
          </ReactMarkdown>

          {/* Ảnh đính kèm (preview bên phải) */}
          {imagePreviews.length > 0 && (
            <div className="mt-4">
              <h4 className="mb-2 text-sm font-medium text-gray-600">Ảnh đính kèm</h4>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {imagePreviews.map((src, i) => (
                  <div key={`pv-img-${i}`} className="relative border rounded overflow-hidden group">
                    <img src={src} alt={`preview-${i}`} className="object-cover w-full" />
                    <Button
                      onClick={() => removeImageByIndex(i)}
                      title="Xóa ảnh"
                      aria-label="Xóa ảnh"
                      className="absolute bottom-2 right-2 grid place-items-center w-8 h-8 rounded-full bg-white/90 backdrop-blur shadow-md ring-1 ring-black/10 text-gray-700 hover:text-[var(--text-danger)] hover:shadow-lg transition-transform duration-150 ease-out opacity-0 group-hover:opacity-100 hover:scale-105"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tệp đính kèm (preview bên phải) */}
          {(existingDocUrls.length > 0 || docFiles.length > 0) && (
            <div className="mt-4">
              <h4 className="mb-2 text-sm font-medium text-[var(--text-sub)]">Tệp đính kèm</h4>
              <div className="space-y-2">
                {existingDocUrls.map((f, i) => (
                  <div key={`pv-file-exist-${i}`} className="flex items-center justify-between gap-2 text-sm">
                    <div className="flex items-center gap-2 min-w-0">
                      <Paperclip size={16} />
                      <a
                        href={f.url}
                        target="_blank"
                        rel="noreferrer"
                        className="truncate text-[var(--color-primary)] hover:underline"
                        title={f.name || f.url}
                      >
                        {f.name || f.url}
                      </a>
                    </div>
                    <Button onClick={() => removeExistingDocByIndex(i)} className="p-1 text-gray-600 hover:text-[var(--color-danger)] rounded shrink-0">
                      <Trash2 size={16} />
                    </Button>
                  </div>
                ))}
                {docFiles.map((f, i) => (
                  <div key={`pv-file-new-${i}`} className="flex items-center justify-between gap-2 text-sm">
                    <div className="flex items-center gap-2 min-w-0">
                      <Paperclip size={16} />
                      <span className="truncate" title={f.name}>
                        {f.name}
                      </span>
                    <Button
                      onClick={() => removeDocFileByIndex(i)}
                      className="p-1 text-gray-600 hover:text-[var(--color-danger)] rounded shrink-0"
                      title="Xóa"
                    >
                      <Trash2 size={16} />
                    </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Toast stack (top-right) */}
      {toasts.length > 0 && (
        <div className="fixed top-6 right-6 z-50 flex flex-col gap-3 items-end">
          {toasts.map((t) => (
            <Toast
              key={t.id}
              inline
              message={t.message}
              title={t.title}
              type={t.type}
              statusCode={t.statusCode}
              onClose={() =>
                setToasts((prev) => prev.filter((x) => x.id !== t.id))
              }
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CreatePost;
