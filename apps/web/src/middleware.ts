import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Skip middleware for static assets
  if (
    path.startsWith("/_next") ||
    path.startsWith("/static") ||
    path.startsWith("/api") ||
    path.includes(".")
  ) {
    return NextResponse.next();
  }

  // Check for our custom session token
  const sessionToken = request.cookies.get("session_token")?.value;
  const isAuthenticated = !!sessionToken;

  // 1. Protected Routes: If NOT authenticated and trying to access /dashboard -> Redirect to Login
  if (path.startsWith("/dashboard") && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Auth Routes: Smart Redirect
  // If authenticated and trying to access Auth pages -> Redirect to Dashboard
  const isAuthPage = path === "/login" || path === "/signup" || path === "/";
  if (isAuthenticated && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
