import { z } from "zod";

export const fileSchema = z
  .instanceof(File)
  .refine((file) => file.size > 0, "فایل نباید خالی باشد.")
  .refine((file) => file.type.startsWith("image/"), "فقط فایل‌های تصویری مجاز هستند.");