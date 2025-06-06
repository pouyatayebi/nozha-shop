// app/admin/products/page.tsx
import ProductForm from "@/components/forms/product-form";
import ProductTable from "@/components/tables/product-table";

/**
 * صفحهٔ مدیریت محصولات – فقط کلاینت کامپوننت‌ها را رندر می‌کند.
 * واکشی محصولات در ProductTable (useEffect) انجام می‌شود،
 * بنابراین هیچ Decimal از سرور به کلاینت پاس داده نمی‌شود.
 */
export default function ProductsPage() {
  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">مدیریت محصولات </h1>

      </div>
      <ProductTable />
    </div>
  );
}
