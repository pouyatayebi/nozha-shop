// "use client";

// import { Image } from "@prisma/client";
// import { useState } from "react";
// import { Button } from "@/components/ui/button";

// interface GalleryProps {
//   images: Image[];
//   onSelect: (selectedImages: { url: string }[]) => void;
// }

// export function Gallery({ images, onSelect }: GalleryProps) {
//   const [selected, setSelected] = useState<string[]>([]);

//   const toggleSelect = (url: string) => {
//     setSelected((prev) =>
//       prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url]
//     );
//   };

//   return (
//     <div className="space-y-4">
//       <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
//         {images.map((image) => (
//           <div
//             key={image.id}
//             className={`relative border rounded-lg overflow-hidden cursor-pointer ${
//               selected.includes(image.url) ? "ring-2 ring-blue-500" : ""
//             }`}
//             onClick={() => toggleSelect(image.url)}
//           >
//             <img
//               src={image.url}
//               alt="Gallery"
//               className="w-full h-24 object-cover"
//             />
//           </div>
//         ))}
//       </div>

//       <div className="flex justify-end">
//         <Button
//           onClick={() => onSelect(selected.map((url) => ({ url })))}
//           disabled={selected.length === 0}
//         >
//           انتخاب تصاویر
//         </Button>
//       </div>
//     </div>
//   );
// }

"use client";

import { Image } from "@prisma/client";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface GalleryProps {
  images: Image[];
  onSelect: (selectedImages: { url: string }[]) => void;
  multiple?: boolean; // گزینه اختیاری برای کنترل انتخاب تکی یا چندتایی
}

export function Gallery({ images, onSelect, multiple = true }: GalleryProps) {
  const [selected, setSelected] = useState<string[]>([]);

  const toggleSelect = (url: string) => {
    setSelected((prev) => {
      if (multiple) {
        return prev.includes(url)
          ? prev.filter((u) => u !== url)
          : [...prev, url];
      } else {
        return prev.includes(url) ? [] : [url];
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {images.map((image) => (
          <div
            key={image.id}
            className={`relative border rounded-lg overflow-hidden cursor-pointer ${
              selected.includes(image.url) ? "ring-2 ring-blue-500" : ""
            }`}
            onClick={() => toggleSelect(image.url)}
          >
            <img
              src={image.url}
              alt="Gallery"
              className="w-full h-24 object-cover"
            />
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <Button
          onClick={() => onSelect(selected.map((url) => ({ url })))}
          disabled={selected.length === 0}
        >
          انتخاب {multiple ? "تصاویر" : "تصویر"}
        </Button>
      </div>
    </div>
  );
}
