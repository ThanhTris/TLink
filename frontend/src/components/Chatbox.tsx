import React, { useState, useRef, useEffect } from "react";
import { MessageCircleMore, SendHorizontal } from "lucide-react";
import Button from "./Button";
import PostModal from "./PostModal";

const Chatbox: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ role: "user" | "bot"; content: string }[]>([]);
  const [postModalId, setPostModalId] = useState<number | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [postResults, setPostResults] = useState<any[]>([]);
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
  }, [open, messages, postResults, isTyping]);

  // Đảm bảo khi mở chatbox thì không mở PostModal
  useEffect(() => {
    if (open) setPostModalId(null);
  }, [open]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;
    const userMsg = input;
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setInput("");
    setIsTyping(true);
    setPostResults([]); // clear old results
    try {
      const res = await fetch("http://localhost:5678/webhook-test/42ddb2dd-e9b3-43c0-810f-e36c2c1c121c", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatInput: userMsg,
          userId: userId,
        }),
      });
      const data = await res.json();
      setIsTyping(false);
      if (data.message) {
        setMessages((prev) => [
          ...prev,
          { role: "bot", content: data.message },
        ]);
      }
      if (Array.isArray(data.data) && data.data.length > 0) {
        setPostResults(data.data);
      }
      if (!data.message && (!Array.isArray(data.data) || data.data.length === 0)) {
        setMessages((prev) => [
          ...prev,
          { role: "bot", content: data.output || data.message || JSON.stringify(data) },
        ]);
      }
    } catch (err) {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        { role: "bot", content: "Lỗi kết nối đến máy chủ!" },
      ]);
    }
  };

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
    return () => {
      if (chatbox) chatbox.removeEventListener("click", handler);
    };
  }, [open, messages]);

  return (
    <div style={{ position: "fixed", right: 24, bottom: 24, zIndex: 1000 }}>
      {!open && (
        <Button
          onClick={() => setOpen(true)}
          className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center shadow-lg hover:bg-blue-700 transition-colors"
          aria-label="Mở chatbox"
        >
          <MessageCircleMore size={32} color="#fff" />
        </Button>
      )}
      {open && (
        <>
        <div
          ref={chatboxRef}
          className="w-96 h-96 bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 animate-fadeIn"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2 bg-blue-600 text-white">
            <span className="font-semibold">Hỗ trợ AI</span>
            <Button onClick={() => setOpen(false)} className="text-white text-xl font-bold">×</Button>
          </div>
          {/* Chat content */}
          <div ref={chatContentRef} className="flex-1 p-4 overflow-y-auto">
            {messages.length === 0 && postResults.length === 0 && (
              <div className="text-gray-500 text-sm text-center mt-8">Chatbot AI sẵn sàng hỗ trợ bạn!</div>
            )}
            {messages.map((msg, idx) => (
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
            ))}
            {/* Render kết quả bài viết */}
            {postResults.length > 0 && postResults.map((post, idx) => {
              let parentTags: string[] = [];
              let childTags: string[] = [];
              if (post.parent_tags) {
                if (Array.isArray(post.parent_tags)) parentTags = post.parent_tags;
                else if (typeof post.parent_tags === "string" && post.parent_tags) parentTags = post.parent_tags.split(",");
              }
              if (post.child_tags) {
                if (Array.isArray(post.child_tags)) childTags = post.child_tags;
                else if (typeof post.child_tags === "string" && post.child_tags) childTags = post.child_tags.split(",");
              }
              const allTags = [...parentTags, ...childTags].filter(Boolean);
              return (
                <div key={post.id || post.post_id || idx} className="chat-post-item bg-gray-100 px-3 py-2 rounded-2xl max-w-[80%] mb-2">
                  <a
                    href="#"
                    data-postid={post.id || post.post_id}
                    className="chat-link font-semibold text-blue-600 hover:underline block"
                    onClick={e => { e.preventDefault(); setPostModalId(Number(post.id || post.post_id)); }}
                  >
                    {post.title}
                  </a>
                  <div className="flex flex-wrap gap-1 mb-1">
                    {allTags.map((tag, i) => (
                      <span key={i} className="inline-block text-xs font-semibold text-blue-700 bg-blue-100 rounded-full px-2 py-0.5">#{tag.trim()}</span>
                    ))}
                  </div>
                  <div className="text-xs text-gray-500">{post.shorter_content || ""}</div>
                </div>
              );
            })}
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
                placeholder="Nhập tin nhắn..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    handleSubmit();
                  }
                }}
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
    </div>
  );
};

export default Chatbox;
