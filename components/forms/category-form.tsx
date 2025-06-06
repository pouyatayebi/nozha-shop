// components/forms/category-form.tsx
"use client";

import {
  useEffect,
  useCallback,
  useMemo,
  startTransition,
  useActionState,
} from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import {
  createCategoryAction,
  editCategoryAction,
  getAllCategories,
} from "@/actions/category.actions";
import { categorySchema, type CategoryInput } from "@/zod-validations";
import { mapCategoryToForm } from "@/helpers/mapCategoryToForm";

import { useCategoryStore } from "@/store/category.store";
import { useImageStore } from "@/store/image.store";
import ParentCategorySelect from "@/components/forms/parent-category-select";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { FormFrame } from "@/components/forms/form-frame";
import ModalGallery from "@/components/gallery/modal-gallery";
import ImagePreview from "@/components/gallery/image-preview";
import RichText from "@/components/forms/rich-text";
import { FormInputShadcn } from "./form-input-shadcn";

interface CategoryFormProps {
  onClose: () => void;
}

export default function CategoryForm({ onClose }: CategoryFormProps) {
  /* Zustand */
  const editing = useCategoryStore((s) => s.editing);
  const setEditing = useCategoryStore((s) => s.setEditing);
  const categories = useCategoryStore((s) => s.categories);
  const setCategories = useCategoryStore((s) => s.setCategories);
  const { images } = useImageStore();

  /* React Hook Form */
  const defaultValues = useMemo<CategoryInput>(
    () => mapCategoryToForm(editing),
    [editing]
  );
  const form = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
    defaultValues,
    mode: "onTouched",
  });

  /* action states */
  const [createState, createAction, createPending] = useActionState(
    createCategoryAction,
    { success: false, version: 0 }
  );
  const [editState, editAction, editPending] = useActionState(
    editCategoryAction,
    { success: false, version: 0 }
  );

  const formAction  = editing ? editAction   : createAction;
  const actionState = editing ? editState    : createState;
  const isPending   = editing ? editPending  : createPending;

  /* وقتی editing تغییر کند فرم را ریست کن */
  useEffect(() => {
    if (!editing) {
      form.reset(mapCategoryToForm(null));
    } else {
      form.reset(mapCategoryToForm(editing));
    }
  }, [editing?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  /* پس از ثبت موفق */
  useEffect(() => {
    if (!actionState.success) return;

    toast.success(editing ? "ویرایش شد" : "ثبت شد");
    setEditing(null);
    onClose();

    startTransition(() => {
      getAllCategories().then(setCategories);
    });
  }, [actionState.version]); // eslint-disable-line react-hooks/exhaustive-deps

  /* گزینه‌های دستهٔ مادر */
  const parentOptions = useMemo(
    () =>
      categories
        .filter((c) => c.id !== editing?.id)
        .map((c) => (
          <SelectItem key={c.id} value={c.id}>
            {c.title}
          </SelectItem>
        )),
    [categories, editing?.id]
  );

  return (
    <FormFrame>
      <Form {...form}>
        <form
          action={formAction}
          className="space-y-6 rounded-xl border bg-white p-6 shadow"
        >
          {editing && (
            <input type="hidden" name="id" value={editing.id} />
          )}

          {/* ردیف ۱: عنوان و اسلاگ */}
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
                    <FormInputShadcn {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* ردیف ۲: دستهٔ مادر و تصویر */}
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="parentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>دستهٔ مادر</FormLabel>
                  <FormControl>
                    <ParentCategorySelect
                      categories={categories}
                      value={field.value}
                      onChange={field.onChange}
                      excludeId={editing?.id}
                    />
                  </FormControl>
                  <FormMessage />
                  <input
                    type="hidden"
                    name="parentId"
                    value={field.value ?? ""}
                  />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="imageId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>تصویر دسته‌بندی</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      <ImagePreview
                        ids={field.value ? [field.value] : []}
                        onRemove={() => field.onChange("")}
                        size={80}
                      />
                      <ModalGallery
                        selectedIds={field.value ? [field.value] : undefined}
                        onSelect={(ids) => field.onChange(ids[0])}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                  <input
                    type="hidden"
                    name="imageId"
                    value={field.value ?? ""}
                  />
                </FormItem>
              )}
            />
          </div>

          {/* توضیحات (پهنای کامل) */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>توضیحات</FormLabel>
                <FormControl>
                  <RichText
                    value={field.value || ""}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
                <input
                  type="hidden"
                  name="description"
                  value={field.value ?? ""}
                />
              </FormItem>
            )}
          />

          {/* ردیف ۳: عنوان سئو و توضیح سئو */}
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="seoTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>عنوان سئو (اختیاری)</FormLabel>
                  <FormControl>
                    <FormInputShadcn {...field} />
                  </FormControl>
                  <FormMessage />
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
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* دکمه‌های ثبت و لغو */}
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
                ? "ذخیرهٔ تغییرات"
                : "ثبت دسته‌بندی"}
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
