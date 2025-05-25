"use client"
import Image from "next/image";
import { GalleryImage } from "@/store/image.store";

interface ImageCardProps {
  image: GalleryImage;
  onDelete?: (id: string) => void;
  onEditAlt?: (id: string, alt: string) => void;
}

export function ImageCard({ image, onDelete, onEditAlt }: ImageCardProps) {
  return (
    <div className="relative group border rounded-lg overflow-hidden">
      <Image
        src={image.url}
        alt={image.alt || ""}
        width={300}
        height={300}
        className="object-cover w-full h-48"
      />
      <div className="absolute inset-0 bg-black bg-opacity-30 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between text-white p-2">
        <div className="text-sm text-center">{image.alt}</div>
        <div className="flex justify-center gap-2">
          {onEditAlt && (
            <button
              onClick={() => {
                const newAlt = prompt("توضیح جدید:", image.alt);
                if (newAlt !== null) onEditAlt(image.id, newAlt);
              }}
              className="bg-white bg-opacity-80 text-black text-xs px-2 py-1 rounded hover:bg-opacity-100"
            >
              ویرایش
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(image.id)}
              className="bg-red-600 text-white text-xs px-2 py-1 rounded hover:bg-red-700"
            >
              حذف
            </button>
          )}
        </div>
      </div>
    </div>
  );
}