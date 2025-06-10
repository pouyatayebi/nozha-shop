// app/admin/gallery/page.tsx
import ModalImageForm from "@/components/forms/modal-image-form";
import GalleryGrid from "@/components/gallery/gallery-grid";
import { getImagesAction } from "@/actions/image.actions";
import type { GalleryImage } from "@/store/image.store";

export default async function GalleryPage() {
  // Server‐side fetch of your gallery images
  const images: GalleryImage[] = await getImagesAction();

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">مدیریت گالری تصاویر</h1>
      </div>

      {/* دکمه و فرم مودال برای افزودن تصویر جدید */}
      <ModalImageForm />

      {/* شبکه نمایش تصاویر با پرکردن props */}
      <GalleryGrid hasDelete hasEdit />
    </div>
  );
}
// This page serves as the main gallery management interface