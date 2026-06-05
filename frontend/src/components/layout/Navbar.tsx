"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Menu, X, BookOpen, User, LogOut, LayoutDashboard, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function Navbar() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isUpgradeDialogOpen, setIsUpgradeDialogOpen] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [upgradeError, setUpgradeError] = useState("");

  const handleUpgradeRole = async () => {
    setIsUpgrading(true);
    setUpgradeError("");
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000/api";
      const accessToken = (session?.user as any)?.accessToken;
      
      const response = await axios.put(
        `${backendUrl}/auth/upgrade`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const { role, token } = response.data;

      // Update next-auth session
      await update({ role, token });

      setIsUpgradeDialogOpen(false);
      
      // Redirect to creator studio dashboard
      router.push("/dashboard/articles");
      router.refresh();
    } catch (err: any) {
      console.error("Failed to upgrade role:", err);
      setUpgradeError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setIsUpgrading(false);
    }
  };

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
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem asChild className="focus:bg-white/10 focus:text-white cursor-pointer">
                    <Link href="/profile" className="flex w-full items-center gap-2 py-2">
                      <User className="h-4 w-4 text-slate-400" />
                      <span>My Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/10" />
                  {/* Dashboard link if creator */}
                  {(session.user as any)?.role === "CREATOR" && (
                    <DropdownMenuItem asChild className="focus:bg-white/10 focus:text-white cursor-pointer">
                      <Link href="/dashboard/articles" className="flex w-full items-center gap-2 py-2">
                        <LayoutDashboard className="h-4 w-4" />
                        <span>Creator Studio</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {/* Upgrade link if visitor */}
                  {(session.user as any)?.role === "VISITOR" && (
                    <DropdownMenuItem 
                      onSelect={() => setIsUpgradeDialogOpen(true)}
                      className="focus:bg-white/10 focus:text-indigo-300 text-indigo-400 font-semibold cursor-pointer"
                    >
                      <div className="flex w-full items-center gap-2 py-2">
                        <Award className="h-4 w-4 text-indigo-400" />
                        <span>Become a Creator</span>
                      </div>
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
                  {/* Profile link in mobile menu */}
                  <Link href="/profile" onClick={() => setMobileMenuOpen(false)} className="block mb-2">
                    <Button className="w-full justify-start bg-white/5 hover:bg-white/10 text-white border border-white/10 py-2.5 text-sm font-semibold cursor-pointer">
                      <User className="mr-2 h-4 w-4 text-slate-400" />
                      My Profile
                    </Button>
                  </Link>
                  {/* Upgrade link in mobile menu */}
                  {(session.user as any)?.role === "VISITOR" && (
                    <Button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setIsUpgradeDialogOpen(true);
                      }}
                      className="w-full justify-start bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-200 border border-indigo-500/30 py-2.5 text-sm font-semibold mb-2"
                    >
                      <Award className="mr-2 h-4 w-4 text-indigo-400" />
                      Become a Creator
                    </Button>
                  )}
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

      {/* Role Upgrade Dialog */}
      <Dialog open={isUpgradeDialogOpen} onOpenChange={setIsUpgradeDialogOpen}>
        <DialogContent className="sm:max-w-[450px] bg-[#0A1F44]/95 border border-white/10 text-white backdrop-blur-md shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-heading font-bold text-white">
              <Award className="h-6 w-6 text-indigo-400 animate-pulse" />
              Become a Creator
            </DialogTitle>
            <DialogDescription className="text-slate-300 mt-3 text-sm leading-relaxed">
              Unlock the Creator Space and share your engineering insights! By upgrading to a Creator account, you will be able to:
            </DialogDescription>
          </DialogHeader>

          <div className="my-4 space-y-3">
            <div className="flex items-start gap-3 rounded-lg bg-white/5 border border-white/5 p-3.5 transition-all hover:bg-white/10">
              <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-indigo-500/20 text-indigo-300 text-xs font-bold">✓</div>
              <div>
                <p className="text-sm font-semibold text-white">Write & Publish Articles</p>
                <p className="text-xs text-slate-400">Share your tutorials, system designs, and case studies with the engineering community.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg bg-white/5 border border-white/5 p-3.5 transition-all hover:bg-white/10">
              <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-[#4f46e5]/20 text-indigo-300 text-xs font-bold">✓</div>
              <div>
                <p className="text-sm font-semibold text-white">Personal Creator Dashboard</p>
                <p className="text-xs text-slate-400">Manage your published works and track real-time readers metrics in one single place.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg bg-white/5 border border-white/5 p-3.5 transition-all hover:bg-white/10">
              <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-[#4f46e5]/20 text-indigo-300 text-xs font-bold">✓</div>
              <div>
                <p className="text-sm font-semibold text-white">Save Drafts & Auto-save</p>
                <p className="text-xs text-slate-400">Work on your articles at your own pace with auto-saving to local storage and sync to db.</p>
              </div>
            </div>
          </div>

          {upgradeError && (
            <p className="text-red-400 text-xs mt-2 bg-red-950/40 border border-red-500/30 p-2.5 rounded">
              {upgradeError}
            </p>
          )}

          <DialogFooter className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
            <Button
              variant="ghost"
              onClick={() => setIsUpgradeDialogOpen(false)}
              disabled={isUpgrading}
              className="border border-white/10 hover:bg-white/5 text-white hover:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpgradeRole}
              disabled={isUpgrading}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-all shadow-[0_0_15px_rgba(99,102,241,0.4)]"
            >
              {isUpgrading ? "Upgrading Profile..." : "Yes, Upgrade Me"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </nav>
  );
}
