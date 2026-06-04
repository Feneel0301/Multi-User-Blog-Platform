"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useQuery, useMutation } from "@tanstack/react-query";
import axios from "axios";
import RichTextEditor from "@/components/common/RichTextEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ShieldAlert, ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

interface EditArticlePageProps {
  params: Promise<{ id: string }>;
}

interface PostDetails {
  _id: string;
  title: string;
  slug: string;
  category: string;
  coverImage?: string;
  excerpt: string;
  seoKeywords?: string;
  htmlContent: string;
  status: "DRAFT" | "PUBLISHED";
}

export default function EditArticlePage({ params }: EditArticlePageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { data: session } = useSession();

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000/api";
  const token = (session?.user as any)?.accessToken;

  // Local Form States
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [htmlContent, setHtmlContent] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [seoKeywords, setSeoKeywords] = useState("");
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">("DRAFT");
  const [isSaving, setIsSaving] = useState(false);

  // Fetch the article detail for editing
  const { data: post, isLoading, isError, error } = useQuery<PostDetails>({
    queryKey: ["edit-post", id, token],
    enabled: !!id && !!token,
    queryFn: async () => {
      const response = await axios.get(`${backendUrl}/posts/by-id/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    },
  });

  // Pre-fill state when data is resolved from the database
  useEffect(() => {
    if (post) {
      setTitle(post.title);
      setCategory(post.category);
      setExcerpt(post.excerpt);
      setHtmlContent(post.htmlContent);
      setCoverImage(post.coverImage || "");
      setSeoKeywords(post.seoKeywords || "");
      setStatus(post.status);
    }
  }, [post]);

  // Automatically compute SEO URL slug
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");

  // Update Post Mutation
  const updateMutation = useMutation({
    mutationFn: async (updatedData: Partial<PostDetails>) => {
      await axios.put(`${backendUrl}/posts/${id}`, updatedData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
    onSuccess: () => {
      router.push("/dashboard/articles");
      router.refresh();
    },
    onError: () => {
      setIsSaving(false);
    },
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    updateMutation.mutate({
      title,
      slug,
      category,
      excerpt,
      htmlContent,
      coverImage,
      seoKeywords,
      status,
    });
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl space-y-8 animate-pulse">
        <Skeleton className="h-6 w-28" />
        <Skeleton className="h-10 w-1/3" />
        <div className="grid grid-cols-2 gap-6">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-[300px] w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-md text-center py-20 border border-white/10 bg-white/5 rounded-2xl p-8 mt-10">
        <ShieldAlert className="mx-auto h-12 w-12 text-red-400 mb-4" />
        <h2 className="text-xl font-bold text-white">Failed to retrieve article details</h2>
        <p className="text-slate-400 mt-2">{(error as any)?.message || "You may not be authorized to edit this article."}</p>
        <Link href="/dashboard/articles" className="inline-block mt-6">
          <Button className="bg-white text-[#0A1F44] hover:bg-slate-200 font-bold px-4 py-2 cursor-pointer">
            Return to Inventory
          </Button>
        </Link>
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
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">Edit Technical Article</h1>
        <p className="text-slate-300 font-medium">Modify your document layout, cover graphics, and SEO markers.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Article Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-slate-300 text-sm font-semibold">Article Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="bg-white/5 border-white/20 text-white placeholder-slate-500"
            />
          </div>

          {/* Category Selector */}
          <div className="space-y-2">
            <Label htmlFor="category" className="text-slate-300 text-sm font-semibold">Category Domain</Label>
            {category && (
              <Select onValueChange={setCategory} defaultValue={category} required>
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
            )}
          </div>
        </div>

        {/* Cover Image URL */}
        <div className="space-y-2">
          <Label htmlFor="coverImage" className="text-slate-300 text-sm font-semibold">Featured Cover Image URL</Label>
          <Input
            id="coverImage"
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
            placeholder="https://images.unsplash.com/photo-..."
            className="bg-white/5 border-white/20 text-white placeholder-slate-500"
          />
        </div>

        {/* Short Excerpt */}
        <div className="space-y-2">
          <Label htmlFor="excerpt" className="text-slate-300 text-sm font-semibold">Brief Excerpt / Abstract</Label>
          <Input
            id="excerpt"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            required
            className="bg-white/5 border-white/20 text-white placeholder-slate-500"
          />
        </div>

        {/* SEO Keywords */}
        <div className="space-y-2">
          <Label htmlFor="seoKeywords" className="text-slate-300 text-sm font-semibold">SEO Keywords (Comma Separated)</Label>
          <Input
            id="seoKeywords"
            value={seoKeywords}
            onChange={(e) => setSeoKeywords(e.target.value)}
            placeholder="kubernetes, microservices, scaling"
            className="bg-white/5 border-white/20 text-white placeholder-slate-500"
          />
        </div>

        {/* Article Body using TipTap */}
        <div className="space-y-2">
          <Label className="text-slate-300 text-sm font-semibold">Article Body Workspace</Label>
          {htmlContent !== undefined && (
            <RichTextEditor content={htmlContent} onChange={setHtmlContent} />
          )}
        </div>

        {/* Status selection and Submit actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-6 border-t border-white/10 gap-4">
          <div className="flex items-center gap-3">
            <Label htmlFor="status" className="text-slate-300 text-sm font-semibold">Visibility State:</Label>
            <Select onValueChange={(val) => setStatus(val as "DRAFT" | "PUBLISHED")} defaultValue={status}>
              <SelectTrigger className="bg-white/5 border-white/20 text-white w-40 flex items-center justify-between">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#0A1F44] border-white/20 text-white">
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="PUBLISHED">Published</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            type="submit"
            disabled={isSaving || !htmlContent}
            className="bg-white text-[#0A1F44] hover:bg-slate-200 font-bold px-8 py-6 shadow-[0_0_20px_rgba(255,255,255,0.15)] transition-all cursor-pointer flex items-center gap-2"
          >
            <Save className="h-5 w-5" />
            <span>{isSaving ? "Saving changes..." : "Save Revision"}</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
