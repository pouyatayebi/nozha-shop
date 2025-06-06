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
// "use client";

// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { useImageStore } from "@/store/image.store";
// import { useEffect, useState, useCallback } from "react";
// import Image from "next/image";
// import { Button } from "@/components/ui/button";
// import { X } from "lucide-react";

// interface GalleryImage {
//   id: string;
//   url: string;
//   alt: string;
//   name?: string;
//   type?: string;
//   size?: number;
//   variantId?: string;
// }

// interface ModalGalleryProps {
//   selectedIds?: string[];
//   onSelect: (ids: string[]) => void;
//   multi?: boolean;
// }

// export default function ModalGallery({
//   selectedIds = [],
//   onSelect,
//   multi = false,
// }: ModalGalleryProps) {
//   const [open, setOpen] = useState(false);
//   const { images, setImages } = useImageStore();

//   // Local copy of currently highlighted image IDs.
//   const [localSelected, setLocalSelected] = useState<string[]>([]);

//   // Fetch gallery images once when component mounts
//   useEffect(() => {
//     (async () => {
//       const { getImages } = await import("@/actions/image.actions");
//       const result = await getImages();
//       if (Array.isArray(result)) {
//         // Map null fields to undefined or empty string
//         const sanitized: GalleryImage[] = result.map((img) => ({
//           id: img.id,
//           url: img.url,
//           alt: img.name ?? "",
//           name: img.name ?? undefined,
//           type: img.type ?? undefined,
//           size:
//             img.size !== null && img.size !== undefined
//               ? Number(img.size)
//               : undefined,
//           variantId: img.variantId ?? undefined,
//         }));
//         setImages(sanitized);
//       }
//     })();
//   }, [setImages]);

//   // Whenever `selectedIds` prop changes from above, reset our local state
//   useEffect(() => {
//     setLocalSelected(Array.isArray(selectedIds) ? [...selectedIds] : []);
//   }, [selectedIds]);

//   // Toggle one image in multi‐select mode; or pick & close in single mode
//   const handleImageClick = useCallback(
//     (id: string) => {
//       if (multi) {
//         setLocalSelected((prev) =>
//           prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
//         );
//       } else {
//         // Single‐select: immediately call onSelect and close
//         onSelect([id]);
//         setOpen(false);
//       }
//     },
//     [multi, onSelect]
//   );

//   // When dialog closes, if multi, push the final selection upward
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

//         <div className="grid grid-cols-3 gap-4 mt-4">
//           {images.map((img) => {
//             const isSelected = localSelected.includes(img.id);
//             return (
//               <div
//                 key={img.id}
//                 className={`relative cursor-pointer border rounded overflow-hidden hover:shadow transition ${
//                   isSelected ? "ring-2 ring-primary" : ""
//                 }`}
//                 onClick={() => handleImageClick(img.id)}
//               >
//                 <Image
//                   src={img.url}
//                   alt={img.alt}
//                   width={200}
//                   height={200}
//                   className="object-cover w-full h-32"
//                 />
//                 {isSelected && multi && (
//                   <button
//                     type="button"
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       // Remove from localSelected when “×” is clicked
//                       setLocalSelected((prev) =>
//                         prev.filter((x) => x !== img.id)
//                       );
//                     }}
//                     className="absolute top-1 right-1 bg-white rounded-full text-red-500 w-5 h-5 flex items-center justify-center text-[10px]"
//                   >
//                     <X size={12} />
//                   </button>
//                 )}
//               </div>
//             );
//           })}
//         </div>

//         {multi && (
//           <div className="mt-4 flex justify-end">
//             <Button onClick={handleDone}>تأیید ({localSelected.length})</Button>
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
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useImageStore } from "@/store/image.store";
import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface GalleryImage {
  id: string;
  url: string;
  alt: string;
  name?: string;
  type?: string;
  size?: number;
  variantId?: string;
}

interface ModalGalleryProps {
  selectedIds?: string[];
  onSelect: (ids: string[]) => void;
  multi?: boolean;
}

export default function ModalGallery({
  selectedIds = [],
  onSelect,
  multi = false,
}: ModalGalleryProps) {
  const [open, setOpen] = useState(false);
  const { images, setImages } = useImageStore();

  // Local copy of currently highlighted image IDs.
  const [localSelected, setLocalSelected] = useState<string[]>([]);

  // Fetch gallery images once when component mounts
  useEffect(() => {
    (async () => {
      const { getImages } = await import("@/actions/image.actions");
      const result = await getImages();
      if (Array.isArray(result)) {
        // Map null fields to undefined or empty string
        const sanitized: GalleryImage[] = result.map((img) => ({
          id: img.id,
          url: img.url,
          alt: img.name ?? "",
          name: img.name ?? undefined,
          type: img.type ?? undefined,
          size:
            img.size !== null && img.size !== undefined
              ? Number(img.size)
              : undefined,
          variantId: img.variantId ?? undefined,
        }));
        setImages(sanitized);
      }
    })();
  }, [setImages]);

  // Whenever `selectedIds` prop changes from above, reset our local state
  useEffect(() => {
    setLocalSelected(Array.isArray(selectedIds) ? [...selectedIds] : []);
  }, [selectedIds]);

  // Toggle one image in multi‐select mode; or pick & close in single mode
  const handleImageClick = useCallback(
    (id: string) => {
      if (multi) {
        setLocalSelected((prev) =>
          prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
      } else {
        // Single‐select: immediately call onSelect and close
        onSelect([id]);
        setOpen(false);
      }
    },
    [multi, onSelect]
  );

  // When dialog closes, if multi, push the final selection upward
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
          <DialogDescription id="gallery-desc">
            لطفاً تصویر(ها) را انتخاب کنید.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-4 mt-4">
          {images.map((img) => {
            const isSelected = localSelected.includes(img.id);
            return (
              <div
                key={img.id}
                className={`relative cursor-pointer border rounded overflow-hidden hover:shadow transition ${
                  isSelected ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => handleImageClick(img.id)}
              >
                <Image
                  src={img.url}
                  alt={img.alt}
                  width={200}
                  height={200}
                  className="object-cover w-full h-32"
                />
                {isSelected && multi && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Remove from localSelected when “×” is clicked
                      setLocalSelected((prev) =>
                        prev.filter((x) => x !== img.id)
                      );
                    }}
                    className="absolute top-1 right-1 bg-white rounded-full text-red-500 w-5 h-5 flex items-center justify-center text-[10px]"
                    aria-label="حذف تصویر انتخاب شده"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {multi && (
          <div className="mt-4 flex justify-end">
            <Button onClick={handleDone}>تأیید ({localSelected.length})</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
