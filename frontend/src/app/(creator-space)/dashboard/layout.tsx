"use client";

import CreatorSidebar from "@/components/layout/CreatorSidebar";
import Navbar from "@/components/layout/Navbar";
import { useUIStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { sidebarOpen } = useUIStore();

  return (
    <div className="flex flex-col min-h-screen bg-[#0A1F44]">
      {/* Top Navigation */}
      <Navbar />

      {/* Main Console Workspace */}
      <div className="flex flex-1 relative">
        {/* Left Console Sidebar */}
        <CreatorSidebar />

        {/* Content Viewport */}
        <main
          className={cn(
            "flex-1 min-h-[calc(100vh-4rem)] transition-all duration-300 p-6 md:p-8 lg:p-10",
            sidebarOpen ? "ml-64" : "ml-16 md:ml-20"
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
