import { getImages } from "@/actions/image.actions";
import { ImageGrid } from "@/components/gallery/image-grid";
import { ImageForm } from "@/components/forms/image-form";
import { GalleryImage } from "@/store/image.store";

export default async function GalleryPage() {
  const result = await getImages();

  const images: GalleryImage[] = Array.isArray(result)
    ? result.map((img) => ({
        ...img,
        name: img.name ?? undefined,
        type: img.type ?? undefined,
        size: img.size ? Number(img.size) : undefined,
      }))
    : [];

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-lg font-semibold">گالری تصاویر</h1>
      <ImageForm />
      <ImageGrid initialImages={images} />
    </div>
  );
}