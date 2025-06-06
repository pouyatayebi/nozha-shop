// components/tables/product-table.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import {
  getAllProducts,
  deleteProductAction,
  deleteVariantAction,
  getProductById,
} from "@/actions/product.actions";
import { useProductStore } from "@/store/product.store";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Pencil, Plus } from "lucide-react";
import ConfirmDelete from "@/components/ui/confirm-delete";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import Image from "next/image";
import { useImageStore } from "@/store/image.store";
import { getImages } from "@/actions/image.actions";
import { ModalForm } from "@/components/ui/modal-form";
import ProductForm from "@/components/forms/product-form";
import VariantForm from "@/components/forms/variant-form";

export default function ProductTable() {
  const {
    products,
    setProducts,
    setEditing,
    variantEditing,
    setVariantEditing,
  } = useProductStore();
  const editing = useProductStore((s) => s.editing);

  const { images, setImages } = useImageStore();
  const [loading, setLoading] = useState(false);
  const [productModalOpen, setProductModalOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [prodData, imgData] = await Promise.all([getAllProducts(), getImages()]);
    setProducts(prodData);
    if (Array.isArray(imgData)) {
      setImages(
        imgData.map((img) => ({
          id: img.id,
          url: img.url,
          alt: img.name ?? "",
          name: img.name ?? "",
          type: img.type ?? "",
          size: img.size ? Number(img.size) : undefined,
        }))
      );
    }
    setLoading(false);
  }, [setProducts, setImages]);

  useEffect(() => {
    load();
  }, [load]);

  const handleDeleteProduct = async (id: string) => {
    const res = await deleteProductAction(id);
    if (res.success) {
      toast.success("محصول حذف شد");
      load();
    } else {
      toast.error(res.errors?.error?.[0] || "خطا در حذف محصول");
    }
  };

  const handleEditProduct = async (id: string) => {
    const prod = await getProductById(id);
    if (prod) {
      setEditing(prod);
      setProductModalOpen(true);
    }
  };

  const handleCreateProduct = () => {
    setEditing(null);
    setProductModalOpen(true);
  };

  const handleDeleteVariant = async (productId: string, variantId: string) => {
    const res = await deleteVariantAction(productId, variantId);
    if (res.success) {
      toast.success("واریانت حذف شد");
      load();
    } else {
      toast.error(res.errors?.error?.[0] || "خطا در حذف واریانت");
    }
  };

  const openCreateVariant = (productId: string) => {
    setVariantEditing({ productId, variant: undefined });
  };

  const openEditVariant = (
    productId: string,
    variant: { id: string; title: string; stock: number; price: number; imageIds: string[] }
  ) => {
    setVariantEditing({ productId, variant });
  };

  const closeVariantDialog = () => {
    setVariantEditing(null);
  };

  return (
    <>
      {/* دکمهٔ افزودن محصول جدید */}
      <div className="flex justify-start mb-4">
        <Button onClick={handleCreateProduct}>
          <Plus size={16} className="ml-1" />
          افزودن محصول
        </Button>
      </div>

      <div className="overflow-x-auto bg-white rounded-md border border-gray-200 shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">عنوان</TableHead>
              <TableHead className="text-right">اسلاگ</TableHead>
              <TableHead className="text-right">دسته</TableHead>
              <TableHead className="text-right">ویژه؟</TableHead>
              <TableHead className="text-right">واریانت‌ها</TableHead>
              <TableHead className="text-center">عملیات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((p) => (
              <TableRow key={p.id} className="hover:bg-gray-50 transition-colors">
                <TableCell>{p.title}</TableCell>
                <TableCell className="lowercase text-gray-600">{p.slug}</TableCell>
                <TableCell>{p.categoryTitle || "-"}</TableCell>
                <TableCell className="text-center">
                  {p.isFeatured ? (
                    <span className="text-green-500">✔</span>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-4">
                    {p.variants.map((v) => {
                      const firstImageId = v.imageIds[0];
                      const imgRecord = images.find((img) => img.id === firstImageId);
                      const imgUrl = imgRecord ? imgRecord.url : null;

                      return (
                        <Card key={v.id} className="w-40 border hover:shadow-md transition-shadow">
                          <CardContent className="p-2">
                            {imgUrl ? (
                              <div className="relative w-full h-24 mb-2 rounded overflow-hidden">
                                <Image src={imgUrl} alt={v.title} fill className="object-cover" />
                              </div>
                            ) : (
                              <div className="w-full h-24 mb-2 bg-gray-100 rounded flex items-center justify-center text-gray-400">
                                بدون تصویر
                              </div>
                            )}
                            <div className="text-sm font-medium mb-2 text-center">{v.title}</div>
                            <div className="flex justify-between">
                              <Button
                                size="icon"
                                variant="outline"
                                onClick={() => openEditVariant(p.id, v)}
                                title="ویرایش واریانت"
                              >
                                <Pencil size={14} />
                              </Button>
                              <ConfirmDelete
                                onConfirm={() => handleDeleteVariant(p.id, v.id)}
                                title="حذف واریانت"
                                confirmText="آیا از حذف این واریانت اطمینان دارید؟"
                              />
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                    <Card className="w-40 flex items-center justify-center border-2 border-dashed hover:bg-gray-50 transition-colors">
                      <CardContent>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => openCreateVariant(p.id)}
                          title="افزودن واریانت"
                        >
                          <Plus size={20} />
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex justify-center gap-2">
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => handleEditProduct(p.id)}
                      title="ویرایش محصول"
                    >
                      <Pencil size={16} />
                    </Button>
                    <ConfirmDelete
                      onConfirm={() => handleDeleteProduct(p.id)}
                      title="حذف محصول"
                      confirmText="آیا از حذف این محصول اطمینان دارید؟"
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}

            {!loading && products.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  هیچ محصولی یافت نشد
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* مودال فرم محصول */}
      <ModalForm
        title={editing ? "ویرایش محصول" : "افزودن محصول جدید"}
        open={productModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            setEditing(null);
          }
          setProductModalOpen(open);
        }}
      >
        <ProductForm onClose={() => setProductModalOpen(false)} />
      </ModalForm>

      {/* دیالوگ واریانت */}
      <Dialog
        open={Boolean(variantEditing)}
        onOpenChange={(open) => {
          if (!open) closeVariantDialog();
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {variantEditing?.variant ? "ویرایش واریانت" : "افزودن واریانت"}
            </DialogTitle>
            <DialogClose />
          </DialogHeader>
          {variantEditing && <VariantForm />}
        </DialogContent>
      </Dialog>
    </>
  );
}
