import React from "react";
import { Heart } from "lucide-react";
import Button from "./Button";

interface CommentIteamProps {
  avatar: string;
  id: number;
  name: string;
  createdAt: Date;
  content: string;
  like_count: number;
  is_like: boolean;
  parent_id: number | null;
  level: number;
  onLike?: () => void;
  onReply?: () => void;
  // Menu & edit/hide/show control (nhận từ parent)
  isOwn?: boolean;
  isHidden?: boolean;
  isEditing?: boolean;
  editContent?: string;
  menuOpen?: boolean;
  onToggleMenu?: () => void;
  onStartEdit?: () => void;
  onEditChange?: (v: string) => void;
  onSaveEdit?: () => void;
  onDelete?: () => void;
  onHide?: () => void;
  onShow?: () => void;
}

const CommentIteam: React.FC<CommentIteamProps> = ({
  avatar,
  name,
  createdAt,
  content,
  like_count,
  is_like,
  level,
  onLike,
  onReply,
  isOwn = false,
  isHidden = false,
  isEditing = false,
  editContent = "",
  menuOpen = false,
  onToggleMenu,
  onStartEdit,
  onEditChange,
  onSaveEdit,
  onDelete,
  onHide,
  onShow,
}) => {
  const showArc = level > 1;

  return (
    <div className="relative flex mb-6">      {/* Đường cong từ đường dọc đến góc 9h của avatar: level > 1 luôn có */}
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
      <img
        src={avatar}
        alt={name}
        className="w-10 h-10 rounded-full mr-3 z-10 border-3 border-blue-400"
        style={{ position: "relative" }}
      />
      <div className="flex-1">
        <div className="flex items-start">
          <div className="flex-1">
            <div className="flex items-center">
              <span className="font-semibold">{name}</span>
              <span className="ml-2 text-xs text-gray-500">
                {createdAt.toLocaleString()}
              </span>
            </div>
          </div>
          {/* Menu ... ở góc trên phải */}
          <div className="relative ml-2">
            <Button
              onClick={onToggleMenu}
              className="text-gray-500 hover:text-gray-700 focus:outline-none px-2"
              aria-label="menu"
            >
              ...
            </Button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-36 bg-white border rounded-md shadow-lg z-10">
                {isOwn ? (
                  <>
                    {!isEditing && (
                      <>
                        <Button
                          onClick={onStartEdit}
                          className="block w-full text-left px-4 py-2 text-blue-600 hover:bg-gray-100"
                        >
                          Chỉnh sửa
                        </Button>
                        <Button
                          onClick={onDelete}
                          className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                        >
                          Xóa
                        </Button>
                      </>
                    )}
                    {isEditing && (
                      <Button
                        onClick={onSaveEdit}
                        className="block w-full text-left px-4 py-2 text-green-600 hover:bg-gray-100"
                      >
                        Lưu
                      </Button>
                    )}
                  </>
                ) : (
                  <>
                    {!isHidden ? (
                      <Button
                        onClick={onHide}
                        className="block w-full text-left px-4 py-2 text-yellow-600 hover:bg-gray-100"
                      >
                        Ẩn
                      </Button>
                    ) : (
                      <Button
                        onClick={onShow}
                        className="block w-full text-left px-4 py-2 text-blue-600 hover:bg-gray-100"
                      >
                        Hiện lại
                      </Button>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Nội dung / chỉnh sửa */}
        {!isEditing ? (
          <p className="mt-1 text-gray-800 break-words">
            {isHidden ? "[Bình luận đã bị ẩn]" : content}
          </p>
        ) : (
          <input
            type="text"
            value={editContent}
            onChange={(e) => onEditChange?.(e.target.value)}
            className="w-full p-2 mt-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSaveEdit?.();
              }
            }}
          />
        )}

        <div className="flex items-center gap-4 mt-2 text-sm">
          <Button
            className={`flex items-center gap-1 ${
              is_like ? "text-red-500" : "text-gray-500"
            } focus:outline-none`}
            onClick={onLike}
          >
            <Heart
              size={16}
              color={is_like ? "#ef4444" : "gray"}
              fill={is_like ? "#ef4444" : "none"}
            />
            {like_count} Thích
          </Button>
          <Button onClick={onReply}>Trả lời</Button>
        </div>
      </div>
    </div>
  );
};

export default CommentIteam;