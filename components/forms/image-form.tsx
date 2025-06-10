// "use client";

// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useActionState, useRef, useEffect, useState } from "react";
// import { createImageAction, getImagesAction } from "@/actions/image.actions";
// import { toast } from "sonner";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import { Button } from "@/components/ui/button";
// import { FormFrame } from "@/components/forms/form-frame";
// import { FormInputShadcn } from "@/components/forms/form-input-shadcn";

// import { cn } from "@/lib/utils";
// import { Input } from "@/components/ui/input";
// import Image from "next/image";
// import { Plus } from "lucide-react";
// import { ImageInput, imageSchema } from "@/zod-validations";
// import {
//   Accordion,
//   AccordionContent,
//   AccordionItem,
//   AccordionTrigger,
// } from "@/components/ui/accordion";
// import { getImages } from "@/actions/image.actions";
// import { useImageStore } from "@/store/image.store";


// export function ImageForm({
//   editMode = false,
//   defaultValues,
// }: {
//   editMode?: boolean;
//   defaultValues?: Partial<ImageInput>;
// }) {
//   const [formState, formAction, isPending] = useActionState(createImageAction, {
//     success: false,
//   });

//   const formRef = useRef<HTMLFormElement>(null);
//   const fileInputRef = useRef<HTMLInputElement>(null);
//     // حالت باز/بسته آکاردئون
//   const [open, setOpen] = useState<string>(""); // "" = بسته
//   const setImages = useImageStore.getState().setImages;

//   const form = useForm<ImageInput & { file?: File }>({
//     resolver: zodResolver(imageSchema),
//     defaultValues: {
//       alt: defaultValues?.alt || "",
//       file: undefined,
//     },
//     mode: "onTouched",
//   });

//   const addImage = useImageStore((state) => state.addImage);
//   const [preview, setPreview] = useState<string | null>(null);

// useEffect(() => {
//   if (formState.success && !editMode) {
//     form.reset({ alt: "", file: undefined });
//     setPreview(null);
//     if (fileInputRef.current) fileInputRef.current.value = "";
//     toast.success("تصویر با موفقیت آپلود شد");

//     getImages().then((data) => {
//       if (Array.isArray(data)) {
//         const sanitized = data.map((img) => ({
//           ...img,
//           name: img.name ?? undefined,
//           type: img.type ?? undefined,
//           size: img.size ? Number(img.size) : undefined,
//         }));
//         setImages(sanitized);
//       }
//     });

//     setOpen(""); // بستن آکاردئون بعد از موفقیت
//   }
// }, [formState.success, form, editMode]);



//   return (
//     <Accordion type="single" collapsible className="w-full" value={open} onValueChange={setOpen}>
//       <AccordionItem value="image-form">
//         <AccordionTrigger>
//           <span className="flex items-center gap-2">
//             <Plus size={18} /> افزودن تصویر جدید
//           </span>
//         </AccordionTrigger>
//         <AccordionContent>
//           <FormFrame>
//             <Form {...form}>
//               <form
//                 ref={formRef}
//                 action={formAction}
//                 className="space-y-6 rounded-xl bg-white shadow-md p-6 border border-gray-200"
//               >
//                 <FormField
//                   control={form.control}
//                   name="alt"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel className="font-medium text-sm">
//                         توضیح تصویر (alt)
//                       </FormLabel>
//                       <FormControl>
//                         <FormInputShadcn
//                           placeholder="مثلاً: بنر صفحه اصلی"
//                           {...field}
//                         />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />

//                 {!editMode && (
//                   <FormField
//                     control={form.control}
//                     name="file"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel className="font-medium text-sm">
//                           انتخاب تصویر
//                         </FormLabel>
//                         <FormControl>
//                           <div className="flex flex-col gap-3">
//                             <Input
//                               type="file"
//                               accept="image/*"
//                               name="file"
//                               ref={(e) => {
//                                 fileInputRef.current = e;
//                                 field.ref(e);
//                               }}
//                               onChange={(e) => {
//                                 const file = e.target.files?.[0];
//                                 if (!file) return;
//                                 field.onChange(file);
//                                 setPreview(URL.createObjectURL(file));
//                               }}
//                               className="hidden"
//                             />

