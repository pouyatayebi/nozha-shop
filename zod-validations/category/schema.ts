import { z } from "zod";

export const categorySchema = z.object({
  title: z.string().min(1, "نام دسته‌بندی الزامی است."),
  slug: z.string().min(1, "اسلاگ الزامی است."),
  parentId: z.string().uuid().nullable().optional(),
  imageId: z.string().uuid().optional().nullable(),

  // توضیح richText به‌صورت HTML ذخیره می‌شود
  description: z.string().default("").optional(),

  // اطلاعات سئو
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
});
