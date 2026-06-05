"use client";

import { useSession } from "next-auth/react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  User, Mail, Calendar, Shield, Bookmark, FileText, 
  Trash2, ArrowRight, Tag, Eye, Clock, Loader2, Award
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface Post {
  _id: string;
  title: string;
  slug: string;
  category: string;
  status: "DRAFT" | "PUBLISHED";
  createdAt: string;
  viewsCount?: number;
  excerpt?: string;
  authorId: {
    _id: string;
    name: string;
    email: string;
  };
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000/api";
  const token = (session?.user as any)?.accessToken;
  const isCreator = (session?.user as any)?.role === "CREATOR";

  // Tab state: saved (default for visitors) | created (default for creators)
  const [activeTab, setActiveTab] = useState<"created" | "saved">("saved");

  // Redirect to login if unauthenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Set default tab based on role once loaded
  useEffect(() => {
    if (isCreator) {
      setActiveTab("created");
    } else {
      setActiveTab("saved");
    }
  }, [isCreator]);

  // React Query: Fetch user profile data (which contains user info, savedPosts populated, and createdPosts list)
  const { data: profileData, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["user-profile", token],
    enabled: !!token,
    queryFn: async () => {
      const response = await axios.get(`${backendUrl}/users/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    },
  });

  // Mutation: Unbookmark / Toggle Bookmark
  const toggleBookmarkMutation = useMutation({
    mutationFn: async (postId: string) => {
      await axios.post(
        `${backendUrl}/users/bookmark/${postId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    },
    onSuccess: () => {
      refetch();
    },
  });

  const handleUnbookmark = (postId: string) => {
    toggleBookmarkMutation.mutate(postId);
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 relative max-w-7xl mx-auto space-y-8">
        {/* Profile Card Header Skeleton */}
        <div className="bg-white/5 border border-white/10 p-8 rounded-2xl backdrop-blur-md flex flex-col md:flex-row items-center gap-6">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="space-y-2.5 flex-1">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-72" />
          </div>
        </div>
        {/* Tabs Skeleton */}
        <div className="h-10 w-64 bg-white/5 rounded-lg" />
        {/* Articles list skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center px-4">
        <div className="text-center space-y-6 max-w-md bg-white/5 border border-white/10 p-10 rounded-2xl backdrop-blur-md">
          <Shield className="mx-auto h-12 w-12 text-red-400" />
          <h1 className="text-2xl font-bold text-white">Profile Synchronisation Error</h1>
          <p className="text-slate-300">
            {(error as any)?.message || "Failed to load user profile. Please try logging in again."}
          </p>
          <Link href="/">
            <Button className="bg-white text-[#0A1F44] hover:bg-slate-200 font-bold px-6 py-2.5 rounded-lg text-sm transition-all cursor-pointer">
              Return to Feed
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const user = profileData?.user;
  const createdPosts = profileData?.createdPosts || [];
  const savedPosts = user?.savedPosts || [];

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 relative max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-[#0A1F44] overflow-hidden -z-10">
        <div className="absolute top-1/4 left-1/2 w-[600px] h-[600px] -translate-x-1/2 -translate-y-1/2 bg-indigo-500/5 rounded-full blur-[130px]" />
      </div>

      {/* User Header Profile Card */}
      <div className="bg-white/5 border border-white/10 p-6 md:p-8 rounded-2xl backdrop-blur-md shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center gap-6">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-indigo-500/10 border-2 border-indigo-500/30 text-indigo-300 text-3xl font-bold font-heading shadow-[0_0_20px_rgba(99,102,241,0.25)]">
          {user?.name.slice(0, 2).toUpperCase()}
        </div>
        <div className="text-center md:text-left space-y-2 flex-1">
          <h1 className="font-heading text-3xl font-bold tracking-tight text-white">{user?.name}</h1>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs md:text-sm text-slate-300">
            <span className="flex items-center gap-1.5"><Mail className="h-4 w-4 text-slate-400" /> {user?.email}</span>
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-slate-400" />
              Joined {new Date(user?.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </span>
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
              user?.role === "CREATOR" 
                ? "bg-indigo-500/20 border border-indigo-500/30 text-indigo-300"
                : "bg-emerald-500/20 border border-emerald-500/30 text-emerald-300"
            }`}>
              <Shield className="h-3 w-3" />
              {user?.role}
            </span>
          </div>
        </div>
      </div>

      {/* Profile Navigation Tabs */}
      <div className="flex gap-4 border-b border-white/10 pb-1">
        <button
          onClick={() => setActiveTab("saved")}
          className={`px-4 py-2.5 text-sm font-semibold capitalize transition-all border-b-2 -mb-0.5 cursor-pointer flex items-center gap-2 ${
            activeTab === "saved"
              ? "border-white text-white font-bold"
              : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          <Bookmark className="h-4 w-4" />
          <span>Saved Bookmarks ({savedPosts.length})</span>
        </button>
        <button
          onClick={() => setActiveTab("created")}
          className={`px-4 py-2.5 text-sm font-semibold capitalize transition-all border-b-2 -mb-0.5 cursor-pointer flex items-center gap-2 ${
            activeTab === "created"
              ? "border-white text-white font-bold"
              : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          <FileText className="h-4 w-4" />
          <span>My Created Articles ({createdPosts.length})</span>
        </button>
      </div>

      {/* Tab Contents */}
      <div className="space-y-6">
        {activeTab === "saved" ? (
          savedPosts.length === 0 ? (
            <Card className="border border-white/10 bg-white/5 p-12 text-center text-slate-400 max-w-md mx-auto rounded-2xl shadow-xl">
              <Bookmark className="mx-auto h-12 w-12 mb-4 text-slate-500" />
              <p className="font-semibold text-white text-lg">No bookmarked articles yet</p>
              <p className="text-sm mt-1">
                Explore the discovery feed and save interesting articles to read them later.
              </p>
              <Link href="/" className="inline-block mt-6">
                <Button className="bg-white text-[#0A1F44] hover:bg-slate-200 font-bold px-6 py-2.5 rounded-lg text-xs cursor-pointer flex items-center gap-1.5 shadow-[0_0_15px_rgba(255,255,255,0.15)]">
                  <span>Explore Feed</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedPosts.map((post: Post) => (
                <div 
                  key={post._id}
                  className="group relative flex flex-col justify-between bg-white/5 border border-white/10 p-5 rounded-2xl shadow-lg transition-all hover:bg-white/10 hover:border-white/20"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
                        {post.category}
                      </span>
                      {/* Unbookmark action */}
                      <Button
                        onClick={() => handleUnbookmark(post._id)}
                        disabled={toggleBookmarkMutation.isPending}
                        variant="ghost"
                        size="icon"
                        title="Remove Bookmark"
                        className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-full cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <Link href={`/blog/${post.slug}`} className="block group-hover:text-slate-200">
                      <h2 className="font-heading text-lg font-bold text-white leading-snug group-hover:underline line-clamp-2">
                        {post.title}
                      </h2>
                    </Link>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {post.excerpt}
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-4 text-[11px] text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-white font-bold text-[9px] uppercase">
                        {post.authorId?.name?.slice(0, 2) || "U"}
                      </div>
                      <span className="font-medium text-slate-300">{post.authorId?.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3.5 w-3.5 text-slate-500" />
                        {post.viewsCount || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-slate-500" />
                        5m
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          /* Created Articles tab contents */
          !isCreator ? (
            /* Visitor upsell card */
            <Card className="border border-white/10 bg-white/5 p-8 text-center text-slate-400 max-w-md mx-auto rounded-2xl shadow-xl flex flex-col items-center">
              <Award className="h-12 w-12 mb-4 text-indigo-400 animate-pulse" />
              <p className="font-semibold text-white text-lg">Switch to Creator Account</p>
              <p className="text-sm mt-1 leading-relaxed">
                You are currently a Visitor with read-only access. Upgrade your profile to become a Creator and start publishing engineering insights.
              </p>
              <Link href="/" className="mt-6">
                {/* Note: This opens the become creator dialog if clicked in the Navbar. We will redirect them or instruct them */}
                <Button className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-2.5 rounded-lg text-xs cursor-pointer shadow-[0_0_15px_rgba(99,102,241,0.4)]">
                  Upgrade Profile via Navbar
                </Button>
              </Link>
            </Card>
          ) : createdPosts.length === 0 ? (
            <Card className="border border-white/10 bg-white/5 p-12 text-center text-slate-400 max-w-md mx-auto rounded-2xl shadow-xl">
              <FileText className="mx-auto h-12 w-12 mb-4 text-slate-500" />
              <p className="font-semibold text-white text-lg">No articles written yet</p>
              <p className="text-sm mt-1">
                You are a Creator! Go to the Creator Studio dashboard to write and publish your first post.
              </p>
              <Link href="/dashboard/articles" className="inline-block mt-6">
                <Button className="bg-white text-[#0A1F44] hover:bg-slate-200 font-bold px-6 py-2.5 rounded-lg text-xs cursor-pointer flex items-center gap-1.5 shadow-[0_0_15px_rgba(255,255,255,0.15)]">
                  <span>Go to Dashboard</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {createdPosts.map((post: Post) => (
                <div 
                  key={post._id}
                  className="group relative flex flex-col justify-between bg-white/5 border border-white/10 p-5 rounded-2xl shadow-lg transition-all hover:bg-white/10 hover:border-white/20"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
                        {post.category}
                      </span>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                        post.status === "PUBLISHED" ? "bg-emerald-500/20 text-emerald-300" : "bg-amber-500/20 text-amber-300"
                      }`}>
                        {post.status}
                      </span>
                    </div>

                    <Link href={`/blog/${post.slug}`} className="block group-hover:text-slate-200">
                      <h2 className="font-heading text-lg font-bold text-white leading-snug group-hover:underline line-clamp-2">
                        {post.title}
                      </h2>
                    </Link>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {post.excerpt || "No summary provided."}
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-4 text-[11px] text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-slate-500" />
                      <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3.5 w-3.5 text-slate-500" />
                        {post.viewsCount || 0}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
