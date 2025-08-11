import React from "react";

interface ButtonProps {
  onClick?: () => void;
  className?: string;
  children: React.ReactNode;
  title?: string; // optional tooltip text
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({ onClick, className = "", children, title, disabled }) => {
  const cursorClass = disabled ? "cursor-not-allowed" : "cursor-pointer";
  return (
    <button
      onClick={disabled ? undefined : onClick}
      className={`${cursorClass} ${className}`}
      title={title}
      disabled={disabled}
      aria-disabled={disabled}
      type="button"
    >
      {children}
    </button>
  );
};

export default Button;