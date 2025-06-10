// components/gallery/gallery-grid.tsx
"use client";

import { useEffect, useRef } from "react";
import ImageCard from "./image-card";
import { useImageStore } from "@/store/image.store";

interface GalleryGridProps {
  hasEdit?: boolean;
  hasDelete?: boolean;
}

export default function GalleryGrid({
  hasEdit = false,
  hasDelete = false,
}: GalleryGridProps) {
  const images = useImageStore((s) => s.images);
  const isLoading = useImageStore((s) => s.isLoading);
  const hasMore = useImageStore((s) => s.hasMore);
  const fetchInitialImages = useImageStore((s) => s.fetchInitialImages);
  const fetchMoreImages = useImageStore((s) => s.fetchMoreImages);

  const sentinelRef = useRef<HTMLDivElement>(null);

  // load first page
  useEffect(() => {
    fetchInitialImages();
  }, [fetchInitialImages]);

  // whenever hasMore or images.length changes, re-attach observer
  useEffect(() => {
    if (!hasMore) return;
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          fetchMoreImages();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(sentinel);
    return () => {
      observer.disconnect();
    };
  }, [fetchMoreImages, hasMore, images.length]);

  if (images.length === 0 && !isLoading) {
    return (
      <p className="text-center py-8 text-gray-500">
        هیچ تصویری یافت نشد
      </p>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {images.map((img) => (
          <ImageCard
            key={img.id}
            image={img}
            hasEdit={hasEdit}
            hasDelete={hasDelete}
          />
        ))}
      </div>

      {isLoading && (
        <p className="text-center py-4 text-gray-500">در حال بارگذاری...</p>
      )}

      {!isLoading && hasMore && (
        <div
          ref={sentinelRef}
          className="text-center py-4 text-gray-500 cursor-pointer"
        >
          بارگذاری بیشتر …
        </div>
      )}
    </>
  );
}
