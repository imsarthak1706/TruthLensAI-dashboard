"use client";

import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { TopAppBar } from "./TopAppBar";
import { MobileNav } from "./MobileNav";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-on-background font-body-md antialiased selection:bg-primary/20 selection:text-primary">
      {/* Persistent Left Sidebar for Desktop (260px) */}
      <Sidebar />

      {/* Top Header */}
      <TopAppBar onToggleMobileNav={() => setIsMobileOpen(true)} />

      {/* Mobile Drawer Menu */}
      <MobileNav isOpen={isMobileOpen} onClose={() => setIsMobileOpen(false)} />

      {/* Main Content Area */}
      <main className="md:ml-[260px] pt-16 min-h-screen">
        <div className="p-container-margin max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
