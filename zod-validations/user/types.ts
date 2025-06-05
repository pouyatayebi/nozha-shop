// zod-validations/user/types.ts
import { z } from "zod";
import {
  sendOtpSchema,
  verifyOtpSchema,
} from "./schema";

export type SendOtpInput = z.infer<typeof sendOtpSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
