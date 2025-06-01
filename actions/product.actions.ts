// // actions/product.actions.ts
// "use server";

// import prisma from "@/lib/prisma";
// import { revalidatePath } from "next/cache";

// import { productSchema } from "@/zod-validations";
// import { FormState }    from "@/types/form";
// import { slugify }      from "@/helpers/slugify";

// /* تبدیل Decimal یا BigInt به number (برای خروجی Plain) */
// const toNumber = (val: any) =>
//   val && typeof val === "object" ? Number(val) : (val as number);

// /* ---------------- FormData → Object ---------------- */
// /** تبدیل FormData به شیء ساده برای Zod */
// function fdToObj(fd: FormData) {
//   const out: Record<string, any> = {};
//   fd.forEach((v, k) => {
//     if (k === "variants" || k === "tags") {
//       out[k] = JSON.parse(v.toString());
//     } else if (k === "isFeatured") {
//       // مقدار بولین را از رشتهٔ "true"/"false" بساز
//       out[k] = v.toString() === "true";
//     } else {
//       out[k] = v === "" || v === "none" ? undefined : v;
//     }
//   });
//   return out;
// }

// /* ================================================================= */
// /* ایجاد محصول                                                       */
// /* ================================================================= */
// export async function createProductAction(
//   _: FormState,
//   payload: FormData
// ): Promise<FormState> {
//   if (!(payload instanceof FormData))
//     return { success: false, errors: { error: ["Invalid data"] } };

//   const raw = fdToObj(payload);
//   const parsed = productSchema.safeParse(raw);
//   console.log("parsed product",parsed)
 
//   if (!parsed.success) {
//     console.log("❌ Zod Validation Errors:", parsed.error.flatten());
//     const errors = parsed.error.flatten().fieldErrors;
//     const fields: Record<string, string> = {};
//     for (const key in raw) fields[key] = String(raw[key] ?? "");
//     return { success: false, errors, fields };
//   }


//   const data = parsed.data;
//   console.log("product data",data)

//   try {
//     await prisma.$transaction(async (tx) => {
//       /* سئو */
//       let seoId: string | null = null;
//       if (data.seoTitle || data.seoDescription) {
//         seoId = (
//           await tx.seo.create({
//             data: { title: data.seoTitle, description: data.seoDescription },
//           })
//         ).id;
//       }

//       /* محصول */
//       const product = await tx.product.create({
//         data: {
//           title: data.title,
//           slug: data.slug,
//           description: data.description ?? "",
//           categoryId: data.categoryId ?? null,
//           isFeatured: data.isFeatured ?? false,
//           seoId,
//         },
//       });

//       /* واریانت‌ها */
//       await Promise.all(
//         data.variants.map((v) =>
//           tx.variant.create({
//             data: {
//               title: v.title,
//               stock: v.stock,
//               price: v.price,
//               productId: product.id,
//               Image: v.imageIds?.length
//                 ? { connect: v.imageIds.map((id) => ({ id })) }
//                 : undefined,
//             },
//           })
//         )
//       );

//       /* تگ‌ها */
//       for (const tagName of data.tags ?? []) {
//         const slug = slugify(tagName);
//         await tx.tag.upsert({
//           where: { slug },
//           update: {},
//           create: { name: tagName, slug },
//         });
//         await tx.product.update({
//           where: { id: product.id },
//           data: { tags: { connect: { slug } } },
//         });
//       }
//     });

//     revalidatePath("/admin/products");
//     return { success: true, version: Date.now() };
//   } catch (err) {
//     console.error(err);
//     return {
//       success: false,
//       errors: { error: ["خطا در ثبت محصول"] },
//     };
//   }
// }

// /* ================================================================= */
// /* ویرایش محصول                                                      */
// /* ================================================================= */
// export async function editProductAction(
//   _: FormState,
//   payload: FormData
// ): Promise<FormState> {
//   if (!(payload instanceof FormData))
//     return { success: false, errors: { error: ["Invalid data"] } };

//   const id = payload.get("id")?.toString();
//   if (!id) return { success: false, errors: { error: ["Missing id"] } };

//   const raw = fdToObj(payload);
//   const parsed = productSchema.safeParse(raw);
//   if (!parsed.success)
//     return { success: false, errors: parsed.error.flatten().fieldErrors };

//   const data = parsed.data;

