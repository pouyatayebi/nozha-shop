// lib/prisma.ts
import 'dotenv/config';
import WebSocket from 'ws';
import { neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaClient } from './generated/prisma';

// 1. پیکربندی WebSocket برای Neon
neonConfig.webSocketConstructor = WebSocket;

declare global {
  // جلوگیری از ایجاد چند نمونه PrismaClient در HMR
  var prisma: PrismaClient | undefined;
}

// 2. رشته‌ی اتصال از متغیر محیطی
const connectionString = process.env.DATABASE_URL!;

// 3. ساخت adapter بر اساس connectionString
const adapter = new PrismaNeon({ connectionString });  // :contentReference[oaicite:0]{index=0}

// 4. نمونه singleton از PrismaClient
const prismaClient =
  global.prisma ??
  new PrismaClient({
    adapter,
    // log: ['query', 'info', 'warn', 'error'], // (اختیاری)
  });

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prismaClient;
}

// 5. خروجی پیش‌فرض برای `import prisma from "@/lib/prisma"`
export default prismaClient;
