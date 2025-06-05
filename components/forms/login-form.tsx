// components/forms/login-form.tsx
"use client";

import { useState, useEffect, startTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { sendOtpAction, verifyOtpAction } from "@/actions/user.actions";
import {
  sendOtpSchema,
  verifyOtpSchema, // (phone + code)
} from "@/zod-validations/user/schema";
import type { FormState } from "@/types/form";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
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
/* ۱) فرم شمارهٔ تلفن                                                 */
/* ------------------------------------------------------------------ */
type PhoneForm = { phone: string };

/* ------------------------------------------------------------------ */
/* ۲) فرم کد تأیید                                                    */
/* فقط فیلد code را اعتبارسنجی می‌کنیم؛ phone به‌صورت hidden ارسال می‌شود */
/* ------------------------------------------------------------------ */
const codeOnlySchema = z.object({
  code: z
    .string()
    .length(6, "کد ۶ رقمی است.")
    .regex(/^\d{6}$/, "کد باید فقط عدد باشد."),
});
type OtpForm = z.infer<typeof codeOnlySchema>;

export default function LoginForm() {
  /* ------------------------------------------------------------ */
  /* وضعیت مرحله و داده‌های جانبی                                  */
  /* ------------------------------------------------------------ */
  const router = useRouter();
  const [step, setStep] = useState<"enterPhone" | "enterOtp">("enterPhone");
  console.log("step",step)
  const [phoneValue, setPhoneValue] = useState<string>(""); // برای مرحلهٔ OTP
  const [counter, setCounter] = useState<number>(60); // تایمر ارسال مجدد

  /* ------------------------------------------------------------ */
  /* فرم شمارهٔ تلفن                                               */
  /* ------------------------------------------------------------ */
  const phoneForm = useForm<PhoneForm>({
    resolver: zodResolver(sendOtpSchema),
    defaultValues: { phone: "" },
    mode: "onTouched",
  });

  const [sendState, sendFormAction, sending] = useActionState(
    sendOtpAction,
    { success: false, version: 0 } satisfies FormState
  );

  /* پس از ارسال موفق OTP → رفتن به مرحلهٔ بعد */
  useEffect(() => {
    if (sendState.success) {
      toast.success("کد تأیید ارسال شد");
      setPhoneValue(phoneForm.getValues("phone").trim());
      setStep("enterOtp");
      setCounter(60);
    }
  }, [sendState.version]); // eslint-disable-line react-hooks/exhaustive-deps

  /* شمارش معکوس 60 ثانیه‌ای برای ارسال مجدد */
  useEffect(() => {
    if (step !== "enterOtp" || counter === 0) return;
    const timer = setTimeout(() => setCounter((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [step, counter]);

  /* ------------------------------------------------------------ */
  /* فرم کد تأیید                                                  */
  /* ------------------------------------------------------------ */
  const otpForm = useForm<OtpForm>({
    resolver: zodResolver(codeOnlySchema),
    defaultValues: { code: "" },
    mode: "onTouched",
  });

  const [verifyState, verifyFormAction, verifying] = useActionState(
    verifyOtpAction,
    { success: false, version: 0 } satisfies FormState
  );

  /* پس از تأیید موفق → ریدایرکت */
  useEffect(() => {
    if (verifyState.success) {
      toast.success("ورود موفقیت‌آمیز بود");
      router.push("/user");
    }
  }, [verifyState.version, router]);

  /* ------------------------------------------------------------ */
  /* ارسالِ مجدد کد                                                */
  /* ------------------------------------------------------------ */
  const handleResend = () => {
    if (!phoneValue) return;
    const fd = new FormData();
    fd.append("phone", phoneValue);
    startTransition(() => {
      sendFormAction(fd);
    });
    setCounter(60);
  };

  /* ------------------------------------------------------------ */
  /* UI                                                            */
  /* ------------------------------------------------------------ */
  return (
    <div className="max-w-md mx-auto p-4 bg-white rounded shadow">
      {/* مرحلهٔ ورود شمارهٔ موبایل -------------------------------- */}
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
                      className="w-full border rounded p-2 text-left ltr"
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

      {/* مرحلهٔ ورود کد OTP --------------------------------------- */}
      {step === "enterOtp" && (
        <Form {...otpForm}>
          <form action={verifyFormAction} className="space-y-6">
            {/* فیلد مخفی شماره تلفن برای ارسال به اکشن verify */}
            <input type="hidden" name="phone" value={phoneValue} />

            <Controller
              control={otpForm.control}
              name="code"
              render={({ field }) => (
                <div>
                  <p className="mb-2">
                    کد ارسال‌شده به <strong>{phoneValue}</strong> را وارد کنید:
                  </p>

                  <InputOTP
                    maxLength={6}
                    value={field.value}
                    onChange={field.onChange}
                  >
                    <InputOTPGroup>
                      {Array.from({ length: 6 }).map((_, idx) => (
                        <InputOTPSlot key={idx} index={idx} />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>

                  <FormMessage>{otpForm.formState.errors.code?.message}</FormMessage>
                </div>
              )}
            />

            <div className="flex justify-between items-center">
              <Button type="submit" disabled={verifying}>
                {verifying ? "در حال بررسی..." : "تأیید کد"}
              </Button>

              {counter > 0 ? (
                <span className="text-sm text-muted-foreground">
                  ارسال مجدد در {counter} ثانیه
                </span>
              ) : (
                <Button variant="ghost" type="button" onClick={handleResend}>
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
