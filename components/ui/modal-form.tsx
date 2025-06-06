// components/ui/modal-form.tsx
"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { X } from "lucide-react";

interface ModalFormProps {
  /** عنوان مودال */
  title: string;
  /** آیا مودال باز باشد یا بسته */
  open: boolean;
  /** تابع برای بستن مودال */
  onOpenChange: (open: boolean) => void;
  /** محتوای فرم داخل پنجرهٔ مودال */
  children: React.ReactNode;
}

export function ModalForm({
  title,
  open,
  onOpenChange,
  children,
}: ModalFormProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="lg:max-w-lg w-full">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <span>{title}</span>
            <DialogClose asChild>
              <button className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </DialogClose>
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4">{children}</div>
      </DialogContent>
    </Dialog>
  );
}
