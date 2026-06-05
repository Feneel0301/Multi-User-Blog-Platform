"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import axios from "axios";

interface BookmarkButtonProps {
  postId: string;
}

export default function BookmarkButton({ postId }: BookmarkButtonProps) {
  const { data: session } = useSession();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingState, setIsFetchingState] = useState(true);

  useEffect(() => {
    if (!session) {
      setIsFetchingState(false);
      return;
    }

    const checkBookmarkStatus = async () => {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000/api";
        const accessToken = (session?.user as any)?.accessToken;
        const res = await axios.get(`${backendUrl}/users/profile`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        
        const savedPosts = res.data.user?.savedPosts || [];
        const isSaved = savedPosts.some((p: any) => (p._id === postId || p === postId));
        setIsBookmarked(isSaved);
      } catch (err) {
        console.error("Error checking bookmark status:", err);
      } finally {
        setIsFetchingState(false);
      }
    };

    checkBookmarkStatus();
  }, [postId, session]);

  const handleToggleBookmark = async () => {
    if (!session) {
      alert("Please sign in to bookmark articles.");
      return;
    }

    setIsLoading(true);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000/api";
      const accessToken = (session?.user as any)?.accessToken;

      const res = await axios.post(
        `${backendUrl}/users/bookmark/${postId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      setIsBookmarked(res.data.bookmarked);
    } catch (err) {
      console.error("Failed to toggle bookmark:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!session) return null; // Only show bookmark button if user is logged in

  return (
    <Button
      onClick={handleToggleBookmark}
      disabled={isLoading || isFetchingState}
      variant="outline"
      className={`relative flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold transition-all duration-200 cursor-pointer ${
        isBookmarked
          ? "bg-indigo-600/20 border-indigo-500/30 text-indigo-300 hover:bg-indigo-600/30"
          : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white"
      }`}
    >
      <Bookmark
        className={`h-4.5 w-4.5 transition-transform duration-200 ${
          isBookmarked ? "fill-indigo-400 text-indigo-400 scale-105" : "text-slate-400"
        }`}
      />
      <span>{isBookmarked ? "Bookmarked" : "Bookmark"}</span>
    </Button>
  );
}
