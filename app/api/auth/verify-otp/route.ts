import { signIn } from "@/lib/auth/options";
import prisma from "@/lib/prisma";
import { verifyOtpSchema } from "@/zod-validations/user/schema";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = verifyOtpSchema.safeParse(body);
  if (!parsed.success)
    return Response.json({ error: "invalid_payload" }, { status: 400 });

  /* 1️⃣ نرمالایز یکسان */
  const phoneNorm = parsed.data.phone.trim().replace(/^\\+?98/, "0");
  const codeClean = parsed.data.code.trim().replace(/[^0-9]/g, "");

  /* 2️⃣ بررسی ساده‌ی وجود OTP */
  const otp = await prisma.otp.findUnique({ where: { phone: phoneNorm } });
  if (!otp || otp.code !== codeClean || otp.expiresAt < new Date())
    return Response.json({ error: "wrong_or_expired" }, { status: 400 });

  /* 3️⃣ signIn با همان مقادیر پاک‌سازی‌شده */
  const result = await signIn("otp-credentials", {
    phone: phoneNorm,
    code: codeClean,
    redirect: false, // ⬅️ بدون ریدایرکت
  });
  if ((result as any)?.error)
    return NextResponse.json({ error: "wrong_or_expired" }, { status: 400 });
  return NextResponse.json({ ok: true }); // status 200
}
