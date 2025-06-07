// lib/prisma.ts
import 'dotenv/config';
import WebSocket from 'ws';
import { neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaClient } from './generated/prisma';

// Configure Neon driver to use WebSocket in serverless environments
neonConfig.webSocketConstructor = WebSocket;

// Use HTTP fetch for queries instead of WebSocket to avoid mask errors
neonConfig.poolQueryViaFetch = true;

declare global {
  // Reuse PrismaClient instance in development to prevent exhausting connections
  var prisma: PrismaClient | undefined;
}

// Get the connection string from environment variable
const connectionString = process.env.DATABASE_URL!;

// Create the Prisma-Neon adapter using the connection string
const adapter = new PrismaNeon({ connectionString });  

// Instantiate a singleton PrismaClient with the Neon adapter
const prismaClient =
  global.prisma ??
  new PrismaClient({
    adapter,
    // Optional: enable query logging for debugging
    // log: ['query', 'info', 'warn', 'error'],
  });

// In development, attach the client to global to preserve between HMR reloads
if (process.env.NODE_ENV !== 'production') {
  global.prisma = prismaClient;
}

// Default export for `import prisma from '@/lib/prisma'`
export default prismaClient;
