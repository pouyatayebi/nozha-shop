// components/forms/modal-image-form.tsx
"use client";

import { Button } from "@/components/ui/button";
import { ModalForm } from "@/components/ui/modal-form";

import { useImageStore } from "@/store/image.store";
import { ImageForm } from "./image-form";

export default function ModalImageForm() {
  const modalOpen = useImageStore((s) => s.modalOpen);
  const setModalOpen = useImageStore((s) => s.setModalOpen);

  return (
    <>
      {/* Trigger button */}
      <div className="flex justify-start mb-4">
        <Button onClick={() => setModalOpen(true)}>
          افزودن تصویر جدید
        </Button>
      </div>

      {/* Modal containing the ImageForm */}
      <ModalForm
        title="افزودن تصویر جدید"
        open={modalOpen}
        onOpenChange={setModalOpen}
      >
        {/* When ImageForm successfully submits, close the modal */}
        <ImageForm onSuccess={() => setModalOpen(false)} />
      </ModalForm>
    </>
  );
}
