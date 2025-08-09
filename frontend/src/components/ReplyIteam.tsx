import React from "react";
import { SendHorizontal } from "lucide-react";
import Button from "./Button";

interface ReplyIteamProps {
  level: number;
  currentUserAvatar: string;
  value: string;
  placeholder?: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
}

const ReplyIteam: React.FC<ReplyIteamProps> = ({
  level,
  currentUserAvatar,
  value,
  placeholder = "Viết trả lời của bạn...",
  onChange,
  onSubmit,
}) => {
  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  const showArc = level > 1;

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
      <div className="flex items-center justify-center flex-1">
        <img
          src={currentUserAvatar}
          alt="me"
          className="w-10 h-10 rounded-full mr-3 border-3 border-blue-400"
          style={{ position: "relative", zIndex: 1 }}
        />
        <div className="relative flex-1">
          <input
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={onKeyDown}
            className="w-full p-1.5 pr-10 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Button
            onClick={onSubmit}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-600 hover:text-blue-700 p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        
          >
            <SendHorizontal size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReplyIteam;
