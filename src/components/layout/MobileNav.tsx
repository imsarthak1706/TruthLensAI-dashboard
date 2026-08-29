"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { APP_CONFIG, NAV_LINKS } from "@/lib/constants";
import { Icon } from "../ui/Icon";

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const pathname = usePathname();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden bg-black/70 backdrop-blur-sm flex">
      <div className="w-[280px] bg-surface-container-lowest h-full border-r border-outline-variant p-container-margin flex flex-col justify-between shadow-2xl animate-in slide-in-from-left duration-200">
        <div>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center border border-primary/30 text-primary">
                <Icon name="shield" fill={true} />
              </div>
              <h2 className="font-headline-md text-headline-md font-bold text-primary tracking-tight">
                {APP_CONFIG.name}
              </h2>
            </div>
            <button onClick={onClose} className="text-on-surface-variant p-1">
              <Icon name="close" className="text-xl" />
            </button>
          </div>

          <nav className="space-y-1">
            {NAV_LINKS.map((link) => {
              const isActive =
                pathname === link.href ||
                (link.href === "/overview" && pathname === "/") ||
                (link.href !== "/overview" && pathname.startsWith(link.href));

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded text-sm transition-colors",
                    isActive
                      ? "text-primary font-bold border-l-2 border-primary bg-primary/10"
                      : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
                  )}
                >
                  <Icon name={link.icon} fill={isActive} className="text-lg" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="pt-4 border-t border-outline-variant">
          <div className="flex items-center gap-2 text-primary font-label-caps text-label-caps uppercase">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span>{APP_CONFIG.statusText}</span>
          </div>
        </div>
      </div>

      <div className="flex-1" onClick={onClose} />
    </div>
  );
}
