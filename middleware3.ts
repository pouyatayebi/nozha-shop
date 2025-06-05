// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  /* 1️⃣ توکن را با گزینهٔ secureCookie=true بگیریم تا روی لوکال HTTPS هم کار کند */
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: true,
  });

  const { pathname } = req.nextUrl;

  /* 2️⃣ مسیرهای آزاد */
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/api/auth")
  ) {
    return NextResponse.next();
  }

  /* 3️⃣ اگر توکن نداریم و مسیر محافظت‌شده است → لاگین */
  if (!token && (pathname === "/user" || pathname.startsWith("/user/") || pathname.startsWith("/admin"))) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  /* 4️⃣ کنترل دسترسی /admin فقط برای ADMIN */
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    if ((token as any)?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/user", req.url));
    }
  }

  return NextResponse.next();
}

/* 5️⃣ matcher باید /user و /admin ریشه را هم بپوشاند */
export const config = {
  matcher: ["/user", "/user/:path*", "/admin", "/admin/:path*"],
};
