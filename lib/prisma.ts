// lib/prisma.ts
import { PrismaNeon } from '@prisma/adapter-neon';
import { neonConfig } from '@neondatabase/serverless';
import WebSocket from 'ws';
import { PrismaClient } from './generated/prisma';

// Configure Neon to use WebSocket in serverless environments
neonConfig.webSocketConstructor = WebSocket;

declare global {
  // Ensure we reuse the PrismaClient in development to avoid exhausting connections
  var prisma: PrismaClient | undefined;
}

// Initialize the Neon adapter with your DATABASE_URL
const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL!,
});

// Create or reuse the PrismaClient instance
const prismaClient =
  global.prisma ??
  new PrismaClient({
    adapter,
    // Optional: enable query logging
    // log: ['query', 'info', 'warn', 'error'],
  });

// In development, assign the client to the global object
if (process.env.NODE_ENV !== 'production') {
  global.prisma = prismaClient;
}

// Default export for easy `import prisma from '@/lib/prisma'`
export default prismaClient;
export { PrismaClient, PrismaNeon }; // Export for direct access if needed