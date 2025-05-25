import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-gray-800 text-white p-4 space-y-4">
        <h2 className="text-xl font-bold mb-4">پنل مدیریت</h2>
        <nav className="space-y-2">
          <Link href="/admin/products" className="block">محصولات</Link>
          <Link href="/admin/categories" className="block">دسته‌بندی‌ها</Link>
          <Link href="/admin/gallery" className="block">گالری تصاویر</Link>
        </nav>
      </aside>
      <main className="flex-1 p-6 bg-gray-100">{children}</main>
    </div>
  );
}