import { checkDbConnection } from "@/lib/db-check";

export default async function HomePage() {
  const isDbConnected = await checkDbConnection();

  return (
    <main className="p-6">
      {!isDbConnected ? (
        <div className="bg-red-100 border border-red-300 text-red-700 p-4 rounded">
          اتصال به پایگاه داده برقرار نیست. لطفاً بعداً دوباره تلاش کنید.
        </div>
      ) : (
        <h1 className="text-xl font-bold">خوش آمدید به سایت</h1>
      )}
    </main>
  );
}
