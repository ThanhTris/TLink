import React, { useEffect, useRef, useState } from "react";
import { Heart } from "lucide-react";
import Button from "./Button";
import ReplyIteam from "./ReplyIteam";

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
  // new: tên người được mention (nếu có) để render prefix
  mentionName?: string;
  // new: callback xóa mention (set mention_user_id = null)
  onClearMention?: () => void;
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
  mentionName,
  onClearMention,
}) => {
  const showArc = level > 1;

  return (
    <div className="relative flex mb-6">
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

      {/* Khi chỉnh sửa: tái sử dụng UI của ReplyIteam (giữ avatar, phần còn lại là input + send) */}
      {isEditing ? (
        <div className="flex-1">
          <ReplyIteam
            level={level}
            currentUserAvatar={avatar}
            value={mentionName ? `@${mentionName} ${editContent}` : editContent}
            placeholder="Chỉnh sửa bình luận..."
            onChange={(v) => {
              const prefix = mentionName ? `@${mentionName} ` : "";
              // Nếu có mentionName và người dùng xóa prefix thì clear mention_user_id
              if (mentionName && !v.startsWith(prefix)) {
                onClearMention?.();
                onEditChange?.(v);
              } else {
                // Nếu vẫn còn prefix thì chỉ lấy phần content phía sau
                onEditChange?.(mentionName ? v.slice(prefix.length) : v);
              }
            }}
            onSubmit={() => onSaveEdit?.()}
            mentionPrefix={mentionName ? `@${mentionName}` : undefined}
            autoFocus
            hideAvatar
          />
        </div>
      ) : (
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
                <div className="absolute right-0 mt-2 w-36 bg-white rounded-md shadow-lg z-10">
                  {isOwn ? (
                    <>
                      {!isEditing && (
                        <>
                          <Button
                            onClick={onStartEdit}
                            className="block w-full text-left px-4 py-2 rounded-md text-blue-600 hover:bg-gray-100"
                          >
                            Chỉnh sửa
                          </Button>
                          <Button
                            onClick={onDelete}
                            className="block w-full text-left px-4 py-2 rounded-md text-red-600 hover:bg-gray-100"
                          >
                            Xóa
                          </Button>
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      {!isHidden ? (
                        <Button
                          onClick={onHide}
                          className="block w-full text-left px-4 py-2 text-yellow-600 rounded-md hover:bg-gray-100"
                        >
                          Ẩn bình luận
                        </Button>
                      ) : (
                        <Button
                          onClick={onShow}
                          className="block w-full text-left px-4 py-2 text-blue-600 rounded-md hover:bg-gray-100"
                        >
                          Hiện bình luận
                        </Button>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Nội dung hiển thị khi KHÔNG chỉnh sửa */}
          <p className="mt-1 text-gray-800 break-words">
            {isHidden ? (
              "[Bình luận đã bị ẩn]"
            ) : (
              <>
                {/* Nếu có mentionName thì hiển thị @TênNgườiDùng trước content */}
                {mentionName && <span className="font-semibold">@{mentionName} </span>}
                {content}
              </>
            )}
          </p>

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
      )}
    </div>
  );
};

export default CommentIteam;
