"use client";

import { ReactNode } from "react";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export interface ConfirmDeleteProps {
  /** عنوان پنجرهٔ تأیید (عنوان دیالوگ) */
  title: ReactNode;
  /** متن توضیحی زیر عنوان (اختیاری) */
  confirmText?: ReactNode;
  /** تابع اجراشونده پس از تأیید حذف */
  onConfirm: () => void | Promise<void>;
}

export default function ConfirmDelete({
  title,
  confirmText,
  onConfirm,
}: ConfirmDeleteProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          size="icon"
          variant="destructive"
          title={typeof title === "string" ? title : undefined}
        >
          <Trash2 size={16} />
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent >
        <AlertDialogHeader>
          <AlertDialogTitle className="text-right">{title}</AlertDialogTitle>
          {confirmText && (
            <AlertDialogDescription className="text-right">{confirmText}</AlertDialogDescription>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>انصراف</AlertDialogCancel>
          <AlertDialogAction className="bg-destructive hover:bg-red-800" onClick={onConfirm}>حذف</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
