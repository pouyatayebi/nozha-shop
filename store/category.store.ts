// store/category.store.ts
import { getAllCategories } from "@/actions/category.actions";
import { create } from "zustand";

/** ساختار نهاییِ دسته‌بندی که قرار است در UI ویرایش شود */
export type Category = {
  id: string;
  title: string;
  slug: string;
  parentId: string | null;
  imageId: string | null;
  description: string;            // همیشه رشته (خالی یا محتوا)
  seoTitle: string | null;
  seoDescription: string | null;
};

type CategoryStore = {
  categories: Category[];
  setCategories: (data: Category[]) => void;
  fetchCategories: () => Promise<void>;
  editing: Category | null;
  setEditing: (cat: Category | null) => void;
};

export const useCategoryStore = create<CategoryStore>((set) => ({
  categories: [],
  setCategories: (data) => set({ categories: data }),
  fetchCategories: async () => {
    const data = await getAllCategories();
    if (Array.isArray(data)) set({ categories: data });
  },
  editing: null,
  setEditing: (cat) => set({ editing: cat }),
}));
