//action/product.actions.ts
"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { FormState } from "@/types/form";
import { productSchema } from "@/zod-validations";
import { slugify } from "@/helpers/slugify";
import { variantSchema } from "@/zod-validations/variant/schema";

/** 
 * Convert FormData to plain object
 * – JSON-parse `tags`, `variants`, `imageIds`
 * – coerce `"isFeatured"` → boolean
 */
function fdToObj(fd: FormData) {
  const out: Record<string, any> = {};
  for (const [key, val] of fd.entries()) {
    const s = val.toString();
    if (key === "tags" || key === "variants" || key === "imageIds") {
      try {
        out[key] = JSON.parse(s);
      } catch {
        out[key] = [];
      }
    } else if (key === "isFeatured") {
      // ◀️ change 1: treat isFeatured string as boolean
      out[key] = s === "true";
    } else {
      out[key] = s === "" || s === "none" ? undefined : s;
    }
  }
  return out;
}

/* ================================================================== */
/*                         Product  CRUD                                */
/* ================================================================== */

export async function createProductAction(
  _prev: FormState,
  payload: FormData
): Promise<FormState> {
  if (!(payload instanceof FormData)) {
    return { success: false, errors: { error: ["Invalid form data"] } };
  }
  const raw = fdToObj(payload);
  const parsed = productSchema.safeParse(raw);
  if (!parsed.success) {
    const errs = parsed.error.flatten().fieldErrors;
    const fields: Record<string,string> = {};
    for (const k in raw) fields[k] = String(raw[k] ?? "");
    return { success: false, errors: errs, fields };
  }
  const data = parsed.data;

  try {
    await prisma.$transaction(async tx => {
      // SEO
      let seoId: string | null = null;
      if (data.seoTitle || data.seoDescription) {
        const seo = await tx.seo.create({
          data: { title: data.seoTitle, description: data.seoDescription }
        });
        seoId = seo.id;
      }
      // Product
      const product = await tx.product.create({
        data: {
          title: data.title,
          slug: data.slug,
          description: data.description ?? "",
          categoryId: data.categoryId ?? null,
          isFeatured: data.isFeatured ?? false,
          seoId,
        },
      });
      // Tags
      for (const tagName of data.tags ?? []) {
        const tagSlug = slugify(tagName);
        await tx.tag.upsert({
          where: { slug: tagSlug },
          update: {},
          create: { name: tagName, slug: tagSlug },
        });
        await tx.product.update({
          where: { id: product.id },
          data: { tags: { connect: { slug: tagSlug } } },
        });
      }
    });

    revalidatePath("/admin/products");
    return { success: true, version: Date.now() };
  } catch (err) {
    console.error("createProductAction error:", err);
    return { success: false, errors: { error: ["خطا در ثبت محصول"] } };
  }
}

export async function editProductAction(
  _prev: FormState,
  payload: FormData
): Promise<FormState> {
  if (!(payload instanceof FormData)) {
    return { success: false, errors: { error: ["Invalid form data"] } };
  }
  const id = payload.get("id")?.toString();
  if (!id) {
    return { success: false, errors: { error: ["Missing product id"] } };
  }
  const raw = fdToObj(payload);
  const parsed = productSchema.safeParse(raw);
  if (!parsed.success) {
    const errs = parsed.error.flatten().fieldErrors;
    return { success: false, errors: errs };
  }
  const data = parsed.data;

  try {
    await prisma.$transaction(async tx => {
      const prod = await tx.product.findUnique({
        where: { id },
        include: { seo: true },
      });
      if (!prod) throw new Error("Product not found");

      // SEO
      let seoId = prod.seoId;
      if (seoId) {
        await tx.seo.update({
          where: { id: seoId },
          data: { title: data.seoTitle, description: data.seoDescription },
        });
      } else if (data.seoTitle || data.seoDescription) {
        const seo = await tx.seo.create({
          data: { title: data.seoTitle, description: data.seoDescription },
        });
        seoId = seo.id;
      }

      // Update product
      await tx.product.update({
        where: { id },
        data: {
          title: data.title,
          slug: data.slug,
          description: data.description ?? "",
          categoryId: data.categoryId ?? null,
          isFeatured: data.isFeatured ?? false,
          seoId,
          tags: { set: [] },
        },
      });

      // Reconnect tags
      for (const tagName of data.tags ?? []) {
        const tagSlug = slugify(tagName);
        await tx.tag.upsert({
          where: { slug: tagSlug },
          update: {},
          create: { name: tagName, slug: tagSlug },
        });
        await tx.product.update({
          where: { id },
          data: { tags: { connect: { slug: tagSlug } } },
        });
      }
    });

    revalidatePath("/admin/products");
    return { success: true, version: Date.now() };
  } catch (err) {
    console.error("editProductAction error:", err);
    return { success: false, errors: { error: ["خطا در ویرایش محصول"] } };
  }
}

export async function deleteProductAction(id: string): Promise<FormState> {
  try {
    await prisma.product.delete({ where: { id } });
    revalidatePath("/admin/products");
    return { success: true };
  } catch (err) {
    console.error("deleteProductAction error:", err);
    return { success: false, errors: { error: ["خطا در حذف محصول"] } };
  }
}

