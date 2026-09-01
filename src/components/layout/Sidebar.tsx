"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { APP_CONFIG, FOOTER_NAV_LINKS, NAV_LINKS } from "@/lib/constants";
import { Icon } from "../ui/Icon";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main Navigation"
      className="hidden md:flex flex-col fixed left-0 top-0 h-full w-[260px] bg-surface-container-lowest border-r border-outline-variant py-container-margin space-y-stack-md z-40"
    >
      {/* Brand Header */}
      <div className="px-container-margin mb-6">
        <Link href="/overview" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center border border-primary/30 text-primary group-hover:border-primary transition-colors shadow-[0_0_10px_rgba(111,221,120,0.15)]">
            <Icon name="shield" fill={true} className="text-xl" />
          </div>
          <div>
            <h1 className="font-headline-md text-headline-md font-bold text-primary tracking-tight">
              {APP_CONFIG.name}
            </h1>
            <p className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
              {APP_CONFIG.subtitle}
            </p>
          </div>
        </Link>

        {/* System Online Status Indicator */}
        <div className="mt-5 flex items-center gap-2 px-3 py-2 bg-surface-container-low border border-surface-variant rounded text-primary">
          <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(111,221,120,0.6)] animate-pulse" />
          <span className="font-label-caps text-label-caps uppercase tracking-wider font-semibold">
            {APP_CONFIG.statusText}
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-4 space-y-1 custom-scrollbar">
        <ul className="space-y-1">
          {NAV_LINKS.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href === "/overview" && pathname === "/") ||
              (link.href !== "/overview" && pathname.startsWith(link.href));

            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2.5 rounded transition-all duration-150 active:scale-[0.98]",
                    isActive
                      ? "text-primary font-bold border-l-2 border-primary bg-primary/10"
                      : "text-on-surface-variant font-medium hover:bg-surface-container-high hover:text-on-surface"
                  )}
                >
                  <Icon
                    name={link.icon}
                    fill={isActive}
                    className={cn("text-lg", isActive ? "text-primary" : "text-on-surface-variant")}
                  />
                  <span className="font-body-sm text-body-sm">{link.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Footer Navigation & Profile */}
      <div className="px-4 mt-auto">
        {FOOTER_NAV_LINKS.length > 0 && (
          <ul className="space-y-1 pt-4 border-t border-outline-variant">
            {FOOTER_NAV_LINKS.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-2 rounded text-on-surface-variant font-medium hover:bg-surface-container-high hover:text-on-surface transition-colors"
                >
                  <Icon name={item.icon} className="text-lg" />
                  <span className="font-body-sm text-body-sm">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}

        {/* User Card */}
        <div className="mt-4 pt-4 border-t border-outline-variant/40 flex items-center gap-3 px-2">
          <img
            src={APP_CONFIG.avatarUrl}
            alt="Security Analyst"
            className="w-8 h-8 rounded-full border border-outline-variant object-cover"
          />
          <div className="overflow-hidden">
            <p className="font-body-sm text-xs font-semibold text-on-surface truncate">SOC Analyst</p>
            <p className="font-code-sm text-[10px] text-on-surface-variant truncate">tier2@truthlens.ai</p>
          </div>
        </div>
      </div>
    </nav>
  );
}
