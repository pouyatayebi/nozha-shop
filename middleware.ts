// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  // اجازه می‌دهیم مسیرهای مربوط بهِ استاتیک‌ها یا API احراز هویت بدون بررسی عبور کنند
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/api/auth")
  ) {
    return NextResponse.next();
  }

  // اگر توکن وجود نداشته باشد و در حال درخواست مسیرهای محافظت‌شده (/user یا /admin) باشیم
  if (!token) {
    if (pathname.startsWith("/user") || pathname.startsWith("/admin")) {
      // برای دسترسی محافظت‌شده، کاربر را به صفحهٔ لاگین هدایت می‌کنیم
      const loginUrl = new URL("/auth/login", req.url);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // اگر توکن موجود باشد، نقش کاربر را از آن استخراج می‌کنیم
  const role = (token as any).role as string;

  // اگر مسیرِ /admin/* باشد و نقش کاربر ADMIN نباشد، به صفحهٔ /user هدایت می‌شود
  if (pathname.startsWith("/admin")) {
    if (role !== "ADMIN") {
      const userHome = new URL("/user", req.url);
      return NextResponse.redirect(userHome);
    }
    return NextResponse.next();
  }

  // اگر مسیرِ /user/* باشد، هر دو نقش USER و ADMIN مجاز هستند
  if (pathname.startsWith("/user")) {
    return NextResponse.next();
  }

  // سایر مسیرها آزاد هستند
  return NextResponse.next();
}

export const config = {
  matcher: ["/user/:path*", "/admin/:path*"],
};
