import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Route protection (Next 16 proxy convention). A missing session cookie
 * redirects to /login. Actual session validation happens in server components
 * / API routes via `getSessionUser` — this is a fast-path gate only.
 */
export default function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isPublic =
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/api"); // API routes self-protect via getSessionUser

  if (isPublic) return NextResponse.next();

  // Better Auth default session cookie
  const hasSession = req.cookies.has("better-auth.session_token");
  if (!hasSession) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  // Exclude static assets, images, and the auth API from the proxy.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:png|jpg|svg|ico|webp)$).*)",
  ],
};