//   try {
//     await prisma.$transaction(async (tx) => {
//       const product = await tx.product.findUnique({
//         where: { id },
//         include: { seo: true },
//       });
//       if (!product) throw new Error("Product not found");

//       /* سئو */
//       let seoId = product.seoId;
//       if (seoId) {
//         await tx.seo.update({
//           where: { id: seoId },
//           data: { title: data.seoTitle, description: data.seoDescription },
//         });
//       } else if (data.seoTitle || data.seoDescription) {
//         seoId = (
//           await tx.seo.create({
//             data: { title: data.seoTitle, description: data.seoDescription },
//           })
//         ).id;
//       }

//       /* به‌روزرسانی محصول */
//       await tx.product.update({
//         where: { id },
//         data: {
//           title: data.title,
//           slug: data.slug,
//           description: data.description ?? "",
//           categoryId: data.categoryId ?? null,
//           isFeatured: data.isFeatured ?? false,
//           seoId,
//           tags: { set: [] },
//         },
//       });

//       /* بازسازی واریانت‌ها */
//       await tx.variant.deleteMany({ where: { productId: id } });
//       await Promise.all(
//         data.variants.map((v) =>
//           tx.variant.create({
//             data: {
//               title: v.title,
//               stock: v.stock,
//               price: v.price,
//               productId: id,
//               Image: v.imageIds?.length
//                 ? { connect: v.imageIds.map((iid) => ({ id: iid })) }
//                 : undefined,
//             },
//           })
//         )
//       );

//       /* تگ‌ها */
//       for (const tagName of data.tags ?? []) {
//         const slug = slugify(tagName);
//         await tx.tag.upsert({
//           where: { slug },
//           update: {},
//           create: { name: tagName, slug },
//         });
//         await tx.product.update({
//           where: { id },
//           data: { tags: { connect: { slug } } },
//         });
//       }
//     });

//     revalidatePath("/admin/products");
//     return { success: true, version: Date.now() };
//   } catch (err) {
//     console.error(err);
//     return {
//       success: false,
//       errors: { error: ["خطا در ویرایش محصول"] },
//     };
//   }
// }

// /* ================================================================= */
// /* واکشی Plain محصولات                                               */
// /* ================================================================= */
// export async function getAllProducts() {
//   const raw = await prisma.product.findMany({
//     include: {
//       Variant: { include: { Image: true } },
//       tags: true,
//       seo: true,
//       Category: true,
//     },
//     orderBy: { createdAt: "desc" },
//   });

//   return raw.map((p) => ({
//     ...p,
//     rating: toNumber(p.rating),
//     Variant: p.Variant.map((v) => ({
//       ...v,
//       price: toNumber(v.price),
//     })),
//   }));
// }

// export async function getProductById(id: string) {
//   const p = await prisma.product.findUnique({
//     where: { id },
//     include: {
//       Variant: { include: { Image: true } },
//       tags: true,
//       seo: true,
//       Category: true,
//     },
//   });

//   if (!p) return null;

//   return {
//     ...p,
//     rating: toNumber(p.rating),
//     Variant: p.Variant.map((v) => ({
//       ...v,
//       price: toNumber(v.price),
//     })),
//   };
// }

// /* ================================================================= */
// /* حذف محصول / حذف واریانت                                          */
// /* ================================================================= */
// export async function deleteProductAction(id: string): Promise<FormState> {
//   try {
//     await prisma.product.delete({ where: { id } });
//     revalidatePath("/admin/products");
//     return { success: true };
//   } catch (err) {
//     console.error(err);
//     return {
//       success: false,
//       errors: { error: ["مشکلی در حذف محصول رخ داد"] },
//     };
//   }
// }

// export async function deleteVariantAction(
//   productId: string,
//   variantId: string
// ): Promise<FormState> {
//   try {
//     await prisma.variant.delete({ where: { id: variantId, productId } });
//     revalidatePath(`/admin/products/${productId}`);
//     return { success: true };
//   } catch (err) {
//     console.error(err);
//     return {
//       success: false,
//       errors: { error: ["مشکلی در حذف واریانت رخ داد"] },
//     };
//   }
// }




// "use server";

// import { revalidatePath } from "next/cache";
// import prisma from "@/lib/prisma";
// import { FormState } from "@/types/form";
// import { productSchema } from "@/zod-validations";
// import { slugify } from "@/helpers/slugify";
// import { variantSchema } from "@/zod-validations/variant/schema";

