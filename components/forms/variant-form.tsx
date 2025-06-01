"use client";

import { useEffect, useCallback, useActionState } from "react";
import { useForm, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import {
  createVariantAction,
  editVariantAction,
  getAllProducts,
} from "@/actions/product.actions";
import { variantSchema, VariantInput } from "@/zod-validations/";
import { useProductStore } from "@/store/product.store";
import { useImageStore } from "@/store/image.store";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import ModalGallery from "@/components/gallery/modal-gallery";
import Image from "next/image";
import { X } from "lucide-react";
import { FormState } from "@/types/form";

export default function VariantForm() {
  const { variantEditing, setVariantEditing, setProducts } = useProductStore();
  const { images } = useImageStore();

  // If there is no active variantEditing state, render nothing:
  if (!variantEditing) return null;

  const { productId, variant } = variantEditing;

  // Map existing edit‐state or defaults into defaultValues:
  const defaultValues: VariantInput = {
    title: variant?.title ?? "",
    price: variant?.price ?? 0,
    stock: variant?.stock ?? 0,
    imageIds: variant?.imageIds ?? [],
  };

  // Initialize react-hook-form
  const form = useForm<VariantInput>({
    resolver: zodResolver(variantSchema) as Resolver<VariantInput>,
    defaultValues,
    mode: "onTouched",
  });

  // Choose create vs edit action:
  const actionFn = useCallback(
    (_prev:FormState, fd: FormData) =>
      variant
        ? editVariantAction(_prev, fd)
        : createVariantAction(_prev, fd),
    [variant]
  );

  const [state, formAction, isPending] = useActionState(actionFn, {
    success: false,
    version: 0,
  });

  // After successful create or edit:
  useEffect(() => {
    if (state.success) {
      toast.success(
        variant ? "ویرایش واریانت موفق" : "واریانت اضافه شد"
      );
      setVariantEditing(null);
      getAllProducts().then(setProducts);
    }
  }, [state.version, variant, setVariantEditing, setProducts]);

  // Watch the selected image IDs array
  const watchedImageIds: string[] = form.watch("imageIds") ?? [];

  // Helper to remove a single image ID from the array:
  const removeImageId = (idToRemove: string) => {
    const updated = watchedImageIds.filter((id) => id !== idToRemove);
    form.setValue("imageIds", updated);
  };

  return (
    <Form {...form}>
      <form action={formAction} className="space-y-4">
        {/* ————— Title ————— */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>نام واریانت</FormLabel>
              <FormControl>
                <input
                  {...field}
                  className="w-full border rounded p-2"
                  placeholder="مثلاً رنگ آبی"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* ————— Price ————— */}
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>قیمت</FormLabel>
              <FormControl>
                <input
                  {...field}
                  type="number"
                  step="0.01"
                  className="w-full border rounded p-2"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* ————— Stock ————— */}
        <FormField
          control={form.control}
          name="stock"
          render={({ field }) => (
            <FormItem>
              <FormLabel>موجودی</FormLabel>
              <FormControl>
                <input
                  {...field}
                  type="number"
                  className="w-full border rounded p-2"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* ————— Images (multi-select) ————— */}
        <FormField
          control={form.control}
          name="imageIds"
          render={({ field }) => (
            <FormItem>
              <FormLabel>تصاویر</FormLabel>
              <FormControl>
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {watchedImageIds.map((imgId) => {
                      const url = images.find((im) => im.id === imgId)?.url;
                      return (
                        <div
                          key={imgId}
                          className="relative w-20 h-20 border rounded overflow-hidden"
                        >
                          {url && (
                            <Image
                              src={url}
                              alt="تصویر واریانت"
                              width={80}
                              height={80}
                              className="object-cover w-full h-full"
                            />
                          )}
                          {/* Red × button at top‐right */}
                          <button
                            type="button"
                            onClick={() => removeImageId(imgId)}
                            className="absolute top-0 right-0 bg-white rounded-full text-red-500 w-5 h-5 flex items-center justify-center text-[10px]"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  <ModalGallery
                    selectedIds={watchedImageIds}
                    onSelect={(newIds) => field.onChange(newIds)}
                    multi={true}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* ————— Hidden fields ————— */}
        <input type="hidden" name="productId" value={productId} />
        {variant && <input type="hidden" name="id" value={variant.id} />}

        {/* We still need to send the selected IDs as JSON */}
        <input
          type="hidden"
          name="imageIds"
          value={JSON.stringify(watchedImageIds)}
        />

        {/* ————— Action Buttons ————— */}
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            type="button"
            onClick={() => setVariantEditing(null)}
          >
            انصراف
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending
              ? variant
                ? "در حال ویرایش..."
                : "در حال افزودن..."
              : variant
              ? "ذخیره تغییرات"
              : "ثبت واریانت"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
