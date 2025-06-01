//zod-validations/product/types.ts
import { z } from "zod";
import { productSchema} from "./schema";

/** نوع داده‌ای که در فرم ایجاد/ویرایش محصول استفاده می‌کنیم */
export type ProductInput = z.infer<typeof productSchema>;

