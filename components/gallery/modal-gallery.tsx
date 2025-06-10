// components/gallery/modal-gallery.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useImageStore } from "@/store/image.store";
import type { GalleryImage } from "@/store/image.store";
import { getImagesAction } from "@/actions/image.actions";

interface ModalGalleryProps {
  /** IDs currently selected (single or multi) */
  selectedIds?: string[];
  /** Called when the user confirms selection */
  onSelect: (ids: string[]) => void;
  /** Allow selecting multiple images */
  multi?: boolean;
}

/** shallow array equality */
function arraysEqual(a: string[], b: string[]) {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

export default function ModalGallery({
  selectedIds = [],
  onSelect,
  multi = false,
}: ModalGalleryProps) {
  const [open, setOpen] = useState(false);
  const [localSelected, setLocalSelected] = useState<string[]>(
    selectedIds
  );
  const images = useImageStore((s) => s.images);
  const setImages = useImageStore((s) => s.setImages);

  // sync incoming prop → local
  useEffect(() => {
    setLocalSelected((prev) =>
      arraysEqual(prev, selectedIds) ? prev : [...selectedIds]
    );
  }, [selectedIds]);

  // fetch images on mount
  useEffect(() => {
    getImagesAction().then((imgs) => {
      setImages(imgs);
    });
  }, [setImages]);

  // toggle selection
  const toggle = useCallback(
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

  // confirm multi‐select
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

      <DialogContent className="max-w-4xl p-4">
        <DialogHeader>
          <DialogTitle>گالری تصاویر</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-4">
          {images.map((img: GalleryImage) => {
            const isSel = localSelected.includes(img.id);
            return (
              <div
                key={img.id}
                onClick={() => toggle(img.id)}
                className={`relative cursor-pointer rounded overflow-hidden border ${
                  isSel ? "ring-2 ring-primary" : "hover:shadow-lg"
                }`}
              >
                <Image
                  src={img.url}
                  alt={img.alt}
                  width={200}
                  height={200}
                  className="object-cover w-full h-32"
                />
                {isSel && (
                  <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center text-white text-xl">
                    ✓
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {multi && (
          <div className="mt-4 text-right">
            <Button onClick={handleDone}>تأیید ({localSelected.length})</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
