// components/forms/product-form.tsx
"use client";

import { useState, useEffect, useCallback, useActionState } from "react";
import { useForm, useFieldArray, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, X, Pencil } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

import {
  createProductAction,
  editProductAction,
  getAllProducts,
} from "@/actions/product.actions";
import { productSchema, ProductInput, VariantInput } from "@/zod-validations";
import { useProductStore } from "@/store/product.store";
import { useCategoryStore } from "@/store/category.store";
import { useImageStore } from "@/store/image.store";
import { slugify } from "@/helpers/slugify";
import { mapProductToForm } from "@/helpers/mapProductToForm";

import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
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
import ModalGallery from "@/components/gallery/modal-gallery";
import RichText from "@/components/forms/rich-text";

export default function ProductForm() {
  const { editing, setEditing, setProducts } = useProductStore();
  const { categories, fetchCategories } = useCategoryStore();
  const { images } = useImageStore();

  // fetch categories once
  useEffect(() => {
    if (categories.length === 0) fetchCategories();
  }, [categories.length, fetchCategories]);

  // accordion state
  const [open, setOpen] = useState<string>("");

  // initialize form
  const form = useForm<ProductInput>({
     resolver: zodResolver(productSchema) as Resolver<ProductInput>,
    defaultValues: mapProductToForm(editing),
    mode: "onTouched",
  });

  // variants array (for creation only; in edit you'll manage separately)
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "variants",
  });

  // choose action
  const actionFn = useCallback(
    editing ? editProductAction : createProductAction,
    [editing?.id]
  );
  const [state, formAction, isPending] = useActionState(actionFn, {
    success: false,
    version: 0,
  });

  // on edit: reset form & open
  useEffect(() => {
    if (editing) {
      form.reset(mapProductToForm(editing));
      setOpen("product-form");
    }
  }, [editing, form]);

  // after submit success
  useEffect(() => {
    if (state.success) {
      toast.success(editing ? "ویرایش محصول موفق" : "محصول ثبت شد");
      form.reset(mapProductToForm(null));
      setEditing(null);
      setOpen("");
      getAllProducts().then(setProducts);
    }
  }, [state.version, editing, form, setEditing, setProducts]);

  // watch for hidden inputs
  const variantsWatch = form.watch("variants");
  const tagsWatch = form.watch("tags");

  // add tag helper
  const addTag = (t: string) => {
    const trimmed = t.trim();
    if (!trimmed) return;
    const current = form.getValues("tags") || [];
    if (!current.includes(trimmed)) form.setValue("tags", [...current, trimmed]);
  };

  return (
    <Accordion
      type="single"
      collapsible
      value={open}
      onValueChange={setOpen}
      className="w-full"
    >
      <AccordionItem value="product-form">
        <AccordionTrigger>
          <span className="flex gap-2 items-center">
            {editing ? <Pencil size={18} /> : <Plus size={18} />}
            {editing ? "ویرایش محصول" : "افزودن محصول جدید"}
          </span>
        </AccordionTrigger>
        <AccordionContent>
          <FormFrame>
            <Form {...form}>
              <form action={formAction} className="space-y-6 p-6">
                {/* Row 1: title, slug, category, featured */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>دسته</FormLabel>
                        <FormControl>
                          <select
                            className="w-full border rounded p-2"
                            value={field.value || ""}
                            onChange={(e) =>
                              field.onChange(e.target.value || undefined)
                            }
                          >
                            <option value="">بدون دسته</option>
                            {categories.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.title}
                              </option>
                            ))}
                          </select>
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

                {/* Description */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>توضیحات</FormLabel>
                      <RichText value={field.value || ""} onChange={field.onChange} />
                      <input
                        type="hidden"
                        name="description"
                        value={field.value ?? ""}
                      />
                    </FormItem>
                  )}
                />

                {/* Variants (creation only) */}
                {!editing && (
                  <div className="space-y-4">
                    {fields.map((v, i) => (
                      <div
                        key={v.id}
                        className="grid gap-4 border p-4 rounded-md sm:grid-cols-2 lg:grid-cols-4"
                      >
                        <FormField
                          control={form.control}
                          name={`variants.${i}.title`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>نام واریانت</FormLabel>
                              <FormControl>
                                <FormInputShadcn {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`variants.${i}.price`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>قیمت</FormLabel>
                              <FormControl>
                                <FormInputShadcn
                                  {...field}
                                  type="number"
                                  step="0.01"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`variants.${i}.stock`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>موجودی</FormLabel>
                              <FormControl>
                                <FormInputShadcn {...field} type="number" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`variants.${i}.imageIds`}
                          render={({ field }) => {
                            const imgId = field.value[0];
                            const imgUrl = imgId
                              ? images.find((img) => img.id === imgId)?.url
                              : null;
                            return (
                              <FormItem className="lg:col-span-1">
                                <FormLabel>تصویر</FormLabel>
                                <FormControl>
                                  <div className="space-y-2">
                                    {imgUrl && (
                                      <div className="relative w-24 h-24 border rounded overflow-hidden">
                                        <Image
                                          src={imgUrl}
                                          alt=""
                                          width={96}
                                          height={96}
                                          className="object-cover w-full h-full"
                                        />
                                        <button
                                          type="button"
                                          onClick={() => field.onChange([])}
                                          className="absolute top-1 right-1 bg-white rounded-full text-red-500 w-5 h-5 text-[10px]"
                                        >
                                          ×
                                        </button>
                                      </div>
                                    )}
                                    <ModalGallery
                                      onSelect={(id) => field.onChange([id])}
                                    />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            );
                          }}
                        />

                        <div className="flex items-end justify-end lg:col-span-4">
                          {fields.length > 1 && (
                            <Button
                              type="button"
                              size="icon"
                              variant="destructive"
                              onClick={() => remove(i)}
                            >
                              <X size={16} />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        append({
                          title: "",
                          stock: 0,
                          price: 0,
                          imageIds: [],
                        } as VariantInput)
                      }
                    >
                      افزودن واریانت
                    </Button>
                  </div>
                )}

                {/* Tags */}
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

                {/* SEO */}
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="seo">
                    <AccordionTrigger className="text-muted-foreground">
                      اطلاعات سئو (اختیاری)
                    </AccordionTrigger>
                    <AccordionContent className="grid sm:grid-cols-2 gap-4 pt-4">
                      <FormField
                        control={form.control}
                        name="seoTitle"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>عنوان سئو</FormLabel>
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
                            <FormLabel>توضیح سئو</FormLabel>
                            <FormControl>
                              <FormInputShadcn {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                {/* Hidden inputs for FormData */}
                <input
                  type="hidden"
                  name="variants"
                  value={JSON.stringify(
                    variantsWatch.map((v) => ({
                      ...v,
                      stock: Number(v.stock),
                      price: Number(v.price),
                    }))
                  )}
                />
                <input
                  type="hidden"
                  name="tags"
                  value={JSON.stringify(tagsWatch)}
                />
                <input
                  type="hidden"
                  name="id"
                  value={editing?.id ?? ""}
                />

                <Button
                  disabled={isPending}
                  className="w-full lg:sticky lg:bottom-4"
                >
                  {isPending
                    ? editing
                      ? "در حال ویرایش..."
                      : "در حال ذخیره..."
                    : editing
                    ? "ذخیره تغییرات"
                    : "ثبت محصول"}
                </Button>
              </form>
            </Form>
          </FormFrame>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
