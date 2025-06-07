// pages/api/env.ts
import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({
    DATABASE_URL: process.env.DATABASE_URL,
  });
}
