// helpers/mapProductToForm.ts
import { Product } from "@/store/product.store";
import { ProductInput, VariantInput } from "@/zod-validations";

export function mapProductToForm(product: Product | null): ProductInput {
  if (!product) {
    return {
      title: "",
      slug: "",
      description: "",
      categoryId: null,
      isFeatured: false,
      tags: [],
      variants: [{ title: "", stock: 0, price: 0, imageIds: [] }],
      seoTitle: "",
      seoDescription: "",
    };
  }

  return {
    title: product.title,
    slug: product.slug,
    description: product.description ?? "",
    categoryId: product.categoryId ?? null,
    isFeatured: product.isFeatured ?? false,
    tags: product.tags,
    // چون در استور قبلاً تبدیل Decimal→number و Image→imageIds انجام شده،
    // اینجا می‌توانیم مستقیم از همان آرایه استفاده کنیم
    variants: product.variants as VariantInput[],
    seoTitle: product.seoTitle ?? "",
    seoDescription: product.seoDescription ?? "",
  };
}
