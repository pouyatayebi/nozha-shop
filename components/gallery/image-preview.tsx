// "use client";

// import Image from "next/image";
// import { X } from "lucide-react";
// import { useImageStore } from "@/store/image.store";

// interface ImagePreviewProps {
//   /** لیست idهای تصاویری که باید نمایش داده شوند */
//   ids: string[];
//   /** تابع حذف تک تصویر */
//   onRemove: (id: string) => void;
//   /** ضلع thumbnail (px) – پیش‌فرض 64 */
//   size?: number;
//   /** اگر true باشد، دور تصویر حلقهٔ رنگی گذاشته می‌شود */
//   highlight?: boolean;
// }

// export default function ImagePreview({
//   ids,
//   onRemove,
//   size = 64,
//   highlight = false,
// }: ImagePreviewProps) {
//   const { images } = useImageStore();

//   if (!ids.length) return null;

//   return (
//     <div className="flex flex-wrap gap-3">
//       {ids.map((id) => {
//         const img = images.find((i) => i.id === id);
//         if (!img) return null;

//         return (
//           <div
//             key={id}
//             style={{ width: size, height: size }}
//             className={`relative overflow-hidden rounded border ${
//               highlight ? "ring-2 ring-primary" : ""
//             }`}
//           >
//             <Image
//               src={img.url}
//               alt={img.alt ?? ""}
//               fill
//               sizes={`${size}px`}
//               className="object-cover"
//             />
//             <button
//               type="button"
//               aria-label="حذف"
//               onClick={() => onRemove(id)}
//               className="absolute right-0 top-0 flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] text-red-500 shadow"
//             >
//               ×
//             </button>
//           </div>
//         );
//       })}
//     </div>
//   );
// }
// components/gallery/image-preview.tsx
"use client";

import * as React from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { useImageStore } from "@/store/image.store";

interface ImagePreviewProps {
  /** لیستی از شناسه‌های تصاویر (UUID) که باید پیش‌نمایش شوند */
  ids: string[];
  /** وقتی ضربدر زده شد، این تابع فراخوانی می‌شود */
  onRemove: () => void;
  /** اندازهٔ (عرض و ارتفاع) هر Thumbnail به پیکسل */
  size: number;
}

export default function ImagePreview({ ids, onRemove, size }: ImagePreviewProps) {
  const { images } = useImageStore();

  if (!Array.isArray(ids) || ids.length === 0) {
    return null;
  }

  // فقط اولین تصویر را پیش‌نمایش می‌دهیم (برای دسته‌بندی تک‌تصویری)
  const id = ids[0];
  const img = images.find((i) => i.id === id);

  if (!img) {
    return null;
  }

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <Image
        src={img.url}
        alt={img.alt || ""}
        width={size}
        height={size}
        className="object-cover w-full h-full rounded border"
      />
      <button
        type="button"
        onClick={onRemove}
        className="absolute top-1 right-1 bg-white rounded-full w-6 h-6 flex items-center justify-center text-sm text-red-500 shadow"
        aria-label="حذف تصویر"
      >
        <X size={12} />
      </button>
    </div>
  );
}
