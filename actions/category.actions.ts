"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { FormState } from "@/types/form";
import { categorySchema } from "@/zod-validations";
import type { Category } from "@/store/category.store";

type CategoryFields = Record<string, string>;

function emptyToUndefined(
  key: string,
  value: FormDataEntryValue
): string | undefined {
  // فیلدهای UUID که ممکن است تهی یا "none" باشند
  if (
    ["parentId", "imageId"].includes(key) &&
    (value === "" || value === "none")
  )
    return undefined;
  // مقادیر خالی سایر فیلدها
  return value === "" ? undefined : (value as string);
}

/* -------------------------------------------------------------------------- */
/*                               CREATE ACTION                                */
/* -------------------------------------------------------------------------- */

export async function createCategoryAction(
  prevState: FormState,
  payload: FormData
): Promise<FormState> {
  if (!(payload instanceof FormData)) {
    return { success: false, errors: { error: ["Invalid Form Data"] } };
  }
  console.log("payload category", payload);

  const raw: Record<string, any> = {};
  for (const [key, value] of payload.entries()) {
    if (key === "id") continue; // id در شِما وجود ندارد
    raw[key] = emptyToUndefined(key, value);
  }

  const parsed = categorySchema.safeParse(raw);
  console.log("parsed category", parsed);
  if (!parsed.success) {
    console.log("❌ Zod Validation Errors:", parsed.error.flatten());
    const errors = parsed.error.flatten().fieldErrors;
    const fields: CategoryFields = {};
    for (const key in raw) fields[key] = String(raw[key] ?? "");
    return { success: false, errors, fields };
  }

  const data = parsed.data;

  try {
    await prisma.$transaction(async (tx) => {
      /* ------------------------- Rich-text توضیح ------------------------- */
      const contentComponent = await tx.contentComponent.create({
        data: { type: "TEXT", order: 0 },
      });
      const text = await tx.textComponent.create({
        data: { id: contentComponent.id, content: data.description || "" },
      });

      /* -------------------------- SEO اختیاری --------------------------- */
      let seoId: string | undefined;
      if (data.seoTitle || data.seoDescription) {
        const seo = await tx.seo.create({
          data: { title: data.seoTitle, description: data.seoDescription },
        });
        seoId = seo.id;
      }

      /* --------------------------- دسته‌بندی ---------------------------- */
      await tx.category.create({
        data: {
          title: data.title,
          slug: data.slug,
          parentId: data.parentId ?? null,
          imageId: data.imageId ?? null,
          descriptionId: text.id,
          seoId: seoId ?? null,
        },
      });
    });

    // صفحات محتمل مصرف‌کنندهٔ دسته‌ها را تازه می‌کنیم
    revalidatePath("/admin/categories");
    revalidatePath("/user"); // در صورت نمایش برای کاربر
    revalidatePath("/"); // برای صفحهٔ اصلی (اختیاری)

    return {
      success: true,
      version: Date.now(),
      fields: { title: data.title, slug: data.slug },
      errors: {},
    };
  } catch (error) {
    console.error("خطا هنگام ثبت دسته:", error);
    return {
      success: false,
      errors: { error: ["خطایی هنگام ثبت دسته‌بندی رخ داد."] },
      fields: { title: data.title, slug: data.slug },
    };
  }
}

/* -------------------------------------------------------------------------- */
/*                                EDIT ACTION                                 */
/* -------------------------------------------------------------------------- */

