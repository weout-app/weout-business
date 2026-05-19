import { Loader2 } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  variant?: "primary" | "outline";
}

export function Button({
  children,
  loading,
  variant = "primary",
  className,
  disabled,
  ...props
}: ButtonProps) {
  const base =
    "w-full rounded-full px-6 py-3 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "bg-primary text-white hover:bg-primary-hover disabled:opacity-50",
    outline:
      "border border-charcoal-200 text-charcoal-700 hover:bg-charcoal-50 disabled:opacity-50",
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${className ?? ""}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <Loader2 size={16} className="animate-spin" />
          Espera por favor...
        </span>
      ) : (
        children
      )}
    </button>
  );
}
