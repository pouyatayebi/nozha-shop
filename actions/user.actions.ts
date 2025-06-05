// actions/user.actions.ts
"use server";


import prisma from "@/lib/prisma";
import { FormState } from "@/types/form";
import { sendOtpSchema, verifyOtpSchema } from "@/zod-validations/user/schema";
import type {
  SendOtpInput,
  VerifyOtpInput,
} from "@/zod-validations/user/types";

import { signIn, signOut } from "@/lib/auth/options";

/* ------------------------------------------------------------------ */
/* ارسال OTP                                                          */
/* ------------------------------------------------------------------ */

export async function sendOtpAction(
  _prev: FormState,
  payload: FormData
): Promise<FormState> {
  if (!(payload instanceof FormData))
    return { success: false, errors: { error: ["Invalid Form Data"] } };

  const raw = Object.fromEntries(
    [...payload.entries()].map(([k, v]) => [k, v.toString()])
  );
  const parsed = sendOtpSchema.safeParse(raw);
  if (!parsed.success)
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors,
      fields: raw,
    };

  const { phone } = parsed.data as SendOtpInput;
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
  const apiUrl = process.env.OTP_API;

  if (!apiUrl)
    return {
      success: false,
      errors: { error: ["OTP_API در .env تعریف نشده"] },
      fields: { phone },
    };

  try {
    /* درخواست به ملی‌پیامک */
    const sms = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to: phone }),
    });
    if (!sms.ok)
      return {
        success: false,
        errors: { error: ["خطا در ارسال پیامک"] },
        fields: { phone },
      };

    const { code: rawCode } = (await sms.json()) as { code?: string };
    if (!rawCode)
      return {
        success: false,
        errors: { error: ["OTP دریافت نشد"] },
        fields: { phone },
      };

    // 🔹 پاک‌سازی احتمالی:
    const code = rawCode.trim().replace(/[^0-9]/g, ""); // فقط ارقام انگلیسی
    const phoneClean = phone.trim();

    await prisma.otp.upsert({
      where: { phone: phoneClean },
      update: { code, expiresAt },
      create: { phone: phoneClean, code, expiresAt },
    });

    return {
      success: true,
      version: Date.now(),
      fields: { phone },
      errors: {},
    };
  } catch (e) {
    console.error("sendOtpAction error", e);
    return {
      success: false,
      errors: { error: ["خطای سرور در ارسال OTP"] },
      fields: { phone },
    };
  }
}