// actions/product.actions.ts

export async function getAllProducts() {
  const raw = await prisma.product.findMany({
    include: {
      Variant: { include: { Image: true } },
      tags: true,
      seo: true,
      Category: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // این مرحله‌ی تبدیل را اضافه کنید:
  const plain = raw.map((p) => ({
    ...p,
    rating: p.rating?.toNumber() ?? 0,
    numReviews: p.numReviews ?? 0,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    Variant: p.Variant.map((v) => ({
      ...v,
      price: v.price?.toNumber() ?? 0,
      createdAt: v.createdAt.toISOString(),
      updatedAt: v.updatedAt.toISOString(),
      Image: v.Image.map((img) => ({ ...img })),
    })),
    tags: p.tags.map((t) => ({ ...t })),       // اگر نیاز دارید
    seo: p.seo ? { ...p.seo } : null,
    Category: p.Category ? { ...p.Category } : null,
  }));

  return plain;
}

export async function getProductById(id: string) {
  const p = await prisma.product.findUnique({
    where: { id },
    include: {
      Variant: { include: { Image: true } },
      tags: true,
      seo: true,
      Category: true,
    },
  });
  if (!p) return null;
  return {
    ...p,
    rating: p.rating?.toNumber() ?? 0,
    numReviews: p.numReviews ?? 0,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    Variant: p.Variant.map((v) => ({
      ...v,
      price: v.price?.toNumber() ?? 0,
      createdAt: v.createdAt.toISOString(),
      updatedAt: v.updatedAt.toISOString(),
      Image: v.Image.map((img) => ({ ...img })),
    })),
    tags: p.tags.map((t) => ({ ...t })),
    seo: p.seo ? { ...p.seo } : null,
    Category: p.Category ? { ...p.Category } : null,
  };
}

/* ================================================================== */
/*                         Variant  CRUD                                */
/* ================================================================== */

export async function createVariantAction(
  _prev: FormState,
  payload: FormData
): Promise<FormState> {
  if (!(payload instanceof FormData)) {
    return { success: false, errors: { error: ["Invalid form data"] } };
  }
  console.log("paylod variant",payload)
  const raw = fdToObj(payload);
  const parsed = variantSchema.safeParse(raw);
  if (!parsed.success) {
    const errs = parsed.error.flatten().fieldErrors;
    console.log("❌ Zod Validation Errors:", parsed.error?.flatten());
    return { success: false, errors: errs };
  }
  const data = parsed.data;
  const productId = raw.productId;
  if (!productId) {
    return { success: false, errors: { error: ["Missing productId"] } };
  }

  try {
    await prisma.variant.create({
      data: {
        title: data.title,
        stock: data.stock,
        price: data.price,
        productId,
        Image: data.imageIds?.length
          ? { connect: data.imageIds.map((id) => ({ id })) }
          : undefined,
      },
    });
    revalidatePath("/admin/products");
    return { success: true, version: Date.now() };
  } catch (err) {
    console.error("createVariantAction error:", err);
    return { success: false, errors: { error: ["خطا در ثبت واریانت"] } };
  }
}




export async function editVariantAction(
  _prev: FormState,
  payload: FormData
): Promise<FormState> {
  if (!(payload instanceof FormData)) {
    return { success: false, errors: { error: ["Invalid form data"] } };
  }
  const raw = fdToObj(payload);
  const parsed = variantSchema.safeParse(raw);
  if (!parsed.success) {
    const errs = parsed.error.flatten().fieldErrors;
    return { success: false, errors: errs };
  }
  const data = parsed.data;
  const id = raw.id as string;
  if (!id) {
    return { success: false, errors: { error: ["Missing variant id"] } };
  }

  try {
    await prisma.$transaction(async (tx) => {
      // به‌روزرسانی فیلدهای اصلی
      await tx.variant.update({
        where: { id },
        data: {
          title: data.title,
          stock: data.stock,
          price: data.price,
        },
      });
      // تنظیم مجدد تصاویر
      await tx.variant.update({
        where: { id },
        data: {
          Image: {
            set: [],
            ...(data.imageIds.length
              ? { connect: data.imageIds.map((iid) => ({ id: iid })) }
              : {}),
          },
        },
      });
    });

    revalidatePath("/admin/products");
    return { success: true, version: Date.now() };
  } catch (err) {
    console.error("editVariantAction error:", err);
    return { success: false, errors: { error: ["خطا در ویرایش واریانت"] } };
  }
}



/**
 * حذف یک واریانت از محصول
 * @param productId شناسهٔ محصول (برای ری‌ریوالید مسیر)
 * @param variantId شناسهٔ واریانت برای حذف
 */
export async function deleteVariantAction(
  productId: string,
  variantId: string
): Promise<FormState> {
  try {
    await prisma.variant.delete({
      where: { id: variantId },
    });
    // ری‌ریوالید صفحهٔ محصول تا جدول به‌روز شود
    revalidatePath("/admin/products");
    return { success: true };
  } catch (error) {
    console.error("خطا در حذف واریانت:", error);
    return {
      success: false,
      errors: { error: ["مشکلی در حذف واریانت رخ داد"] },
    };
  }
}


