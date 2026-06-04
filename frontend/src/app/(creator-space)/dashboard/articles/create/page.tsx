"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import axios from "axios";
import RichTextEditor from "@/components/common/RichTextEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEditorStore } from "@/lib/store";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

export default function CreateArticlePage() {
  const router = useRouter();
  const { data: session } = useSession();

  // Zustand persistent cache
  const { draft, setDraftField, clearDraft } = useEditorStore();
  
  const [isMounted, setIsMounted] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  // Prevent Next.js hydration issues with localStorage persist
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Generate a URL-safe slug from the title automatically
  const slug = draft.title
    ? draft.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "")
    : "";

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPublishing(true);

    try {
      // Send the formatted data to your Node.js backend using the secure token
      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000/api"}/posts`,
        {
          title: draft.title,
          slug,
          category: draft.category,
          excerpt: draft.excerpt,
          htmlContent: draft.htmlContent,
          coverImage: draft.coverImage,
          seoKeywords: draft.seoKeywords,
          status: "PUBLISHED",
        },
        {
          headers: {
            Authorization: `Bearer ${(session?.user as any)?.accessToken}`,
          },
        }
      );
      
      // Clear persistent Zustand cache on success
      clearDraft();
      router.push("/dashboard/articles");
      router.refresh();
    } catch (error) {
      console.error("Failed to publish post:", error);
      setIsPublishing(false);
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

  return (
    <div className="mx-auto max-w-4xl space-y-8 animate-fade-in pb-12">
      {/* Header and Back Link */}
      <div className="border-b border-white/10 pb-6 space-y-3">
        <Link
          href="/dashboard/articles"
          className="inline-flex items-center text-sm font-semibold text-slate-300 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Inventory
        </Link>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">Draft New Article</h1>
        <p className="text-slate-300 font-medium">Configure your SEO parameters and write your content. Changes are saved locally on the fly.</p>
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

        {/* Cover Image URL */}
        <div className="space-y-2">
          <Label htmlFor="coverImage" className="text-slate-300 text-sm font-semibold">Featured Cover Image URL</Label>
          <Input 
            id="coverImage" 
            value={draft.coverImage} 
            onChange={(e) => setDraftField("coverImage", e.target.value)} 
            placeholder="https://images.unsplash.com/photo-..."
            className="bg-white/5 border-white/20 text-white placeholder-slate-500 shadow-inner"
          />
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

        {/* Submit Actions */}
        <div className="flex justify-end pt-6 border-t border-white/10">
          <Button 
            type="submit" 
            className="bg-white text-[#0A1F44] hover:bg-slate-200 font-bold px-8 py-6 shadow-[0_0_20px_rgba(255,255,255,0.15)] transition-all cursor-pointer flex items-center gap-1.5"
            disabled={isPublishing || !draft.htmlContent}
          >
            <Save className="h-5 w-5" />
            <span>{isPublishing ? "Publishing to Network..." : "Publish Article"}</span>
          </Button>
        </div>
      </form>
    </div>
  );
}