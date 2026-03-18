import { ReactNode } from "react";

interface ForgeButtonProps {
  children: ReactNode;
  variant?: "primary" | "outline" | "ghost";
  size?: "default" | "lg";
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}

const ForgeButton = ({
  children,
  variant = "primary",
  size = "default",
  className = "",
  onClick,
  disabled,
}: ForgeButtonProps) => {
  const base = "relative group overflow-hidden font-display font-bold uppercase tracking-widest transition-colors duration-200";
  
  const sizes = {
    default: "px-6 py-3 text-xs",
    lg: "px-8 py-4 text-sm",
  };

  const variants = {
    primary: "border border-primary bg-transparent text-primary hover:text-primary-foreground",
    outline: "border border-border bg-transparent text-foreground hover:text-primary-foreground",
    ghost: "border border-transparent text-muted-foreground hover:text-foreground",
  };

  return (
    <button
      className={`${base} ${sizes[size]} ${variants[variant]} ${className} ${disabled ? "opacity-50 pointer-events-none" : ""}`}
      onClick={onClick}
      disabled={disabled}
    >
      {variant !== "ghost" && (
        <div className="absolute inset-0 bg-primary translate-y-[101%] group-hover:translate-y-0 transition-transform duration-200 ease-out" />
      )}
      <span className="relative z-10">{children}</span>
    </button>
  );
};

export default ForgeButton;
