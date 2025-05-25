// "use client";

// import { useState, useEffect } from "react";
// import {
//   getAllCategories,
//   deleteCategoryAction,
// } from "@/actions/category.actions";
// import { useCategoryStore } from "@/store/category.store";
// import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
// import { Button } from "@/components/ui/button";
// import { Pencil, Trash2 } from "lucide-react";
// import { toast } from "sonner";
// import { Category } from "@/lib/generated/prisma";


// interface CategoryTableProps {
//   onEdit: (cat: Category) => void;
// }

// export default function CategoryTable({ onEdit }: CategoryTableProps) {
//   const categories = useCategoryStore((s) => s.categories);
//   const setCategories = useCategoryStore((s) => s.setCategories);
//   const [loading, setLoading] = useState(false);

//   const load = async () => {
//     setLoading(true);
//     const data = await getAllCategories();
//     setCategories(data);
//     setLoading(false);
//   };

//   useEffect(() => {
//     load();
//   }, []);

//   const handleDelete = async (id: string) => {
//     if (!confirm("مطمئنی حذف کنی؟")) return;
//     const res = await deleteCategoryAction(id);
//     if (res.success) {
//       toast.success("حذف شد");
//       load();
//     } else {
//       toast.error(res.errors?.error?.[0] || "خطا در حذف");
//     }
//   };

//   return (
//     <div className="overflow-x-auto bg-white rounded-md border border-gray-200">
//       <Table>
//         <TableHeader>
//           <TableRow>
//             <TableHead>نام دسته</TableHead>
//             <TableHead>اسلاگ</TableHead>
//             <TableHead>دسته مادر</TableHead>
//             <TableHead className="text-center">عملیات</TableHead>
//           </TableRow>
//         </TableHeader>
//         <TableBody>
//           {categories.map((cat) => (
//             <TableRow key={cat.id}>
//               <TableCell>{cat.title}</TableCell>
//               <TableCell>{cat.slug}</TableCell>
//               <TableCell>
//                 {categories.find((c) => c.id === cat.parentId)?.title || "-"}
//               </TableCell>
//               <TableCell className="text-center">
//                 <div className="flex justify-center gap-2">
//                   <Button
//                     size="icon"
//                     variant="outline"
//                     onClick={() => onEdit(cat)}
//                     title="ویرایش"
//                   >
//                     <Pencil size={16} />
//                   </Button>
//                   <Button
//                     size="icon"
//                     variant="destructive"
//                     onClick={() => handleDelete(cat.id)}
//                     title="حذف"
//                   >
//                     <Trash2 size={16} />
//                   </Button>
//                 </div>
//               </TableCell>
//             </TableRow>
//           ))}
//           {!loading && categories.length === 0 && (
//             <TableRow>
//               <TableCell colSpan={4} className="text-center py-4">
//                 یافت نشد
//               </TableCell>
//             </TableRow>
//           )}
//         </TableBody>
//       </Table>
//     </div>
//   );
// }
// components/tables/category-table.tsx
"use client";

import { useEffect, useState } from "react";
import {
  getAllCategories,
  deleteCategoryAction,
  getCategoryById,
} from "@/actions/category.actions";
import { useCategoryStore } from "@/store/category.store";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import ConfirmDelete from "../ui/confirm-delete";

export default function CategoryTable() {
  const { categories, setCategories, setEditing } = useCategoryStore();
  const [loading, setLoading] = useState(false);

  // واکشی اولیه
  const load = async () => {
    setLoading(true);
    const data = await getAllCategories();
    setCategories(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  // حذف
  const handleDelete = async (id: string) => {
    if (!confirm("مطمئنی حذف کنی؟")) return;
    const res = await deleteCategoryAction(id);
    if (res.success) {
      toast.success("حذف شد");
      load(); // رفرش لیست
    } else {
      toast.error(res.errors?.error?.[0] || "خطا در حذف");
    }
  };
// ویرایش
const handleEdit = async (id: string) => {
  const cat = await getCategoryById(id);
  if (!cat) return;

  // فلت کردن فیلدهای تو در تو به فرمت فرم
  setEditing({
    id: cat.id,
    title: cat.title,
    slug: cat.slug,
    parentId: cat.parentId,
    imageId: cat.imageId ?? undefined,
    description: cat.description?.content ?? "",
    seoTitle: cat.seo?.title ?? "",
    seoDescription: cat.seo?.description ?? "",
  });
};

  return (
    <div className="overflow-x-auto bg-white rounded-md border border-gray-200">
      <Table>
        <TableHeader >
          <TableRow >
            <TableHead  className="text-right">نام دسته</TableHead>
            <TableHead  className="text-right">اسلاگ</TableHead>
            <TableHead  className="text-right">دسته مادر</TableHead>
            <TableHead className="text-center">عملیات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((cat) => (
            <TableRow key={cat.id}>
              <TableCell>{cat.title}</TableCell>
              <TableCell>{cat.slug}</TableCell>
              <TableCell>
                {categories.find((c) => c.id === cat.parentId)?.title || "-"}
              </TableCell>
              <TableCell className="text-center">
                <div className="flex justify-center gap-2">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => handleEdit(cat.id)}
                    title="ویرایش"
                  >
                    <Pencil size={16} />
                  </Button>
                   <ConfirmDelete onConfirm={() => handleDelete(cat.id)} />
                </div>
              </TableCell>
            </TableRow>
          ))}

          {!loading && categories.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-4">
                هیچ دسته‌ای یافت نشد
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
