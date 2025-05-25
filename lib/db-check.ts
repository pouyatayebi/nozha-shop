// lib/db-check.ts
import prisma from "@/lib/prisma";

export async function checkDbConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error("اتصال به دیتابیس ممکن نیست:", error);
    return false;
  }
}
