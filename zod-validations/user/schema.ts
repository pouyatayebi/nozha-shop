// zod-validations/user/schema.ts
import { z } from "zod";

// اسکیما برای فاز «درخواست کد OTP»
export const sendOtpSchema = z.object({
  phone: z
    .string()
    .min(1, "شمارهٔ موبایل الزامی است.")
    .regex(/^09\d{9}$/, "شمارهٔ موبایل باید با 09 شروع شده و 11 رقم باشد."),
});

// اسکیما برای فاز «تایید کد OTP»
export const verifyOtpSchema = z.object({
  phone: z
    .string()
    .min(1, "شمارهٔ موبایل الزامی است.")
    .regex(/^09\d{9}$/, "شمارهٔ موبایل باید با 09 شروع شده و 11 رقم باشد."),
  code: z
    .string()
    .min(1, "کد OTP الزامی است.")
    .regex(/^\d{6}$/, "کد باید ۶ رقم عددی باشد."),
});
