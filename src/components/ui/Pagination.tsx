import React from "react";
import { cn } from "@/lib/utils";
import { Icon } from "./Icon";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalEntries: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  totalEntries,
  onPageChange,
  className,
}: PaginationProps) {
  const start = Math.min((currentPage - 1) * 10 + 1, totalEntries);
  const end = Math.min(currentPage * 10, totalEntries);

  return (
    <div className={cn("border-t border-[#30363D] bg-[#0A0C10] p-4 flex flex-col sm:flex-row items-center justify-between gap-4", className)}>
      <p className="font-body-sm text-body-sm text-on-surface-variant">
        Showing <span className="text-on-surface font-medium">{start}-{end}</span> of{" "}
        <span className="text-on-surface font-medium">{totalEntries.toLocaleString()}</span> entries
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="w-8 h-8 rounded border border-[#30363D] flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:border-outline-variant transition-colors disabled:opacity-40 disabled:pointer-events-none"
        >
          <Icon name="chevron_left" className="text-lg" />
        </button>

        {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
          const pageNum = i + 1;
          const isActive = pageNum === currentPage;
          return (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={cn(
                "w-8 h-8 rounded flex items-center justify-center font-code-sm text-code-sm transition-colors",
                isActive
                  ? "bg-primary/10 border border-primary text-primary font-bold"
                  : "border border-[#30363D] text-on-surface-variant hover:text-on-surface hover:border-outline-variant"
              )}
            >
              {pageNum}
            </button>
          );
        })}

        {totalPages > 5 && <span className="text-on-surface-variant px-1 font-code-sm">...</span>}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="w-8 h-8 rounded border border-[#30363D] flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:border-outline-variant transition-colors disabled:opacity-40 disabled:pointer-events-none"
        >
          <Icon name="chevron_right" className="text-lg" />
        </button>
      </div>
    </div>
  );
}
