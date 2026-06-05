"use client";

import { useEffect, useState, useRef } from "react";
import { ArrowUp, Clock, BookOpen, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ScrollProgressProps {
  htmlContent: string;
}

export default function ScrollProgress({ htmlContent }: ScrollProgressProps) {
  const [scrollPercent, setScrollPercent] = useState(0);
  const [wordCount, setWordCount] = useState(0);
  const [readingTime, setReadingTime] = useState(1);
  const [timeLeft, setTimeLeft] = useState(1);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [showCompletionToast, setShowCompletionToast] = useState(false);
  const toastShownRef = useRef(false);

  // Compute word count and initial reading time
  useEffect(() => {
    // Strip HTML tags using simple regex
    const cleanText = htmlContent.replace(/<\/?[^>]+(>|$)/g, " ");
    const words = cleanText.trim().split(/\s+/).filter(Boolean);
    const count = words.length;
    setWordCount(count);
    
    // Average reading speed: 200 words per minute
    const time = Math.max(1, Math.ceil(count / 200));
    setReadingTime(time);
    setTimeLeft(time);
  }, [htmlContent]);

  // Track scroll position
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      
      if (docHeight <= 0) {
        setScrollPercent(0);
        return;
      }
      
      const pct = Math.min(100, Math.max(0, Math.round((scrollTop / docHeight) * 100)));
      setScrollPercent(pct);
      
      // Calculate remaining reading time
      const remainingTime = Math.max(0, Math.ceil((1 - pct / 100) * readingTime));
      setTimeLeft(remainingTime);

      // Show back to top button after 200px
      setShowBackToTop(scrollTop > 200);

      // Trigger completion celebration at 100%
      if (pct >= 99) {
        if (!toastShownRef.current) {
          setShowCompletionToast(true);
          toastShownRef.current = true;
          // Auto hide toast after 5 seconds
          setTimeout(() => {
            setShowCompletionToast(false);
          }, 5000);
        }
      } else if (pct < 90) {
        // Reset completion state if user scrolls back up
        toastShownRef.current = false;
        setShowCompletionToast(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    // Trigger once on mount
    handleScroll();
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, [readingTime]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <>
      {/* Top sticky progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 w-full bg-white/10">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-75 ease-out shadow-[0_0_10px_rgba(99,102,241,0.5)]"
          style={{ width: `${scrollPercent}%` }}
        />
      </div>

      {/* Floating stats widget & Back to Top */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3 pointer-events-none">
        {/* Completion micro-toast */}
        {showCompletionToast && (
          <div className="pointer-events-auto flex items-center gap-2.5 rounded-xl border border-[#4f46e5]/30 bg-[#0A1F44]/95 p-4 text-white shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-5 fade-in duration-300 max-w-sm">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-300">
              <CheckCircle className="h-4 w-4 text-indigo-400" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Article Completed!</p>
              <p className="text-[10px] text-slate-400">Thanks for reading this engineering post.</p>
            </div>
          </div>
        )}

        {/* Stats card + back to top button */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Scroll progress stats card */}
          {scrollPercent > 0 && (
            <div className="flex items-center gap-3.5 rounded-full border border-white/10 bg-[#0A1F44]/90 px-4 py-2.5 text-xs text-white shadow-lg backdrop-blur-md transition-all duration-300 hover:border-white/20 select-none">
              <div className="flex items-center gap-1 text-slate-300">
                <BookOpen className="h-3.5 w-3.5 text-indigo-400" />
                <span className="font-semibold text-white">{scrollPercent}%</span>
                <span>read</span>
              </div>
              <div className="h-3 w-px bg-white/15" />
              {timeLeft > 0 ? (
                <div className="flex items-center gap-1 text-slate-300">
                  <Clock className="h-3.5 w-3.5 text-indigo-400" />
                  <span className="font-semibold text-white">{timeLeft}</span>
                  <span>{timeLeft === 1 ? "min" : "mins"} left</span>
                </div>
              ) : (
                <span className="text-indigo-400 font-bold">Finished</span>
              )}
            </div>
          )}

          {/* Floating Back to Top Button */}
          {showBackToTop && (
            <Button
              onClick={scrollToTop}
              size="icon"
              className="h-9 w-9 rounded-full bg-white text-[#0A1F44] hover:bg-slate-200 shadow-[0_0_15px_rgba(255,255,255,0.2)] transition-all hover:scale-105 active:scale-95 cursor-pointer"
              title="Back to Top"
            >
              <ArrowUp className="h-4.5 w-4.5 font-bold" />
            </Button>
          )}
        </div>
      </div>
    </>
  );
}
