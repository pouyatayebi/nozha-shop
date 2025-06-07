// app/api/check-db/route.ts
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // ساده‌ترین تست اتصال
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('Prisma connection error:', error);
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}
// این کد یک endpoint ساده برای تست اتصال به پایگاه داده با Prisma است.