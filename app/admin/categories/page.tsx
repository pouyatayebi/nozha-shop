// app/admin/categories/page.tsx
import CategoryForm from "@/components/forms/category-form";
import CategoryTable from "@/components/tables/category-table";

export default function CategoriesPage() {
  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">مدیریت دسته‌بندی‌ها</h1>
        {/* مثال از یک لینک برگشت */}
        {/* <Link href="/admin" className="text-sm text-primary">⬅ داشبورد</Link> */}
      </div>

      <CategoryTable />
    </div>
  );
}