// /** Helper: turn FormData into a plain object, JSON-parsing `variants` & `tags` */
// function fdToObj(fd: FormData) {
//   const out: Record<string, any> = {};
//   fd.forEach((v, k) => {
//     if (k === "variants" || k === "tags") {
//       out[k] = JSON.parse(v.toString());
//     } else {
//       out[k] = v === "" || v === "none" ? undefined : v;
//     }
//   });
//   return out;
// }

// /* ================================================================== */
// /* CREATE PRODUCT                                                     */
// /* ================================================================== */
// export async function createProductAction(
//   _: FormState,
//   payload: FormData
// ): Promise<FormState> {
//   if (!(payload instanceof FormData))
//     return { success: false, errors: { error: ["Invalid data"] } };

//   const raw = fdToObj(payload);
//   const parsed = productSchema.safeParse(raw);
//   if (!parsed.success) {
//     const errors = parsed.error.flatten().fieldErrors;
//     const fields: Record<string, string> = {};
//     for (const k in raw) fields[k] = String(raw[k] ?? "");
//     return { success: false, errors, fields };
//   }
//   const data = parsed.data;

//   try {
//     await prisma.$transaction(async (tx) => {
//       // SEO
//       let seoId: string | null = null;
//       if (data.seoTitle || data.seoDescription) {
//         seoId = (
//           await tx.seo.create({
//             data: { title: data.seoTitle, description: data.seoDescription },
//           })
//         ).id;
//       }

//       // Product
//       const product = await tx.product.create({
//         data: {
//           title: data.title,
//           slug: data.slug,
//           description: data.description ?? "",
//           categoryId: data.categoryId ?? null,
//           isFeatured: data.isFeatured ?? false,
//           seoId,
//         },
//       });

//       // Variants
//       await Promise.all(
//         data.variants.map((v) =>
//           tx.variant.create({
//             data: {
//               title: v.title,
//               stock: v.stock,
//               price: v.price,
//               productId: product.id,
//               Image: v.imageIds?.length
//                 ? { connect: v.imageIds.map((id) => ({ id })) }
//                 : undefined,
//             },
//           })
//         )
//       );

//       // Tags
//       for (const tagName of data.tags ?? []) {
//         const slug = slugify(tagName);
//         await tx.tag.upsert({
//           where: { slug },
//           update: {},
//           create: { name: tagName, slug },
//         });
//         await tx.product.update({
//           where: { id: product.id },
//           data: { tags: { connect: { slug } } },
//         });
//       }
//     });

//     revalidatePath("/admin/products");
//     return { success: true, version: Date.now() };
//   } catch (err) {
//     console.error(err);
//     return { success: false, errors: { error: ["خطا در ثبت محصول"] } };
//   }
// }

// /* ================================================================== */
// /* EDIT PRODUCT                                                       */
// /* ================================================================== */
// export async function editProductAction(
//   _: FormState,
//   payload: FormData
// ): Promise<FormState> {
//   if (!(payload instanceof FormData))
//     return { success: false, errors: { error: ["Invalid data"] } };

//   const id = payload.get("id")?.toString();
//   if (!id) return { success: false, errors: { error: ["Missing product ID"] } };

//   const raw = fdToObj(payload);
//   const parsed = productSchema.safeParse(raw);
//   if (!parsed.success) {
//     const errors = parsed.error.flatten().fieldErrors;
//     return { success: false, errors };
//   }
//   const data = parsed.data;

//   try {
//     await prisma.$transaction(async (tx) => {
//       // Fetch existing
//       const prod = await tx.product.findUnique({
//         where: { id },
//         include: { seo: true },
//       });
//       if (!prod) throw new Error("Product not found");

//       // SEO
//       let seoId = prod.seoId;
//       if (seoId) {
//         await tx.seo.update({
//           where: { id: seoId },
//           data: { title: data.seoTitle, description: data.seoDescription },
//         });
//       } else if (data.seoTitle || data.seoDescription) {
//         seoId = (
//           await tx.seo.create({
//             data: { title: data.seoTitle, description: data.seoDescription },
//           })
//         ).id;
//       }

//       // Update product fields
//       await tx.product.update({
//         where: { id },
//         data: {
//           title: data.title,
//           slug: data.slug,
//           description: data.description ?? "",
//           categoryId: data.categoryId ?? null,
//           isFeatured: data.isFeatured ?? false,
//           seoId,
//           tags: { set: [] },
//         },
//       });

