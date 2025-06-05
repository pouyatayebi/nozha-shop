// next-auth.d.ts

import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      phone: string;
      role: string;
      // سایر فیلدهای دلخواه شما ...
    };
  }

  // اگر از JWT callback استفاده کردید:
  interface User {
    id: string;
    phone: string;
    role: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
  }
}
