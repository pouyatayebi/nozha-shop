export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-100 text-black">
      <aside className="w-64 fixed left-0 top-0 h-full bg-slate-800 text-white p-4">Admin Sidebar</aside>
      <main className="ml-64 p-6">{children}</main>
    </div>
  );
}
