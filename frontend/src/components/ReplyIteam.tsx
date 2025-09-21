import React, { useEffect, useMemo, useRef, useState } from "react";
import { SendHorizontal } from "lucide-react";
import Button from "./Button";

interface ReplyIteamProps {
  level: number;
  currentUserAvatar: string;
  value: string;
  placeholder?: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  // new: show a bold @Name prefix if value starts with "@Name "
  mentionPrefix?: string;
  // tự động focus khi hiển thị
  autoFocus?: boolean;
  // new: trigger refocus when this changes
  focusTick?: number;
  // new: ẩn avatar (dùng khi tái sử dụng cho UI chỉnh sửa trong CommentIteam)
  hideAvatar?: boolean;
}

const ReplyIteam: React.FC<ReplyIteamProps> = ({
  level,
  currentUserAvatar,
  value,
  placeholder = "Viết trả lời của bạn...",
  onChange,
  onSubmit,
  mentionPrefix,
  autoFocus,
  focusTick,
  hideAvatar,
}) => {
  const showArc = level > 1;

  // Detect and handle prefix "@Name "
  const effectivePrefix = useMemo(
    () => (mentionPrefix ? `${mentionPrefix} ` : ""),
    [mentionPrefix]
  );
  const hasPrefix = !!mentionPrefix && value.startsWith(effectivePrefix);
  const displayValue = hasPrefix ? value.slice(effectivePrefix.length) : value;

  // Measure prefix width to pad input
  const prefixRef = useRef<HTMLSpanElement>(null);
  const [prefixWidth, setPrefixWidth] = useState(0);
  useEffect(() => {
    if (hasPrefix && prefixRef.current) {
      setPrefixWidth(prefixRef.current.getBoundingClientRect().width);
    } else {
      setPrefixWidth(0);
    }
  }, [hasPrefix, effectivePrefix]);

  // focus input khi cần
  const inputRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
      const v = inputRef.current.value;
      inputRef.current.selectionStart = v.length;
      inputRef.current.selectionEnd = v.length;
    }
  }, [autoFocus, hasPrefix, focusTick]);

  return (
    <div className="relative flex items-start mb-8">
      {showArc && (
        <div
          className="absolute"
          style={{
            left: -24,
            top: 1,
            width: "20px",
            height: "20px",
            border: "2px solid #d1d5db",
            borderTop: "none",
            borderRight: "none",
            borderRadius: "0 0 0 20px",
            zIndex: 0,
          }}
        />
      )}
      <div className="flex items-start justify-center flex-1">
        {!hideAvatar && (
          <img
            src={currentUserAvatar}
            alt="me"
            className="w-10 h-10 rounded-full mr-3 border-3 border-blue-400"
          />
        )}
        <div className="relative flex-1">
          {/* Visible bold prefix */}
          {hasPrefix && (
            <span
              className="absolute left-3 top-1/2 -translate-y-1/2 font-semibold text-gray-800 pointer-events-none whitespace-pre"
              aria-hidden
            >
              {effectivePrefix}
            </span>
          )}
          {/* Hidden measurer */}
          <span
            ref={prefixRef}
            className="invisible absolute font-semibold"
            style={{ left: 0, top: 0 }}
          >
            {hasPrefix ? effectivePrefix : ""}
          </span>

          <textarea
            ref={inputRef}
            // Ẩn placeholder khi có prefix để con trỏ hiện ngay sau khoảng trắng
            placeholder={hasPrefix ? "" : placeholder}
            value={displayValue}
            onChange={(e) => {
              const raw = e.target.value;
              onChange(
                hasPrefix ? `${effectivePrefix}${raw}`.replace(/\s+$/, " ") : raw
              );
            }}
            onKeyDown={(e) => {
              // Enter -> submit
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSubmit();
                return;
              }
              // Backspace ở đầu -> xóa prefix "@Tên "
              if (
                e.key === "Backspace" &&
                hasPrefix &&
                inputRef.current &&
                inputRef.current.selectionStart === 0 &&
                inputRef.current.selectionEnd === 0
              ) {
                e.preventDefault();
                // gửi giá trị đã bỏ prefix lên parent
                onChange(value.slice(effectivePrefix.length));
              }
            }}
            className="w-full py-2 px-3 border rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            style={{
              paddingLeft: hasPrefix ? Math.ceil(prefixWidth) + 16 : undefined,
              minHeight: "1rem", // Minimum height for multi-line input
              maxHeight: "20rem", // Maximum height for 18 lines
              overflowY: "auto", // Add scroll if content exceeds max height
              
            }}
            rows={Math.min(18, displayValue.split("\n").length)} // Dynamically adjust rows
          />
          {/* Icon inside the input box */}
          <div className="absolute right-3 bottom-3">
            <Button
              onClick={onSubmit}
              className="text-blue-600 hover:text-blue-700 p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <SendHorizontal size={18} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReplyIteam;
