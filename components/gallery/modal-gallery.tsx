// "use client";

// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import Image from "next/image";
// import { useEffect, useState, useCallback } from "react";
// import { useImageStore } from "@/store/image.store";

// interface ModalGalleryProps {
//   selectedIds?: string[];
//   onSelect: (ids: string[]) => void;
//   multi?: boolean; // پیش‌فرض false
// }

// function arraysEqual(a: string[], b: string[]) {
//   return a.length === b.length && a.every((v, i) => v === b[i]);
// }

// export default function ModalGallery({
//   selectedIds,
//   onSelect,
//   multi = false,
// }: ModalGalleryProps) {
//   const [open, setOpen] = useState(false);
//   const [localSelected, setLocalSelected] = useState<string[]>(
//     selectedIds ? [...selectedIds] : []
//   );

//   const { images, setImages } = useImageStore();

//   /* واکشی تصاویر یک بار */
//   useEffect(() => {
//     (async () => {
//       const { getImages } = await import("@/actions/image.actions");
//       const result = await getImages();
//       if (Array.isArray(result)) setImages(result);
//     })();
//   }, [setImages]);

//   /* همگام‌سازی prop → state */
//   useEffect(() => {
//     if (!selectedIds) return;
//     setLocalSelected((p) =>
//       arraysEqual(p, selectedIds) ? p : [...selectedIds]
//     );
//   }, [selectedIds]);

//   const toggleSelect = useCallback(
//     (id: string) => {
//       if (multi) {
//         setLocalSelected((prev) =>
//           prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
//         );
//       } else {
//         onSelect([id]);
//         setOpen(false);
//       }
//     },
//     [multi, onSelect]
//   );

//   const handleDone = () => {
//     onSelect(localSelected);
//     setOpen(false);
//   };

//   return (
//     <Dialog open={open} onOpenChange={setOpen}>
//       <DialogTrigger asChild>
//         <Button variant="outline">
//           {multi ? "انتخاب چند تصویر" : "انتخاب از گالری"}
//         </Button>
//       </DialogTrigger>

//       <DialogContent className="max-w-4xl">
//         <DialogHeader>
//           <DialogTitle>گالری تصاویر</DialogTitle>
//         </DialogHeader>

//         <div className="mt-4 grid grid-cols-3 gap-4">
//           {images.map((img) => {
//             const isSelected = localSelected.includes(img.id);
//             return (
//               <div
//                 key={img.id}
//                 onClick={() => toggleSelect(img.id)}
//                 className={`relative cursor-pointer overflow-hidden rounded border transition hover:shadow ${
//                   isSelected ? "ring-2 ring-primary" : ""
//                 }`}
//               >
//                 <Image
//                   src={img.url}
//                   alt={img.alt ?? ""}
//                   width={200}
//                   height={200}
//                   className="h-32 w-full object-cover"
//                 />
//               </div>
//             );
//           })}
//         </div>

//         {multi && (
//           <div className="mt-4 flex justify-end">
//             <Button onClick={handleDone}>
//               تأیید ({localSelected.length})
//             </Button>
//           </div>
//         )}
//       </DialogContent>
//     </Dialog>
//   );
// }
// components/gallery/modal-gallery.tsx
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useEffect, useState, useCallback } from "react";
import { useImageStore } from "@/store/image.store";

interface ModalGalleryProps {
  selectedIds?: string[];
  onSelect: (ids: string[]) => void;
  multi?: boolean; // پیش‌فرض false
}

function arraysEqual(a: string[], b: string[]) {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

export default function ModalGallery({
  selectedIds,
  onSelect,
  multi = false,
}: ModalGalleryProps) {
  const [open, setOpen] = useState(false);
  const [localSelected, setLocalSelected] = useState<string[]>(
    selectedIds ? [...selectedIds] : []
  );

  const { images, setImages } = useImageStore();

  /* واکشی تصاویر یک بار از سرور */
  useEffect(() => {
    (async () => {
      try {
        const { getImages } = await import("@/actions/image.actions");
        const result = await getImages();
        if (Array.isArray(result)) {
          // Map to store’s GalleryImage shape
          const sanitized = result.map((img) => ({
            id: img.id,
            url: img.url,
            alt: img.alt ?? "",
            name: img.name ?? undefined,
            type: img.type ?? undefined,
            size: img.size ?? undefined,
            // Note: getImages() does not return variantId; omit it here
          }));
          setImages(sanitized);
        }
      } catch (err) {
        console.error("Error loading images:", err);
      }
    })();
  }, [setImages]);

  /* همگام‌سازی prop → state */
  useEffect(() => {
    if (!selectedIds) return;
    setLocalSelected((p) =>
      arraysEqual(p, selectedIds) ? p : [...selectedIds]
    );
  }, [selectedIds]);

  const toggleSelect = useCallback(
    (id: string) => {
      if (multi) {
        setLocalSelected((prev) =>
          prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
      } else {
        onSelect([id]);
        setOpen(false);
      }
    },
    [multi, onSelect]
  );

  const handleDone = () => {
    onSelect(localSelected);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          {multi ? "انتخاب چند تصویر" : "انتخاب از گالری"}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-4xl" aria-describedby="gallery-desc">
        <DialogHeader>
          <DialogTitle>گالری تصاویر</DialogTitle>
        </DialogHeader>

        <div className="mt-4 grid grid-cols-3 gap-4">
          {images.map((img) => {
            const isSelected = localSelected.includes(img.id);
            return (
              <div
                key={img.id}
                onClick={() => toggleSelect(img.id)}
                className={`relative cursor-pointer overflow-hidden rounded border transition hover:shadow ${
                  isSelected ? "ring-2 ring-primary" : ""
                }`}
              >
                <Image
                  src={img.url}
                  alt={img.alt}
                  width={200}
                  height={200}
                  className="h-32 w-full object-cover"
                />
                {isSelected && multi && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setLocalSelected((prev) =>
                        prev.filter((x) => x !== img.id)
                      );
                    }}
                    className="absolute top-1 right-1 bg-white rounded-full text-red-500 w-5 h-5 flex items-center justify-center text-[10px]"
                    aria-label="حذف تصویر انتخاب شده"
                  >
                    ×
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {multi && (
          <div className="mt-4 flex justify-end">
            <Button onClick={handleDone}>
              تأیید ({localSelected.length})
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
