// "use client";

// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
// import { useImageStore } from "@/store/image.store";
// import { useEffect, useState } from "react";
// import Image from "next/image";
// import { Button } from "@/components/ui/button";

// export default function ModalGallery({
//   selectedId,
//   onSelect,
// }: {
//   selectedId?: string;
//   onSelect: (id: string) => void;
// }) {
//   const [open, setOpen] = useState(false);
//   const { images, setImages } = useImageStore();

//   useEffect(() => {
//     import("@/actions/image.actions").then(async ({ getImages }) => {
//       const result = await getImages();
//       if (Array.isArray(result)) {
//         const sanitized = result.map((img) => ({
//           ...img,
//           name: img.name ?? undefined,
//           type: img.type ?? undefined,
//           size: img.size ? Number(img.size) : undefined,
//         }));
//         setImages(sanitized);
//       }
//     });
//   }, [setImages]);

//   return (
//     <Dialog open={open} onOpenChange={setOpen}>
//       <DialogTrigger asChild>
//         <Button variant="outline">انتخاب از گالری</Button>
//       </DialogTrigger>
//       <DialogContent className="max-w-3xl">
//         <DialogHeader>
//           <DialogTitle>انتخاب تصویر</DialogTitle>
//         </DialogHeader>
//         <div className="grid grid-cols-3 gap-4">
//           {images.map((img) => (
//             <div
//               key={img.id}
//               className={`cursor-pointer border rounded overflow-hidden hover:shadow transition ${
//                 selectedId === img.id ? "ring-2 ring-primary" : ""
//               }`}
//               onClick={() => {
//                 onSelect(img.id);
//                 setOpen(false);
//               }}
//             >
//               <Image
//                 src={img.url}
//                 alt={img.alt}
//                 width={200}
//                 height={200}
//                 className="object-cover w-full h-32"
//               />
//             </div>
//           ))}
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }

// components/gallery/modal-gallery.tsx
"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useImageStore } from "@/store/image.store";
import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface ModalGalleryProps {
  /** In single‐select mode, `selectedIds` should be a single‐element array or undefined. */
  selectedIds?: string[];
  /** Called whenever selection changes. In single mode, `onSelect([id])` closes immediately. In multi mode, it's called on “Done.” */
  onSelect: (ids: string[]) => void;
  /** If true, allow selecting multiple images; otherwise only one at a time. */
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
    import("@/actions/image.actions").then(async ({ getImages }) => {
      const result = await getImages();
      if (Array.isArray(result)) {
        const sanitized = result.map((img) => ({
          ...img,
          name: img.name ?? undefined,
          type: img.type ?? undefined,
          size: img.size ? Number(img.size) : undefined,
        }));
        setImages(sanitized);
      }
    });
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
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>گالری تصاویر</DialogTitle>
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
                  alt={img.alt ?? ""}
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

