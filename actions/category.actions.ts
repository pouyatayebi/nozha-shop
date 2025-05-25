"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { FormState } from "@/types/form";
import { categorySchema } from "@/zod-validations";

export async function createCategoryAction(
  prevState: FormState,
  payload: FormData
): Promise<FormState> {
  if (!(payload instanceof FormData)) {
    return {
      success: false,
      errors: { error: ["Invalid Form Data"] },
    };
  }

  const raw: Record<string, any> = {};

  for (const [key, value] of payload.entries()) {
    raw[key] = value === "" ? undefined : value;
  }

  const parsed = categorySchema.safeParse(raw);

  if (!parsed.success) {
    console.log("❌ Zod Validation Errors:", parsed.error.flatten());
    const errors = parsed.error.flatten().fieldErrors;
    const fields: Record<string, string> = {};
    for (const key in raw) fields[key] = String(raw[key] ?? "");
    return { success: false, errors, fields };
  }

  const data = parsed.data;


  try {
    await prisma.$transaction(async (tx) => {
      const contentComponent = await tx.contentComponent.create({
        data: { type: "TEXT", order: 0 },
      });

      const text = await tx.textComponent.create({
        data: {
          id: contentComponent.id,
          content: data.description || "",
        },
      });

      let seoId: string | undefined;
      if (data.seoTitle || data.seoDescription) {
        const seo = await tx.seo.create({
          data: {
            title: data.seoTitle,
            description: data.seoDescription,
          },
        });
        seoId = seo.id;
      }

      await tx.category.create({
        data: {
          title: data.title,
          slug: data.slug,
          parentId: data.parentId || null,
          imageId: data.imageId || null,
          descriptionId: text.id,
          seoId: seoId || null,
        },
      });
    });

    revalidatePath("/admin/categories");

    return {
      success: true,
      version: Date.now(),      // فیلدی همیشه متفاوت
      fields: {
        title: data.title,
        slug: data.slug,
      },
      errors: {},
    };
  } catch (error) {
    console.error("خطا هنگام ثبت دسته:", error);
    return {
      success: false,
      errors: { error: ["خطایی هنگام ثبت دسته‌بندی رخ داد."] },
      fields: {
        title: data.title,
        slug: data.slug,
      },
    };
  }
}

export async function editCategoryAction(
  prevState: FormState,
  payload: FormData
): Promise<FormState> {
  if (!(payload instanceof FormData)) {
    return {
      success: false,
      errors: { error: ["Invalid Form Data"] },
    };
  }
  console.log("payload", payload);
  const formData = Object.fromEntries(payload);

  const id = formData.id?.toString?.();

  const raw: Record<string, any> = {};
  for (const [key, value] of payload.entries()) {
    if (key === "parentId" && (value === "" || value === "none")) {
      raw[key] = undefined; //  ← رفع خطا
    } else {
      raw[key] = value;
    }
  }
  const parsed = categorySchema.safeParse(raw);

  if (!parsed.success || !id) {
    const errors = parsed.error?.flatten().fieldErrors || {};
    console.log("❌ Zod Validation Errors:", parsed.error?.flatten());
    const fields: Record<string, string> = {};
    for (const key of Object.keys(formData)) {
      fields[key] = formData[key]?.toString?.() || "";
    }
    return { success: false, errors, fields };
  }

  const data = parsed.data;
  console.log("category data", data);

  try {
    await prisma.$transaction(async (tx) => {
      const category = await tx.category.findUnique({
        where: { id },
        include: { description: true, seo: true },
      });

      if (!category) {
        throw new Error("دسته‌بندی یافت نشد");
      }

      if (category.descriptionId) {
        await tx.textComponent.update({
          where: { id: category.descriptionId },
          data: { content: data.description || "" },
        });
      }

      let seoId = category.seoId;
      if (seoId) {
        await tx.seo.update({
          where: { id: seoId },
          data: {
            title: data.seoTitle,
            description: data.seoDescription,
          },
        });
      } else if (data.seoTitle || data.seoDescription) {
        const seo = await tx.seo.create({
          data: {
            title: data.seoTitle,
            description: data.seoDescription,
          },
        });
        seoId = seo.id;
      }

      await tx.category.update({
        where: { id },
        data: {
          title: data.title,
          slug: data.slug,
          parentId: data.parentId || null,
          imageId: data.imageId || null,
          seoId,
        },
      });
    });
    console.log("update category success");
    revalidatePath("/admin/categories");

    return {
      success: true,
      version: Date.now(),      // فیلدی همیشه متفاوت
      fields: {
        title: data.title,
        slug: data.slug,
      },
      errors: {},
    };
  } catch (error) {
    console.error("خطا هنگام ویرایش دسته:", error);
    return {
      success: false,
      errors: { error: ["خطایی هنگام ویرایش دسته‌بندی رخ داد."] },
      fields: {
        title: data.title,
        slug: data.slug,
      },
    };
  }
}

export async function getAllCategories() {
  return prisma.category.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function getCategoryById(id: string) {
  return prisma.category.findUnique({
    where: { id },
    include: {
      description: true,
      seo: true,
      image: true,
      parent: true,
    },
  });
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
