// pages/api/check-pg.ts
import { Client } from "pg";

export default async function handler(req, res) {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  try {
    await client.connect();
    const { rows } = await client.query("SELECT NOW()");
    await client.end();
    res.status(200).json({ ok: true, now: rows[0] });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
}
