// app/auth/login/page.tsx
import LoginForm from "@/components/forms/login-form";

export const metadata = {
  title: "ورود به سایت",
  description: "صفحهٔ ورود با استفاده از کد OTP",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">ورود به سایت</h1>
        <LoginForm />
      </div>
    </div>
  );
}
