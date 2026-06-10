"use client";

import { useEffect } from "react";
import CreatorSidebar from "@/components/layout/CreatorSidebar";
import Navbar from "@/components/layout/Navbar";
import RoleGuard from "@/components/common/RoleGuard";
import { useUIStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { sidebarOpen, toggleSidebar } = useUIStore();

  // Auto-collapse the sidebar on initial mobile page loads
  useEffect(() => {
    const handleInitialCollapse = () => {
      if (window.innerWidth < 768 && sidebarOpen) {
        toggleSidebar();
      }
    };
    handleInitialCollapse();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-[#0A1F44] relative">
      {/* Top Navigation */}
      <Navbar />

      {/* Main Console Workspace */}
      <RoleGuard>
        <div className="flex flex-1 relative">
          {/* Left Console Sidebar */}
          <CreatorSidebar />

          {/* Content Viewport */}
          <main
            className={cn(
              "flex-1 min-h-[calc(100vh-4rem)] transition-all duration-300 p-6 md:p-8 lg:p-10",
              sidebarOpen ? "ml-0 md:ml-64" : "ml-0 md:ml-20"
            )}
          >
            {children}
          </main>
        </div>
      </RoleGuard>

      {/* Mobile Floating Menu Button */}
      <button
        onClick={toggleSidebar}
        className="fixed bottom-6 right-6 z-40 flex md:hidden h-12 w-12 items-center justify-center rounded-full bg-white text-[#0A1F44] shadow-2xl border border-white/10 hover:bg-slate-200 cursor-pointer transition-transform duration-200 active:scale-95"
        title="Toggle Menu"
      >
        {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>
    </div>
  );
}

