// zod-validations/product/schema.ts
import { z } from "zod";
import { variantSchema } from "../variant/schema";

export const productSchema = z.object({
  title: z.string().min(1, "عنوان محصول الزامی است."),
  slug: z.string().min(1, "اسلاگ محصول الزامی است."),

  // ↙️ همیشه یک رشته (اگر خالی، "")
  description: z.string().default(""),

  // ↙️ همیشه یا UUID یا null
  categoryId: z.string().uuid().nullable().default(null),

  // ↙️ همیشه یک بولئین (false اگر ندادند)
  isFeatured: z.boolean().default(false),

  // ↙️ همیشه آرایهٔ واریانت (ممکن است خالی باشد)
  variants: z.array(variantSchema).default([]),

  // ↙️ همیشه آرایهٔ تگ (ممکن است خالی باشد)
  tags: z.array(z.string()).default([]),

  // ↙️ همیشه یک رشته (اگر خالی، "")
  seoTitle: z.string().default(""),
  seoDescription: z.string().default(""),
});

