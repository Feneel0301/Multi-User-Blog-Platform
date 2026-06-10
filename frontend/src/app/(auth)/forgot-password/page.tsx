"use client";

import { useState } from "react";
import Link from "next/link";
import axios from "axios";
import { Mail, ArrowLeft, Send, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setErrorMsg("");
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000/api";
      await axios.post(`${backendUrl}/auth/forgot-password`, { email });
      setSubmitted(true);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setErrorMsg(error.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute inset-0 bg-[#0A1F44] overflow-hidden -z-10">
        <div className="absolute top-1/2 left-1/2 w-[500px] h-[500px] -translate-x-1/2 -translate-y-1/2 bg-indigo-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-md space-y-6 bg-white/5 border border-white/10 p-8 rounded-2xl backdrop-blur-md shadow-2xl relative">
        <div className="text-center space-y-2">
          <h2 className="font-heading text-3xl font-extrabold text-white">Reset Password</h2>
          <p className="text-slate-300 text-sm">
            Enter your email and we will send a password reset link.
          </p>
        </div>

        {submitted ? (
          <div className="text-center space-y-4 py-4 animate-fade-in">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-white">Reset Link Dispatched</h3>
            <p className="text-slate-300 text-sm">
              If an account exists for <span className="font-medium text-white">{email}</span>, a secure recovery email has been sent.
            </p>
            <div className="pt-2">
              <Link href="/login">
                <Button className="w-full bg-white text-[#0A1F44] hover:bg-slate-200 font-bold py-2 shadow-md">
                  Return to Sign In
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="bg-red-950/40 border border-red-500/30 p-3 rounded-lg text-red-200 text-xs text-center">
                {errorMsg}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-white/5 border-white/20 text-white placeholder-slate-500"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-white text-[#0A1F44] hover:bg-slate-200 font-bold py-2 shadow-[0_0_15px_rgba(255,255,255,0.15)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              <span>{isLoading ? "Sending..." : "Send Reset Instructions"}</span>
            </Button>

            <Link
              href="/login"
              className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors pt-2"
            >
              <ArrowLeft className="h-4.5 w-4.5" />
              <span>Back to Sign In</span>
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}
