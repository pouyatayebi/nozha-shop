"use client";

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

interface ConfirmDeleteProps {
  onConfirm: () => void;
  children?: React.ReactNode; // آیکون یا متن روی دکمه
}

export default function ConfirmDelete({
  onConfirm,
  children,
}: ConfirmDeleteProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size="icon" variant="destructive" title="حذف">
          {children ?? <Trash2 size={16} />}
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent className="text-right">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-right">حذف رکورد</AlertDialogTitle>
          <AlertDialogDescription className="text-right">
            آیا مطمئن هستید که می‌خواهید این آیتم را حذف کنید؟ این عمل غیرقابل
            برگشت است.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>انصراف</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={onConfirm}
          >
            حذف
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
