// app/api/check-pg/route.ts
import { NextResponse } from 'next/server';
import { Client } from 'pg';

export async function GET() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    // اگر نیاز به قبول گواهی‌های self-signed داشتید:
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    const result = await client.query('SELECT NOW()');
    await client.end();

    return NextResponse.json({
      ok: true,
      now: result.rows[0],
    });
  } catch (error: any) {
    console.error('PG connection error:', error);
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}
