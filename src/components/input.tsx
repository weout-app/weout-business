"use client";

import { forwardRef, useState } from "react";
import { Eye, EyeOff, X } from "lucide-react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  clearable?: boolean;
  onClear?: () => void;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, type, className, clearable, onClear, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";

    return (
      <div className="space-y-1.5">
        <label className="block text-sm text-charcoal-500">
          {label}
        </label>
        <div className="relative">
          <input
            ref={ref}
            type={isPassword && showPassword ? "text" : type}
            className={`
              w-full rounded-lg border border-charcoal-200 bg-white px-4 py-3 text-sm
              text-charcoal-900 placeholder:text-charcoal-300
              outline-none transition-colors
              focus:border-primary focus:ring-2 focus:ring-primary/20
              ${error ? "border-error focus:border-error focus:ring-error/20" : ""}
              ${isPassword || clearable ? "pr-12" : ""}
              ${className ?? ""}
            `}
            {...props}
          />
          {clearable && !isPassword && (
            <button
              type="button"
              onClick={onClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-300 hover:text-charcoal-500 transition-colors"
            >
              <X size={16} />
            </button>
          )}
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-300 hover:text-charcoal-500 transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}
        </div>
        {error && <p className="text-xs text-error">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
