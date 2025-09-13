import React, { useState, useRef, useEffect } from "react";
import { MessageCircleMore, SendHorizontal } from "lucide-react";
import Button from "./Button";
import PostModal from "./PostModal";
import ChatPostCard from "./ChatPostCard";
import type { ChatDisplayItem } from "./ChatPostCard";

const API_URL = "http://localhost:5678/webhook-test/chatbox"; // Unified endpoint

// Thay đổi: thêm kiểu ChatMessage có thể chứa card
type ChatMessage = {
  role: "user" | "bot";
  content: string;
  card?: ChatDisplayItem; // nếu có card thì content dùng làm mô tả / có thể để rỗng
};

const Chatbox: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  // Thay displayItems -> bỏ hẳn, tích hợp vào messages
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [postModalId, setPostModalId] = useState<number | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [createMode, setCreateMode] = useState<{ active: boolean; step?: string | null; options: string[]; selectedChildTags: string[] }>({ active: false, step: null, options: [], selectedChildTags: [] });
  const [lastMessage, setLastMessage] = useState<string | null>(null); // ADD: lastMessage state (bị thiếu trước đó)
  const chatboxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatContentRef = useRef<HTMLDivElement>(null);

  // Lấy userId từ localStorage nếu có
  const userId = (() => {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        return user?.id || null;
      }
    } catch {}
    return null;
  })();

  // Đóng chatbox khi click ra ngoài, nhưng không đóng nếu đang mở PostModal
  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (postModalId) return; // Nếu đang mở PostModal thì không đóng chatbox
      if (chatboxRef.current && !chatboxRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, postModalId]);

  // Focus input khi mở chatbox
  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  // Tự động scroll xuống cuối khi có tin nhắn hoặc kết quả mới
  useEffect(() => {
    if (open && chatContentRef.current) {
      chatContentRef.current.scrollTop = chatContentRef.current.scrollHeight;
    }
  }, [open, messages, isTyping, createMode]);

  // Đảm bảo khi mở chatbox thì không mở PostModal
  useEffect(() => {
    if (open) setPostModalId(null);
  }, [open]);

  // Helper giữ lại để chuẩn hóa
  const normalizeOne = (obj: any, variant: ChatDisplayItem["variant"]): ChatDisplayItem => {
    if (!obj || typeof obj !== "object") return { variant };
    const { authorId, authorID, author_id, ...rest } = obj;
    return { ...rest, variant };
  };
  const normalizeArray = (arr: any[], variant: ChatDisplayItem["variant"]) =>
    arr.map(o => normalizeOne(o, variant));

  // Thay đổi toàn bộ processApiResponse: dựng thứ tự message -> data -> lastMessage
  const processApiResponse = (raw: any) => {
    const payload = Array.isArray(raw) ? raw[0] : raw;
    const action = payload?.action ?? null;
    const step = payload?.step ?? null;

    // Cập nhật create mode (giữ nguyên)
    if (action === "create") {
      const opts = Array.isArray(payload?.data) ? payload.data : [];
      setCreateMode(prev => ({
        active: true,
        step,
        options: opts,
        selectedChildTags: step === "choose_child_tag" ? prev.selectedChildTags : []
      }));
    } else {
      setCreateMode({ active: false, step: null, options: [], selectedChildTags: [] });
    }

    const newMessages: ChatMessage[] = [];

    // 1) message trước
    if (payload?.message) {
      newMessages.push({ role: "bot", content: payload.message });
      setLastMessage(payload.message);
    }

    // 2) data (post card) ở giữa
    // - Single object (create/edit/delete review)
    if (
      payload?.data &&
      typeof payload.data === "object" &&
      !Array.isArray(payload.data) &&
      (action === "create" || action === "edit" || action === "delete") &&
      (step === "review" || action !== "create")
    ) {
      const variant: ChatDisplayItem["variant"] =
        action === "create"
          ? "create"
          : action === "edit"
          ? "edit"
          : "delete";
      const item = normalizeOne(payload.data, variant);
      newMessages.push({
        role: "bot",
        content: item.title || "",
        card: item
      });
      if (!payload?.message && !payload?.lastMessage) {
        setLastMessage(item.title || variant.toUpperCase());
      }
    }

    // - Array data (search/list or create choose lists—but chỉ hiển thị khi thực sự là kết quả chứ không phải bước chọn tag)
    if (
      Array.isArray(payload?.data) &&
      payload.data.length > 0 &&
      !(
        action === "create" &&
        (step === "choose_parent_tag" || step === "choose_child_tag")
      )
    ) {
      const items = normalizeArray(payload.data, action === "delete" ? "delete" : action === "edit" ? "edit" : action === "create" ? "create" : "search");
      items.forEach(it => {
        newMessages.push({
          role: "bot",
            content: it.title || it.content?.slice(0, 60) || "",
          card: it
        });
      });
      if (!payload?.message && !payload?.lastMessage) {
        const first = items[0];
        const txt =
          first.title ||
          (typeof first.content === "string"
            ? first.content.slice(0, 60)
            : "Kết quả");
        setLastMessage(txt);
      }
    }

    // Xóa logic cũ: không còn setDisplayItems (vì đã tích hợp vào messages)

    // 3) lastMessage sau cùng
    if (payload?.lastMessage) {
      newMessages.push({ role: "bot", content: payload.lastMessage });
      setLastMessage(payload.lastMessage);
    }

    // Fallback nếu không có gì rõ ràng
    if (
      newMessages.length === 0 &&
      !payload?.message &&
      !payload?.lastMessage
    ) {
      const txt = payload?.output || JSON.stringify(payload);
      newMessages.push({ role: "bot", content: txt });
      setLastMessage(txt);
    }

    // Gộp vào danh sách tin nhắn
    if (newMessages.length > 0) {
      setMessages(prev => [...prev, ...newMessages]);
    }
  };

  const sendRequest = async (body: any) => {
    const res = await fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    return res.json();
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() && !(createMode.active && createMode.step === "choose_child_tag")) return;

    const userMsg = input.trim();
    const action = createMode.active ? "create" : null;
    const step = createMode.step || null;

    // Parent tag selection by typing
    if (action === "create" && step === "choose_parent_tag") {
      setMessages(prev => [...prev, { role: "user", content: userMsg }]);
      setInput('');
      setIsTyping(true);
      setCreateMode(prev => ({ ...prev, options: [] }));
      try {
        const data = await sendRequest({ userId, action: 'create', step, parentTag: userMsg });
        setIsTyping(false); processApiResponse(data);
      } catch { setIsTyping(false); setMessages(prev => [...prev, { role: 'bot', content: 'Lỗi kết nối đến máy chủ!' }]); }
      return;
    }

    // Child tag step: Enter acts as confirm if we have selected tags and no manual input; if user typed something treat it as a custom tag appended
    if (action === "create" && step === "choose_child_tag") {
      if (userMsg) {
        setCreateMode(prev => prev.selectedChildTags.includes(userMsg) ? prev : { ...prev, selectedChildTags: [...prev.selectedChildTags, userMsg] });
        setInput('');
        return; // wait for confirm
      }
      if (createMode.selectedChildTags.length === 0) return;
      const chosenArray = [...createMode.selectedChildTags];
      // Display readable list instead of JSON string
      setMessages(prev => [...prev, { role: "user", content: chosenArray.join(', ') }]);
      setIsTyping(true);
      setCreateMode(prev => ({ ...prev, options: [], selectedChildTags: [] }));
      try {
        const data = await sendRequest({ userId, action: 'create', step, childTags: chosenArray });
        setIsTyping(false); processApiResponse(data);
      } catch { setIsTyping(false); setMessages(prev => [...prev, { role: 'bot', content: 'Lỗi kết nối đến máy chủ!' }]); }
      return;
    }

    // Normal flow (loại bỏ đoạn xóa displayItems trước đây)
    if (!userMsg) return;
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setInput("");
    setIsTyping(true);
    try {
      const data = await sendRequest({ userId, action: null, step: null, chatInput: userMsg });
      setIsTyping(false);
      processApiResponse(data);
    } catch {
      setIsTyping(false);
      setMessages(prev => [...prev, { role: "bot", content: "Lỗi kết nối đến máy chủ!" }]);
    }
  };

  const handleParentTagSelect = async (tag: string) => {
    if (!createMode.active || createMode.step !== "choose_parent_tag" || isTyping) return;
    setMessages(prev => [...prev, { role: "user", content: tag }]);
    setIsTyping(true);
    setCreateMode(prev => ({ ...prev, options: [] }));
    try { const data = await sendRequest({ userId, action: 'create', step: createMode.step, parentTag: tag }); setIsTyping(false); processApiResponse(data); } catch { setIsTyping(false); setMessages(prev => [...prev, { role: 'bot', content: 'Lỗi kết nối đến máy chủ!' }]); }
  };

  // New: toggle child tag selection
  const toggleChildTag = (tag: string) => {
    if (!createMode.active || createMode.step !== "choose_child_tag" || isTyping) return;
    setCreateMode(prev => ({ ...prev, selectedChildTags: prev.selectedChildTags.includes(tag) ? prev.selectedChildTags.filter(t => t !== tag) : [...prev.selectedChildTags, tag] }));
  };

  const submitChildTags = async () => {
    if (!createMode.active || createMode.step !== "choose_child_tag" || createMode.selectedChildTags.length === 0 || isTyping) return;
    const chosenArray = [...createMode.selectedChildTags];
    // Display readable list
    setMessages(prev => [...prev, { role: "user", content: chosenArray.join(', ') }]);
    setIsTyping(true);
    setCreateMode(prev => ({ ...prev, options: [], selectedChildTags: [] }));
    try { const data = await sendRequest({ userId, action: 'create', step: createMode.step, childTags: chosenArray }); setIsTyping(false); processApiResponse(data); } catch { setIsTyping(false); setMessages(prev => [...prev, { role: 'bot', content: 'Lỗi kết nối đến máy chủ!' }]); }
  };

  // Đóng chatbox khi nhấn nút Esc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  // Bắt sự kiện click vào link bài viết trong chat
  useEffect(() => {
    if (!open) return;
    const handler = (e: any) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains("chat-link") && target.dataset.postid) {
        e.preventDefault();
        setPostModalId(Number(target.dataset.postid));
      }
    };
    const chatbox = chatboxRef.current;
    if (chatbox) chatbox.addEventListener("click", handler);
    return () => { if (chatbox) chatbox.removeEventListener("click", handler); };
  }, [open, messages]);

  return (
    <div style={{ position: "fixed", right: 24, bottom: 24, zIndex: 1000 }}>
      {open && (
        <>
        <div
          ref={chatboxRef}
          className="w-96 h-96 bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 animate-fadeIn"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2 bg-blue-600 text-white">
            <span className="font-semibold">Hỗ trợ AI</span>
            {/* Hiển thị lastMessage nhỏ dưới header nếu có */}
            <Button onClick={() => setOpen(false)} className="text-white text-xl font-bold">×</Button>
          </div>
          {/* Chat content */}
          <div ref={chatContentRef} className="flex-1 p-4 overflow-y-auto">
            {messages.length === 0 && (
              <div className="text-gray-500 text-sm text-center mt-8">Chatbot AI sẵn sàng hỗ trợ bạn!</div>
            )}
            {messages.map((msg, idx) => {
              if (msg.card) {
                return (
                  <div key={"card-" + idx} className="mb-2 text-left">
                    <ChatPostCard
                      item={msg.card}
                      onOpen={(id) => id && setPostModalId(Number(id))}
                    />
                  </div>
                );
              }
              return (
                <div key={idx} className={msg.role === "user" ? "text-right mb-2" : "text-left mb-2"}>
                  <span
                    className={
                      msg.role === "user"
                        ? "inline-block bg-blue-100 text-blue-900 px-3 py-2 rounded-2xl max-w-[80%]"
                        : "inline-block bg-gray-100 text-gray-900 px-3 py-2 rounded-2xl max-w-[80%]"
                    }
                  >
                    {msg.content}
                  </span>
                </div>
              );
            })}
            {/* Create mode options */}
            {createMode.active && createMode.step === 'choose_parent_tag' && createMode.options.length > 0 && (
              <div className="mb-2 text-left">
                <div className="flex flex-wrap gap-2">
                  {createMode.options.map(opt => (
                    <button
                      key={opt}
                      onClick={() => handleParentTagSelect(opt)}
                      disabled={isTyping}
                      className={`text-xs px-3 py-1 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400 ${isTyping ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {createMode.active && createMode.step === 'choose_child_tag' && createMode.options.length > 0 && (
              <div className="mb-3 text-left space-y-2">
                <div className="flex flex-wrap gap-2">
                  {createMode.options.map(opt => {
                    const selected = createMode.selectedChildTags.includes(opt);
                    return (
                      <button key={opt} type="button" onClick={() => toggleChildTag(opt)} disabled={isTyping} className={`text-xs px-3 py-1 rounded-full border transition focus:outline-none focus:ring-2 focus:ring-blue-400 ${selected ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-blue-700 border-blue-400 hover:bg-blue-50'} ${isTyping ? 'opacity-60 cursor-not-allowed' : ''}`}>{selected ? '✓ ' : ''}{opt}</button>
                    );
                  })}
                </div>
                <div className="text-xs text-gray-600">Đã chọn: {createMode.selectedChildTags.length > 0 ? createMode.selectedChildTags.join(', ') : 'Chưa có'}</div>
                <div className="flex gap-2">
                  <button type="button" onClick={submitChildTags} disabled={isTyping || createMode.selectedChildTags.length === 0} className={`text-xs px-3 py-1 rounded-md font-semibold ${createMode.selectedChildTags.length === 0 || isTyping ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700'}`}>Xác nhận</button>
                  {createMode.selectedChildTags.length > 0 && (
                    <button type="button" onClick={() => setCreateMode(prev => ({ ...prev, selectedChildTags: [] }))} disabled={isTyping} className="text-xs px-3 py-1 rounded-md bg-red-100 text-red-600 hover:bg-red-200">Reset</button>
                  )}
                </div>
              </div>
            )}
            {isTyping && (
              <div className="text-left mb-2">
                <span className="inline-block bg-gray-100 text-gray-900 px-3 py-2 rounded-2xl max-w-[80%] animate-pulse">AI đang trả lời...</span>
              </div>
            )}
          </div>
          {/* Input */}
          <div className="p-3 border-t bg-gray-50">
            <form className="relative flex items-center" onSubmit={handleSubmit}>
              <input
                ref={inputRef}
                type="text"
                className="flex-1 rounded-full border px-3 py-2 pr-10 outline-none focus:border-blue-500"
                placeholder={createMode.active && createMode.step === 'choose_parent_tag' ? 'Nhập hoặc chọn chủ đề...' : (createMode.active && createMode.step === 'choose_child_tag' ? 'Nhập tag con mới (Enter để thêm) hoặc chọn ở trên...' : 'Nhập tin nhắn...')}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { handleSubmit(); } }}
              />
              <Button
                className="absolute right-5 text-blue-600 hover:text-blue-700 p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Gửi"
                onClick={handleSubmit}
              >
                <SendHorizontal size={20} />
              </Button>
            </form>
          </div>
        </div>
        {/* Hiển thị PostModal khi có postModalId */}
        {postModalId && open && (
          <div style={{ position: "fixed", inset: 0, zIndex: 2000 }}>
            <PostModal postId={postModalId} open={!!postModalId} onClose={() => setPostModalId(null)} />
          </div>
        )}
        </>
      )}
      {!open && (
        <div className="flex flex-col items-end">
          <Button
            onClick={() => setOpen(true)}
            className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center shadow-lg hover:bg-blue-700 transition-colors"
            aria-label="Mở chatbox"
          >
            <MessageCircleMore size={32} color="#fff" />
          </Button>
          {lastMessage && (
            <div
              className="mt-2 max-w-60 text-xs bg-white shadow px-3 py-2 rounded-lg border border-gray-200 text-gray-700 overflow-hidden"
              style={{ whiteSpace: "nowrap", textOverflow: "ellipsis" }}
              title={lastMessage}
            >
              {lastMessage}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Chatbox;
