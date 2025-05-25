"use server";

import { revalidatePath } from "next/cache";

import prisma from "@/lib/prisma";
import { FormState } from "@/types/form";
import { utapi } from "@/lib/uploadthing";
import { GalleryImage, useImageStore } from "@/store/image.store"
import { imageSchema } from "@/zod-validations";

export async function createImageAction(
  prevState: FormState,
  payload: FormData
): Promise<FormState> {

  if (!(payload instanceof FormData)) {
    return {
      success: false,
      errors: { error: ["Invalid Form Data"] },
    };
  }
  const formData = Object.fromEntries(payload);
  const parsed = imageSchema.safeParse(formData);

  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors;
    const fields: Record<string, string> = {};

    for (const key of Object.keys(formData)) {
      fields[key] = formData[key].toString();
    }

    return {
      success: false,
      fields,
      errors,
    };
  }
  const { data } = parsed;
  console.log("Parsed Data:", data);
  if (!data.alt) {
    return { success: false, errors: { error: ["مقدار alt را وارد کنید"] } };
  }

  if (!data.file) {
    return { success: false, errors: { error: ["فایل را آپلود کنید"] } };
  }

  const { alt, file } = data;



  console.log("alt", alt);
  console.log("file", file);


  try {
    const uploadRes = await utapi.uploadFiles([file]);
    const uploaded = uploadRes.find(
      (res) => res && !res.error && typeof res.data?.ufsUrl === "string"
    );

    if (!uploaded || !uploaded.data?.ufsUrl) {
      return {
        success: false,
        errors: {
          file: ["آپلود فایل با خطا مواجه شد."],
        },
        fields: {
          alt: String(alt),
        },
      };
    }

    await prisma.image.create({
      data: {
        alt: String(alt),
        url: uploaded.data.url,
        name: file.name,
        type: file.type,
        size: file.size,
      },
    });

    revalidatePath("/admin/gallery");

    return {
      success: true,
      fields: {
        alt: String(alt),
      },
      errors: {},
    };
  } catch (error) {
    console.error("خطا هنگام ذخیره تصویر:", error);
    return {
      success: false,
      errors: {
        file: ["مشکلی هنگام آپلود یا ذخیره تصویر پیش آمد."],
      },
      fields: {
        alt: alt ? String(alt) : "",
      },
    };
  }
}
export async function deleteImageAction(id: string): Promise<FormState> {
  try {
    const image = await prisma.image.findUnique({
      where: { id },
    });

    if (!image) {
      return {
        success: false,
        errors: { error: ["تصویر یافت نشد."] },
      };
    }

    if (image.name) {
      await utapi.deleteFiles([image.name]);
    } else {
      console.warn("نام فایل تصویر برای حذف موجود نیست، حذف فقط دیتابیس انجام می‌شود.");
    }

    await prisma.image.delete({
      where: { id },
    });

    revalidatePath("/admin/gallery");

    return { success: true };
  } catch (error) {
    console.error(
      "خطا هنگام حذف تصویر:",
      error instanceof Error ? error.message : error
    );
    return {
      success: false,
      errors: { error: ["مشکلی هنگام حذف تصویر پیش آمد."] },
    };
  }
}
export async function updateImageAltAction(
  id: string,
  alt: string
): Promise<FormState> {
  try {
    const image = await prisma.image.findUnique({
      where: { id },
    });

    if (!image) {
      return {
        success: false,
        errors: {
          error: ["تصویر یافت نشد."],
        },
      };
    }

    await prisma.image.update({
      where: { id },
      data: { alt },
    });

    revalidatePath("/admin/gallery");

    return {
      success: true,
    };
  } catch (error) {
    console.error("خطا هنگام ویرایش تصویر:", error);
    return {
      success: false,
      errors: {
        error: ["مشکلی هنگام ویرایش تصویر پیش آمد."],
      },
    };
  }
}


export async function getImages() {
  return prisma.image.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function getImagesAction(limit = 20, cursor?: string): Promise<GalleryImage[]> {
  const images = await prisma.image.findMany({
    take: limit,
    skip: cursor ? 1 : 0,
    cursor: cursor ? { id: cursor } : undefined,
    orderBy: { createdAt: "desc" },
  });

  return images.map((img) => ({
    id: img.id,
    alt: img.alt,
    url: img.url,
    name: img.name ?? "",
    type: img.type ?? "",
    size: img.size ?? 0,
  }));
}
