// components/forms/image-alt-form.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { ModalForm } from "@/components/ui/modal-form";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";

import { updateImageAltAction } from "@/actions/image.actions";
import { useImageStore } from "@/store/image.store";

const altSchema = z.object({
  alt: z.string().min(1, "متن alt نمی‌تواند خالی باشد"),
});

type AltFormValues = z.infer<typeof altSchema>;

interface ImageAltFormProps {
  imageId: string;
  currentAlt: string;
  open: boolean;
  onClose: () => void;
}

export default function ImageAltForm({
  imageId,
  currentAlt,
  open,
  onClose,
}: ImageAltFormProps) {
  const updateImageAlt = useImageStore((s) => s.updateImageAlt);

  const defaultValues = useMemo<AltFormValues>(
    () => ({ alt: currentAlt }),
    [currentAlt]
  );
  const form = useForm<AltFormValues>({
    resolver: zodResolver(altSchema),
    defaultValues,
    mode: "onTouched",
  });

  const [busy, setBusy] = useState(false);

  // reset form when image changes
  useEffect(() => {
    form.reset(defaultValues);
  }, [defaultValues, form]);

  const onSubmit = async (data: AltFormValues) => {
    setBusy(true);
    const res = await updateImageAltAction(imageId, data.alt.trim());
    setBusy(false);

    if (res.success) {
      updateImageAlt(imageId, data.alt.trim());
      toast.success("متن alt با موفقیت ویرایش شد");
      onClose();
    } else {
      toast.error(res.errors?.error?.[0] || "خطا در ویرایش alt");
    }
  };

  return (
    <ModalForm
      title="ویرایش توضیح تصویر"
      open={open}
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <FormField
            control={form.control}
            name="alt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>متن alt</FormLabel>
                <FormControl>
                  <input
                    {...field}
                    className="w-full border rounded p-2"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={busy}
            >
              لغو
            </Button>
            <Button type="submit" disabled={busy}>
              {busy ? "در حال ذخیره..." : "ذخیره"}
            </Button>
          </div>
        </form>
      </Form>
    </ModalForm>
  );
}
