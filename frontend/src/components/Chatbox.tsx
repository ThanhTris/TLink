import React, { useState, useRef, useEffect } from "react";
import { MessageCircleMore, SendHorizontal } from "lucide-react";
import Button from "./Button";
import PostModal from "./PostModal";
import ChatPostCard from "./ChatPostCard";
import type { ChatDisplayItem } from "./ChatPostCard";

const API_URL = "http://localhost:5678/webhook-test/chatbox";

type ChatMessage = { role: "user" | "bot"; content: string; card?: ChatDisplayItem };

const Chatbox: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [postModalId, setPostModalId] = useState<number | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const chatboxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const chatContentRef = useRef<HTMLDivElement>(null);

  const userId = (() => {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        return user?.id || null;
      }
    } catch {
      return null;
    }
  })();

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (postModalId) return;
      if (chatboxRef.current && !chatboxRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, postModalId]);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  useEffect(() => {
    if (open && chatContentRef.current) {
      chatContentRef.current.scrollTop = chatContentRef.current.scrollHeight;
    }
  }, [open, messages, isTyping]);

  const processApiResponse = (raw: any) => {
    const payload = Array.isArray(raw) ? raw[0] : raw;
    const newMessages: ChatMessage[] = [];

    if (payload?.message) {
      newMessages.push({ role: "bot", content: payload.message });
    }

    if (typeof payload?.data === "number" && payload.success) {
      setPostModalId(payload.data);
    }

    if (payload?.data && typeof payload.data === "object" && !Array.isArray(payload.data)) {
      const variant: ChatDisplayItem["variant"] =
        payload.action === "create" ? "create" :
        payload.action === "edit" ? "edit" :
        payload.action === "delete" ? "delete" : "search";

      const item: ChatDisplayItem = { ...payload.data, variant };
      newMessages.push({ role: "bot", content: item.title || "", card: item });
    }

    if (Array.isArray(payload?.data) && payload.data.length > 0) {
      const variant: ChatDisplayItem["variant"] =
        payload.action === "create" ? "create" :
        payload.action === "edit" ? "edit" :
        payload.action === "delete" ? "delete" : "search";

      payload.data.forEach((item: any) => {
        const content =
          payload?.action === "search" && item.content?.length > 300
            ? item.content.slice(0, 300).trimEnd() + "..."
            : item.content;
        newMessages.push({
          role: "bot",
          content: content || "",
          card: { ...item, variant },
        });
      });
    }

    if (newMessages.length > 0) setMessages((prev) => [...prev, ...newMessages]);
  };

  const sendRequest = async (body: any) => {
    const payload = {
      userId,
      action: body.action ?? null,
      step: body.step ?? null,
      chatInput: body.chatInput ?? null,
    };
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return res.json();
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input.trim();
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setInput("");
    setIsTyping(true);

    try {
      const data = await sendRequest({ userId, action: null, step: null, chatInput: userMsg });
      setIsTyping(false);
      processApiResponse(data);
    } catch {
      setIsTyping(false);
      setMessages((prev) => [...prev, { role: "bot", content: "Lỗi kết nối đến máy chủ!" }]);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  return (
    <div style={{ position: "fixed", right: 24, bottom: 0, zIndex: 1000 }}>
      {open && (
        <>
          <div ref={chatboxRef} className="w-96 h-96 bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden border border-gray-200">
            <div className="flex items-center justify-between px-4 py-2 bg-blue-600 text-white">
              <span className="font-semibold">Hỗ trợ AI</span>
              <Button onClick={() => setOpen(false)} className="text-white text-xl font-bold">×</Button>
            </div>
            <div ref={chatContentRef} className="flex-1 p-4 overflow-y-auto">
              {messages.length === 0 && (
                <div className="text-gray-500 text-sm text-center mt-8">Chatbot AI sẵn sàng hỗ trợ bạn!</div>
              )}
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex items-end justify-center mb-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  {msg.role === "bot" && (
                    <img
                      src="https://i.pinimg.com/736x/86/78/44/867844ee7058d9bb79afb30dcb4a96ed.jpg"
                      alt="Bot Avatar"
                      className="w-8 h-8 rounded-full mr-2"
                    />
                  )}
                  {msg.role === "bot" && msg.card ? (
                    <ChatPostCard
                      item={msg.card}
                      onOpen={(id) => setPostModalId(typeof id === "number" ? id : id ? Number(id) : null)}
                    />
                  ) : (
                    <span
                      className={`inline-block px-3 py-2 rounded-2xl max-w-[80%] text-left ${
                        msg.role === "user" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"
                      }`}
                      style={{
                        whiteSpace: "pre-wrap",
                        wordWrap: "break-word",
                      }}
                    >
                      {msg.content}
                    </span>
                  )}
                </div>
              ))}
              {isTyping && (
                <div className="flex mb-2 justify-start">
                  <img
                    src="https://i.pinimg.com/736x/86/78/44/867844ee7058d9bb79afb30dcb4a96ed.jpg"
                    alt="Bot Avatar"
                    className="w-8 h-8 rounded-full mr-2"
                  />
                  <span className="inline-block px-3 py-2 rounded-2xl max-w-[80%] bg-gray-100 text-gray-900">
                    <span className="animate-bounce inline-block w-1 h-1 bg-gray-600 rounded-full mr-1" style={{ animationDuration: "0.6s", transformOrigin: "bottom" }}></span>
                    <span className="animate-bounce inline-block w-1 h-1 bg-gray-600 rounded-full mr-1" style={{ animationDelay: "0.2s", animationDuration: "0.6s", transformOrigin: "bottom" }}></span>
                    <span className="animate-bounce inline-block w-1 h-1 bg-gray-600 rounded-full" style={{ animationDelay: "0.4s", animationDuration: "0.6s", transformOrigin: "bottom" }}></span>
                  </span>
                </div>
              )}
            </div>
            <div className="p-3 bg-gray-50">
              <form className="relative flex items-center" onSubmit={handleSubmit}>
                <div className="flex-1">
                  <textarea
                    ref={inputRef}
                    placeholder="Nhập tin nhắn..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        handleSubmit(e);
                      }
                    }}
                    className="w-full py-2 px-3 border rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    style={{
                      minHeight: "1rem",
                      maxHeight: "8rem",
                      overflowY: input.split("\n").length > 5 ? "visible" : "auto",
                    }}
                    rows={input.split("\n").length > 5 ? input.split("\n").length : Math.min(5, input.split("\n").length)}
                  />
                </div>
                <Button
                  className="absolute right-3 bottom-3 text-blue-600 hover:text-blue-700 p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Gửi"
                  onClick={handleSubmit}
                >
                  <SendHorizontal size={20} />
                </Button>
              </form>
            </div>
          </div>
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
          {messages.length > 0 && (
            <div
              className="mt-2 max-w-60 text-xs bg-white shadow px-3 py-2 rounded-lg border border-gray-200 text-gray-700 overflow-hidden"
              style={{ whiteSpace: "nowrap", textOverflow: "ellipsis" }}
              title={messages[messages.length - 1].content}
            >
              {messages[messages.length - 1].content}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Chatbox;
