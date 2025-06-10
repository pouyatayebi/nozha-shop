// components/gallery/image-card.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, X, ZoomIn, ZoomOut } from "lucide-react";
import { toast } from "sonner";

import { useImageStore } from "@/store/image.store";
import type { GalleryImage } from "@/store/image.store";
import ConfirmDelete from "@/components/ui/confirm-delete";
import ImageAltForm from "@/components/forms/image-alt-form";
import {
  deleteImageAction,
  updateImageAltAction,
} from "@/actions/image.actions";

interface ImageCardProps {
  image: GalleryImage;
  hasEdit?: boolean;
  hasDelete?: boolean;
}

export default function ImageCard({
  image,
  hasEdit = false,
  hasDelete = false,
}: ImageCardProps) {
  const removeImage = useImageStore((s) => s.removeImage);
  const updateImageAlt = useImageStore((s) => s.updateImageAlt);

  const [open, setOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [busy, setBusy] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  // Delete handler
  const onDelete = async () => {
    setBusy(true);
    const res = await deleteImageAction(image.id);
    setBusy(false);

    if (res.success) {
      removeImage(image.id);
      toast.success("تصویر حذف شد");
      setOpen(false);
    } else {
      toast.error(res.errors?.error?.[0] || "خطا در حذف تصویر");
    }
  };

  const zoomIn = () => setZoom((z) => Math.min(z + 0.25, 3));
  const zoomOut = () => setZoom((z) => Math.max(z - 0.25, 0.5));

  return (
    <>
      {/* Thumbnail */}
      <div className="relative w-full aspect-square rounded border overflow-hidden">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <div className="group w-full h-full cursor-pointer">
              <Image
                src={image.url}
                alt={image.alt}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition" />
            </div>
          </DialogTrigger>

          <DialogContent
            className="bg-white rounded-lg shadow-lg w-[90vw] sm:w-[80vw] md:w-[70vw] lg:w-[60vw] xl:w-[50vw] max-w-none p-4"
            aria-describedby="lightbox-dialog"
          >
            <DialogHeader className="flex justify-between items-center p-0">
              <DialogTitle className="text-lg font-medium">
                پیش‌نمایش تصویر
              </DialogTitle>
              <DialogClose asChild>
                <Button variant="ghost" size="icon" aria-label="بستن">
                  <X size={16} />
                </Button>
              </DialogClose>
            </DialogHeader>

            {/* Zoom controls */}
            <div className="mt-2 flex justify-center gap-2">
              <Button
                size="icon"
                variant="outline"
                onClick={zoomOut}
                title="Zoom Out"
                disabled={zoom <= 0.5}
              >
                <ZoomOut size={16} />
              </Button>
              <span className="flex items-center text-sm">
                {Math.round(zoom * 100)}%
              </span>
              <Button
                size="icon"
                variant="outline"
                onClick={zoomIn}
                title="Zoom In"
                disabled={zoom >= 3}
              >
                <ZoomIn size={16} />
              </Button>
            </div>

            {/* Large image */}
            <div className="mt-4 overflow-auto">
              <div
                className="mx-auto w-fit origin-center transition-transform"
                style={{ transform: `scale(${zoom})` }}
              >
                <Image
                  src={image.url}
                  alt={image.alt}
                  width={800}
                  height={800}
                  className="object-contain"
                />
              </div>
            </div>

            {/* Caption */}
            <p className="mt-2 text-center text-sm text-gray-600">
              {image.alt}
            </p>

            {/* Edit/Delete buttons */}
            {(hasEdit || hasDelete) && (
              <div className="mt-4 flex justify-center gap-2">
                {hasEdit && (
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => setEditOpen(true)}
                    disabled={busy}
                    title="ویرایش alt"
                  >
                    <Pencil size={16} />
                  </Button>
                )}
                {hasDelete && (
                  <ConfirmDelete
                    title="حذف تصویر"
                    confirmText="آیا از حذف این تصویر اطمینان دارید؟"
                    onConfirm={onDelete}
                  />
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* ALT‐Edit ModalForm */}
      <ImageAltForm
        imageId={image.id}
        currentAlt={image.alt}
        open={editOpen}
        onClose={() => setEditOpen(false)}
      />
    </>
  );
}
