import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function DashboardArticlesPage() {
  // 1. Fetch the secure session from the server
  const session = await auth();

  // 2. The Server-Side Guard (Route Protection)
  if (!session) {
    redirect("/login");
  }

  // 3. The Role Guard (Enforcing CREATOR privileges)
  if ((session.user as any)?.role !== "CREATOR") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 dark:bg-slate-900">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-red-600">403</h1>
          <h2 className="text-2xl font-semibold">Access Denied</h2>
          <p className="text-slate-500">You do not have creator privileges to view this workspace.</p>
        </div>
      </div>
    );
  }

  // 4. The Authorized Dashboard Layout
 return (
    <div className="relative min-h-screen p-8 lg:p-12">
      <div className="mx-auto max-w-6xl space-y-10">
        
        {/* Header Section */}
        <div className="flex items-end justify-between border-b border-white/10 pb-6">
          <div>
            <h1 className="font-heading text-4xl font-bold tracking-tight text-white">
              Creator Studio
            </h1>
            <p className="mt-2 text-slate-300 font-medium">
              Welcome back, {session.user?.name}. Manage your publication network here.
            </p>
          </div>
          {/* Note: In a real environment, you would use a Next.js <Link> wrapper here */}
          <Button className="bg-white text-[#0A1F44] hover:bg-slate-200 font-bold px-6 py-6 shadow-[0_0_20px_rgba(255,255,255,0.15)] transition-all">
            + New Article
          </Button>
        </div>

        {/* Glassmorphism Data Card */}
        <Card className="border-0 bg-white/5 backdrop-blur-md shadow-2xl overflow-hidden rounded-xl">
          <CardHeader className="border-b border-white/10 bg-white/5">
            <CardTitle className="font-heading text-xl text-white">Article Inventory</CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <p className="text-sm text-slate-300">
              Database synchronization and live status toggles will be rendered here.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}