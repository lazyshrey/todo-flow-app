import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Only require Clerk authentication for frontend pages and the standard frontend API endpoints.
// External APIs (/api/discord and /api/mcp) will handle their own token-based authorization.
const isProtectedRoute = createRouteMatcher([
  '/settings(.*)', 
  '/api/todos(.*)', 
  '/api/auth/link(.*)'
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html|css|js|gif|svg|png|jpeg|jpg|webp|woff2?)).*)',
    // Always run for API routes to process auth context
    '/(api|trpc)(.*)',
    // Clerk auto-proxy path
    '/__clerk/:path*',
  ],
};
