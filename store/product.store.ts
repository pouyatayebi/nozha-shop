"use client";

import { getAllProducts, deleteProduct } from "@/actions/product.actions";
import { create } from "zustand";

type Product = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  categoryId: string | null;
  isFeatured?: boolean | null;
  rating?: number | null;
  numReviews?: number | null;
  seoId?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type ProductStore = {
  products: Product[];
  setProducts: (products: Product[]) => void;
  removeProduct: (id: string) => void;
  fetchProducts: () => Promise<void>;
};

export const useProductStore = create<ProductStore>((set) => ({
  products: [],
  setProducts: (products) => set({ products }),
  removeProduct: (id) =>
    set((state) => ({
      products: state.products.filter((p) => p.id !== id),
    })),
  fetchProducts: async () => {
    const data = await getAllProducts();

    const converted = data.map((p) => ({
      ...p,
      rating: p.rating ? Number(p.rating) : null,
    }));

    set({ products: converted });
  },
}));