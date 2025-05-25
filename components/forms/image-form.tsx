"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useActionState, useRef, useEffect, useState } from "react";
import { createImageAction, getImagesAction } from "@/actions/image.actions";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { FormFrame } from "@/components/forms/form-frame";
import { FormInputShadcn } from "@/components/forms/form-input-shadcn";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { Plus } from "lucide-react";
import { ImageInput, imageSchema } from "@/zod-validations";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { getImages } from "@/actions/image.actions";
import { useImageStore } from "@/store/image.store";


export function ImageForm({
  editMode = false,
  defaultValues,
}: {
  editMode?: boolean;
  defaultValues?: Partial<ImageInput>;
}) {
  const [formState, formAction, isPending] = useActionState(createImageAction, {
    success: false,
  });

  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
    // حالت باز/بسته آکاردئون
  const [open, setOpen] = useState<string>(""); // "" = بسته
  const setImages = useImageStore.getState().setImages;

  const form = useForm<ImageInput & { file?: File }>({
    resolver: zodResolver(imageSchema),
    defaultValues: {
      alt: defaultValues?.alt || "",
      file: undefined,
    },
    mode: "onTouched",
  });

  const addImage = useImageStore((state) => state.addImage);
  const [preview, setPreview] = useState<string | null>(null);

useEffect(() => {
  if (formState.success && !editMode) {
    form.reset({ alt: "", file: undefined });
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    toast.success("تصویر با موفقیت آپلود شد");

    getImages().then((data) => {
      if (Array.isArray(data)) {
        const sanitized = data.map((img) => ({
          ...img,
          name: img.name ?? undefined,
          type: img.type ?? undefined,
          size: img.size ? Number(img.size) : undefined,
        }));
        setImages(sanitized);
      }
    });

    setOpen(""); // بستن آکاردئون بعد از موفقیت
  }
}, [formState.success, form, editMode]);



  return (
    <Accordion type="single" collapsible className="w-full" value={open} onValueChange={setOpen}>
      <AccordionItem value="image-form">
        <AccordionTrigger>
          <span className="flex items-center gap-2">
            <Plus size={18} /> افزودن تصویر جدید
          </span>
        </AccordionTrigger>
        <AccordionContent>
          <FormFrame>
            <Form {...form}>
              <form
                ref={formRef}
                action={formAction}
                className="space-y-6 rounded-xl bg-white shadow-md p-6 border border-gray-200"
              >
                <FormField
                  control={form.control}
                  name="alt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-medium text-sm">
                        توضیح تصویر (alt)
                      </FormLabel>
                      <FormControl>
                        <FormInputShadcn
                          placeholder="مثلاً: بنر صفحه اصلی"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {!editMode && (
                  <FormField
                    control={form.control}
                    name="file"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-medium text-sm">
                          انتخاب تصویر
                        </FormLabel>
                        <FormControl>
                          <div className="flex flex-col gap-3">
                            <Input
                              type="file"
                              accept="image/*"
                              name="file"
                              ref={(e) => {
                                fileInputRef.current = e;
                                field.ref(e);
                              }}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                field.onChange(file);
                                setPreview(URL.createObjectURL(file));
                              }}
                              className="hidden"
                            />

                            {preview && (
                              <div className="relative mt-2 w-32 h-32 border rounded-lg overflow-hidden group">
                                <Image
                                  src={preview}
                                  alt="پیش‌نمایش تصویر"
                                  className="object-cover w-full h-full"
                                  width={128}
                                  height={128}
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    setPreview(null);
                                    if (fileInputRef.current) {
                                      fileInputRef.current.value = "";
                                    }
                                    field.onChange(undefined);
                                  }}
                                  className="absolute top-1 right-1 bg-white bg-opacity-90 rounded-full w-6 h-6 flex items-center justify-center text-sm text-red-500 hover:bg-opacity-100"
                                  aria-label="حذف تصویر"
                                >
                                  ×
                                </button>
                              </div>
                            )}

                            <Button
                              type="button"
                              variant="outline"
                              className="w-full text-sm"
                              onClick={() => fileInputRef.current?.click()}
                            >
                              {field.value
                                ? field.value.name
                                : "انتخاب فایل..."}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <Button disabled={isPending} className="w-full mt-4">
                  {isPending
                    ? "در حال ذخیره..."
                    : editMode
                    ? "ویرایش تصویر"
                    : "آپلود تصویر"}
                </Button>
              </form>
            </Form>
          </FormFrame>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
