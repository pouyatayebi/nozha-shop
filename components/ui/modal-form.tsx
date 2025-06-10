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
import { ScrollArea } from "./scroll-area";

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
      <DialogContent  className="w-full sm:max-w-xl lg:max-w-2xl xl:max-w-7xl p-0">
        <DialogHeader >
          <DialogTitle  className="flex justify-between items-center p-2 bg-white border-b border-gray-200 text-center">
            <span>{title}</span>
            <DialogClose asChild>
              <button className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </DialogClose>
          </DialogTitle>
        </DialogHeader>
        <div dir="rtl" className="mt-4">
          <ScrollArea dir="rtl" className="h-[70vh] p-4">{children}</ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
