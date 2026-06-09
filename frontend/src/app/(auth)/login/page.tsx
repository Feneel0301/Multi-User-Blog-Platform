"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { LogIn, Mail, Lock, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setErrorMsg("Authentication Failed: Invalid email or password");
        setIsLoading(false);
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err) {
      setErrorMsg("An unexpected connection error occurred.");
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-[#0A1F44] overflow-hidden -z-10">
        <div className="absolute top-1/2 left-1/2 w-[500px] h-[500px] -translate-x-1/2 -translate-y-1/2 bg-indigo-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-md space-y-8 bg-white/5 border border-white/10 p-8 rounded-2xl backdrop-blur-md shadow-2xl relative">
        {/* Title */}
        <div className="text-center space-y-2">
          <h2 className="font-heading text-3xl font-extrabold text-white">Sign In</h2>
          <p className="text-slate-300 text-sm">
            Access your secure engineering publication workbench.
          </p>
        </div>

        {/* Error Callout */}
        {errorMsg && (
          <div className="flex items-center gap-2 bg-red-950/40 border border-red-500/30 p-3.5 rounded-lg text-red-200 text-xs">
            <ShieldAlert className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleCredentialsSubmit} className="space-y-6">
          <div className="space-y-4">
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

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-slate-300">Password</Label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-semibold text-slate-400 hover:text-white transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
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
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-white text-[#0A1F44] hover:bg-slate-200 font-bold py-2.5 shadow-[0_0_15px_rgba(255,255,255,0.15)] transition-all cursor-pointer"
          >
            {isLoading ? "Signing in..." : "Continue"}
          </Button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-[#0A1F44] px-2.5 text-slate-400">or</span>
          </div>
        </div>

        {/* Google OAuth Login */}
        <Button
          type="button"
          onClick={() => signIn("google")}
          disabled={isLoading}
          variant="outline"
          className="w-full bg-transparent border-white/20 text-white hover:bg-white/5 transition-all cursor-pointer"
        >
          Sign In with Google
        </Button>


        {/* Register link */}
        <p className="text-center text-xs text-slate-400 pt-4">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-semibold text-white hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#0A1F44]">
        <div className="text-slate-300 font-medium animate-pulse">Initializing login portal...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}