export async function editCategoryAction(
  prevState: FormState,
  payload: FormData
): Promise<FormState> {
  if (!(payload instanceof FormData)) {
    return { success: false, errors: { error: ["Invalid Form Data"] } };
  }

  const formEntries = Object.fromEntries(payload);
  const id = formEntries.id?.toString?.();
  const raw: Record<string, any> = {};

  for (const [key, value] of payload.entries()) {
    if (key === "id") continue;
    raw[key] = emptyToUndefined(key, value);
  }

  const parsed = categorySchema.safeParse(raw);
  console.log("parsed category", parsed);
  if (!parsed.success || !id) {
    const errors = parsed.error?.flatten().fieldErrors || {};
    console.log("❌ Zod Validation Errors:", parsed.error?.flatten());
    const fields: CategoryFields = {};
    for (const key in formEntries)
      fields[key] = formEntries[key]?.toString?.() || "";
    return { success: false, errors, fields };
  }

  const data = parsed.data;

  try {
    await prisma.$transaction(async (tx) => {
      const category = await tx.category.findUnique({
        where: { id },
        include: { description: true, seo: true },
      });
      if (!category) throw new Error("دسته‌بندی یافت نشد");

      /* ----------------------- به‌روزرسانی Rich-text ----------------------- */
      if (category.descriptionId) {
        await tx.textComponent.update({
          where: { id: category.descriptionId },
          data: { content: data.description || "" },
        });
      }

      /* ----------------------------- SEO ----------------------------------- */
      let seoId = category.seoId;
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

      /* ------------------------ به‌روزرسانی دسته --------------------------- */
      await tx.category.update({
        where: { id },
        data: {
          title: data.title,
          slug: data.slug,
          parentId: data.parentId ?? null,
          imageId: data.imageId ?? null,
          seoId,
        },
      });
    });

    revalidatePath("/admin/categories");
    revalidatePath("/user");
    revalidatePath("/");

    return {
      success: true,
      version: Date.now(),
      fields: { title: data.title, slug: data.slug },
      errors: {},
    };
  } catch (error) {
    console.error("خطا هنگام ویرایش دسته:", error);
    return {
      success: false,
      errors: { error: ["خطایی هنگام ویرایش دسته‌بندی رخ داد."] },
      fields: { title: data.title, slug: data.slug },
    };
  }
}

/* -------------------------------------------------------------------------- */
/*                            READ/DELETE HELPERS                             */
/* -------------------------------------------------------------------------- */

// بازگرداندن لیست تمام دسته‌ها (برای پر کردن جدول)
// این تابع را اصلاح می‌کنیم تا تمام فیلدهای مورد نیاز از جمله description و seo را بازگرداند
export async function getAllCategories(): Promise<{
  id: string;
  title: string;
  slug: string;
  parentId: string | null;
  imageId: string | null;
  description: string;
  seoTitle: string | null;
  seoDescription: string | null;
}[]> {
  const cats = await prisma.category.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      description: true, // اگر رکوردی در textComponent باشد
      seo: true,         // اگر رکوردی در seo باشد
    },
  });

  // مسطح سازی (flatten) خروجی به شکل ساختار ساده‌ی Category
  return cats.map((cat) => ({
    id: cat.id,
    title: cat.title,
    slug: cat.slug,
    parentId: cat.parentId,
    imageId: cat.imageId,
    description: cat.description?.content ?? "",
    seoTitle: cat.seo?.title ?? null,
    seoDescription: cat.seo?.description ?? null,
  }));
}

export async function getCategoryById(
  id: string
): Promise<{
  id: string;
  title: string;
  slug: string;
  parentId: string | null;
  imageId: string | null;
  description: string;
  seoTitle: string | null;
  seoDescription: string | null;
} | null> {
  const cat = await prisma.category.findUnique({
    where: { id },
    include: {
      description: true,
      seo: true,
    },
  });
  if (!cat) return null;

  return {
    id: cat.id,
    title: cat.title,
    slug: cat.slug,
    parentId: cat.parentId,
    imageId: cat.imageId,
    description: cat.description?.content ?? "",
    seoTitle: cat.seo?.title ?? null,
    seoDescription: cat.seo?.description ?? null,
  };
}


export async function deleteCategoryAction(id: string): Promise<FormState> {
  try {
    await prisma.category.delete({ where: { id } });
    revalidatePath("/admin/categories");
    return { success: true };
  } catch (error) {
    console.error("خطا در حذف دسته:", error);
    return {
      success: false,
      errors: { error: ["مشکلی در حذف دسته رخ داد."] },
    };
  }
}
