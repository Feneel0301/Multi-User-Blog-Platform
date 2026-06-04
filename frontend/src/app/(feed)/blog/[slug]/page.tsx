import type { Metadata } from "next";
import Link from "next/link";
import axios from "axios";
import { ArrowLeft, Clock, Calendar, User, BookOpen } from "lucide-react";
import ExportPDFButton from "@/components/elements/ExportPDF";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

// 1. Fetch post details helper (Server-side compatible)
async function fetchPost(slug: string) {
  const backendUrl = process.env.BACKEND_URL || "http://localhost:5000/api";
  try {
    const response = await axios.get(`${backendUrl}/posts/${slug}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching article server-side:", (error as any).message);
    return null;
  }
}

// 2. Dynamic SEO Injection (Executed on server-side request)
export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await fetchPost(slug);

  if (!post) {
    return {
      title: "Article Not Found | Corporate Engineering Hub",
      description: "The requested technical resource could not be found.",
    };
  }

  return {
    title: `${post.title} | Corporate Engineering Hub`,
    description: post.excerpt,
    keywords: post.seoKeywords ? post.seoKeywords.split(",").map((k: string) => k.trim()) : [],
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.createdAt,
      images: post.coverImage ? [{ url: post.coverImage }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: post.coverImage ? [post.coverImage] : [],
    },
  };
}

// 3. Main Server Component Page
export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await fetchPost(slug);

  // Handle article missing
  if (!post) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="text-center space-y-6 max-w-md bg-white/5 border border-white/10 p-10 rounded-2xl backdrop-blur-md">
          <BookOpen className="mx-auto h-12 w-12 text-red-400" />
          <h1 className="text-2xl font-bold text-white">Resource Not Found</h1>
          <p className="text-slate-300">
            The article page you are looking for has been archived, deleted, or does not exist.
          </p>
          <Link href="/">
            <button className="bg-white text-[#0A1F44] hover:bg-slate-200 font-bold px-6 py-2.5 rounded-lg text-sm transition-all cursor-pointer">
              Return to Feed
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(post.createdAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <article className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="mx-auto max-w-4xl space-y-8 relative z-10">
        
        {/* Navigation back and print button action line */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center text-sm font-semibold text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Feed
          </Link>
          {/* PDF Download Link */}
          <ExportPDFButton post={post} />
        </div>

        {/* Cover graphic */}
        {post.coverImage && (
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden shadow-2xl border border-white/10">
            <img
              src={post.coverImage}
              alt={post.title}
              className="object-cover w-full h-full"
            />
          </div>
        )}

        {/* Article details header */}
        <div className="space-y-4">
          <span className="inline-block bg-white/10 border border-white/20 text-white text-[10px] font-bold tracking-wider uppercase px-3 py-1 rounded-full">
            {post.category}
          </span>
          <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
            {post.title}
          </h1>

          {/* Author metadata bar */}
          <div className="flex flex-wrap items-center gap-6 py-4 border-y border-white/10 text-slate-300 text-sm">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white font-bold text-xs uppercase border border-white/10">
                {post.authorId.name.slice(0, 2)}
              </div>
              <span className="font-semibold text-white">{post.authorId.name}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-slate-400" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-slate-400" />
              <span>5 min read</span>
            </div>
          </div>
        </div>

        {/* Article content block */}
        <div 
          className="prose prose-invert max-w-none text-slate-200 mt-8 [&_h2]:text-white [&_h3]:text-white [&_h2]:font-heading [&_h3]:font-heading [&_h2]:mt-10 [&_h3]:mt-8 [&_p]:leading-relaxed [&_p]:mb-6 [&_li]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5"
          dangerouslySetInnerHTML={{ __html: post.htmlContent }}
        />
      </div>
    </article>
  );
}
