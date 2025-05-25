
"use client"

import Image from "next/image";

export function ImagePreview({ imageId }: { imageId: string }) {
  // فرض کنیم که لینک تصویر را با imageId به‌دست می‌آوریم
  const imageUrl = `/uploads/${imageId}.jpg`;
  return (
    <div className="w-32 h-32 relative">
      <Image src={imageUrl} alt="Image" layout="fill" objectFit="cover" />
    </div>
  );
}
