"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useActionState,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  createCategoryAction,
  editCategoryAction,
  getAllCategories,
} from "@/actions/category.actions";
import { categorySchema, CategoryInput } from "@/zod-validations";
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
import { FormInputShadcn } from "@/components/forms/form-input-shadcn";
import { FormFrame } from "@/components/forms/form-frame";
import { Plus } from "lucide-react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCategoryStore } from "@/store/category.store";
import ModalGallery from "@/components/gallery/modal-gallery";
import { useImageStore } from "@/store/image.store";
import Image from "next/image";

import { mapCategoryToForm } from "@/helpers/mapCategoryToForm";
import RichText from "./rich-text";

export default function CategoryForm() {
  const { editing, setEditing, setCategories } = useCategoryStore();
  const { images } = useImageStore();

  // حالت باز/بسته آکاردئون
  const [open, setOpen] = useState<string>(""); // "" = بسته
  const [formKey, setFormKey] = useState(0);

  // فرم
  const form = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: mapCategoryToForm(editing),
    mode: "onTouched",
  });

  // اکشن متناسب با حالت
  const actionFn = useCallback(
    editing ? editCategoryAction : createCategoryAction,
    [editing?.id] // ← تغییرِ id باعث تغییر تابع و ریست هُک می‌شود
  );

  const [formState, formAction, isPending] = useActionState(actionFn, {
    success: false,
    version: 0,
  });

  // ① وقتی editing تغییر کند، فرم را با مقادیرش ریست و آکاردئون را باز کن
  useEffect(() => {
    if (editing) {
      form.reset(mapCategoryToForm(editing));
      setOpen("category-form");
    }
  }, [editing]);

  // پس از موفقیت
  // --- پس از موفقیت ---
  useEffect(() => {
    if (formState.success) {
      toast.success(editing ? "ویرایش شد" : "ثبت شد");
      form.reset(); // مقادیر خالی
      setEditing(null);
      setOpen(""); // بستن
      setFormKey((k) => k + 1); // فورس ری‌مونت فرم
      getAllCategories().then(setCategories);
    }
  }, [formState.version]); // نسخه هنوز لازم است
  return (
    <Accordion
      type="single"
      collapsible
      className="w-full"
      value={open}
      onValueChange={setOpen}
    >
      <AccordionItem value="category-form">
        <AccordionTrigger>
          <span className="flex gap-2 items-center">
            <Plus size={18} />
            {editing ? "ویرایش دسته‌بندی" : "افزودن دسته‌بندی جدید"}
          </span>
        </AccordionTrigger>

        <AccordionContent>
          <FormFrame>
            <Form {...form} key={formKey}>
              <form
                action={formAction}
                className="space-y-6 rounded-xl bg-white shadow p-6 border"
              >
                {/* ردیف ۱: عنوان، اسلاگ، دسته مادر و تصویر*/}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {/* title / slug / parent/image */}

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

                  <FormField
                    control={form.control}
                    name="parentId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>دسته مادر</FormLabel>
                        <FormControl>
                          <div>
                            <Select
                              value={field.value ?? "none"}
                              onValueChange={(val) =>
                                field.onChange(val === "none" ? undefined : val)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="بدون دسته" />
                              </SelectTrigger>
                              <SelectContent>
                                {/* گزینهٔ پیش‌فرض */}
                                <SelectItem value="none">بدون دسته</SelectItem>

                                {/* گزینه‌های واقعی از استور */}
                                {useCategoryStore
                                  .getState()
                                  .categories.map((c) => (
                                    <SelectItem key={c.id} value={c.id}>
                                      {c.title}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>

                            {/* هیدن برای ارسال به اکشن */}
                            <input
                              type="hidden"
                              name="parentId"
                              value={field.value ?? ""}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="imageId"
                    render={({ field }) => {
                      const imgUrl =
                        field.value &&
                        images.find((img) => img.id === field.value)?.url;

                      return (
                        <FormItem>
                          <FormLabel>تصویر دسته‌بندی</FormLabel>
                          <FormControl>
                            <div className="space-y-2">
                              {imgUrl && (
                                <div className="relative w-32 h-32 border rounded overflow-hidden group">
                                  <Image
                                    src={imgUrl}
                                    alt="پیش‌نمایش"
                                    width={128}
                                    height={128}
                                    className="object-cover w-full h-full"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => field.onChange(undefined)}
                                    className="absolute top-1 right-1 bg-white rounded-full w-6 h-6 flex items-center justify-center text-sm text-red-500"
                                    aria-label="حذف"
                                  >
                                    ×
                                  </button>
                                </div>
                              )}

                              <ModalGallery
                                onSelect={(id) => field.onChange(id)}
                              />
                              <input
                                type="hidden"
                                name="imageId"
                                value={field.value || ""}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                </div>

                {/* توضیحات */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="lg:col-span-3">
                      <FormLabel>توضیحات</FormLabel>
                      <FormControl>
                        <div>
                          <RichText
                            value={field.value || ""}
                            onChange={field.onChange}
                          />
                          <input
                            type="hidden"
                            name="description"
                            value={field.value || ""}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* ========= اطلاعات سئو (اختیاری) ========= */}
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
                            <FormMessage />
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
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* آی‌دی برای ویرایش */}
                      <input
                        type="hidden"
                        name="id"
                        value={editing?.id || ""}
                      />
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                <Button
                  disabled={isPending}
                  className="w-full lg:sticky lg:bottom-4 lg:left-0 lg:right-0"
                >
                  {isPending
                    ? editing
                      ? "در حال ویرایش..."
                      : "در حال ذخیره..."
                    : editing
                    ? "ذخیره تغییرات"
                    : "ثبت دسته‌بندی"}
                </Button>
              </form>
            </Form>
          </FormFrame>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
