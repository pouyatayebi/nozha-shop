"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useActionState, useEffect, useRef, useState } from "react";
import { createProductAction } from "@/actions/product.actions";
import { productSchema, ProductInput } from "@/zod-validations/";
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
import { useProductStore } from "@/store/product.store";
import { Plus } from "lucide-react";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";

export function ProductForm({ editMode = false, defaultValues }: {
  editMode?: boolean;
  defaultValues?: Partial<ProductInput> & { id?: string };
}) {
  const [formState, formAction, isPending] = useActionState(createProductAction, {
    success: false,
  });

  const formRef = useRef<HTMLFormElement>(null);
  const form = useForm<ProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: defaultValues?.title || "",
      slug: defaultValues?.slug || "",
      description: defaultValues?.description || "",
      categoryId: defaultValues?.categoryId || "",
      isFeatured: defaultValues?.isFeatured || false,
    },
    mode: "onTouched",
  });

  const addProduct = useProductStore((state) => state.setProducts);

  useEffect(() => {
    if (formState.success && !editMode) {
      toast.success("محصول با موفقیت افزوده شد");
      form.reset();
    }
  }, [formState.success, form, editMode]);

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="product-form">
        <AccordionTrigger className="[&>svg]:hidden">
          <span className="flex items-center gap-2">
            <Plus size={18} /> افزودن محصول جدید
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
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>عنوان محصول</FormLabel>
                      <FormControl>
                        <FormInputShadcn placeholder="عنوان..." {...field} />
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
                      <FormLabel>نامک (slug)</FormLabel>
                      <FormControl>
                        <FormInputShadcn placeholder="slug-product" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>توضیحات</FormLabel>
                      <FormControl>
                        <Input placeholder="توضیح مختصر" {...field} />
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
                      <FormLabel>شناسه دسته‌بندی</FormLabel>
                      <FormControl>
                        <Input placeholder="category-id" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isFeatured"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ویژه باشد؟</FormLabel>
                      <FormControl>
                        <input type="checkbox" checked={field.value} onChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <Button disabled={isPending} className="w-full">
                  {isPending ? "در حال ذخیره..." : editMode ? "ویرایش محصول" : "ثبت محصول"}
                </Button>
              </form>
            </Form>
          </FormFrame>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}