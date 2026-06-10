"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { Lock, ArrowLeft, Key, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setErrorMsg("Missing reset token. Please request a new link.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000/api";
      await axios.post(`${backendUrl}/auth/reset-password`, { token, password });
      setSubmitted(true);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setErrorMsg(error.response?.data?.message || "Failed to update password. Link may be invalid or expired.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6 bg-white/5 border border-white/10 p-8 rounded-2xl backdrop-blur-md shadow-2xl relative">
      <div className="text-center space-y-2">
        <h2 className="font-heading text-3xl font-extrabold text-white">Choose New Password</h2>
        <p className="text-slate-300 text-sm">
          Please enter your new password parameters.
        </p>
      </div>

      {!token && (
        <div className="bg-amber-950/40 border border-amber-500/30 p-3 rounded-lg text-amber-200 text-xs text-center">
          Warning: Missing password reset token in URL parameters.
        </div>
      )}

      {submitted ? (
        <div className="text-center space-y-4 py-4 animate-fade-in">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-semibold text-white">Password Updated</h3>
          <p className="text-slate-300 text-sm">
            Your credentials have been successfully updated. You may now sign in using your new credentials.
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

          <div className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="password" className="text-slate-300">New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-white/5 border-white/20 text-white placeholder-slate-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="confirmPassword" className="text-slate-300">Confirm New Password</Label>
              <div className="relative">
                <Key className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="confirmPassword"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 bg-white/5 border-white/20 text-white placeholder-slate-500"
                />
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading || !token}
            className="w-full bg-white text-[#0A1F44] hover:bg-slate-200 font-bold py-2 shadow-[0_0_15px_rgba(255,255,255,0.15)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span>{isLoading ? "Updating..." : "Update Password"}</span>
          </Button>

          <Link
            href="/login"
            className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors pt-2"
          >
            <ArrowLeft className="h-4.5 w-4.5" />
            <span>Cancel & Back</span>
          </Link>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute inset-0 bg-[#0A1F44] overflow-hidden -z-10">
        <div className="absolute top-1/2 left-1/2 w-[500px] h-[500px] -translate-x-1/2 -translate-y-1/2 bg-indigo-500/10 rounded-full blur-[120px]" />
      </div>

      <Suspense fallback={
        <div className="w-full max-w-md bg-white/5 border border-white/10 p-8 rounded-2xl backdrop-blur-md shadow-2xl relative text-center text-white py-12">
          Loading recovery parameters...
        </div>
      }>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
