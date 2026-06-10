"use client";

import { useQuery } from "@tanstack/react-query";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import { Search, ChevronLeft, ChevronRight, BookOpen, Clock, Tag, User, Eye, ShieldAlert } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ListingSkeleton } from "@/components/ui/skeleton";

function SecurityAlert() {
  const searchParams = useSearchParams();
  const errorCode = searchParams.get("error");
  
  if (errorCode !== "403") return null;
  
  return (
    <div className="max-w-2xl mx-auto flex items-start gap-3.5 bg-red-950/40 border border-red-500/30 p-4 rounded-2xl text-red-200 text-sm shadow-xl animate-fade-in">
      <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5 text-red-400" />
      <div className="space-y-1 text-left">
        <p className="font-bold text-white">403 - Access Denied</p>
        <p className="text-slate-300 text-xs leading-relaxed">
          You do not have creator privileges to access the publishing dashboard. You can request a role upgrade from the user menu in the top navigation bar.
        </p>
      </div>
    </div>
  );
}


interface Post {
  _id: string;
  title: string;
  slug: string;
  category: string;
  coverImage?: string;
  excerpt: string;
  authorId: {
    _id: string;
    name: string;
  };
  createdAt: string;
  viewsCount?: number;
}

interface FetchPostsResponse {
  posts: Post[];
  currentPage: number;
  totalPages: number;
  totalPosts: number;
}

export default function DiscoveryFeedPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);

  // Debounce search input to avoid hitting backend on every keystroke
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset page on new search
    }, 400);

    return () => clearTimeout(handler);
  }, [search]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const categories = ["All", "Architecture", "Frontend", "Backend", "DevOps"];

  // React Query Fetching
  const { data, isLoading, isError, error } = useQuery<FetchPostsResponse>({
    queryKey: ["posts", debouncedSearch, category, page],
    queryFn: async () => {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000/api";
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", "6"); // 6 items per page
      if (debouncedSearch) params.append("search", debouncedSearch);
      if (category && category !== "All") params.append("category", category);

      const response = await axios.get(`${backendUrl}/posts?${params.toString()}`);
      return response.data;
    },
  });

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-12">
        {/* Banner Section */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <h1 className="font-heading text-4xl font-extrabold tracking-tight sm:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
            Corporate Engineering Insights
          </h1>
          <p className="text-slate-300 text-lg">
            High-fidelity technical design patterns, architecture briefs, and development logs.
          </p>
        </div>

        <Suspense fallback={null}>
          <SecurityAlert />
        </Suspense>

        {/* Search & Category Filter Section */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-xl">
          {/* Search Input */}
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              type="text"
              placeholder="Search by title or keywords..."
              value={search}
              onChange={handleSearchChange}
              className="pl-10 bg-white/5 border-white/20 text-white placeholder-slate-400 focus:border-white focus:ring-1 focus:ring-white"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 w-full md:w-auto justify-start md:justify-end">
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={category === cat || (cat === "All" && !category) ? "default" : "outline"}
                onClick={() => {
                  setCategory(cat === "All" ? "" : cat);
                  setPage(1); // Reset page on category filter change
                }}
                className={
                  category === cat || (cat === "All" && !category)
                    ? "bg-white text-[#0A1F44] hover:bg-slate-100 font-semibold text-xs py-1.5 px-4 cursor-pointer"
                    : "bg-transparent border-white/20 text-slate-300 hover:bg-white/5 hover:text-white font-semibold text-xs py-1.5 px-4 cursor-pointer"
                }
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>

        {/* Posts Grid */}
        {isLoading ? (
          <ListingSkeleton />
        ) : isError ? (
          <div className="text-center py-12 border border-white/10 bg-white/5 rounded-2xl p-8">
            <h2 className="text-xl font-bold text-red-400">Failed to sync feed</h2>
            <p className="text-slate-400 mt-2">Error: {(error as Error)?.message || "Internal network error"}</p>
          </div>
        ) : !data?.posts || data.posts.length === 0 ? (
          <div className="text-center py-20 border border-white/10 bg-white/5 rounded-2xl p-8 max-w-md mx-auto">
            <BookOpen className="mx-auto h-12 w-12 text-slate-400" />
            <h2 className="text-xl font-bold text-white mt-4">No articles found</h2>
            <p className="text-slate-400 mt-2">Try adjusting your filters or search query.</p>
          </div>
        ) : (
          <div className="space-y-10">
            {/* Grid of Articles */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {data.posts.map((post) => (
                <Link key={post._id} href={`/blog/${post.slug}`} className="group block h-full">
                  <Card className="h-full border-0 bg-white/5 hover:bg-white/10 backdrop-blur-md shadow-2xl rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1.5 border-t border-white/5">
                    {/* Cover Graphic Container */}
                    <div className="relative aspect-video w-full bg-slate-800 overflow-hidden">
                      {post.coverImage ? (
                        <img
                          src={post.coverImage}
                          alt={post.title}
                          className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-slate-900 to-indigo-900/60 text-white/20 font-heading text-lg font-bold">
                          {post.category}
                        </div>
                      )}
                      {/* Category Tag */}
                      <span className="absolute top-4 left-4 bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
                        <Tag className="h-3 w-3" />
                        {post.category}
                      </span>
                    </div>

                    <CardContent className="p-6 flex flex-col justify-between flex-1 space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                          <span>{new Date(post.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5 text-slate-500" />
                              5 min read
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="h-3.5 w-3.5 text-slate-500" />
                              {post.viewsCount || 0}
                            </span>
                          </div>
                        </div>

                        {/* Title */}
                        <h3 className="font-heading text-xl font-bold text-white group-hover:text-slate-200 transition-colors line-clamp-2">
                          {post.title}
                        </h3>

                        {/* Excerpt */}
                        <p className="text-slate-300 text-sm font-light leading-relaxed line-clamp-3">
                          {post.excerpt}
                        </p>
                      </div>

                      {/* Author Info */}
                      <div className="flex items-center space-x-3 pt-4 border-t border-white/10 mt-auto">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white font-bold text-xs uppercase border border-white/10">
                          {post.authorId.name.slice(0, 2)}
                        </div>
                        <div className="text-xs">
                          <p className="font-semibold text-white flex items-center gap-1">
                            <User className="h-3 w-3 text-slate-400" />
                            {post.authorId.name}
                          </p>
                          <p className="text-slate-400">Author</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Pagination Controls */}
            {data.totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-white/10 pt-6">
                <p className="text-sm text-slate-400 font-medium">
                  Page <span className="text-white">{data.currentPage}</span> of{" "}
                  <span className="text-white">{data.totalPages}</span>
                </p>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="bg-transparent border-white/20 text-slate-300 hover:bg-white/5 hover:text-white disabled:opacity-30 cursor-pointer"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                    disabled={page === data.totalPages}
                    className="bg-transparent border-white/20 text-slate-300 hover:bg-white/5 hover:text-white disabled:opacity-30 cursor-pointer"
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
