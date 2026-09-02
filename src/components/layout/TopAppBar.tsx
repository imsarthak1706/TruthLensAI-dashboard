"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Icon } from "../ui/Icon";
import { Button } from "../ui/Button";

interface TopAppBarProps {
  onToggleMobileNav?: () => void;
}

export function TopAppBar({ onToggleMobileNav }: TopAppBarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const getBreadcrumb = () => {
    if (pathname === "/" || pathname === "/overview") return "Security Overview";
    if (pathname === "/scan/new") return "Multimodal Threat Scanner";
    if (pathname.startsWith("/scan/")) return "Forensic Threat Report";
    if (pathname === "/history") return "Telemetry & Scan History";
    if (pathname === "/incidents") return "Incident Triage Center";
    if (pathname === "/community") return "Community Intelligence Database";
    if (pathname === "/analytics") return "Detection Analytics & Benchmarks";
    if (pathname === "/settings") return "Access Restricted";
    return "Console";
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/history?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="bg-surface-dim/80 backdrop-blur-md fixed top-0 right-0 w-full md:w-[calc(100%-260px)] z-30 border-b border-outline-variant flex justify-between items-center h-16 px-container-margin">
      {/* Left side: Mobile menu toggle + Contextual Breadcrumb */}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleMobileNav}
          className="md:hidden text-on-surface-variant hover:text-primary transition-colors p-1"
          aria-label="Open Navigation"
        >
          <Icon name="menu" className="text-2xl" />
        </button>

        <div className="flex items-center gap-2">
          <span className="font-label-caps text-xs text-on-surface-variant uppercase tracking-wider hidden sm:inline">
            Console
          </span>
          <span className="text-on-surface-variant/40 hidden sm:inline">/</span>
          <h2 className="font-headline-sm text-sm sm:text-base font-semibold text-on-surface">
            {getBreadcrumb()}
          </h2>
        </div>
      </div>

      {/* Center/Right: Global Search, New Scan CTA, Notifications */}
      <div className="flex items-center gap-4">
        {/* Global Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative w-64 lg:w-80 hidden md:block">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">
            <Icon name="search" className="text-base" />
          </span>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface-container-lowest border border-outline-variant rounded pl-9 pr-4 py-1.5 text-xs font-code-sm text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            placeholder="Search scans, URLs, domains, incidents..."
            type="text"
          />
        </form>

        <Link href="/scan/new">
          <Button variant="primary" size="sm" icon="security">
            New Scan
          </Button>
        </Link>

        <div className="flex items-center gap-2 border-l border-outline-variant pl-4">
          <button
            className="text-on-surface-variant hover:text-primary transition-colors w-8 h-8 flex items-center justify-center rounded hover:bg-surface-container-high relative"
            aria-label="Notifications"
          >
            <Icon name="notifications" className="text-lg" />
            <span className="w-1.5 h-1.5 rounded-full bg-error absolute top-1.5 right-1.5" />
          </button>
        </div>
      </div>
    </header>
  );
}
