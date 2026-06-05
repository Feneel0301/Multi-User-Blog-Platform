"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";

interface TrackViewProps {
  postId: string;
}

export default function TrackView({ postId }: TrackViewProps) {
  const { data: session } = useSession();

  useEffect(() => {
    const recordView = async () => {
      try {
        // 1. Get or generate anonymous visitorId from localStorage
        let visitorId = localStorage.getItem("blog_visitor_id");
        if (!visitorId) {
          visitorId = crypto.randomUUID();
          localStorage.setItem("blog_visitor_id", visitorId);
        }

        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000/api";
        const token = (session?.user as any)?.accessToken;
        
        const config = {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        };

        await axios.post(`${backendUrl}/posts/${postId}/view`, { visitorId }, config);
      } catch (error) {
        console.error("Failed to record page view:", error);
      }
    };

    // Trigger unique view count when page has fully loaded/mounted
    recordView();
  }, [postId, session]);

  return null; // Invisible analytics helper
}
