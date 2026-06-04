"use client";

import { useSession } from "next-auth/react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import axios from "axios";
import Link from "next/link";
import { FileText, Plus, Edit, Trash2, Tag, Calendar, ShieldAlert, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Post {
  _id: string;
  title: string;
  slug: string;
  category: string;
  status: "DRAFT" | "PUBLISHED";
  createdAt: string;
}

export default function DashboardArticlesPage() {
  const { data: session } = useSession();
  const [postToDelete, setPostToDelete] = useState<string | null>(null);

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000/api";
  const token = (session?.user as any)?.accessToken;

  // React Query: Fetch creator's specific posts
  const { data: posts, isLoading, isError, error, refetch } = useQuery<Post[]>({
    queryKey: ["my-posts", token],
    enabled: !!token,
    queryFn: async () => {
      const response = await axios.get(`${backendUrl}/posts/my-posts`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    },
  });

  // Mutation: Toggle Draft/Published Status
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, newStatus }: { id: string; newStatus: "DRAFT" | "PUBLISHED" }) => {
      await axios.put(
        `${backendUrl}/posts/${id}`,
        { status: newStatus },
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

  // Mutation: Delete Post
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`${backendUrl}/posts/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
    onSuccess: () => {
      setPostToDelete(null);
      refetch();
    },
  });

  const handleToggleStatus = (id: string, currentStatus: "DRAFT" | "PUBLISHED") => {
    const newStatus = currentStatus === "DRAFT" ? "PUBLISHED" : "DRAFT";
    toggleStatusMutation.mutate({ id, newStatus });
  };

  const handleDeleteConfirm = () => {
    if (postToDelete) {
      deleteMutation.mutate(postToDelete);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-white/10 pb-6 gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Creator Studio
          </h1>
          <p className="mt-2 text-slate-300 font-medium">
            Welcome back, {session?.user?.name || "Creator"}. Manage your publication portfolio here.
          </p>
        </div>
        <Link href="/dashboard/articles/create">
          <Button className="w-full sm:w-auto bg-white text-[#0A1F44] hover:bg-slate-200 font-bold px-6 py-6 shadow-[0_0_20px_rgba(255,255,255,0.15)] transition-all cursor-pointer flex items-center justify-center gap-1.5">
            <Plus className="h-5 w-5" />
            <span>New Article</span>
          </Button>
        </Link>
      </div>

      {/* Main Inventory Card */}
      <Card className="border-0 bg-white/5 backdrop-blur-md shadow-2xl overflow-hidden rounded-xl">
        <CardHeader className="border-b border-white/10 bg-white/5">
          <CardTitle className="font-heading text-xl text-white">Article Inventory</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : isError ? (
            <div className="p-8 text-center text-red-400">
              <ShieldAlert className="mx-auto h-10 w-10 mb-2" />
              <p className="font-semibold">Failed to synchronise database records</p>
              <p className="text-xs text-slate-400 mt-1">{(error as any)?.message}</p>
            </div>
          ) : !posts || posts.length === 0 ? (
            <div className="p-12 text-center text-slate-400 max-w-sm mx-auto">
              <FileText className="mx-auto h-12 w-12 mb-4 text-slate-500" />
              <p className="font-semibold text-white">No articles created yet</p>
              <p className="text-sm mt-1">Draft your first article using the editor workbench.</p>
              <Link href="/dashboard/articles/create" className="inline-block mt-4">
                <Button className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs py-2 px-4 cursor-pointer">
                  Start Writing
                </Button>
              </Link>
            </div>
          ) : (
            /* Tabular Listing */
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-white/10 text-xs font-bold uppercase tracking-wider text-slate-300 bg-white/2 bg-opacity-10">
                    <th className="py-4 px-6">Title</th>
                    <th className="py-4 px-6">Category</th>
                    <th className="py-4 px-6">Created Date</th>
                    <th className="py-4 px-6 text-center">Live Status</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm text-slate-200">
                  {posts.map((post) => (
                    <tr key={post._id} className="hover:bg-white/2 transition-colors">
                      {/* Title */}
                      <td className="py-4 px-6 font-semibold text-white max-w-xs truncate">
                        <Link href={`/blog/${post.slug}`} className="hover:underline">
                          {post.title}
                        </Link>
                      </td>
                      {/* Category */}
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center gap-1 text-xs bg-white/5 border border-white/10 px-2 py-0.5 rounded-full text-slate-300">
                          <Tag className="h-3 w-3" />
                          {post.category}
                        </span>
                      </td>
                      {/* Created date */}
                      <td className="py-4 px-6 text-slate-400">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date(post.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </td>
                      {/* Live status toggle */}
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center gap-3">
                          <span
                            className={`text-xs font-semibold uppercase tracking-wider ${
                              post.status === "PUBLISHED" ? "text-emerald-400" : "text-amber-400"
                            }`}
                          >
                            {post.status}
                          </span>
                          <Switch
                            checked={post.status === "PUBLISHED"}
                            onCheckedChange={() => handleToggleStatus(post._id, post.status)}
                            disabled={toggleStatusMutation.isPending}
                            className="cursor-pointer"
                          />
                        </div>
                      </td>
                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/dashboard/articles/edit/${post._id}`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-slate-300 hover:text-white hover:bg-white/10 p-2 h-auto cursor-pointer"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          {/* Deletion dialog wrapper */}
                          <Dialog open={postToDelete === post._id} onOpenChange={(open) => !open && setPostToDelete(null)}>
                            <DialogTrigger asChild>
                              <Button
                                onClick={() => setPostToDelete(post._id)}
                                variant="ghost"
                                size="sm"
                                className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-2 h-auto cursor-pointer"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md bg-[#0A1F44] border-white/10 text-white">
                              <DialogHeader>
                                <DialogTitle className="flex items-center gap-2 text-white">
                                  <ShieldAlert className="h-5 w-5 text-red-400" />
                                  Confirm Destructive Action
                                </DialogTitle>
                                <DialogDescription className="text-slate-300">
                                  Are you sure you want to delete this article? This database deletion is immediate and cannot be undone.
                                </DialogDescription>
                              </DialogHeader>
                              <DialogFooter>
                                <Button
                                  variant="outline"
                                  onClick={() => setPostToDelete(null)}
                                  className="bg-transparent border-white/20 text-white hover:bg-white/5 cursor-pointer"
                                >
                                  Cancel
                                </Button>
                                <Button
                                  onClick={handleDeleteConfirm}
                                  disabled={deleteMutation.isPending}
                                  className="bg-red-600 hover:bg-red-500 text-white font-semibold cursor-pointer"
                                >
                                  {deleteMutation.isPending ? "Removing..." : "Delete Permanently"}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}