//                             {preview && (
//                               <div className="relative mt-2 w-32 h-32 border rounded-lg overflow-hidden group">
//                                 <Image
//                                   src={preview}
//                                   alt="پیش‌نمایش تصویر"
//                                   className="object-cover w-full h-full"
//                                   width={128}
//                                   height={128}
//                                 />
//                                 <button
//                                   type="button"
//                                   onClick={() => {
//                                     setPreview(null);
//                                     if (fileInputRef.current) {
//                                       fileInputRef.current.value = "";
//                                     }
//                                     field.onChange(undefined);
//                                   }}
//                                   className="absolute top-1 right-1 bg-white bg-opacity-90 rounded-full w-6 h-6 flex items-center justify-center text-sm text-red-500 hover:bg-opacity-100"
//                                   aria-label="حذف تصویر"
//                                 >
//                                   ×
//                                 </button>
//                               </div>
//                             )}

//                             <Button
//                               type="button"
//                               variant="outline"
//                               className="w-full text-sm"
//                               onClick={() => fileInputRef.current?.click()}
//                             >
//                               {field.value
//                                 ? field.value.name
//                                 : "انتخاب فایل..."}
//                             </Button>
//                           </div>
//                         </FormControl>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />
//                 )}

//                 <Button disabled={isPending} className="w-full mt-4">
//                   {isPending
//                     ? "در حال ذخیره..."
//                     : editMode
//                     ? "ویرایش تصویر"
//                     : "آپلود تصویر"}
//                 </Button>
//               </form>
//             </Form>
//           </FormFrame>
//         </AccordionContent>
//       </AccordionItem>
//     </Accordion>
//   );
// }


// "use client";

// import {
//   useEffect,
//   useMemo,
//   startTransition,
//   useActionState,
// } from "react";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { toast } from "sonner";

// import {
//   createImageAction,
//   getImages as fetchImages,
// } from "@/actions/image.actions";
// import { imageSchema, type ImageInput } from "@/zod-validations";
// import { useImageStore } from "@/store/image.store";

// import {
//   Form,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormControl,
//   FormMessage,
// } from "@/components/ui/form";
// import { Button } from "@/components/ui/button";
// import { FormFrame } from "@/components/forms/form-frame";
// import { FormInputShadcn } from "@/components/forms/form-input-shadcn";

// interface ImageFormProps {
//   onClose: () => void;
// }

// export default function ImageForm({ onClose }: ImageFormProps) {
//   const setImages = useImageStore((s) => s.setImages);

//   // RHF + Zod
//   const form = useForm<ImageInput & { file?: File }>({
//     resolver: zodResolver(imageSchema),
//     defaultValues: { alt: "", file: undefined },
//     mode: "onTouched",
//   });

//   // createImageAction
//   const [state, action, pending] = useActionState(createImageAction, {
//     success: false,
//     version: 0,
//   });

//   // on success
//   useEffect(() => {
//     if (!state.success) return;

//     toast.success("تصویر با موفقیت ذخیره شد");
//     form.reset({ alt: "", file: undefined });
//     onClose();

//     // reload gallery
//     startTransition(async () => {
//       const imgs = await fetchImages();
//       if (Array.isArray(imgs)) {
//         setImages(
//           imgs.map((img) => ({
//             id: img.id,
//             url: img.url,
//             alt: img.alt,
//             name: img.name ?? undefined,
//             type: img.type ?? undefined,
//             size: img.size ?? undefined,
//             variantId: img.variantId ?? undefined,
//           }))
//         );
//       }
//     });
//   }, [state.version, onClose, setImages, form]);

//   return (
//     <FormFrame>
//       <Form {...form}>
//         <form
//           action={action}
//           className="space-y-6 rounded-xl border bg-white p-6 shadow"
//         >
//           {/* alt */}
//           <FormField
//             control={form.control}
//             name="alt"
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel>توضیح تصویر (alt)</FormLabel>
//                 <FormControl>
//                   <FormInputShadcn {...field} />
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />

