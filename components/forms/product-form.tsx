// components/forms/product-form.tsx
"use client";

import {
  useEffect,
  useCallback,
  useMemo,
  startTransition,
  useActionState,
} from "react";
import { useForm } from "react-hook-form";
import type { Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import {
  createProductAction,
  editProductAction,
  getAllProducts,
} from "@/actions/product.actions";
import { productSchema, type ProductInput } from "@/zod-validations";
import { useProductStore } from "@/store/product.store";
import { useCategoryStore } from "@/store/category.store";
import ParentCategorySelect from "@/components/forms/parent-category-select";
import { slugify } from "@/helpers/slugify";
import { mapProductToForm } from "@/helpers/mapProductToForm";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { FormInputShadcn } from "@/components/forms/form-input-shadcn";
import { FormFrame } from "@/components/forms/form-frame";
import RichText from "@/components/forms/rich-text";

interface ProductFormProps {
  onClose: () => void;
}

export default function ProductForm({ onClose }: ProductFormProps) {
  /* ---------- Zustand stores ---------- */
  const editing = useProductStore((s) => s.editing);
  const setEditing = useProductStore((s) => s.setEditing);
  const setProducts = useProductStore((s) => s.setProducts);
  const { categories, fetchCategories } = useCategoryStore();

  /* ---------- React Hook Form ---------- */
  const defaultValues = useMemo<ProductInput>(
    () => mapProductToForm(editing),
    [editing]
  );
  const form = useForm<ProductInput>({
    resolver: zodResolver(productSchema) as Resolver<ProductInput>,
    defaultValues,
    mode: "onTouched",
  });

  /* ---------- separate action states ---------- */
  const [createState, createAction, createPending] = useActionState(
    createProductAction,
    { success: false, version: 0 }
  );
  const [editState, editAction, editPending] = useActionState(
    editProductAction,
    { success: false, version: 0 }
  );

  const formAction  = editing ? editAction   : createAction;
  const actionState = editing ? editState    : createState;
  const isPending   = editing ? editPending  : createPending;

  /* ---------- when switching into edit mode ---------- */
  useEffect(() => {
    if (editing) {
      form.reset(mapProductToForm(editing));
    } else {
      form.reset(mapProductToForm(null));
    }
  }, [editing?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ---------- after successful submit ---------- */
  useEffect(() => {
    if (!actionState.success) return;

    toast.success(editing ? "ویرایش محصول موفق" : "محصول ثبت شد");
    setEditing(null);
    onClose();

    startTransition(() => {
      getAllProducts().then(setProducts);
    });
  }, [actionState.version]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ---------- fetch categories once ---------- */
  useEffect(() => {
    if (categories.length === 0) {
      fetchCategories();
    }
  }, [categories.length, fetchCategories]);

  /* ---------- watch tags for hidden input ---------- */
  const tagsWatch = form.watch("tags");

  /* ---------- helper for adding a new tag ---------- */
  const addTag = useCallback(
    (t: string) => {
      const trimmed = t.trim();
      if (!trimmed) return;
      const current = form.getValues("tags") || [];
      if (!current.includes(trimmed)) {
        form.setValue("tags", [...current, trimmed]);
      }
    },
    [form]
  );

  return (
    <FormFrame>
      <Form {...form}>
        <form action={formAction} className="space-y-6 p-6">
          {/* برای حالت ویرایش، id مخفی لازم است */}
          {editing && (
            <input type="hidden" name="id" value={editing.id} />
          )}

          {/* ردیف اول: عنوان و اسلاگ */}
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>عنوان</FormLabel>
                  <FormControl>
                    <FormInputShadcn {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>اسلاگ</FormLabel>
                  <FormControl>
                    <FormInputShadcn
                      {...field}
                      onBlur={(e) => field.onChange(slugify(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* ردیف دوم: دسته و محصول ویژه */}
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>دسته</FormLabel>
                  <FormControl>
                    <ParentCategorySelect
                      categories={categories}
                      value={field.value ?? null}
                      onChange={field.onChange}
                      excludeId={undefined}
                    />
                  </FormControl>
                  <input
                    type="hidden"
                    name="categoryId"
                    value={field.value ?? ""}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isFeatured"
              render={({ field }) => (
                <FormItem className="flex items-end">
                  <FormControl>
                    <label className="flex gap-2 items-center">
                      <input
                        type="checkbox"
                        checked={field.value ?? false}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                      محصول ویژه
                    </label>
                  </FormControl>
                  <input
                    type="hidden"
                    name="isFeatured"
                    value={field.value ? "true" : "false"}
                  />
                </FormItem>
              )}
            />
          </div>

          {/* توضیحات */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>توضیحات</FormLabel>
                <RichText
                  value={field.value || ""}
                  onChange={field.onChange}
                />
                <input
                  type="hidden"
                  name="description"
                  value={field.value ?? ""}
                />
              </FormItem>
            )}
          />

          {/* تگ‌ها */}
          <FormField
            control={form.control}
            name="tags"
            render={({ field }) => (
              <FormItem>
                <FormLabel>تگ‌ها</FormLabel>
                <FormControl>
                  <div className="space-y-2">
                    <FormInputShadcn
                      placeholder="تگ جدید و Enter"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addTag((e.target as HTMLInputElement).value);
                          (e.target as HTMLInputElement).value = "";
                        }
                      }}
                    />
                    <div className="flex gap-1 flex-wrap">
                      {(field.value || []).map((t, idx) => (
                        <span
                          key={idx}
                          className="bg-muted px-2 py-0.5 rounded text-sm"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* اطلاعات سئو */}

            <FormField
              control={form.control}
              name="seoTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>عنوان سئو (اختیاری)</FormLabel>
                  <FormControl>
                    <FormInputShadcn {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="seoDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>توضیح سئو (اختیاری)</FormLabel>
                  <FormControl>
                    <FormInputShadcn {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
  

          {/* ورودی مخفی برای تگ‌ها */}
          <input
            type="hidden"
            name="tags"
            value={JSON.stringify(tagsWatch)}
          />

          {/* ورودی مخفی برای شناسهٔ محصول */}
          <input
            type="hidden"
            name="id"
            value={editing?.id ?? ""}
          />

          {/* دکمه‌های ذخیره / لغو */}
          <div className="flex gap-3">
            <Button
              disabled={isPending}
              className="flex-1"
              aria-busy={isPending}
            >
              {isPending
                ? editing
                  ? "در حال ویرایش..."
                  : "در حال ذخیره..."
                : editing
                ? "ذخیره تغییرات"
                : "ثبت محصول"}
            </Button>
            {editing && (
              <Button
                type="button"
                variant="outline"
                className="w-28"
                disabled={isPending}
                onClick={() => {
                  setEditing(null);
                  form.reset();
                  onClose();
                }}
              >
                لغو
              </Button>
            )}
          </div>
        </form>
      </Form>
    </FormFrame>
  );
}
