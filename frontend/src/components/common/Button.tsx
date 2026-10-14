import React, { ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger" | "amber";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  icon,
  className = "",
  disabled,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed select-none rounded-lg";

  const sizeStyles = {
    sm: "px-2.5 py-1.5 text-xs gap-1.5",
    md: "px-4 py-2 text-sm gap-2",
    lg: "px-5 py-2.5 text-base gap-2.5",
  };

  const variantStyles = {
    primary:
      "bg-[#F4B400] hover:bg-[#D99A00] text-[#1F2933] font-bold shadow-xs focus:ring-[#F4B400]",
    secondary:
      "bg-white hover:bg-[#FFF3C4] text-[#1F2933] border border-[#E5E7EB] hover:border-[#F4B400] focus:ring-[#F4B400]",
    outline:
      "bg-transparent hover:bg-[#FFF3C4] text-[#1F2933] border border-[#E5E7EB] hover:border-[#F4B400] focus:ring-[#F4B400]",
    danger:
      "bg-rose-600 hover:bg-rose-700 text-white shadow-xs focus:ring-rose-500",
    amber:
      "bg-[#F4B400] hover:bg-[#D99A00] text-[#1F2933] font-semibold shadow-xs focus:ring-[#F4B400]",
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : (
        icon && <span className="shrink-0">{icon}</span>
      )}
      <span>{children}</span>
    </button>
  );
};
