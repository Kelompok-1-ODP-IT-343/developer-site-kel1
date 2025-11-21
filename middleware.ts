import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function isMobileOrTablet(ua: string, secChUaMobile?: string | null) {
  const mobileRegex =
    /(Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini)/i;
  const tabletRegex = /(iPad|Tablet|Nexus 7|Nexus 10|KFAPWI|Silk)/i;
  const isClientHintMobile = !!secChUaMobile && secChUaMobile.includes("?1");
  return mobileRegex.test(ua) || tabletRegex.test(ua) || isClientHintMobile;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip static assets & API routes & the warning page itself
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/unsupported-device") ||
    /\.(png|jpg|jpeg|gif|svg|webp|ico|css|js)$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  // Device-Based Access Restriction (Desktop-Only)
  const ua = req.headers.get("user-agent") || "";
  const secChUaMobile = req.headers.get("sec-ch-ua-mobile");

  if (
    isMobileOrTablet(ua, secChUaMobile) &&
    !pathname.startsWith("/unsupported-device")
  ) {
    const url = req.nextUrl.clone();
    url.pathname = "/unsupported-device";
    return NextResponse.redirect(url);
  }

  // Auth protection: allow dashboard if refreshToken exists (client will refresh), otherwise send to login
  const token = req.cookies.get("token")?.value;
  const refreshToken = req.cookies.get("refreshToken")?.value;

  if (!token && pathname.startsWith("/dashboard")) {
    if (!refreshToken) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    // refreshToken exists -> allow client-side interceptor to refresh
    return NextResponse.next();
  }

  // Do not force redirect from /login; client will handle role-aware routing

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|api|unsupported-device|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|css|js)).*)",
  ],
};
