
"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Gallery } from "./gallery";

export function ModalImageForm({
  open,
  onOpenChange,
  onSelectImage,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectImage: (id: string) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>انتخاب تصویر</DialogTitle>
        </DialogHeader>
        <Gallery onSelect={onSelectImage} />
      </DialogContent>
    </Dialog>
  );
}
