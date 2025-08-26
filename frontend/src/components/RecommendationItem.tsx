import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import twemoji from "twemoji";

interface RecommendationItemProps {
  title: string;
  imageUrl?: string;
  content: string;
  tags?: string[];
  onClick?: () => void;
}

const RecommendationItem: React.FC<RecommendationItemProps> = ({
  title,
  imageUrl,
  content,
  tags,
  onClick,
}) => {
  // Custom markdown components giống ContentPost
  const markdownComponents = {
    ul: ({ node, ...props }: any) => <ul className="pl-6 list-disc" {...props} />,
    ol: ({ node, ...props }: any) => <ol className="pl-6 list-decimal" {...props} />,
    li: ({ node, ...props }: any) => <li className="mb-1" {...props} />,
    text: ({ value }: any) => (
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

  return (
    <div
      className="flex flex-col gap-1 p-3 border-b last:border-b-0 cursor-pointer hover:bg-gray-50"
      onClick={onClick}
    >
      <div className="font-semibold text-xl leading-snug mb-1">{title}</div>
      {/* Hiển thị tất cả tags (parent + child) dưới title */}
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-1">
          {tags.map((tag, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
      <div className="flex gap-2 items-start">
        {imageUrl && (
          <img
            src={imageUrl}
            alt="Ảnh bài viết"
            className="w-25 object-cover border-black/10 rounded "
          />
        )}
        <div
          className="text-gray-700 text-sm overflow-hidden text-ellipsis"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            whiteSpace: "normal",
          }}
          title={content}
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

export default RecommendationItem;
