"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { Menu, X, BookOpen, User, LogOut, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Navbar() {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#0A1F44]/75 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2.5 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-[#0A1F44] shadow-[0_0_15px_rgba(255,255,255,0.2)] transition-transform group-hover:scale-105">
                <BookOpen className="h-5 w-5" />
              </div>
              <span className="font-heading text-lg font-bold tracking-tight text-white transition-colors group-hover:text-slate-300">
                Corporate Engineering Hub
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
              Discovery Feed
            </Link>
            {session && (session.user as any)?.role === "CREATOR" && (
              <Link href="/dashboard/articles" className="text-sm font-medium text-slate-300 hover:text-white transition-colors flex items-center gap-1.5">
                <LayoutDashboard className="h-4 w-4" />
                Creator Studio
              </Link>
            )}

            {/* Auth Actions */}
            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative flex items-center gap-2 rounded-full border border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white px-4 py-2 text-sm transition-all cursor-pointer">
                    <User className="h-4 w-4" />
                    <span>{session.user?.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 mt-2 bg-[#0A1F44] border border-white/10 text-white">
                  <DropdownMenuLabel className="font-semibold text-slate-400">My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem className="py-2.5 focus:bg-white/10 focus:text-white">
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm">{session.user?.name}</span>
                      <span className="text-xs text-slate-400">{(session.user as any)?.role || "Visitor"}</span>
                    </div>
                  </DropdownMenuItem>
                  {/* Dashboard link if creator */}
                  {(session.user as any)?.role === "CREATOR" && (
                    <DropdownMenuItem asChild className="focus:bg-white/10 focus:text-white cursor-pointer">
                      <Link href="/dashboard/articles" className="flex w-full items-center gap-2 py-2">
                        <LayoutDashboard className="h-4 w-4" />
                        <span>Creator Studio</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem onClick={() => signOut()} className="flex w-full items-center gap-2 py-2.5 text-red-400 focus:bg-white/10 focus:text-red-400 cursor-pointer">
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login">
                <Button className="bg-white text-[#0A1F44] hover:bg-slate-200 font-bold px-5 py-2 text-sm shadow-[0_0_15px_rgba(255,255,255,0.15)] transition-all">
                  Sign In
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center rounded-md p-2 text-slate-400 hover:bg-white/5 hover:text-white focus:outline-none transition-colors"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#0A1F44]/95 backdrop-blur-lg">
          <div className="space-y-1 px-4 py-3 pb-4">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block rounded-md px-3 py-2 text-base font-medium text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
            >
              Discovery Feed
            </Link>
            {session && (session.user as any)?.role === "CREATOR" && (
              <Link
                href="/dashboard/articles"
                onClick={() => setMobileMenuOpen(false)}
                className="block rounded-md px-3 py-2 text-base font-medium text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
              >
                Creator Studio
              </Link>
            )}
            <div className="border-t border-white/10 mt-4 pt-4">
              {session ? (
                <div className="space-y-2">
                  <div className="px-3 py-2">
                    <p className="text-sm font-semibold text-white">{session.user?.name}</p>
                    <p className="text-xs text-slate-400">{(session.user as any)?.role || "Visitor"}</p>
                  </div>
                  <Button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      signOut();
                    }}
                    className="w-full justify-start bg-red-600/20 hover:bg-red-600/40 text-red-200 border border-red-500/30 py-2.5 text-sm font-semibold"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </Button>
                </div>
              ) : (
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full bg-white text-[#0A1F44] hover:bg-slate-200 font-bold py-2.5 text-sm">
                    Sign In
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
