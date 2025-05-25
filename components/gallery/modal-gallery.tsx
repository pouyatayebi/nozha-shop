"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useImageStore } from "@/store/image.store";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function ModalGallery({
  selectedId,
  onSelect,
}: {
  selectedId?: string;
  onSelect: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const { images, setImages } = useImageStore();

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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">انتخاب از گالری</Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>انتخاب تصویر</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-3 gap-4">
          {images.map((img) => (
            <div
              key={img.id}
              className={`cursor-pointer border rounded overflow-hidden hover:shadow transition ${
                selectedId === img.id ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => {
                onSelect(img.id);
                setOpen(false);
              }}
            >
              <Image
                src={img.url}
                alt={img.alt}
                width={200}
                height={200}
                className="object-cover w-full h-32"
              />
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
