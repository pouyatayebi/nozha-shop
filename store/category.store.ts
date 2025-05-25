import { create } from "zustand";
import { getAllCategories } from "@/actions/category.actions";

/** ساختار یک دسته (همان مدل Prisma به شکل ساده) */
export type Category = {
  id: string;
  title: string;
  slug: string;
  parentId?: string | null;
    imageId?: string | null;        // ← افزودیم
  description?: string | null;    // (برای آینده)
  seoTitle?: string | null;       // (برای آینده)
  seoDescription?: string | null; // (برای آینده)
};

/** استور دسته‌بندی با پشتیبانی از حالت ویرایش */
type CategoryStore = {
  /* لیست همه دسته‌ها */
  categories: Category[];
  /* ست‌کردن یکباره دسته‌ها (برای رفرش جدول) */
  setCategories: (data: Category[]) => void;
  /* واکشی از سرور و پرکردن استور */
  fetchCategories: () => Promise<void>;

  /* --- حالت ویرایش --- */
  editing: Category | null;
  setEditing: (cat: Category | null) => void;
};

export const useCategoryStore = create<CategoryStore>((set) => ({
  // لیست دسته‌ها
  categories: [],

  // ست لیست کامل
  setCategories: (data) => set({ categories: data }),

  // واکشی از سرور
  fetchCategories: async () => {
    const data = await getAllCategories();
    if (Array.isArray(data)) set({ categories: data });
  },

  // حالت ویرایش
  editing: null,
  setEditing: (cat) => set({ editing: cat }),
}));
