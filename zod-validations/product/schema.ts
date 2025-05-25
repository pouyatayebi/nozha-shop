import { z } from "zod";

export const productSchema = z.object({
  title: z.string().min(1, "نام محصول الزامی است."),
  slug: z.string().min(1, "اسلاگ الزامی است."),
  description: z.string().optional(),
  categoryId: z.string().uuid({ message: "شناسه دسته‌بندی معتبر نیست." }),
  isFeatured: z.boolean().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
});