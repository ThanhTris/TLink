import React, { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import twemoji from "twemoji";

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
  const containerClass = `chat-post-item px-3 py-2 rounded-2xl max-w-[80%] text-left ${variantStyles[item.variant]} ${
    clickable ? "cursor-pointer hover:shadow-md" : ""
  }`;

  // Lấy nội dung: search ưu tiên shorter_content; các variant khác hiển thị full content
  const rawContent = useMemo(() => {
    if (item.variant === 'search') return item.shorter_content || item.content || "";
    return item.content || item.shorter_content || "";
  }, [item]);

  // Truncate chỉ với search
  const displayedContent = useMemo(() => {
    if (item.variant === 'search' && rawContent.length > 300) {
      return rawContent.slice(0, 300).trimEnd() + "...";
    }
    return rawContent;
  }, [rawContent, item.variant]);

  const markdownComponents = {
    ul: ({node, ...props}: any) => <ul className="pl-5 list-disc mb-2" {...props} />,
    ol: ({node, ...props}: any) => <ol className="pl-5 list-decimal mb-2" {...props} />,
    li: ({node, ...props}: any) => <li className="mb-1" {...props} />,
    code: ({inline, className, children, ...props}: any) =>
      inline ? (
        <code className="px-1 rounded bg-gray-200 text-[11px]" {...props}>{children}</code>
      ) : (
        <pre className="bg-gray-900 text-gray-100 rounded-md p-2 overflow-x-auto text-xs mb-2">
          <code {...props}>{children}</code>
        </pre>
      ),
    a: ({node, ...props}: any) => <a className="text-blue-600 underline" target="_blank" rel="noopener noreferrer" {...props} />,
    p: ({node, ...props}: any) => <p className="mb-2 leading-snug" {...props} />,
    h1: ({node, ...props}: any) => <h1 className="font-bold text-lg mt-3 mb-2" {...props} />,
    h2: ({node, ...props}: any) => <h2 className="font-semibold text-base mt-3 mb-2" {...props} />,
    h3: ({node, ...props}: any) => <h3 className="font-semibold text-sm mt-3 mb-1" {...props} />,
    text: ({value}: any) => (
      <span
        dangerouslySetInnerHTML={{
          __html: twemoji.parse(value, {
            folder: "svg",
            ext: ".svg",
            className: "inline align-[-0.125em] w-4 h-4",
            base: "https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/",
          }),
        }}
      />
    ),
  };

  return (
    <div
      className={containerClass}
      onClick={() => clickable && onOpen && onOpen(item.id)} // Make the entire card clickable
    >
      {item.title && (
        <div className={`font-semibold mb-1 ${titleStyles[item.variant]}`}>
          {item.title}
        </div>
      )}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-1">
          {allTags.map((t, i) => (
            <span
              key={i}
              className={`inline-block text-[10px] font-semibold rounded-full px-2 py-0.5 ${tagColor[item.variant]}`}
            >
              #{t}
            </span>
          ))}
        </div>
      )}
      {displayedContent && (
        <div className="text-xs text-gray-700 whitespace-pre-wrap break-words">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={markdownComponents as any}
          >
            {displayedContent}
          </ReactMarkdown>
        </div>
      )}
     
    </div>
  );
};

export default ChatPostCard;
