"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUIStore } from "@/lib/store";
import { BookOpen, FileText, PlusCircle, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function CreatorSidebar() {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar } = useUIStore();

  const links = [
    {
      label: "Article Inventory",
      href: "/dashboard/articles",
      icon: FileText,
    },
    {
      label: "New Article",
      href: "/dashboard/articles/create",
      icon: PlusCircle,
    },
  ];

  return (
    <>
      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed top-16 bottom-0 z-30 border-r border-white/10 bg-[#0A1F44]/95 transition-all duration-300 flex flex-col justify-between",
          sidebarOpen 
            ? "w-64 left-0" 
            : "-left-64 md:left-0 w-0 md:w-20 overflow-hidden md:overflow-visible"
        )}
      >
        {/* Navigation Section */}
        <div className="flex-1 px-3 py-6 space-y-6">
          <div className="space-y-1.5">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-3.5 px-3 py-3 rounded-lg text-sm font-medium transition-all group relative",
                    isActive
                      ? "bg-white text-[#0A1F44] shadow-[0_0_15px_rgba(255,255,255,0.15)]"
                      : "text-slate-300 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span
                    className={cn(
                      "transition-opacity duration-300 whitespace-nowrap",
                      sidebarOpen ? "opacity-100" : "hidden md:inline opacity-0 w-0 overflow-hidden md:group-hover:opacity-100 md:group-hover:w-auto md:group-hover:absolute md:group-hover:left-20 md:group-hover:bg-[#0A1F44] md:group-hover:px-3 md:group-hover:py-2 md:group-hover:border md:group-hover:border-white/10 md:group-hover:rounded-md"
                    )}
                  >
                    {link.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-3 border-t border-white/10 space-y-1.5">
          <Link
            href="/"
            className="flex items-center gap-3.5 px-3 py-3 rounded-lg text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-white transition-all group relative"
          >
            <ArrowLeft className="h-5 w-5 shrink-0" />
            <span
              className={cn(
                "transition-opacity duration-300 whitespace-nowrap",
                sidebarOpen ? "opacity-100" : "hidden md:inline opacity-0 w-0 overflow-hidden md:group-hover:opacity-100 md:group-hover:w-auto md:group-hover:absolute md:group-hover:left-20 md:group-hover:bg-[#0A1F44] md:group-hover:px-3 md:group-hover:py-2 md:group-hover:border md:group-hover:border-white/10 md:group-hover:rounded-md"
              )}
            >
              Back to Feed
            </span>
          </Link>

          {/* Collapse/Expand Toggle Button (Hidden on Mobile) */}
          <button
            onClick={toggleSidebar}
            className="hidden md:flex w-full items-center gap-3.5 px-3 py-3 rounded-lg text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-white transition-all cursor-pointer"
          >
            {sidebarOpen ? (
              <>
                <ChevronLeft className="h-5 w-5 shrink-0" />
                <span>Collapse Sidebar</span>
              </>
            ) : (
              <>
                <ChevronRight className="h-5 w-5 shrink-0" />
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Mobile Drawer Overlay Trigger */}
      {sidebarOpen && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 z-20 bg-black/40 backdrop-blur-xs md:hidden"
        />
      )}
    </>
  );
}
