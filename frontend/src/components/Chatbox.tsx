import React, { useState, useRef, useEffect } from "react";
import { MessageCircleMore, SendHorizontal } from "lucide-react";
import Button from "./Button";


const Chatbox: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const chatboxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Đóng chatbox khi click ra ngoài
  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (chatboxRef.current && !chatboxRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  // Focus input khi mở chatbox
  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;
    // TODO: Xử lý gửi tin nhắn ở đây
    setInput("");
  };

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
          <div className="flex-1 p-4 overflow-y-auto">
            {/* TODO: Render hội thoại ở đây */}
            <div className="text-gray-500 text-sm text-center mt-8">Chatbot AI sẵn sàng hỗ trợ bạn!</div>
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
              <button
                type="submit"
                className="absolute right-5 text-blue-600 hover:text-blue-700 p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Gửi"
                style={{ background: "transparent", border: "none" }}
              >
                <SendHorizontal size={20} />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbox;
