import React, { useState, useRef, useEffect } from "react";
import { MessageCircleMore, SendHorizontal } from "lucide-react";
import Button from "./Button";
import PostModal from "./PostModal";
import ChatPostCard from "./ChatPostCard";
import type { ChatDisplayItem } from "./ChatPostCard";

const API_URL = "http://localhost:5678/webhook-test/chatbox";

type ChatMessage = { role: "user" | "bot"; content: string; card?: ChatDisplayItem; };

const Chatbox: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [postModalId, setPostModalId] = useState<number | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [tagMode, setTagMode] = useState<{ active: boolean; step: string | null; options: string[]; selectedChildTags: string[] }>({ active: false, step: null, options: [], selectedChildTags: [] });
  const [lastMessage, setLastMessage] = useState<string | null>(null);
  const [currentAction, setCurrentAction] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<string | null>(null);
  const chatboxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
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
  }, [open, messages, isTyping, tagMode]);

  // Đảm bảo khi mở chatbox thì không mở PostModal
  useEffect(() => {
    if (open) setPostModalId(null);
  }, [open]);

  const normalizeOne = (obj: any, variant: ChatDisplayItem["variant"]): ChatDisplayItem => {
    if (!obj || typeof obj !== "object") return { variant } as any;
    const { authorId, authorID, author_id, ...rest } = obj;
    return { ...rest, variant };
  };
  const normalizeArray = (arr: any[], variant: ChatDisplayItem["variant"]) => arr.map(o => normalizeOne(o, variant));

  const processApiResponse = (raw: any) => {
    const payload = Array.isArray(raw) ? raw[0] : raw;
    const action = payload?.action ?? null;
    const step = payload?.step ?? null;
    const SKIP_CARD_STEPS = ['edit_parent_tag', 'edit_child_tag'];

    setCurrentAction(action);
    setCurrentStep(step);

    if (step === 'edit_parent_tag' || step === 'edit_child_tag') {
      const opts = Array.isArray(payload?.data) ? payload.data : [];
      setTagMode(prev => ({
        active: true,
        step,
        options: opts,
        selectedChildTags: step === 'edit_child_tag' ? prev.selectedChildTags : []
      }));
    } else {
      setTagMode({ active: false, step: null, options: [], selectedChildTags: [] });
    }

    const newMessages: ChatMessage[] = [];

    if (payload?.message) {
      newMessages.push({ role: "bot", content: payload.message });
      setLastMessage(payload.message);
    }

    // NEW: Nếu data là post ID, mở PostModal
    if (typeof payload?.data === "number" && payload.success) {
      setPostModalId(payload.data); // Mở modal với ID bài viết
    }

    if (
      payload?.data &&
      typeof payload.data === "object" &&
      !Array.isArray(payload.data) &&
      !SKIP_CARD_STEPS.includes(step)
    ) {
      const variant: ChatDisplayItem["variant"] =
        action === "delete" ? "delete" :
        action === "create" ? "create" :
        (action === "edit" || action === "update") ? "edit" : "search";
      const item = normalizeOne(payload.data, variant);
      newMessages.push({ role: "bot", content: item.title || "", card: item });
      if (!payload?.message && !payload?.lastMessage) setLastMessage(item.title || variant.toUpperCase());
    }

    if (
      Array.isArray(payload?.data) &&
      payload.data.length > 0 &&
      !SKIP_CARD_STEPS.includes(step)
    ) {
      const variant: ChatDisplayItem["variant"] =
        action === "delete" ? "delete" :
        action === "create" ? "create" :
        (action === "edit" || action === "update") ? "edit" : "search";
      const items = normalizeArray(payload.data, variant);
      items.forEach(it => {
        newMessages.push({
          role: "bot",
          content: it.title || (typeof it.content === 'string' ? it.content.slice(0, 60) : ""),
          card: it
        });
      });
      if (!payload?.message && !payload?.lastMessage) {
        const first = items[0];
        setLastMessage(first.title || (typeof first.content === 'string' ? first.content.slice(0,60) : "Kết quả"));
      }
    }

    if (payload?.lastMessage) {
      newMessages.push({ role: "bot", content: payload.lastMessage });
      setLastMessage(payload.lastMessage);
    }

    if (newMessages.length === 0 && !payload?.message && !payload?.lastMessage) {
      const txt = payload?.output || JSON.stringify(payload);
      newMessages.push({ role: "bot", content: txt });
      setLastMessage(txt);
    }

    if (newMessages.length > 0) setMessages(prev => [...prev, ...newMessages]);
  };

  const sendRequest = async (body: any) => {
    // Luôn chỉ gửi đúng 4 trường yêu cầu
    const payload = {
      userId,
      action: body.action ?? null,
      step: body.step ?? null,
      chatInput: body.chatInput ?? null
    };
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.json();
  };

  // Chọn tag cha: gửi chatInput = string
  const handleParentTagSelect = async (tag: string) => {
    if (!tagMode.active || tagMode.step !== 'edit_parent_tag' || isTyping) return;
    setMessages(prev => [...prev, { role: 'user', content: tag }]);
    setIsTyping(true);
    setTagMode(prev => ({ ...prev, options: [] }));
    try {
      const data = await sendRequest({ userId, action: currentAction, step: 'edit_parent_tag', chatInput: tag });
      setIsTyping(false); processApiResponse(data);
    } catch {
      setIsTyping(false);
      setMessages(prev => [...prev, { role:'bot', content:'Lỗi kết nối đến máy chủ!' }]);
    }
  };

  // Toggle tag con
  const toggleChildTag = (tag: string) => {
    if (!tagMode.active || tagMode.step !== 'edit_child_tag' || isTyping) return;
    setTagMode(prev => ({
      ...prev,
      selectedChildTags: prev.selectedChildTags.includes(tag)
        ? prev.selectedChildTags.filter(t => t !== tag)
        : [...prev.selectedChildTags, tag]
    }));
  };

  // Submit tag con: gửi chatInput = array
  const submitChildTags = async () => {
    if (!tagMode.active || tagMode.step !== 'edit_child_tag' || tagMode.selectedChildTags.length === 0 || isTyping) return;
    const chosen = [...tagMode.selectedChildTags];
    setMessages(prev => [...prev, { role: 'user', content: chosen.join(', ') }]);
    setIsTyping(true);
    setTagMode(prev => ({ ...prev, options: [], selectedChildTags: [] }));
    try {
      const data = await sendRequest({ userId, action: currentAction, step: 'edit_child_tag', chatInput: chosen });
      setIsTyping(false); processApiResponse(data);
    } catch {
      setIsTyping(false);
      setMessages(prev => [...prev, { role:'bot', content:'Lỗi kết nối đến máy chủ!' }]);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (tagMode.active) {
      if (tagMode.step === 'edit_child_tag' && tagMode.selectedChildTags.length > 0) {
        await submitChildTags();
      }
      return;
    }

    if (!input.trim()) return;
    const userMsg = input.trim();
    setMessages(prev => [...prev, { role:"user", content:userMsg }]);
    setInput("");
    setIsTyping(true);
    try {
      const data = await sendRequest({ userId, action: currentAction, step: currentStep, chatInput: userMsg });
      setIsTyping(false); processApiResponse(data);
    } catch {
      setIsTyping(false);
      setMessages(prev => [...prev, { role:"bot", content:"Lỗi kết nối đến máy chủ!" }]);
    }
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
          <div ref={chatboxRef} className="w-96 h-96 bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 animate-fadeIn">
            <div className="flex items-center justify-between px-4 py-2 bg-blue-600 text-white">
              <span className="font-semibold">Hỗ trợ AI</span>
              <Button onClick={() => setOpen(false)} className="text-white text-xl font-bold">×</Button>
            </div>
            <div ref={chatContentRef} className="flex-1 p-4 overflow-y-auto">
              {messages.length === 0 && (
                <div className="text-gray-500 text-sm text-center mt-8">Chatbot AI sẵn sàng hỗ trợ bạn!</div>
              )}
              {messages.map((msg, idx) => msg.card ? (
                <div key={"card-" + idx} className="mb-2 text-left">
                  <ChatPostCard item={msg.card} onOpen={(id) => id && setPostModalId(Number(id))} />
                </div>
              ) : (
                <div key={idx} className={msg.role === "user" ? "text-right mb-2" : "text-left mb-2"}>
                  <span className={`${msg.role === "user"
                      ? "inline-block bg-blue-100 text-blue-900 px-3 py-2 rounded-2xl max-w-[80%]"
                      : "inline-block bg-gray-100 text-gray-900 px-3 py-2 rounded-2xl max-w-[80%]"} overflow-hidden`}
                    style={{
                      display: "-webkit-box",
                      WebkitBoxOrient: "vertical",
                      WebkitLineClamp: 4,
                      whiteSpace: "normal"
                    }}
                  >
                    {msg.content}
                  </span>
                </div>
              ))}

              {tagMode.active && tagMode.step === 'edit_parent_tag' && tagMode.options.length > 0 && (
                <div className="mb-2 text-left">
                  <div className="flex flex-wrap gap-2">
                    {tagMode.options.map(opt => (
                      <button
                        key={opt}
                        onClick={() => handleParentTagSelect(opt)}
                        disabled={isTyping}
                        className={`text-xs px-3 py-1 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                          isTyping ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                      >{opt}</button>
                    ))}
                  </div>
                </div>
              )}

              {tagMode.active && tagMode.step === 'edit_child_tag' && tagMode.options.length > 0 && (
                <div className="mb-3 text-left space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {tagMode.options.map(opt => {
                      const selected = tagMode.selectedChildTags.includes(opt);
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => toggleChildTag(opt)}
                          disabled={isTyping}
                          className={`text-xs px-3 py-1 rounded-full border transition focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                            selected ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-blue-700 border-blue-400 hover:bg-blue-50'
                          } ${isTyping ? 'opacity-60 cursor-not-allowed' : ''}`}
                        >{selected ? '✓ ' : ''}{opt}</button>
                      );
                    })}
                  </div>
                  <div className="text-xs text-gray-600">
                    Đã chọn: {tagMode.selectedChildTags.length > 0 ? tagMode.selectedChildTags.join(', ') : 'Chưa có'}
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={submitChildTags}
                      disabled={isTyping || tagMode.selectedChildTags.length === 0}
                      className={`text-xs px-3 py-1 rounded-md font-semibold ${
                        tagMode.selectedChildTags.length === 0 || isTyping
                          ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                    >Xác nhận</button>
                    {tagMode.selectedChildTags.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setTagMode(prev => ({ ...prev, selectedChildTags: [] }))}
                        disabled={isTyping}
                        className="text-xs px-3 py-1 rounded-md bg-red-100 text-red-600 hover:bg-red-200"
                      >Reset</button>
                    )}
                  </div>
                </div>
              )}

              {isTyping && (
                <div className="text-left mb-2">
                  <span className="inline-block bg-gray-100 text-gray-900 px-3 py-2 rounded-2xl max-w-[80%] animate-pulse">
                    AI đang trả lời...
                  </span>
                </div>
              )}
            </div>
            <div className="p-3 bg-gray-50">
              <form className="relative flex items-center" onSubmit={handleSubmit}>
                <div className="flex-1">
                  <textarea
                    ref={inputRef}
                    placeholder={
                      tagMode.active && tagMode.step === 'edit_parent_tag'
                        ? 'Chọn tag cha ở dưới'
                        : tagMode.active && tagMode.step === 'edit_child_tag'
                        ? 'Chọn tag con ở dưới'
                        : 'Nhập tin nhắn...'
                    }
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        handleSubmit(e);
                      }
                    }}
                    className="w-full py-2 px-3 border rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    style={{
                      minHeight: "1rem", // Minimum height for multi-line input
                      maxHeight: "8rem", // Maximum height for 5 lines
                      overflowY: "auto", // Add scroll if content exceeds max height
                    }}
                    rows={Math.min(5, input.split("\n").length)} // Dynamically adjust rows
                  />
                </div>
                <Button
                  className="absolute right-3 bottom-3 text-blue-600 hover:text-blue-700 p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Gửi"
                  onClick={handleSubmit}
                  disabled={tagMode.active && tagMode.step === 'edit_parent_tag'}
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
