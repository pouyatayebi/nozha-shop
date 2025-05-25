"use server";

import prisma from "@/lib/prisma";
import { FormState } from "@/types/form";
import { productSchema } from "@/zod-validations/product/schema";
import { revalidatePath } from "next/cache";

export async function createProductAction(
  prevState: FormState,
  payload: FormData
): Promise<FormState> {
  const formData = Object.fromEntries(payload);
  const parsed = productSchema.safeParse(formData);

  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors;
    const fields: Record<string, string> = {};
    for (const key of Object.keys(formData)) {
      fields[key] = formData[key].toString();
    }
    return { success: false, fields, errors };
  }

  const { title, slug, description, categoryId, isFeatured } = parsed.data;

  try {
    await prisma.product.create({
      data: {
        title,
        slug,
        description,
        categoryId,
        isFeatured: !!isFeatured,
      },
    });
  } catch (error) {
    return { success: false, errors: { error: ["خطا در ثبت محصول"] } };
  }

  revalidatePath("/admin/products");
  return { success: true };
}

export async function updateProduct(id: string, data: Partial<{ title: string; slug: string; description?: string; categoryId: string; isFeatured?: boolean; }>) {
  await prisma.product.update({
    where: { id },
    data: {
      ...data,
      updatedAt: new Date(),
    },
  });
  revalidatePath("/admin/products");
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findUnique({ where: { slug } });
}

export async function getAllProducts() {
  return prisma.product.findMany({ orderBy: { createdAt: "desc" } });
}

export async function deleteProduct(id: string) {
  await prisma.product.delete({ where: { id } });
  revalidatePath("/admin/products");
}