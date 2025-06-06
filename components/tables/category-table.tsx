// components/tables/category-table.tsx
"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import {
  getAllCategories,
  deleteCategoryAction,
  getCategoryById,
} from "@/actions/category.actions";
import { useCategoryStore, type Category } from "@/store/category.store";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import ConfirmDelete from "@/components/ui/confirm-delete";
import { toast } from "sonner";
import { ModalForm } from "@/components/ui/modal-form";
import CategoryForm from "@/components/forms/category-form";

export default function CategoryTable() {
  const categories = useCategoryStore((s) => s.categories);
  const setCategories = useCategoryStore((s) => s.setCategories);
  const setEditing = useCategoryStore((s) => s.setEditing);
  const editing = useCategoryStore((s) => s.editing);

  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  /* -------------------------- بارگذاری لیست -------------------------- */
  const load = useCallback(async () => {
    setLoading(true);
    const data = await getAllCategories();
    setCategories(data); // اکنون data: Category[] است
    setLoading(false);
  }, [setCategories]);

  useEffect(() => {
    load();
  }, [load]);

  /* ---------------------------- حذف دسته ----------------------------- */
  const handleDelete = useCallback(
    async (id: string) => {
      const res = await deleteCategoryAction(id);
      if (res.success) {
        toast.success("حذف شد");
        setCategories(categories.filter((c) => c.id !== id));
      } else {
        toast.error(res.errors?.error?.[0] || "خطا در حذف");
      }
    },
    [categories, setCategories]
  );

  /* ---------------------------- ویرایش ------------------------------- */
  const handleEdit = useCallback(
    async (id: string) => {
      const cat = await getCategoryById(id);
      if (!cat) return;
      setEditing(cat);
      setModalOpen(true);
    },
    [setEditing]
  );

  /* -------------------------- افزودن دسته ---------------------------- */
  const handleAdd = () => {
    setEditing(null);
    setModalOpen(true);
  };

  /* ------------------ نگاشت عنوان والد برای دسترسی سریع ------------------ */
  const parentTitleMap = useMemo(() => {
    const map: Record<string, string> = {};
    categories.forEach((c) => {
      map[c.id] = c.title;
    });
    return map;
  }, [categories]);

  /* ------------------ بستن مودال فرم دسته‌بندی ------------------ */
  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
  };

  return (
    <>
      {/* دکمهٔ افزودن دسته جدید */}
      <div className="flex justify-start mb-4">
        <Button onClick={handleAdd}>افزودن دسته</Button>
      </div>

      <div className="overflow-x-auto rounded-md border border-gray-200 bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">نام دسته</TableHead>
              <TableHead className="text-right">اسلاگ</TableHead>
              <TableHead className="text-right">دستهٔ مادر</TableHead>
              <TableHead className="text-center">عملیات</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {categories.map((cat) => (
              <TableRow key={cat.id}>
                <TableCell>{cat.title}</TableCell>
                <TableCell>{cat.slug}</TableCell>
                <TableCell>{parentTitleMap[cat.parentId ?? ""] || "-"}</TableCell>
                <TableCell className="text-center">
                  <div className="flex justify-center gap-2">
                    <Button
                      size="icon"
                      variant="outline"
                      title="ویرایش"
                      onClick={() => handleEdit(cat.id)}
                    >
                      <Pencil size={16} />
                    </Button>

                    <ConfirmDelete
                      title="حذف دسته"
                      confirmText="آیا مطمئن هستید که می‌خواهید این دسته را حذف کنید؟"
                      onConfirm={() => handleDelete(cat.id)}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}

            {!loading && categories.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="py-4 text-center">
                  هیچ دسته‌ای یافت نشد
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* مودال فرم دسته‌بندی */}
      <ModalForm
        title={editing ? "ویرایش دسته‌بندی" : "افزودن دسته‌بندی"}
        open={modalOpen}
        onOpenChange={(open) => {
          if (!open) closeModal();
          else setModalOpen(open);
        }}
      >
        <CategoryForm onClose={closeModal} />
      </ModalForm>
    </>
  );
}
