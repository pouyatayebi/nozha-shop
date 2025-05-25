// helpers/mapCategoryToForm.ts
import { CategoryInput } from "@/zod-validations";
import { Category } from "@/store/category.store"; // یا مدل Prisma

export function mapCategoryToForm(cat: Category | null): CategoryInput {
  if (!cat) {
    // مقادیر خالی برای حالت افزودن
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
