// store/product.store.ts
import { create } from "zustand";
import { getAllProducts } from "@/actions/product.actions";
import type { VariantInput } from "@/zod-validations/variant/types";

/** مدل واریانت ساده‌شده با id */
export type ProductVariant = VariantInput & {
  id: string;
};

/** مدل سادهٔ محصول */
export type Product = {
  id: string;
  title: string;
  slug: string;
  categoryId?: string | null;
  categoryTitle?: string | null;
  description?: string | null;
  isFeatured?: boolean | null;
  rating?: number;
  variants: ProductVariant[];
  tags: string[];
  seoTitle?: string | null;
  seoDescription?: string | null;
};

/** نگاشت امن Decimal → number */
const toNumber = (val: unknown): number =>
  typeof val === "object" ? Number(val as any) : (val as number);

/** نگاشت دادهٔ خام ← Product */
const mapRawToProduct = (p: any): Product => ({
  id: p.id,
  title: p.title,
  slug: p.slug,
  categoryId: p.categoryId,
  categoryTitle: p.Category?.title ?? null,
  description: p.description,
  isFeatured: p.isFeatured,
  rating: toNumber(p.rating) || 0,

  variants: Array.isArray(p.Variant)
    ? p.Variant.map(
        (v: any): ProductVariant => ({
          id: v.id,
          title: v.title,
          stock: v.stock ?? 0,
          price: toNumber(v.price) || 0,
          discountPercentage: toNumber(v.discountPercentage) || 0,
          imageIds: Array.isArray(v.Image)
            ? v.Image.map((img: any) => img.id)
            : [],
        })
      )
    : [],

  tags: Array.isArray(p.tags) ? p.tags.map((t: any) => t.slug) : [],
  seoTitle: p.seo?.title ?? null,
  seoDescription: p.seo?.description ?? null,
});

/** استور محصولات */
type ProductStore = {
  products: Product[];
  setProducts: (raw: any[]) => void;
  fetchProducts: () => Promise<void>;
  editing: Product | null;
  setEditing: (raw: any | null) => void;
  variantEditing: { productId: string; variant?: ProductVariant } | null;
  setVariantEditing: (
    payload: { productId: string; variant?: ProductVariant } | null
  ) => void;
};

export const useProductStore = create<ProductStore>((set) => ({
  products: [],

  setProducts: (raw) => set({ products: raw.map(mapRawToProduct) }),
  variantEditing: null,
  setVariantEditing: (payload) => set({ variantEditing: payload }),

  fetchProducts: async () => {
    const raw = await getAllProducts();
    if (Array.isArray(raw)) {
      set({ products: raw.map(mapRawToProduct) });
    }
  },

  editing: null,
  setEditing: (raw) => set({ editing: raw ? mapRawToProduct(raw) : null }),
}));
