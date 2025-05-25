import { ProductForm } from "@/components/forms/product-form";

export default function ProductPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">مدیریت محصولات</h1>
      <p>در این صفحه محصولات فروشگاه مدیریت می‌شوند.</p>
      <ProductForm />
    </div>
  );
}