// actions/user.actions.ts
"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { FormState } from "@/types/form";
import { sendOtpSchema, verifyOtpSchema } from "@/zod-validations/user/schema";
import { SendOtpInput, VerifyOtpInput } from "@/zod-validations/user/types";
import { signOut } from "next-auth/react";
import { Role } from "@/lib/generated/prisma";

/**
 * ارسال کد OTP
 * – ورودی: فیلد phone
 * – اعتبارسنجی با sendOtpSchema
 * – ذخیره یا بروزرسانی رکورد Otp
 * – فراخوانی API ملی‌پیامک
 */
export async function sendOtpAction(
  prev: FormState,
  payload: FormData
): Promise<FormState> {
  if (!(payload instanceof FormData)) {
    return {
      success: false,
      errors: { error: ["Invalid Form Data"] },
    };
  }



  // تبدیل FormData به یک شیٔ ساده
  const raw: Record<string, any> = {};
  for (const [key, value] of payload.entries()) {
    raw[key] = value.toString();
  }

  // اعتبارسنجی با Zod
  const parsed = sendOtpSchema.safeParse(raw);
  console.log("parsed",parsed)
  if (!parsed.success) {
    const errs = parsed.error.flatten().fieldErrors;
    // آماده کردن مقادیر برای پر کردن مجدد فرم
    const fields: Record<string, string> = {};
    for (const k in raw) fields[k] = raw[k] as string;
    return { success: false, errors: errs, fields };
  }

  const data: SendOtpInput = parsed.data;
  const phone = data.phone;
  // تولید کد ۶ رقمی
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  // انقضا ۵ دقیقه‌ای
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  try {
    // ذخیره یا بروزرسانی رکورد OTP
    await prisma.otp.upsert({
      where: { phone },
      update: { code, expiresAt },
      create: { phone, code, expiresAt },
    });

    // ارسال پیامک از طریق ملی‌پیامک
    const apiUrl = process.env.OTP_API; // مثلاً: "https://console.melipayamak.com/api/send/otp/KEY"
    if (!apiUrl) {
      return {
        success: false,
        errors: { error: ["OTP_API در .env تعریف نشده است."] },
      };
    }

    const body = JSON.stringify({ to: phone });
    const res = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(body).toString(),
      },
      body,
    });
    if (!res.ok) {
      const text = await res.text();
      console.error("Melipayamak Error:", text);
      return { success: false, errors: { error: ["خطا در ارسال پیامک"] } };
    }
    const result = await res.json();
    if (!result.code) {
      return { success: false, errors: { error: ["ارسال کد OTP ناموفق بود"] } };
    }

    return {
      success: true,
      version: Date.now(),
      fields: { phone },
      errors: {},
    };
  } catch (err) {
    console.error("sendOtpAction error:", err);
    return {
      success: false,
      errors: { error: ["خطای سرور در ارسال OTP"] },
      fields: { phone },
    };
  }
}

/**
 * بررسی و تایید کد OTP
 * – ورودی: phone و code
 * – اعتبارسنجی با verifyOtpSchema
 * – تطبیق کد با ثبت‌نام‌شده و بررسی انقضا
 * – حذف رکورد OTp و ایجاد/خواندن User
 */
export async function verifyOtpAction(
  prev: FormState,
  payload: FormData
): Promise<FormState> {
  if (!(payload instanceof FormData)) {
    return {
      success: false,
      errors: { error: ["Invalid Form Data"] },
    };
  }

  // تبدیل FormData
  const raw: Record<string, any> = {};
  for (const [key, value] of payload.entries()) {
    raw[key] = value.toString();
  }

  // اعتبارسنجی
  const parsed = verifyOtpSchema.safeParse(raw);
  if (!parsed.success) {
    const errs = parsed.error.flatten().fieldErrors;
    const fields: Record<string, string> = {};
    for (const k in raw) fields[k] = raw[k] as string;
    return { success: false, errors: errs, fields };
  }

  const data: VerifyOtpInput = parsed.data;
  const { phone, code } = data;

  try {
    // واکشی رکورد OTP
    const otpRecord = await prisma.otp.findUnique({ where: { phone } });
    if (!otpRecord) {
      return {
        success: false,
        errors: { code: ["کد ارسال‌شده پیدا نشد یا منقضی شده."] },
        fields: { phone, code },
      };
    }

    if (otpRecord.code !== code) {
      return {
        success: false,
        errors: { code: ["کد واردشده صحیح نیست."] },
        fields: { phone, code },
      };
    }
    if (otpRecord.expiresAt < new Date()) {
      return {
        success: false,
        errors: { code: ["کد منقضی شده است."] },
        fields: { phone, code },
      };
    }

    // حذف رکورد OTP
    await prisma.otp.delete({ where: { phone } });

    // بررسی وجود User
    let user = await prisma.user.findUnique({ where: { phone } });
    if (!user) {
      user = await prisma.user.create({
        data: { phone, role: Role.USER },
      });
    }

    // ری‌ریوالید مسیرهای وابسته (در صورت نیاز)
    revalidatePath("/user");
    revalidatePath("/admin");

    return {
      success: true,
      version: Date.now(),
      fields: { phone },
      errors: {},
    };
  } catch (err) {
    console.error("verifyOtpAction error:", err);
    return {
      success: false,
      errors: { error: ["خطا در بررسی و تایید کد OTP"] },
      fields: { phone, code },
    };
  }
}

/**
 * خروج کاربر
 * – فراخوانی signOut از next-auth/react
 */
export async function signOutUserAction(
  prev: FormState,
  payload: FormData
): Promise<FormState> {
  try {
    await signOut();
    return {
      success: true,
      version: Date.now(),
      fields: {},
      errors: {},
    };
  } catch (err) {
    console.error("signOutUserAction error:", err);
    return {
      success: false,
      errors: { error: ["خطا در خروج از حساب کاربری"] },
    };
  }
}
