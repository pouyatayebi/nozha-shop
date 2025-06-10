"use client";

import { getImagesAction } from "@/actions/image.actions";
import { create } from "zustand";

export type GalleryImage = {
  id: string;
  alt: string;
  url: string;
  isLoading?: boolean;
  hasMore?: boolean;
  name?: string;
  type?: string;
  size?: number;
};

type ImageStore = {
  images: GalleryImage[];
  isLoading: boolean;
  hasMore: boolean;
  addImage: (image: GalleryImage) => void;
  setImages: (images: GalleryImage[]) => void;
  removeImage: (id: string) => void;
  updateImageAlt: (id: string, alt: string) => void;
  fetchInitialImages: () => Promise<void>;
  fetchMoreImages: () => Promise<void>;
  // ← add modal state
  modalOpen: boolean;
  setModalOpen: (open: boolean) => void;
};

export const useImageStore = create<ImageStore>((set, get) => ({
  images: [],
  isLoading: false,
  hasMore: true,
  // ← initial modal state closed
  modalOpen: false,
  setModalOpen: (open) => set({ modalOpen: open }),
  addImage: (image) =>
    set((state) => ({
      images: [image, ...state.images],
    })),

  setImages: (images) => set({ images }),

  removeImage: (id) =>
    set((state) => ({
      images: state.images.filter((img) => img.id !== id),
    })),

  updateImageAlt: (id, alt) =>
    set((state) => ({
      images: state.images.map((img) =>
        img.id === id ? { ...img, alt } : img
      ),
    })),

  fetchInitialImages: async () => {
    const { isLoading } = get();
    if (isLoading) return;
    set({ isLoading: true });
    const images = await getImagesAction(20);
    set({
      images,
      isLoading: false,
      hasMore: images.length === 20,
    });
  },

  fetchMoreImages: async () => {
    const { images, isLoading, hasMore } = get();
    if (isLoading || !hasMore) return;

    set({ isLoading: true });
    const last = images[images.length - 1];
    const newImages = await getImagesAction(20, last?.id);

    set({
      images: [...images, ...newImages],
      isLoading: false,
      hasMore: newImages.length > 0,
    });
  },
}));
