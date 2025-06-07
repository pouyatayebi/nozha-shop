// app/api/env.ts
import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(
  _req: NextApiRequest,       // ← اینجا _req به جای req
  res: NextApiResponse
) {
  res.status(200).json({
    DATABASE_URL: process.env.DATABASE_URL,
  });
}
