"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import axios from "axios";
import { ShieldAlert, Award, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RoleGuardProps {
  children: React.ReactNode;
}

export default function RoleGuard({ children }: RoleGuardProps) {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [upgradeError, setUpgradeError] = useState("");

  const handleUpgradeRole = async () => {
    setIsUpgrading(true);
    setUpgradeError("");
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000/api";
      const accessToken = (session?.user as any)?.accessToken;
      
      const response = await axios.put(
        `${backendUrl}/auth/upgrade`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const { role, token } = response.data;

      // Update next-auth session cache
      await update({ role, token });
      
      // Refresh to reload dashboard layout
      router.refresh();
    } catch (err: any) {
      console.error("Failed to upgrade role from guard:", err);
      setUpgradeError(err.response?.data?.message || "Failed to upgrade profile. Please try again.");
    } finally {
      setIsUpgrading(false);
    }
  };

  // 1. Show loading state while next-auth checks credentials
  if (status === "loading") {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
        <p className="text-slate-400 text-sm font-medium">Verifying creator credentials...</p>
      </div>
    );
  }

  const userRole = (session?.user as any)?.role || "VISITOR";

  // 2. Access Denied Block: If not logged in or role is not CREATOR
  if (!session || userRole !== "CREATOR") {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-white/5 border border-white/10 p-8 rounded-2xl backdrop-blur-md shadow-2xl space-y-8 relative overflow-hidden">
          {/* Subtle background radial glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl -z-10" />
          
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 mb-2">
              <ShieldAlert className="h-8 w-8" />
            </div>
            <h2 className="font-heading text-2xl font-extrabold text-white">403 - Access Denied</h2>
            <p className="text-slate-300 text-sm leading-relaxed max-w-sm mx-auto">
              You are signed in as a <span className="font-semibold text-slate-100 uppercase">Visitor</span>. 
              Only registered Creators have permission to access the publishing studio.
            </p>
          </div>

          {/* Quick Upgrade Section */}
          <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-xl p-5 space-y-4">
            <div className="flex items-start gap-3">
              <Award className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-white">Want to start writing?</p>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Upgrade your profile to a Creator instantly. This will unlock the publishing dashboard, editor workspace, and article inventory controls.
                </p>
              </div>
            </div>

            {upgradeError && (
              <p className="text-red-400 text-xs bg-red-950/40 border border-red-500/30 p-2.5 rounded">
                {upgradeError}
              </p>
            )}

            <Button
              onClick={handleUpgradeRole}
              disabled={isUpgrading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              {isUpgrading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Upgrading Account...</span>
                </>
              ) : (
                <>
                  <Award className="h-4 w-4" />
                  <span>Yes, Upgrade Me to Creator</span>
                </>
              )}
            </Button>
          </div>

          {/* Nav Actions */}
          <div className="pt-2 flex justify-center border-t border-white/5">
            <Button
              variant="ghost"
              onClick={() => router.push("/")}
              className="text-slate-400 hover:text-white hover:bg-white/5 text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Home Feed</span>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 3. User is a CREATOR, allow them to view the dashboard contents
  return <>{children}</>;
}
