import React, { useEffect } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "./Icon";

interface SlideOverProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  widthClass?: string;
}

export function SlideOver({
  isOpen,
  onClose,
  title,
  subtitle,
  badge,
  children,
  footer,
  widthClass = "w-[400px]",
}: SlideOverProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        "shrink-0 bg-[#1C2128] border border-[#30363D] rounded-xl flex flex-col h-[calc(100vh-140px)] sticky top-24 shadow-[0_0_30px_rgba(0,0,0,0.5)] transition-all duration-300 z-30",
        widthClass
      )}
    >
      {/* Header */}
      <div className="p-5 border-b border-[#30363D] flex justify-between items-start bg-surface-dim/50 rounded-t-xl">
        <div className="space-y-1">
          {badge && <div className="flex items-center gap-2">{badge}</div>}
          <h3 className="font-headline-sm text-headline-sm text-on-surface leading-tight font-semibold">
            {title}
          </h3>
          {subtitle && <p className="font-code-sm text-xs text-on-surface-variant">{subtitle}</p>}
        </div>
        <button
          onClick={onClose}
          className="text-on-surface-variant hover:text-on-surface transition-colors p-1 rounded hover:bg-surface-container-high"
        >
          <Icon name="close" className="text-xl" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
        {children}
      </div>

      {/* Footer */}
      {footer && (
        <div className="p-4 border-t border-[#30363D] bg-surface-dim/50 rounded-b-xl">
          {footer}
        </div>
      )}
    </div>
  );
}
