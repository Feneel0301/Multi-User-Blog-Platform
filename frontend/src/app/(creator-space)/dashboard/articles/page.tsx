"use client";

import { useSession } from "next-auth/react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import axios from "axios";
import Link from "next/link";
import { 
  FileText, Plus, Edit, Trash2, Tag, Calendar, ShieldAlert, 
  RotateCcw, Loader2, Eye
} from "lucide-react";
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
} from "@/components/ui/dialog";

interface Post {
  _id: string;
  title: string;
  slug: string;
  category: string;
  status: "DRAFT" | "PUBLISHED";
  createdAt: string;
  viewsCount?: number;
}

export default function DashboardArticlesPage() {
  const { data: session } = useSession();
  
  // Tab state: all | published | draft | trash
  const [activeTab, setActiveTab] = useState<"all" | "published" | "draft" | "trash">("all");
  
  // Deletion state
  const [postToDelete, setPostToDelete] = useState<Post | null>(null);
  const [deleteError, setDeleteError] = useState("");

  // Permanent delete state
  const [postToPermanentlyDelete, setPostToPermanentlyDelete] = useState<string | null>(null);

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000/api";
  const token = (session?.user as any)?.accessToken;

  // React Query: Fetch creator's specific posts based on active tab
  const { data: posts, isLoading, isError, error, refetch } = useQuery<Post[]>({
    queryKey: ["my-posts", activeTab, token],
    enabled: !!token,
    queryFn: async () => {
      const url = activeTab === "trash"
        ? `${backendUrl}/posts/my-posts?trash=true`
        : `${backendUrl}/posts/my-posts`;
        
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = response.data;
      if (activeTab === "published") {
        return data.filter((p: Post) => p.status === "PUBLISHED");
      }
      if (activeTab === "draft") {
        return data.filter((p: Post) => p.status === "DRAFT");
      }
      return data;
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

  // Mutation: Soft Delete Post
  const softDeleteMutation = useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      await axios.delete(`${backendUrl}/posts/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
    onSuccess: () => {
      setPostToDelete(null);
      setDeleteError("");
      refetch();
    },
    onError: (err: any) => {
      setDeleteError(err.response?.data?.message || "Failed to move article to Trash.");
    },
  });

  // Mutation: Restore Post from Trash
  const restoreMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.put(
        `${backendUrl}/posts/${id}/restore`,
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

  // Mutation: Permanently Delete Post
  const permanentDeleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`${backendUrl}/posts/${id}/permanent`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
    onSuccess: () => {
      setPostToPermanentlyDelete(null);
      refetch();
    },
  });

  const handleToggleStatus = (id: string, currentStatus: "DRAFT" | "PUBLISHED") => {
    const newStatus = currentStatus === "DRAFT" ? "PUBLISHED" : "DRAFT";
    toggleStatusMutation.mutate({ id, newStatus });
  };

  const handleDeleteConfirm = () => {
    if (postToDelete) {
      softDeleteMutation.mutate({ id: postToDelete._id });
    }
  };

  const handleRestore = (id: string) => {
    restoreMutation.mutate(id);
  };

  const handlePermanentDelete = () => {
    if (postToPermanentlyDelete) {
      permanentDeleteMutation.mutate(postToPermanentlyDelete);
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

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-white/10 pb-1">
        {(["all", "published", "draft", "trash"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-semibold capitalize transition-all border-b-2 -mb-0.5 cursor-pointer ${
              activeTab === tab
                ? "border-white text-white font-bold"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            {tab === "all" ? "All Articles" : tab === "draft" ? "Drafts" : tab}
          </button>
        ))}
      </div>

      {/* Main Inventory Card */}
      <Card className="border-0 bg-white/5 backdrop-blur-md shadow-2xl overflow-hidden rounded-xl">
        <CardHeader className="border-b border-white/10 bg-white/5 flex flex-row items-center justify-between">
          <CardTitle className="font-heading text-xl text-white capitalize">
            {activeTab === "all" ? "Article" : activeTab} Inventory
          </CardTitle>
          {activeTab === "trash" && (
            <span className="text-xs font-semibold text-slate-400 bg-white/5 border border-white/10 px-2 py-1 rounded-full">
              Soft Deleted Items
            </span>
          )}
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
              <p className="font-semibold text-white">
                {activeTab === "trash" ? "Trash is empty" : "No articles found"}
              </p>
              <p className="text-sm mt-1">
                {activeTab === "trash" 
                  ? "Items you delete will temporarily sit here." 
                  : "Draft your first article using the editor workbench."}
              </p>
              {activeTab !== "trash" && (
                <Link href="/dashboard/articles/create" className="inline-block mt-4">
                  <Button className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs py-2 px-4 cursor-pointer">
                    Start Writing
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            /* Tabular Listing */
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-white/10 text-xs font-bold uppercase tracking-wider text-slate-300 bg-white/2 bg-opacity-10">
                    <th className="py-4 px-6">Title</th>
                    <th className="py-4 px-6">Category</th>
                    <th className="py-4 px-6">
                      {activeTab === "trash" ? "Deleted Date" : "Created Date"}
                    </th>
                    <th className="py-4 px-6 text-center">Views</th>
                    {activeTab !== "trash" && (
                      <th className="py-4 px-6 text-center">Live Status</th>
                    )}
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm text-slate-200">
                  {posts.map((post) => (
                    <tr key={post._id} className="hover:bg-white/2 transition-colors">
                      {/* Title */}
                      <td className="py-4 px-6 font-semibold text-white max-w-xs truncate">
                        {post.status === "PUBLISHED" && activeTab !== "trash" ? (
                          <Link href={`/blog/${post.slug}`} className="hover:underline">
                            {post.title}
                          </Link>
                        ) : (
                          <span className="text-slate-300">{post.title}</span>
                        )}
                      </td>
                      {/* Category */}
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center gap-1 text-xs bg-white/5 border border-white/10 px-2 py-0.5 rounded-full text-slate-300">
                          <Tag className="h-3 w-3" />
                          {post.category}
                        </span>
                      </td>
                      {/* Date */}
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
                      {/* Views Count */}
                      <td className="py-4 px-6 text-center font-semibold text-slate-300">
                        <span className="inline-flex items-center gap-1">
                          <Eye className="h-3.5 w-3.5 text-slate-400" />
                          {post.viewsCount || 0}
                        </span>
                      </td>
                      {/* Live status toggle */}
                      {activeTab !== "trash" && (
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
                      )}
                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        {activeTab === "trash" ? (
                          <div className="flex justify-end gap-2">
                            <Button
                              onClick={() => handleRestore(post._id)}
                              variant="ghost"
                              size="sm"
                              title="Restore"
                              disabled={restoreMutation.isPending}
                              className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 p-2 h-auto cursor-pointer"
                            >
                              {restoreMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <RotateCcw className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              onClick={() => setPostToPermanentlyDelete(post._id)}
                              variant="ghost"
                              size="sm"
                              title="Delete Permanently"
                              className="text-red-500 hover:text-red-400 hover:bg-red-500/10 p-2 h-auto cursor-pointer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
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
                            <Button
                              onClick={() => setPostToDelete(post)}
                              variant="ghost"
                              size="sm"
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-2 h-auto cursor-pointer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Deletion Dialog (Soft Delete) */}
      <Dialog 
        open={postToDelete !== null} 
        onOpenChange={(open) => {
          if (!open) {
            setPostToDelete(null);
            setDeleteError("");
          }
        }}
      >
        <DialogContent className="sm:max-w-md bg-[#0A1F44] border-white/10 text-white shadow-2xl rounded-2xl">
          <DialogHeader className="space-y-3">
            <DialogTitle className="flex items-center gap-2 text-white text-xl">
              <ShieldAlert className="h-6 w-6 text-amber-400" />
              Confirm Deletion
            </DialogTitle>
            <DialogDescription className="text-slate-300 text-sm">
              Are you sure you want to delete this article? It will be moved to the Trash and can be restored or permanently deleted from the Trash tab.
            </DialogDescription>
          </DialogHeader>

          {deleteError && (
            <div className="text-red-400 text-xs font-semibold bg-red-500/10 border border-red-500/20 p-2.5 rounded-lg flex items-center gap-1.5">
              <ShieldAlert className="h-4 w-4 flex-shrink-0" />
              <span>{deleteError}</span>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setPostToDelete(null);
                setDeleteError("");
              }}
              className="bg-transparent border-white/20 text-white hover:bg-white/5 cursor-pointer"
            >
              Cancel
            </Button>
            
            <Button
              onClick={handleDeleteConfirm}
              disabled={softDeleteMutation.isPending}
              className="bg-red-600 hover:bg-red-500 text-white font-semibold cursor-pointer flex items-center gap-1.5"
            >
              {softDeleteMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Moving to Trash...</span>
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  <span>Confirm Delete</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Permanent Deletion Dialog */}
      <Dialog 
        open={postToPermanentlyDelete !== null} 
        onOpenChange={(open) => !open && setPostToPermanentlyDelete(null)}
      >
        <DialogContent className="sm:max-w-md bg-[#0A1F44] border-white/10 text-white shadow-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white text-xl">
              <ShieldAlert className="h-6 w-6 text-red-500" />
              Permanent Destructive Action
            </DialogTitle>
            <DialogDescription className="text-slate-300 mt-2">
              Are you absolutely sure you want to permanently delete this article? This database deletion is immediate, bypasses Trash, and cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-4 border-t border-white/10 mt-4">
            <Button
              variant="outline"
              onClick={() => setPostToPermanentlyDelete(null)}
              className="bg-transparent border-white/20 text-white hover:bg-white/5 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              onClick={handlePermanentDelete}
              disabled={permanentDeleteMutation.isPending}
              className="bg-red-600 hover:bg-red-500 text-white font-semibold cursor-pointer flex items-center gap-1.5"
            >
              {permanentDeleteMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  <span>Delete Permanently</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}