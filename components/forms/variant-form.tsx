// components/forms/variant-form.tsx
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
import { variantSchema, VariantInput } from "@/zod-validations";
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
import ImagePreview from "@/components/gallery/image-preview";
import { FormState } from "@/types/form";

export default function VariantForm() {
  const { variantEditing, setVariantEditing, setProducts } = useProductStore();
  const { images } = useImageStore();

  if (!variantEditing) return null;
  const { productId, variant } = variantEditing;

  const defaultValues: VariantInput = {
    title: variant?.title ?? "",
    price: variant?.price ?? 0,
    stock: variant?.stock ?? 0,
    imageIds: variant?.imageIds ?? [],
  };

  const form = useForm<VariantInput>({
    resolver: zodResolver(variantSchema) as Resolver<VariantInput>,
    defaultValues,
    mode: "onTouched",
  });

  const actionFn = useCallback(
    (_prev: FormState, fd: FormData) =>
      variant
        ? editVariantAction(_prev, fd)
        : createVariantAction(_prev, fd),
    [variant]
  );

  const [state, formAction, isPending] = useActionState(actionFn, {
    success: false,
    version: 0,
  });

  useEffect(() => {
    if (!state.success) return;
    toast.success(variant ? "ویرایش واریانت موفق" : "واریانت اضافه شد");
    setVariantEditing(null);
    getAllProducts().then(setProducts);
  }, [state.version, variant, setVariantEditing, setProducts]);

  const watchedImageIds: string[] = form.watch("imageIds") ?? [];

  const removeImageId = (idToRemove: string) => {
    form.setValue(
      "imageIds",
      watchedImageIds.filter((id) => id !== idToRemove)
    );
  };

  return (
    <Form {...form}>
      <form action={formAction} className="space-y-4">
        {/* نام واریانت */}
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

        {/* قیمت */}
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

        {/* موجودی */}
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

        {/* تصاویر (انتخاب چندگانه) */}
        <FormField
          control={form.control}
          name="imageIds"
          render={({ field }) => (
            <FormItem>
              <FormLabel>تصاویر</FormLabel>
              <FormControl>
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {watchedImageIds.map((imgId) => (
                      <ImagePreview
                        key={imgId}
                        ids={[imgId]}
                        onRemove={() => removeImageId(imgId)}
                        size={80}
                      />
                    ))}
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

        {/* فیلدهای مخفی */}
        <input type="hidden" name="productId" value={productId} />
        {variant && <input type="hidden" name="id" value={variant.id} />}
        <input
          type="hidden"
          name="imageIds"
          value={JSON.stringify(watchedImageIds)}
        />

        {/* دکمه‌های عمل */}
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
