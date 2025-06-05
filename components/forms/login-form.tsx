// components/forms/login-form.tsx
"use client";

import { useState, useEffect, startTransition, useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { sendOtpAction } from "@/actions/user.actions";
import { sendOtpSchema } from "@/zod-validations/user/schema";
import type { FormState } from "@/types/form";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";

/* ------------------------------------------------------------------ */
/* انواع و شِماها                                                     */
/* ------------------------------------------------------------------ */
interface PhoneForm {
  phone: string;
}
const codeSchema = z.object({
  code: z
    .string()
    .length(6)
    .regex(/^\d{6}$/),
});
type OtpForm = z.infer<typeof codeSchema>;

export default function LoginForm() {
  const router = useRouter();

  /* وضعیت مراحل */
  const [step, setStep] = useState<"enterPhone" | "enterOtp">("enterPhone");
  const [phone, setPhone] = useState("");
  const [counter, setCounter] = useState(60);

  /* ------------------------------------------------------------------ */
  /* فرم ارسال OTP                                                     */
  /* ------------------------------------------------------------------ */
  const phoneForm = useForm<PhoneForm>({
    resolver: zodResolver(sendOtpSchema),
    defaultValues: { phone: "" },
    mode: "onTouched",
  });

  const [sendState, sendFormAction, sending] = useActionState(sendOtpAction, {
    success: false,
    version: 0,
  } satisfies FormState);

  useEffect(() => {
    if (sendState.success) {
      toast.success("کد تأیید ارسال شد");
      setPhone(phoneForm.getValues("phone").trim());
      setStep("enterOtp");
      setCounter(60);
    }
  }, [sendState.version]); // eslint-disable-line react-hooks/exhaustive-deps

  /* شمارنده ارسال مجدد */
  useEffect(() => {
    if (step !== "enterOtp" || counter === 0) return;
    const t = setTimeout(() => setCounter((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [step, counter]);

  /* ------------------------------------------------------------------ */
  /* فرم ورود OTP                                                      */
  /* ------------------------------------------------------------------ */
  const otpForm = useForm<OtpForm>({
    resolver: zodResolver(codeSchema),
    defaultValues: { code: "" },
    mode: "onTouched",
  });

  const [isPending, startPending] = useTransition();

/* ---------- verifyOnServer (نسخهٔ نهایی) ---------- */
const verifyOnServer = otpForm.handleSubmit(({ code }) =>
  startPending(async () => {
    const res = await fetch("/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, code }),
      credentials: "include",           // ⬅️ کوکی سشن را بپذیر
    });
   console.log("res",res)
    /* اگر ریدایرکت دنبال شد یا پاسخ 200 /user است */
    if (res.ok) {
      router.replace("/user");
      toast.success("ورود موفقیت‌آمیز بود");
      return;
    }

    /* در صورت ریدایرکت manual یا opaque */
    if (
      res.redirected ||
      (res.status >= 300 && res.status < 400) ||
      res.type === "opaqueredirect"
    ) {
      router.replace(
        res.headers.get("Location") ?? res.url ?? "/user"
      );
      toast.success("ورود موفقیت‌آمیز بود");
      return;
    }

    /* خطاها */
    const { error } = await res.json().catch(() => ({ error: "" }));
    toast.error(
      error === "wrong_or_expired"
        ? "کد نادرست یا منقضی شده"
        : "خطا در ورود"
    );
  })
);





  /* ------------------------------------------------------------------ */
  /* UI                                                                 */
  /* ------------------------------------------------------------------ */
  return (
    <div className="max-w-md mx-auto p-4 bg-white rounded shadow">
      {/* مرحله ۱: دریافت شماره موبایل */}
      {step === "enterPhone" && (
        <Form {...phoneForm}>
          <form action={sendFormAction} className="space-y-6">
            <FormField
              control={phoneForm.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>شماره موبایل</FormLabel>
                  <FormControl>
                    <input
                      {...field}
                      type="tel"
                      className="w-full border rounded p-2 ltr"
                      placeholder="09xxxxxxxxx"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={sending} className="w-full">
              {sending ? "در حال ارسال..." : "دریافت کد تأیید"}
            </Button>
          </form>
        </Form>
      )}

      {/* مرحله ۲: ورود کد OTP */}
      {step === "enterOtp" && (
        <Form {...otpForm}>
          <form onSubmit={verifyOnServer} className="space-y-6">
            <Controller
              control={otpForm.control}
              name="code"
              render={({ field }) => (
                <InputOTP
                  dir="ltr"
                  autoFocus
                  maxLength={6}
                  value={field.value}
                  onChange={field.onChange}
                  className="flex justify-center"
                >
                  <InputOTPGroup dir="ltr" className="gap-2">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <InputOTPSlot
                        key={i}
                        index={i}
                        className="w-10 h-10 border rounded text-center"
                      />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              )}
            />
            <FormMessage>{otpForm.formState.errors.code?.message}</FormMessage>

            <div className="flex justify-between items-center">
              <Button type="submit" disabled={isPending} className="w-32">
                {isPending ? "در حال بررسی..." : "ورود"}
              </Button>

              {counter > 0 ? (
                <span className="text-sm text-muted-foreground">
                  ارسال مجدد در {counter} ثانیه
                </span>
              ) : (
                <Button
                  variant="ghost"
                  type="button"
                  onClick={() => {
                    const fd = new FormData();
                    fd.append("phone", phone);
                    startTransition(() => sendFormAction(fd));
                    setCounter(60);
                  }}
                >
                  ارسال مجدد کد
                </Button>
              )}
            </div>
          </form>
        </Form>
      )}
    </div>
  );
}
