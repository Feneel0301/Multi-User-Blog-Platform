"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { UserPlus, User, Mail, Lock, ShieldAlert, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("VISITOR");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000/api";
      
      // 1. Send register request to Node.js backend
      await axios.post(`${backendUrl}/auth/register`, {
        name,
        email,
        password,
        role,
      });

      // 2. Perform silent sign-in
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setErrorMsg("Account created, but automatic sign-in failed. Please login manually.");
        setIsLoading(false);
      } else {
        // Redirect based on role
        const redirectTarget = role === "CREATOR" ? "/dashboard/articles" : "/";
        router.push(redirectTarget);
        router.refresh();
      }
    } catch (err) {
      const errorMsg = (err as { response?: { data?: { message?: string } } }).response?.data?.message;
      setErrorMsg(errorMsg || "Registration failed. Email may already be registered.");
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
          <h2 className="font-heading text-3xl font-extrabold text-white">Create Account</h2>
          <p className="text-slate-300 text-sm">
            Join the platform as a Creator or a reader.
          </p>
        </div>

        {/* Error Callout */}
        {errorMsg && (
          <div className="flex items-center gap-2 bg-red-950/40 border border-red-500/30 p-3.5 rounded-lg text-red-200 text-xs">
            <ShieldAlert className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleRegister} className="space-y-5">
          <div className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-slate-300 text-xs font-semibold">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="name"
                  type="text"
                  required
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10 bg-white/5 border-white/20 text-white placeholder-slate-500"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-slate-300 text-xs font-semibold">Email Address</Label>
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

            {/* Password */}
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-slate-300 text-xs font-semibold">Password</Label>
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

            {/* Role Select */}
            <div className="space-y-1.5">
              <Label htmlFor="role" className="text-slate-300 text-xs font-semibold">Platform Role</Label>
              <Select onValueChange={setRole} defaultValue="VISITOR">
                <SelectTrigger className="bg-white/5 border-white/20 text-white w-full flex items-center justify-between">
                  <SelectValue placeholder="Select platform role" />
                </SelectTrigger>
                <SelectContent className="bg-[#0A1F44] border-white/20 text-white">
                  <SelectItem value="VISITOR">Visitor (Read-Only Access)</SelectItem>
                  <SelectItem value="CREATOR">Creator (Publish & Edit Access)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-white text-[#0A1F44] hover:bg-slate-200 font-bold py-2.5 shadow-[0_0_15px_rgba(255,255,255,0.15)] transition-all cursor-pointer"
          >
            {isLoading ? "Creating Account..." : "Create Account"}
          </Button>
        </form>

        {/* Back to Login link */}
        <p className="text-center text-xs text-slate-400 pt-2">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-white hover:underline">
            Sign In instead
          </Link>
        </p>
      </div>
    </div>
  );
}
