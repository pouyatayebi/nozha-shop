"use client";

import { useEffect } from "react";
import { useImageStore } from "@/store/image.store";
import { ImageCard } from "@/components/gallery/image-card";
import { deleteImageAction, updateImageAltAction } from "@/actions/image.actions";
import { GalleryImage } from "@/store/image.store";

interface ImageGridProps {
  initialImages?: GalleryImage[];
}

export function ImageGrid({ initialImages = [] }: ImageGridProps) {
  const images = useImageStore((state) => state.images);
  const setImages = useImageStore((state) => state.setImages);
  const removeImage = useImageStore((state) => state.removeImage);
  const updateAlt = useImageStore((state) => state.updateImageAlt);

  useEffect(() => {
    if (images.length === 0 && initialImages.length > 0) {
      setImages(initialImages);
    }
  }, [images.length, initialImages, setImages]);

  const handleDelete = async (id: string) => {
    await deleteImageAction(id);
    removeImage(id);
  };

  const handleEditAlt = async (id: string, newAlt: string) => {
    await updateImageAltAction(id, newAlt);
    updateAlt(id, newAlt);
  };

  if (!images || images.length === 0) {
    return <p className="text-center text-muted-foreground">هیچ تصویری موجود نیست.</p>;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {images.map((img) => (
        <ImageCard
          key={img.id}
          image={img}
          onDelete={handleDelete}
          onEditAlt={handleEditAlt}
        />
      ))}
    </div>
  );
}