// lib/auth/guards.ts

import { redirect } from "next/navigation";
import { auth } from "./options";
import prisma from "../prisma";

export async function requireRole(
  allowed: ("USER" | "ADMIN")[]
) {
  const session = await auth();

  /* کاربر لاگین نکرده است؟ */
  if (!session?.user?.id) redirect("/auth/login");

  /* ⇣ نقش را مستقیم از DB می‌خوانیم ⇣ */
  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id as string },
    select: { role: true },
  });

  const role = dbUser?.role?.toUpperCase() as "USER" | "ADMIN" | undefined;

  if (!role) redirect("/auth/login");          // نباید رخ دهد
  if (!allowed.includes(role)) redirect("/user");

  /* در صورت مجاز: می‌توانید نقش تازه را روی session بنویسید */
  session.user.role = role;
  return session;
}
