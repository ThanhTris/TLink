import React, { useEffect, useRef, useState } from "react";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";
import Button from "./Button";

interface ToastProps {
  message: string;
  title?: string;
  type?: "success" | "error" | "warning";
  statusCode?: number;
  onClose: () => void;
  inline?: boolean; // NEW: render without fixed positioning to allow stacking
}

const getTypeFromStatus = (statusCode?: number): "success" | "error" | "warning" => {
  if (!statusCode) return "success";
  if (statusCode === 200 || statusCode === 201) return "success";
  if (statusCode >= 500) return "warning";
  if (statusCode >= 400) return "error";
  return "success";
};

const iconMap = {
  success: <CheckCircle className="w-5 h-5 text-green-600" fill="#dcfce7" />,
  error: <XCircle className="w-5 h-5 text-red-600" fill="#fee2e2" />,
  warning: <AlertCircle className="w-5 h-5 text-yellow-600" fill="#fef9c3" />,
};

const bgMap = {
  success: "bg-green-50",
  error: "bg-red-50",
  warning: "bg-yellow-50",
};

const borderMap = {
  success: "border-l-4 border-green-500 border",
  error: "border-l-4 border-red-500 border",
  warning: "border-l-4 border-yellow-500 border",
};

const titleMap = {
  success: "Thành công",
  error: "Thất bại",
  warning: "Cảnh báo",
};

const textColorMap = {
  success: "text-green-700",
  error: "text-red-700",
  warning: "text-yellow-700",
};

const Toast: React.FC<ToastProps> = ({
  message,
  title,
  type,
  statusCode,
  onClose,
  inline, // NEW
}) => {
  const toastType = type || getTypeFromStatus(statusCode);
  const [show, setShow] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Bắt đầu: translate-x-full -> translate-x-0 (slide in)
    setTimeout(() => setShow(true), 10); // delay nhỏ để đảm bảo mount xong mới animate
    timerRef.current = setTimeout(() => {
      setShow(false);
      setTimeout(onClose, 500); // chờ animation xong mới gọi onClose
    }, 2500);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [onClose]);

  return (
    <div
      className={`${inline ? "" : "fixed top-6 right-6 z-50"} min-w-[320px] max-w-xs px-5 py-4 flex flex-row items-start gap-3 rounded-lg shadow-lg
        ${bgMap[toastType]} ${borderMap[toastType]}
        transition-all duration-500 ease-in-out
        ${show ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}
      `}
      role="alert"
      style={{ borderRadius: 10 }}
    >
      <div className="shrink-0 w-8 h-8 relative flex items-center justify-top">
        <div
          className={`absolute left-0 top-0 rounded-full w-8 h-8 ${
            toastType === "success"
              ? "bg-green-100"
              : toastType === "error"
              ? "bg-red-100"
              : "bg-yellow-100"
          }`}
        ></div>
        <div className="absolute left-1.5 top-1.5">{iconMap[toastType]}</div>
      </div>
      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex flex-row items-center w-full">
          <span className="font-semibold text-base text-black">
            {title || titleMap[toastType]}
          </span>
          <Button
            className="ml-auto text-gray-400 hover:text-gray-700 transition"
            onClick={onClose}
            aria-label="Close"
          >
            <XCircle className="w-5 h-5" />
          </Button>
        </div>
        <span className={`mt-1 text-base font-normal ${textColorMap[toastType]} whitespace-pre-line`}>
          {message}
        </span>
      </div>
    </div>
  );
};

export default Toast;
