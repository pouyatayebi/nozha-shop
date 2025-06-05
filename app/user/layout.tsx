import { requireRole } from "@/lib/auth/guards";


export default async function UserLayout({ children }: { children: React.ReactNode }) {
  await requireRole(["USER", "ADMIN"]); // هر دو نقش مجازند
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <nav className="p-4 bg-gray-200">User Navigation</nav>
      <main className="p-6">{children}</main>
    </div>
  );
}