//       // Rebuild variants
//       await tx.variant.deleteMany({ where: { productId: id } });
//       await Promise.all(
//         data.variants.map((v) =>
//           tx.variant.create({
//             data: {
//               title: v.title,
//               stock: v.stock,
//               price: v.price,
//               productId: id,
//               Image: v.imageIds?.length
//                 ? { connect: v.imageIds.map((iid) => ({ id: iid })) }
//                 : undefined,
//             },
//           })
//         )
//       );

//       // Reconnect tags
//       for (const tagName of data.tags ?? []) {
//         const slug = slugify(tagName);
//         await tx.tag.upsert({
//           where: { slug },
//           update: {},
//           create: { name: tagName, slug },
//         });
//         await tx.product.update({
//           where: { id },
//           data: { tags: { connect: { slug } } },
//         });
//       }
//     });

//     revalidatePath("/admin/products");
//     return { success: true, version: Date.now() };
//   } catch (err) {
//     console.error(err);
//     return { success: false, errors: { error: ["خطا در ویرایش محصول"] } };
//   }
// }

// /* ================================================================== */
// /* DELETE PRODUCT                                                     */
// /* ================================================================== */
// export async function deleteProductAction(id: string): Promise<FormState> {
//   try {
//     await prisma.product.delete({ where: { id } });
//     revalidatePath("/admin/products");
//     return { success: true };
//   } catch (err) {
//     console.error(err);
//     return { success: false, errors: { error: ["مشکلی در حذف محصول"] } };
//   }
// }

// /* ================================================================== */
// /* DELETE VARIANT                                                     */
// /* ================================================================== */
// export async function deleteVariantAction(
//   variantId: string
// ): Promise<FormState> {
//   try {
//     await prisma.variant.delete({ where: { id: variantId } });
//     revalidatePath("/admin/products");
//     return { success: true };
//   } catch (err) {
//     console.error(err);
//     return { success: false, errors: { error: ["مشکلی در حذف واریانت"] } };
//   }
// }

// /* ================================================================== */
// /* EDIT VARIANT                                                       */
// /* ================================================================== */
// export async function editVariantAction(
//   _: FormState,
//   payload: FormData
// ): Promise<FormState> {
//   if (!(payload instanceof FormData))
//     return { success: false, errors: { error: ["Invalid data"] } };

//   const variantId = payload.get("variantId")?.toString();
//   if (!variantId)
//     return { success: false, errors: { error: ["Missing variant ID"] } };

//   // build raw object for validation
//   const raw: Record<string, any> = {};
//   payload.forEach((v, k) => {
//     if (k === "imageIds") {
//       raw[k] = JSON.parse(v.toString());
//     } else {
//       raw[k] = v === "" ? undefined : v;
//     }
//   });

//   const parsed = variantSchema.safeParse(raw);
//   if (!parsed.success) {
//     const errors = parsed.error.flatten().fieldErrors;
//     return { success: false, errors };
//   }
//   const data = parsed.data;

//   try {
//     await prisma.$transaction(async (tx) => {
//       // Update the core fields
//       await tx.variant.update({
//         where: { id: variantId },
//         data: {
//           title: data.title,
//           stock: data.stock,
//           price: data.price,
//         },
//       });

//       // Re‐set images
//       await tx.variant.update({
//         where: { id: variantId },
//         data: {
//           Image: {
//             set: [],
//             connect: data.imageIds.map((id) => ({ id })),
//           },
//         },
//       });
//     });

//     revalidatePath("/admin/products");
//     return { success: true };
//   } catch (err) {
//     console.error(err);
//     return { success: false, errors: { error: ["خطا در ویرایش واریانت"] } };
//   }
// }

// /* ================================================================== */
// /* READ HELPERS                                                        */
// /* ================================================================== */
// export async function getAllProducts() {
//   return prisma.product.findMany({
//     include: {
//       Variant: { include: { Image: true } },
//       tags: true,
//       seo: true,
//       Category: true,
//     },
//     orderBy: { createdAt: "desc" },
//   });
// }

// export async function getProductById(id: string) {
//   return prisma.product.findUnique({
//     where: { id },
//     include: {
//       Variant: { include: { Image: true } },
//       tags: true,
//       seo: true,
//       Category: true,
//     },
//   });
// }


// actions/product.actions.ts
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


