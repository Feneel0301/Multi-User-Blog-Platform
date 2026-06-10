"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import axios from "axios";
import RichTextEditor from "@/components/common/RichTextEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEditorStore } from "@/lib/store";
import { ArrowLeft, Save, Upload, Trash2, Cloud, CloudCheck, CloudOff, Loader2, ShieldAlert } from "lucide-react";
import Link from "next/link";

export default function CreateArticlePage() {
  const router = useRouter();
  const { data: session } = useSession();

  // Zustand persistent cache
  const { draft, setDraftField, clearDraft } = useEditorStore();
  
  const [isMounted, setIsMounted] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Sync status: idle | saving | synced | error
  const [syncStatus, setSyncStatus] = useState<"idle" | "saving" | "synced" | "error">("idle");

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    setSubmitError(null);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000/api";
      const response = await axios.post(`${backendUrl}/upload`, formData, {
        headers: {
          Authorization: `Bearer ${(session?.user as { accessToken?: string })?.accessToken}`,
        },
      });
      setDraftField("coverImage", response.data.url);
    } catch (error) {
      console.error("Image upload failed:", error);
      const errorMsg = (error as { response?: { data?: { message?: string } } }).response?.data?.message;
      setSubmitError(errorMsg || "Image upload failed. Please try again.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Prevent Next.js hydration issues with localStorage persist
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  // Generate a URL-safe slug from the title automatically
  const slug = draft.title
    ? draft.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "")
    : "";

  // Ref to hold the latest draft state for unload/tab switch handlers
  const latestDraftRef = useRef(draft);
  useEffect(() => {
    latestDraftRef.current = draft;
  }, [draft]);

  // Synchronize draft immediately to the database (used on tab switch / unload)
  const syncImmediately = async () => {
    const currentDraft = latestDraftRef.current;
    
    // Only sync if there is some meaningful content
    if (!currentDraft.title && !currentDraft.htmlContent && !currentDraft.excerpt) {
      return;
    }

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000/api";
    const token = (session?.user as { accessToken?: string })?.accessToken;
    if (!token) return;

    const payload = {
      title: currentDraft.title || "Untitled Draft",
      slug: currentDraft.title
        ? currentDraft.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "")
        : `draft-${Date.now()}`,
      category: currentDraft.category || "Architecture",
      excerpt: currentDraft.excerpt || "",
      htmlContent: currentDraft.htmlContent || "",
      coverImage: currentDraft.coverImage || "",
      seoKeywords: currentDraft.seoKeywords || "",
      status: "DRAFT",
    };

    const url = currentDraft._id 
      ? `${backendUrl}/posts/${currentDraft._id}` 
      : `${backendUrl}/posts`;
    const method = currentDraft._id ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
        keepalive: true, // Crucial for sending fetch during page unload/exit
      });

      if (response.ok && !currentDraft._id) {
        const data = await response.json();
        setDraftField("_id", data._id);
      }
    } catch (err) {
      console.error("Immediate background sync failed:", err);
    }
  };

  // Debounced auto-save function
  const syncDraft = async (currentDraft: typeof draft) => {
    // Only sync if there is some content
    if (!currentDraft.title && !currentDraft.htmlContent && !currentDraft.excerpt) {
      return;
    }

    setSyncStatus("saving");
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000/api";
      const payload = {
        title: currentDraft.title || "Untitled Draft",
        slug: currentDraft.title
          ? currentDraft.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "")
          : `draft-${Date.now()}`,
        category: currentDraft.category || "Architecture",
        excerpt: currentDraft.excerpt || "",
        htmlContent: currentDraft.htmlContent || "",
        coverImage: currentDraft.coverImage || "",
        seoKeywords: currentDraft.seoKeywords || "",
        status: "DRAFT",
      };

      if (currentDraft._id) {
        await axios.put(`${backendUrl}/posts/${currentDraft._id}`, payload, {
          headers: {
            Authorization: `Bearer ${(session?.user as { accessToken?: string })?.accessToken}`,
          },
        });
      } else {
        const response = await axios.post(`${backendUrl}/posts`, payload, {
          headers: {
            Authorization: `Bearer ${(session?.user as { accessToken?: string })?.accessToken}`,
          },
        });
        setDraftField("_id", response.data._id);
      }
      setSyncStatus("synced");
    } catch (error) {
      console.error("Auto-save sync failed:", error);
      setSyncStatus("error");
    }
  };

  // Setup debouncing effect for typing changes
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!isMounted) return;
    
    // Don't auto-save if all fields are completely blank
    if (!draft.title && !draft.htmlContent && !draft.excerpt) {
      setSyncStatus("idle");
      return;
    }

    setSyncStatus("idle");
    const timer = setTimeout(() => {
      syncDraft(draft);
    }, 2000); // 2 seconds debounce

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    draft.title,
    draft.category,
    draft.excerpt,
    draft.htmlContent,
    draft.coverImage,
    draft.seoKeywords,
    isMounted
  ]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Handle Tab Switch and Browser Close hooks
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        syncImmediately();
      }
    };

    const handleBeforeUnload = () => {
      syncImmediately();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      // SPA navigate away sync (component unmount)
      syncImmediately();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPublishing(true);
    setSubmitError(null);

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000/api";
      const payload = {
        title: draft.title,
        slug,
        category: draft.category,
        excerpt: draft.excerpt,
        htmlContent: draft.htmlContent,
        coverImage: draft.coverImage,
        seoKeywords: draft.seoKeywords,
        status: "PUBLISHED",
      };

      if (draft._id) {
        // Update draft to published
        await axios.put(`${backendUrl}/posts/${draft._id}`, payload, {
          headers: {
            Authorization: `Bearer ${(session?.user as { accessToken?: string })?.accessToken}`,
          },
        });
      } else {
        // Create directly as published
        await axios.post(`${backendUrl}/posts`, payload, {
          headers: {
            Authorization: `Bearer ${(session?.user as { accessToken?: string })?.accessToken}`,
          },
        });
      }
      
      // Clear persistent Zustand cache on success
      clearDraft();
      router.push("/dashboard/articles");
      router.refresh();
    } catch (error) {
      console.error("Failed to publish post:", error);
      const errorMsg = (error as { response?: { data?: { message?: string } } }).response?.data?.message;
      setSubmitError(errorMsg || "Failed to publish article. Please verify slug and content.");
      setIsPublishing(false);
    }
  };

  const handleSaveAsDraft = async () => {
    setIsSavingDraft(true);
    setSubmitError(null);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000/api";
      const payload = {
        title: draft.title || "Untitled Draft",
        slug: slug || `draft-${Date.now()}`,
        category: draft.category || "Architecture",
        excerpt: draft.excerpt || "",
        htmlContent: draft.htmlContent || "",
        coverImage: draft.coverImage || "",
        seoKeywords: draft.seoKeywords || "",
        status: "DRAFT",
      };

      if (draft._id) {
        await axios.put(`${backendUrl}/posts/${draft._id}`, payload, {
          headers: {
            Authorization: `Bearer ${(session?.user as { accessToken?: string })?.accessToken}`,
          },
        });
      } else {
        await axios.post(`${backendUrl}/posts`, payload, {
          headers: {
            Authorization: `Bearer ${(session?.user as { accessToken?: string })?.accessToken}`,
          },
        });
      }

      clearDraft();
      router.push("/dashboard/articles");
      router.refresh();
    } catch (error) {
      console.error("Failed to save draft:", error);
      const errorMsg = (error as { response?: { data?: { message?: string } } }).response?.data?.message;
      setSubmitError(errorMsg || "Failed to save draft.");
    } finally {
      setIsSavingDraft(false);
    }
  };

  if (!isMounted) {
    return (
      <div className="mx-auto max-w-4xl space-y-8 animate-pulse">
        <div className="h-6 w-24 bg-white/10 rounded" />
        <div className="h-10 w-1/3 bg-white/10 rounded" />
        <div className="grid grid-cols-2 gap-6">
          <div className="h-12 w-full bg-white/10 rounded" />
          <div className="h-12 w-full bg-white/10 rounded" />
        </div>
      </div>
    );
  }

  // Generate Status Indicator JSX
  const renderStatusIndicator = () => {
    switch (syncStatus) {
      case "saving":
        return (
          <div className="inline-flex items-center gap-1.5 text-xs text-indigo-300 font-semibold bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
            <Loader2 className="h-3 w-3 animate-spin text-indigo-400" />
            <span>Syncing draft...</span>
          </div>
        );
      case "synced":
        return (
          <div className="inline-flex items-center gap-1.5 text-xs text-emerald-300 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
            <CloudCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>Synced to cloud</span>
          </div>
        );
      case "error":
        return (
          <div className="inline-flex items-center gap-1.5 text-xs text-red-300 font-semibold bg-red-500/10 px-2.5 py-1 rounded-full border border-red-500/20">
            <CloudOff className="h-3.5 w-3.5 text-red-400" />
            <span>Sync failed</span>
          </div>
        );
      case "idle":
      default:
        return (
          <div className="inline-flex items-center gap-1.5 text-xs text-slate-300 font-semibold bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
            <Cloud className="h-3.5 w-3.5 text-slate-400" />
            <span>Saved locally</span>
          </div>
        );
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8 animate-fade-in pb-12">
      {/* Header and Back Link */}
      <div className="border-b border-white/10 pb-6 space-y-3 relative">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Link
            href="/dashboard/articles"
            className="inline-flex items-center text-sm font-semibold text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Inventory
          </Link>
          {renderStatusIndicator()}
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mt-2">Draft New Article</h1>
        <p className="text-slate-300 font-medium">Configure your SEO parameters and write your content. Changes are saved locally and synced automatically.</p>
      </div>

      <form onSubmit={handlePublish} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Article Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-slate-300 text-sm font-semibold">Article Title</Label>
            <Input 
              id="title" 
              value={draft.title} 
              onChange={(e) => setDraftField("title", e.target.value)} 
              required 
              placeholder="e.g. Scaling Microservices with Kubernetes"
              className="bg-white/5 border-white/20 text-white placeholder-slate-500 shadow-inner"
            />
          </div>

          {/* Category Picker */}
          <div className="space-y-2">
            <Label htmlFor="category" className="text-slate-300 text-sm font-semibold">Category Domain</Label>
            <Select onValueChange={(val) => setDraftField("category", val)} value={draft.category} required>
              <SelectTrigger className="bg-white/5 border-white/20 text-white w-full flex items-center justify-between">
                <SelectValue placeholder="Select a domain" />
              </SelectTrigger>
              <SelectContent className="bg-[#0A1F44] border-white/20 text-white">
                <SelectItem value="Architecture">Architecture</SelectItem>
                <SelectItem value="Frontend">Frontend</SelectItem>
                <SelectItem value="Backend">Backend</SelectItem>
                <SelectItem value="DevOps">DevOps</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Cover Image Upload */}
        <div className="space-y-2">
          <Label className="text-slate-300 text-sm font-semibold">Featured Cover Image</Label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            id="coverImageUpload"
            disabled={isUploadingImage}
          />
          {draft.coverImage ? (
            <div className="relative aspect-video w-full max-w-md rounded-xl overflow-hidden border border-white/20 bg-white/5">
              <img src={draft.coverImage} alt="Cover Preview" className="object-cover w-full h-full" />
              <button
                type="button"
                onClick={() => setDraftField("coverImage", "")}
                className="absolute top-2 right-2 bg-red-600/80 hover:bg-red-600 text-white rounded-full p-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div
              onClick={() => !isUploadingImage && document.getElementById("coverImageUpload")?.click()}
              className="flex flex-col items-center justify-center border-2 border-dashed border-white/20 rounded-xl p-8 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer w-full max-w-md"
            >
              <Upload className="h-8 w-8 text-slate-400 mb-2" />
              <p className="text-sm font-semibold text-white">
                {isUploadingImage ? "Uploading cover image..." : "Upload Cover Image"}
              </p>
              <p className="text-xs text-slate-400 mt-1">PNG, JPG, or WEBP up to 5MB</p>
            </div>
          )}
        </div>

        {/* Short Excerpt */}
        <div className="space-y-2">
          <Label htmlFor="excerpt" className="text-slate-300 text-sm font-semibold">Brief Excerpt / Abstract</Label>
          <Input 
            id="excerpt" 
            value={draft.excerpt} 
            onChange={(e) => setDraftField("excerpt", e.target.value)} 
            required 
            placeholder="A short summary sentences used for catalog listing card..."
            className="bg-white/5 border-white/20 text-white placeholder-slate-500 shadow-inner"
          />
        </div>

        {/* SEO Keywords */}
        <div className="space-y-2">
          <Label htmlFor="seoKeywords" className="text-slate-300 text-sm font-semibold">SEO Keywords (Comma Separated)</Label>
          <Input 
            id="seoKeywords" 
            value={draft.seoKeywords} 
            onChange={(e) => setDraftField("seoKeywords", e.target.value)} 
            placeholder="kubernetes, microservices, scaling"
            className="bg-white/5 border-white/20 text-white placeholder-slate-500 shadow-inner"
          />
        </div>

        {/* Article Body using TipTap */}
        <div className="space-y-2">
          <Label className="text-slate-300 text-sm font-semibold">Article Body Workspace</Label>
          <RichTextEditor 
            content={draft.htmlContent} 
            onChange={(content) => setDraftField("htmlContent", content)} 
          />
        </div>

        {submitError && (
          <div className="flex items-center gap-2.5 bg-red-950/40 border border-red-500/30 p-4 rounded-xl text-red-200 text-sm">
            <ShieldAlert className="h-5 w-5 shrink-0 text-red-400" />
            <span>{submitError}</span>
          </div>
        )}

        {/* Submit Actions */}
        <div className="flex justify-end pt-6 border-t border-white/10 gap-4">
          <Button 
            type="button"
            onClick={handleSaveAsDraft}
            disabled={isSavingDraft || isPublishing}
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10 font-bold px-6 py-6 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Save className="h-5 w-5 text-slate-300" />
            <span>{isSavingDraft ? "Saving Draft..." : "Save as Draft"}</span>
          </Button>

          <Button 
            type="submit" 
            className="bg-white text-[#0A1F44] hover:bg-slate-200 font-bold px-8 py-6 shadow-[0_0_20px_rgba(255,255,255,0.15)] transition-all cursor-pointer flex items-center gap-1.5"
            disabled={isPublishing || isSavingDraft || !draft.htmlContent}
          >
            <Save className="h-5 w-5" />
            <span>{isPublishing ? "Publishing to Network..." : "Publish Article"}</span>
          </Button>
        </div>
      </form>
    </div>
  );
}