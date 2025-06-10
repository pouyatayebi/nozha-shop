// zod-validations/variant/schema.ts
import { z } from "zod";

export const variantSchema = z.object({
  title: z.string().min(1, "نام واریانت الزامی است."),
  // ابتدا اگر مقدار رشته‌ای بود، به عدد تبدیلش کن
  stock: z.preprocess((val) => {
    if (typeof val === "string" && val.trim() !== "") {
      const n = Number(val);
      return isNaN(n) ? val : n;
    }
    return val;
  }, z.number({ invalid_type_error: "موجودی باید عدد باشد." }).min(0, "مقدار موجودی نمی‌تواند منفی باشد.")),

  price: z.preprocess((val) => {
    if (typeof val === "string" && val.trim() !== "") {
      const n = Number(val);
      return isNaN(n) ? val : n;
    }
    return val;
  }, z.number({ invalid_type_error: "قیمت باید عدد باشد." }).min(0, "قیمت نمی‌تواند منفی باشد.")),

  // درصد تخفیف اختیاری (۰ تا ۱۰۰)
  discountPercentage: z
    .preprocess((val) => {
      if (typeof val === "string" && val.trim() !== "") {
        const n = Number(val);
        return isNaN(n) ? val : n;
      }
      return val;
    }, z.number({ invalid_type_error: "تخفیف باید عدد باشد." }).min(0, "تخفیف نمی‌تواند منفی باشد.").max(100, "تخفیف نمی‌تواند بیش از ۱۰۰ درصد باشد."))
    .optional()
    .default(0),

  // ↙️ همیشه یک آرایه (خالی اگر هیچ تصویری نباشد)
  imageIds: z.array(z.string().uuid()).default([]),
});
