import React from "react";

export type ChatPostVariant = 'search' | 'create' | 'edit' | 'delete';

export interface ChatDisplayItem {
  id?: number | string;
  title?: string;
  parentTag?: string;
  parent_tags?: string[] | string;
  childTags?: string[];
  child_tags?: string[] | string;
  content?: string;
  shorter_content?: string;
  variant: ChatPostVariant;
}

interface ChatPostCardProps {
  item: ChatDisplayItem;
  onOpen?: (id: number | string | undefined) => void;
}

const variantStyles: Record<ChatPostVariant, string> = {
  search: "bg-gray-100",
  create: "bg-green-50 border border-green-200",
  edit: "bg-yellow-50 border border-yellow-200",
  delete: "bg-red-50 border border-red-200"
};

const titleStyles: Record<ChatPostVariant, string> = {
  search: "text-blue-600",
  create: "text-green-700",
  edit: "text-yellow-700",
  delete: "text-red-700"
};

const tagColor: Record<ChatPostVariant, string> = {
  search: "text-blue-700 bg-blue-100",
  create: "text-green-700 bg-green-100",
  edit: "text-yellow-700 bg-yellow-100",
  delete: "text-red-700 bg-red-100"
};

const ChatPostCard: React.FC<ChatPostCardProps> = ({ item, onOpen }) => {
  const pTags: string[] = (() => {
    if (Array.isArray(item.parent_tags)) return item.parent_tags;
    if (typeof item.parent_tags === 'string') return item.parent_tags.split(',').map(s => s.trim()).filter(Boolean);
    if (item.parentTag) return [item.parentTag];
    return [];
  })();

  const cTags: string[] = (() => {
    if (Array.isArray(item.child_tags)) return item.child_tags;
    if (typeof item.child_tags === 'string') return item.child_tags.split(',').map(s => s.trim()).filter(Boolean);
    if (Array.isArray(item.childTags)) return item.childTags;
    return [];
  })();

  const allTags = [...pTags, ...cTags].filter(Boolean);
  const clickable = !!item.id && item.variant !== 'create';
  const showFullContent = item.variant === 'create' || item.variant === 'edit';
  const containerClass = `chat-post-item px-3 py-2 rounded-2xl max-w-[80%] mb-2 text-left ${variantStyles[item.variant]}`;

  // chuẩn hóa và cắt nội dung tối đa 300 ký tự
  const rawContent = (() => {
    const full = (item.variant === 'create' || item.variant === 'edit')
      ? item.content
      : (item.shorter_content || item.content);
    return full || "";
  })();
  const displayedContent = rawContent.length > 300 ? rawContent.slice(0, 300).trimEnd() + "..." : rawContent;

  return (
    <div className={containerClass}>
      {item.title && (
        clickable ? (
          <button
            type="button"
            onClick={() => onOpen && onOpen(item.id)}
            className={`font-semibold hover:underline block text-left ${titleStyles[item.variant]}`}
          >
            {item.title}
          </button>
        ) : (
          <div className={`font-semibold mb-1 ${titleStyles[item.variant]}`}>{item.title}</div>
        )
      )}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-1">
          {allTags.map((t, i) => (
            <span key={i} className={`inline-block text-[10px] font-semibold rounded-full px-2 py-0.5 ${tagColor[item.variant]}`}>#{t}</span>
          ))}
        </div>
      )}
      {displayedContent && (
        <div
          className="text-xs text-gray-700 whitespace-pre-wrap break-words"
        >
          {displayedContent}
        </div>
      )}
      {item.variant === 'delete' && (
        <div className="text-[10px] text-red-600 mt-1">Bài viết đã bị xóa.</div>
      )}
    </div>
  );
};

export default ChatPostCard;
