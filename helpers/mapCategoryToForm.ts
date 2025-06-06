// helpers/mapCategoryToForm.ts
import { CategoryInput } from "@/zod-validations";
import type { Category } from "@/store/category.store";

/**
 * مقادیر پیش‌فرض فرم دسته‌بندی را بر اساس شیء Category تولید می‌کند.
 * اگر cat تهی باشد، فرم در حالت «افزودن» قرار می‌گیرد.
 */
export function mapCategoryToForm(cat: Category | null): CategoryInput {
  if (!cat) {
    // حالت افزودن
    return {
      title: "",
      slug: "",
      parentId: undefined,
      imageId: undefined,
      description: "",
      seoTitle: "",
      seoDescription: "",
    };
  }

  // حالت ویرایش
  return {
    title: cat.title,
    slug: cat.slug,
    parentId: cat.parentId ?? undefined,
    imageId: cat.imageId ?? undefined,
    description: cat.description ?? "",
    seoTitle: cat.seoTitle ?? "",
    seoDescription: cat.seoDescription ?? "",
  };
}
// این تابع به شما امکان می‌دهد تا مقادیر فرم را بر اساس دسته‌بندی موجود تنظیم کنید.