// app/api/env/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  // فقط برای تست: مقدار واقعی DATABASE_URL که در Vercel تنظیم شده را برمی‌گرداند
  return NextResponse.json({
    DATABASE_URL: process.env.DATABASE_URL ?? null,
  });
}
// در صورت نیاز می‌توانید اطلاعات دیگری را نیز به اینجا اضافه کنید