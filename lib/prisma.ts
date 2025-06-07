// import { PrismaClient } from './generated/prisma'
// import { withAccelerate } from '@prisma/extension-accelerate'

// const globalForPrisma = global as unknown as { 
//     prisma: PrismaClient
// }

// const prisma = globalForPrisma.prisma || new PrismaClient().$extends(withAccelerate())

// if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// export default prisma



// lib/prisma.ts

import { PrismaNeon } from '@prisma/adapter-neon';
import { neonConfig } from '@neondatabase/serverless';
import WebSocket from 'ws';
import { PrismaClient } from './generated/prisma';

// برای اینکه PrismaNeon بتواند از WebSocket استفاده کند
neonConfig.webSocketConstructor = WebSocket;

declare global {
  // جلوگیری از ایجاد چند نمونه در محیط توسعه
  var prisma: PrismaClient | undefined;
}

const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL!,
});

export const prisma =
  global.prisma ??
  new PrismaClient({
    adapter,
    // log: ['query', 'info', 'warn', 'error'], // (اختیاری)
  });

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}


export default prisma;