//           {/* file */}
//           <FormField
//             control={form.control}
//             name="file"
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel>فایل تصویر</FormLabel>
//                 <FormControl>
//                   <input
//                     type="file"
//                     accept="image/*"
//                     onChange={(e) => {
//                       const f = e.target.files?.[0];
//                       field.onChange(f);
//                     }}
//                     className="block w-full text-sm text-gray-700"
//                   />
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />

//           {/* hidden for FormData */}
//           <input type="hidden" name="alt" value={form.getValues("alt")} />
//           {form.getValues("file") && (
//             <input
//               type="hidden"
//               name="file"
//               value={(form.getValues("file") as File).name}
//             />
//           )}

//           {/* actions */}
//           <div className="flex gap-3">
//             <Button
//               variant="outline"
//               type="button"
//               onClick={() => {
//                 form.reset({ alt: "", file: undefined });
//                 onClose();
//               }}
//               disabled={pending}
//             >
//               انصراف
//             </Button>
//             <Button type="submit" disabled={pending} className="flex-1">
//               {pending ? "در حال ذخیره..." : "بارگذاری تصویر"}
//             </Button>
//           </div>
//         </form>
//       </Form>
//     </FormFrame>
//   );
// }



// components/forms/image-form.tsx


// components/forms/image-form.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useActionState, useRef, useEffect, useState } from "react";
import { createImageAction, getImages } from "@/actions/image.actions";
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
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { Plus } from "lucide-react";
import { ImageInput, imageSchema } from "@/zod-validations";
import { useImageStore } from "@/store/image.store";

interface ImageFormProps {
  editMode?: boolean;
  defaultValues?: Partial<ImageInput>;
  onSuccess?: () => void;
}

export function ImageForm({
  editMode = false,
  defaultValues,
  onSuccess,
}: ImageFormProps) {
  const [formState, formAction, isPending] = useActionState(createImageAction, {
    success: false,
  });

  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const setImages = useImageStore.getState().setImages;

  const form = useForm<ImageInput & { file?: File }>({
    resolver: zodResolver(imageSchema),
    defaultValues: {
      alt: defaultValues?.alt || "",
      file: undefined,
    },
    mode: "onTouched",
  });

  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (formState.success && !editMode) {
      toast.success("تصویر با موفقیت آپلود شد");

      // Notify parent to close modal if provided
      onSuccess?.();

      // Reset form
      form.reset({ alt: "", file: undefined });
      setPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";

      // Refresh gallery images in store
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
    }
  }, [formState.success, editMode, form, setImages, onSuccess]);

  return (
    <FormFrame>
      <Form {...form}>
        <form ref={formRef} action={formAction} className="space-y-6 rounded-xl bg-white p-6 shadow-md border border-gray-200">
          <FormField
            control={form.control}
            name="alt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>توضیح تصویر (alt)</FormLabel>
                <FormControl>
                  <FormInputShadcn {...field} />
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
                  <FormLabel>انتخاب تصویر</FormLabel>
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
                        <div className="relative w-32 h-32 border rounded-lg overflow-hidden">
                          <Image
                            src={preview}
                            alt="پیش‌نمایش تصویر"
                            width={128}
                            height={128}
                            className="object-cover w-full h-full"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setPreview(null);
                              if (fileInputRef.current) fileInputRef.current.value = "";
                              field.onChange(undefined);
                            }}
                            className="absolute top-1 right-1 bg-white rounded-full w-6 h-6 flex items-center justify-center text-red-500 text-sm"
                            aria-label="حذف تصویر"
                          >
                            ×
                          </button>
                        </div>
                      )}

                      <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                        {field.value ? field.value.name : "انتخاب فایل..."}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? (editMode ? "در حال ویرایش..." : "در حال ذخیره...") : editMode ? "ویرایش تصویر" : "آپلود تصویر"}
          </Button>
        </form>
      </Form>
    </FormFrame>
  );
}

