import { auth } from "@/auth";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { nextUrl } = req;
  const isDashboardRoute = nextUrl.pathname.startsWith("/dashboard");
  const isAuthRoute = nextUrl.pathname.startsWith("/login") || nextUrl.pathname.startsWith("/register");

  if (isDashboardRoute) {
    if (!isLoggedIn) {
      return Response.redirect(new URL("/login", nextUrl));
    }

    const userRole = (req.auth?.user as { role?: string })?.role;
    if (userRole !== "CREATOR") {
      // Access Denied: redirect visitors to home page
      return Response.redirect(new URL("/?error=403", nextUrl));
    }
  }

  if (isAuthRoute && isLoggedIn) {
    const userRole = (req.auth?.user as { role?: string })?.role;
    if (userRole === "CREATOR") {
      return Response.redirect(new URL("/dashboard/articles", nextUrl));
    } else {
      return Response.redirect(new URL("/", nextUrl));
    }
  }
});

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
};
